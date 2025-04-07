import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { RedisService } from 'src/config/redis/redis.service';
import { ResendService } from 'src/config/resend/resend.service';
import { TokenService } from 'src/token/token.service';
import { ForgotPasswordDTO, ResetPasswordDTO } from './dto/forgot.password.dto';
import { LoginDTO, LoginUserResponseDto } from './dto/login.dto';
import {
  RegisterDTO,
  RegisterOtpVerifyDTO,
  RegisterPendingDataDTO,
  RegisterResponse,
  RegisterResponseDTO,
} from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
    private readonly tokenService: TokenService,
    private readonly resendService: ResendService,
  ) {}

  async login(
    loginData: LoginDTO,
    deviceId: string,
    fcmToken: string,
    ip: any,
  ): Promise<LoginUserResponseDto | null> {
    try {
      const { username, password } = loginData;
      const account = await this.prismaService.account.findUnique({
        where: { username },
        include: { profile: true },
      });

      if (!account) {
        this.logger.error('Tài khoản không tồn tại');
        return null;
      }

      const validatePassword = await bcrypt.compare(password, account.password);
      if (!validatePassword) {
        this.logger.error('Mật khẩu không chính xác');
        return null;
      }

      // Tạo tokens và lưu thông tin thiết bị
      const refreshToken = await this.tokenService.generateRefreshToken({
        account,
        deviceId,
        ip,
        fcmToken,
      });
      if (!refreshToken) {
        return null;
      }

      const accessToken = await this.tokenService.generateAccessToken(account);

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (error) {
      this.logger.error(`Lỗi đăng nhập: ${error.message}`, error.stack);
      return null;
    }
  }

  async register(data: RegisterDTO): Promise<RegisterResponse> {
    // Kiểm tra username và email tồn tại
    const existingUsername = await this.prismaService.account.findUnique({
      where: { username: data.username },
    });

    if (existingUsername) {
      throw new ConflictException('Tên đăng nhập đã tồn tại');
    }

    const existingEmail = await this.prismaService.account.findUnique({
      where: { email: data.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email đã tồn tại');
    }

    // Kiểm tra xem email đã trong hàng đợi đăng ký chưa
    const pendingRegistration = await this.redisService.get(
      `register:${data.email}`,
    );
    if (pendingRegistration) {
      const timeLeft = await this.redisService.ttl(`register:${data.email}`);
      const key = await this.redisService.get(`verify:${data.email}`);
      if (timeLeft > 120) {
        return {
          email: data.email,
          isPending: true,
          key: key,
        };
      }

      await this.redisService.del(`register:${data.email}`);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const otp = this.generateOTP();
    // Tạo dữ liệu đăng ký và lưu vào Redis
    const registrationData = {
      username: data.username,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      otp,
      createdAt: new Date().toISOString(),
    };

    // Lưu thông tin đăng ký vào Redis với email làm key
    await this.redisService.set(
      `register:${data.email}`,
      registrationData,
      300, // Time to live: 5 minutes (300 seconds)
    );

    // Tạo một random key cho xác thực bổ sung nếu cần
    const verificationKey = crypto.randomBytes(16).toString('hex');
    // Lưu key ngẫu nhiên với reference đến email
    await this.redisService.set(
      `verify:${data.email}`,
      verificationKey,
      300, // Time to live: 5 minutes
    );

    try {
      // Gửi email OTP sử dụng ResendService
      await this.resendService.sendOTPEmail(data.email, otp);
    } catch (error) {
      this.logger.error(`Lỗi khi gửi email: ${error.message}`, error.stack);
      await this.redisService.del(`register:${data.email}`);
      throw new BadRequestException(
        'Không thể gửi email xác minh. Vui lòng thử lại sau.',
      );
    }

    return {
      email: data.email,
      isPending: true,
      key: verificationKey,
    };
  }
  async CheckRegister(data: { key: string; email: string }): Promise<boolean> {
    try {
      const keyCheck = await this.redisService.get(`verify:${data.email}`);
      if (keyCheck && keyCheck === data.key) {
        return true;
      }
      return false;
    } catch (error) {
      throw new Error('Permission denined');
    }
  }

  private async retry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
  ): Promise<T> {
    let lastError: Error = new Error('Unknown error occurred');

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (attempt === maxRetries) break;

        this.logger.warn(
          `Lần thử ${attempt}/${maxRetries} thất bại, thử lại sau ${delay}ms`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  async verifyOTP(data: RegisterOtpVerifyDTO): Promise<RegisterResponseDTO> {
    const registerPendingData: RegisterPendingDataDTO | null =
      await this.redisService.get<RegisterPendingDataDTO>(
        `register:${data.email}`,
      );
    if (!registerPendingData) {
      this.logger.warn(
        `Không tìm thấy thông tin đăng ký cho email: ${data.email}`,
      );
      throw new BadRequestException(
        'Thông tin đăng ký không tồn tại hoặc đã hết hạn',
      );
    }

    if (registerPendingData.otp !== data.otp) {
      this.logger.warn(
        `OTP không khớp cho email: ${data.email}. OTP nhập: ${data.otp}, OTP lưu: ${registerPendingData.otp}`,
      );
      throw new BadRequestException('Mã OTP không chính xác');
    }

    try {
      this.logger.debug(`Bắt đầu tạo tài khoản cho email: ${data.email}`);
      const result = await this.retry(async () => {
        return await this.prismaService.$transaction(async (prisma) => {
          const account = await prisma.account.create({
            data: {
              username: registerPendingData.username,
              email: registerPendingData.email,
              password: registerPendingData.password,
              role: registerPendingData.role || Role.USER,
            },
          });

          const profile = await prisma.profile.create({
            data: {
              accountId: account.id,
            },
          });

          return { account, profile };
        });
      });

      this.logger.debug(
        `Tạo tài khoản thành công: ${JSON.stringify(result, null, 2)}`,
      );

      // Xóa dữ liệu tạm trong Redis
      await this.redisService.del(`register:${data.email}`);
      await this.redisService.del(`verify:${data.email}`);

      this.logger.debug(
        `Đã xóa dữ liệu tạm trong Redis cho email: ${data.email}`,
      );

      return {
        accountId: result.account.id,
        username: result.account.username,
        email: result.account.email,
        profileId: result.profile.id,
      };
    } catch (error) {
      this.logger.error(`Lỗi khi tạo tài khoản: ${error.message}`, error.stack);
      throw new BadRequestException(
        'Không thể tạo tài khoản. Vui lòng thử lại sau.',
      );
    }
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async logout(accessToken: string, ip: any, deviceId: string): Promise<void> {
    try {
      // Thu hồi access token
      if (accessToken) {
        try {
          await this.tokenService.revokeAccessToken(accessToken);
        } catch (error) {
          const errorMessage = error.message.toLowerCase();
          if (
            !errorMessage.includes('jwt expired') &&
            !errorMessage.includes('invalid token') &&
            !errorMessage.includes('invalid access token') &&
            !errorMessage.includes('token has been revoked')
          ) {
            this.logger.warn(
              `Không thể thu hồi access token: ${error.message}`,
            );
            throw error; // Ném lỗi nếu không phải các trường hợp thông thường
          }
        }
      }

      this.logger.debug('Đăng xuất thành công');
    } catch (error) {
      this.logger.error(`Lỗi khi đăng xuất: ${error.message}`);
      throw error;
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDTO): Promise<void> {
    const account = await this.prismaService.account.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!account) {
      throw new BadRequestException('Email không hợp lệ');
    }

    const existingRequest = await this.redisService.get(
      `reset_pending:${account.id}`,
    );
    this.logger.debug(existingRequest);
    if (existingRequest) {
      throw new BadRequestException(
        'Bạn đã gửi yêu cầu reset mật khẩu rồi. Vui lòng đợi 1 giờ sau để thử lại hoặc kiểm tra email của bạn.',
      );
    }

    // Tạo token reset password ngẫu nhiên
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresIn = 3600; // 1 giờ tính bằng giây

    // Lưu thông tin reset password vào Redis với ID account làm khóa
    await Promise.all([
      // Lưu token với ID làm khóa để dễ tìm kiếm
      this.redisService.set(`reset_token:${resetToken}`, account.id, expiresIn),
      this.redisService.set(`reset_pending:${account.id}`, true, expiresIn),
    ]);

    // Tạo link reset password
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

    try {
      // Gửi email reset password sử dụng ResendService
      await this.resendService.sendPasswordResetEmail(account.email, resetLink);
      this.logger.debug(
        `Email reset mật khẩu đã được gửi thành công đến ${account.email}`,
      );
    } catch (error) {
      this.logger.error(
        `Lỗi khi gửi email reset mật khẩu: ${error.message}`,
        error.stack,
      );
      await Promise.all([
        this.redisService.del(`reset_token:${resetToken}`),
        this.redisService.del(`reset_pending:${account.id}`),
      ]);
      throw new BadRequestException(
        'Không thể gửi email reset mật khẩu. Vui lòng thử lại sau.',
      );
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDTO): Promise<void> {
    const userId = await this.redisService.get(
      `reset_token:${resetPasswordDto.token}`,
    );

    if (!userId) {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }

    // Tìm tài khoản
    const account = await this.prismaService.account.findUnique({
      where: { id: userId },
    });

    if (!account) {
      throw new UnauthorizedException('Tài khoản không tồn tại');
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    // Cập nhật mật khẩu
    await this.prismaService.account.update({
      where: { id: account.id },
      data: {
        password: hashedPassword,
      },
    });

    // Xóa key lưu token
    await Promise.all([
      this.redisService.del(`reset_token:${resetPasswordDto.token}`),
      // Có thể thêm nếu muốn reset liên tục
      // this.redisService.del(`reset_pending:${account.id}`),
    ]);
  }

  async resendOTP(email: string): Promise<{ email: string }> {
    const pendingRegistration = await this.redisService.get(
      `register:${email}`,
    );

    if (!pendingRegistration) {
      throw new BadRequestException(
        'Thời gian đăng ký hết hạn vui lòng đăng ký lại',
      );
    }

    const parsedData = JSON.parse(pendingRegistration);
    const timeLeft = await this.redisService.ttl(`register:${email}`);

    // Kiểm tra xem đã đủ 2 phút chưa
    if (timeLeft > 180) {
      // 300 - 120 = 180 (còn hơn 2 phút)
      throw new BadRequestException(
        'Vui lòng đợi 2 phút trước khi yêu cầu gửi lại OTP',
      );
    }

    // Tạo OTP mới
    const newOTP = this.generateOTP();

    // Cập nhật OTP mới trong Redis
    parsedData.otp = newOTP;
    parsedData.createdAt = new Date().toISOString();

    await this.redisService.setex(
      `register:${email}`,
      JSON.stringify(parsedData),
      300, // Reset TTL về 5 phút
    );

    try {
      // Gửi email OTP mới
      await this.resendService.sendOTPEmail(email, newOTP);
    } catch (error) {
      this.logger.error(`Lỗi khi gửi lại email: ${error.message}`, error.stack);
      throw new BadRequestException(
        'Không thể gửi lại email xác minh. Vui lòng thử lại sau.',
      );
    }

    return { email };
  }
}
