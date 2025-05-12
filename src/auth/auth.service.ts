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
import { GetProfileIdResponseDTO } from 'src/profile/dto/get.profile.dto';
import { TokenService } from 'src/token/token.service';
import { ForgotPasswordDTO, ResetPasswordDTO } from './dto/forgot.password.dto';
import { LoginDTO, LoginUserResponseDTO } from './dto/login.dto';
import {
  CheckRegister,
  RegisterDTO,
  RegisterOtpVerifyDTO,
  RegisterPendingDataDTO,
  RegisterResponse,
  RegisterResponseDTO,
  ResendOtpDTO,
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
  ): Promise<LoginUserResponseDTO> {
    try {
      const { username, password } = loginData;
      const account = await this.prismaService.account.findUnique({
        where: { username },
        include: { profile: true },
      });

      if (!account) {
        throw new Error('Tài khoản không tồn tại');
      }
      if (!account.profile) {
        throw new Error('Tài khoản không có profile');
      }
      const validatePassword = await bcrypt.compare(password, account.password);
      if (!validatePassword) {
        throw new Error('Mật khẩu không chính xác');
      }

      const refreshToken = await this.tokenService.generateRefreshToken({
        account,
        profileId: account.profile.id,
        deviceId,
        ip,
        fcmToken,
      });

      const accessToken = await this.tokenService.generateAccessToken(
        account,
        account.profile.id,
      );

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (error) {
      this.logger.error(`Lỗi đăng nhập: ${error.message}`, error.stack);
      throw new Error(error.message);
    }
  }

  async register(data: RegisterDTO): Promise<RegisterResponse> {
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

    const registrationData = {
      username: data.username,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      otp,
      createAt: new Date().toISOString(),
    };

    await this.redisService.set(
      `register:${data.email}`,
      registrationData,
      300,
    );

    const verificationKey = crypto.randomBytes(16).toString('hex');

    await this.redisService.set(`verify:${data.email}`, verificationKey, 300);

    try {
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
  async CheckRegister(data: CheckRegister): Promise<any> {
    try {
      this.logger.debug(`Kiểm tra đăng ký cho email: ${data.email}`);
      const check = await this.redisService.get(`verify:${data.email}`);
      this.logger.debug(`Kiểm tra key: ${check}`);
      if (check && check === data.key) {
        this.logger.debug(`Xác thực thành công cho email: ${data.email}`);
        return true;
      }
      this.logger.warn(
        `Không tìm thấy thông tin đăng ký cho email: ${data.email}`,
      );
      throw new Error('Không tìm thấy thông tin đăng ký');
    } catch (error) {
      this.logger.error(`Lỗi khi kiểm tra đăng ký: ${error.message}`);
      throw new Error(error.message);
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
              name: `User${Math.floor(Math.random() * 10000)}`,
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

  async logout(
    accessToken: string,
    ip: any,
    deviceId: string,
    refreshToken: string,
  ): Promise<void> {
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
            throw error;
          }
        }
      }

      // Xóa device ID khỏi Redis hash (thông tin người dùng đang đăng nhập)
      if (refreshToken) {
        await this.tokenService.revokeRefreshToken(refreshToken, deviceId, ip);
      } else {
        // Trường hợp không có refreshToken, cố gắng giải mã accessToken để lấy user ID
        const decodedToken = this.tokenService.decodeToken(accessToken);
        if (decodedToken?.profileId) {
          await this.tokenService.removeDeviceById(
            decodedToken.profileId,
            deviceId,
          );
        }
      }

      this.logger.debug('Đăng xuất thành công');
    } catch (error) {
      this.logger.error(`Lỗi khi đăng xuất: ${error.message}`);
      throw error;
    }
  }

  async forgotPassword(forgotPasswordDTO: ForgotPasswordDTO): Promise<void> {
    const account = await this.prismaService.account.findUnique({
      where: { email: forgotPasswordDTO.email },
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
    const resetLink = `http://localhost:3000/reset/${resetToken}`;

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

  async resetPassword(
    resetPasswordDTO: ResetPasswordDTO,
  ): Promise<GetProfileIdResponseDTO> {
    try {
      const userId = await this.redisService.get(
        `reset_token:${resetPasswordDTO.token}`,
      );
      if (!userId) {
        throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
      }

      // Tìm tài khoản
      const account = await this.prismaService.account.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      if (!account) {
        throw new UnauthorizedException('Tài khoản không tồn tại');
      }

      if (!account.profile) {
        throw new UnauthorizedException('Tài khoản không tồn tại');
      }
      // Hash mật khẩu mới
      const hashedPassword = await bcrypt.hash(
        resetPasswordDTO.newPassword,
        10,
      );

      // Cập nhật mật khẩu
      await this.prismaService.account.update({
        where: { id: account.id },
        data: {
          password: hashedPassword,
        },
      });

      // Xóa key lưu token
      await Promise.all([
        this.redisService.del(`reset_token:${resetPasswordDTO.token}`),
        // Xóa toàn bộ hash chứa thông tin session của user này để buộc logout khỏi mọi thiết bị
        this.redisService.del(`user:${account.profile.id}`),
        // Có thể thêm nếu muốn reset liên tục
        // this.redisService.del(`reset_pending:${account.id}`),
      ]);

      this.logger.debug(
        `Đã đổi mật khẩu và xóa tất cả session của user ${account.profile.id}`,
      );

      return {
        profileId: account.profile.id,
      };
    } catch (error) {
      this.logger.error(`Lỗi khi đặt lại mật khẩu: ${error.message}`);
      throw error;
    }
  }

  async resendOTP(email: string): Promise<ResendOtpDTO> {
    try {
      const pendingRegistration = await this.redisService.get(
        `register:${email}`,
      );
      const verifyKey = await this.redisService.get(`verify:${email}`);
      if (!pendingRegistration) {
        throw new BadRequestException(
          'Thời gian đăng ký hết hạn vui lòng đăng ký lại',
        );
      }

      const timeLeft = await this.redisService.ttl(`register:${email}`);
      const RESEND_COOLDOWN = 120; // 2 phút
      const TOTAL_TTL = 300; // 5 phút

      if (timeLeft > TOTAL_TTL - RESEND_COOLDOWN) {
        throw new BadRequestException(
          'Vui lòng đợi 2 phút trước khi yêu cầu gửi lại OTP',
        );
      }
      this.logger.debug({
        message: 'Pending registration data',
        pendingRegistration,
      });

      const newOTP = this.generateOTP();

      pendingRegistration.otp = newOTP;
      pendingRegistration.createAt = new Date().toISOString();

      await Promise.all([
        this.redisService.set(
          `register:${email}`,
          pendingRegistration,
          TOTAL_TTL,
        ),
        this.redisService.set(`verify:${email}`, verifyKey, TOTAL_TTL),
        this.resendService.sendOTPEmail(email, newOTP),
      ]);

      return { email };
    } catch (error) {
      this.logger.error(`Lỗi khi gửi lại email: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }
}
