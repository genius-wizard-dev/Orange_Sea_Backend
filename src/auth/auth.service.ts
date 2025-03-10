import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Account, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Resend } from 'resend';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot.password.dto';
import { LoginUserDto, LoginUserResponseDto } from './dto/login.dto';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';
import {
  JwtPayload,
  RefreshTokenRedisPayload,
} from './interfaces/jwt.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly resend: Resend;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY'));
  }

  async login(
    loginData: LoginUserDto,
    req: any,
  ): Promise<LoginUserResponseDto> {
    const { username, password } = loginData;
    const account = await this.prismaService.account.findUnique({
      where: { username },
      include: { profile: true },
    });
    if (!account) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }
    const validatePassword = await bcrypt.compare(password, account.password);
    if (!validatePassword) {
      throw new UnauthorizedException('Mật khẩu không chính xác');
    }

    const accessToken = await this.generateAccessToken(account);
    const refreshToken = await this.generateRefreshToken(account, req);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      account: {
        id: account.id,
        email: account.email,
        username: account.username,
        role: account.role,
      },
      profile: {
        id: account.profile?.id || '',
        name: account.profile?.name || '',
        avatar: account.profile?.avatar || '',
      },
    };
  }

  async register(data: RegisterDto): Promise<RegisterResponseDto> {
    // Kiểm tra username đã tồn tại chưa
    const existingUsername = await this.prismaService.account.findUnique({
      where: { username: data.username },
    });

    if (existingUsername) {
      throw new ConflictException('Tên đăng nhập đã tồn tại');
    }

    // Kiểm tra email đã tồn tại chưa
    const existingEmail = await this.prismaService.account.findUnique({
      where: { email: data.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email đã tồn tại');
    }

    try {
      // Mã hóa mật khẩu
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Tạo tài khoản và profile trống trong một transaction
      const result = await this.prismaService.$transaction(async (prisma) => {
        // 1. Tạo tài khoản
        const account = await prisma.account.create({
          data: {
            username: data.username,
            email: data.email,
            password: hashedPassword,
            role: data.role || Role.USER,
          },
        });

        // 2. Tạo profile trống liên kết với tài khoản
        const profile = await prisma.profile.create({
          data: {
            accountId: account.id,
            // Các trường khác để trống, người dùng sẽ cập nhật sau
          },
        });

        return { account, profile };
      });

      return {
        accountId: result.account.id,
        username: result.account.username,
        email: result.account.email,
        profileId: result.profile.id,
      };
    } catch (error) {
      this.logger.error(`Lỗi khi tạo tài khoản: ${error.message}`);
      throw new BadRequestException('Không thể tạo tài khoản');
    }
  }

  async logout(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      this.revokeAccessToken(accessToken),
      this.revokeRefreshToken(refreshToken),
    ]);
  }

  async generateAccessToken(user: Account): Promise<string> {
    try {
      if (!process.env.JWT_ACCESS_SECRET) {
        throw new Error('JWT_ACCESS_SECRET not set');
      }

      const tokenId = crypto.randomBytes(16).toString('hex');
      const payload: JwtPayload = {
        sub: user.id,
        username: user.username,
        role: user.role,
        type: 'access',
        jti: tokenId,
      };

      return this.jwtService.sign(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      });
    } catch (error) {
      this.logger.error(`Error generating access token: ${error.message}`);
      throw new UnauthorizedException('Could not generate access token');
    }
  }

  async validateAccessToken(token: string): Promise<JwtPayload> {
    try {
      if (!process.env.JWT_ACCESS_SECRET) {
        throw new Error('JWT_ACCESS_SECRET not set');
      }

      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      if (payload.type !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Kiểm tra xem token có trong blacklist không
      const isBlacklisted = await this.redisService.get(
        `blacklist:${payload.jti}`,
      );
      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }

      return payload;
    } catch (error) {
      this.logger.error(`Error validating access token: ${error.message}`);
      throw new UnauthorizedException('Invalid access token');
    }
  }

  async revokeAccessToken(token: string): Promise<void> {
    try {
      if (!process.env.JWT_ACCESS_SECRET) {
        throw new Error('JWT_ACCESS_SECRET not set');
      }

      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      // Thêm token vào blacklist cho đến khi hết hạn
      const currentTime = Math.floor(Date.now() / 1000);
      // Ensure payload.exp exists before using it
      if (!payload.exp) {
        throw new Error('Token payload is missing expiration time');
      }
      const remainingTtl = payload.exp - currentTime;

      if (remainingTtl > 0 && payload.jti) {
        await this.redisService.set(
          `blacklist:${payload.jti}`,
          'revoked',
          remainingTtl,
        );
        this.logger.debug(
          `Access token blacklisted for ${remainingTtl}s: ${payload.jti}`,
        );
      }
    } catch (error) {
      this.logger.error(`Error revoking access token: ${error.message}`);
    }
  }

  private getIP(ip: string): string {
    // Nếu không có IP, trả về unknown
    if (!ip) return 'unknown';

    // Xử lý IPv4-mapped IPv6 (::ffff:127.0.0.1)
    if (ip.includes('::ffff:')) {
      return ip.split('::ffff:')[1];
    }

    // Xử lý localhost IPv6 (::1)
    if (ip === '::1') {
      return '127.0.0.1';
    }
    // Trường hợp IPv6 khác, giữ nguyên
    // Hoặc IPv4 thuần túy, giữ nguyên
    return ip;
  }

  private generateFingerprint(req: any): string {
    // Thu thập thông tin từ request
    const userAgent = req.headers['user-agent'] || '';

    // Xử lý nhiều nguồn IP khác nhau
    let ip = 'unknown';

    // Thứ tự ưu tiên các nguồn IP
    const IPs = [
      req.headers['x-forwarded-for'],
      req.headers['x-real-ip'],
      req.ip,
      req.connection?.remoteAddress,
    ];

    // Lấy IP đầu tiên không phải undefined hoặc null
    for (const IP of IPs) {
      if (IP) {
        const extractedIP = Array.isArray(IP)
          ? IP[0]
          : typeof IP === 'string' && IP.includes(',')
            ? IP.split(',')[0].trim()
            : IP;

        ip = this.getIP(extractedIP);
        break;
      }
    }

    this.logger.debug(`User-Agent: ${userAgent}, IP: ${ip}`);

    return crypto
      .createHash('sha256')
      .update(`${userAgent}:${ip}`)
      .digest('hex');
  }

  async generateRefreshToken(
    user: Account,
    req: any,
    existingToken?: string,
  ): Promise<string> {
    try {
      if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET not set');
      }

      let expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
      let ttl = 7 * 24 * 60 * 60; // Mặc định 7 ngày

      if (existingToken) {
        try {
          const existingPayload = this.jwtService.verify(existingToken, {
            secret: process.env.JWT_REFRESH_SECRET,
            ignoreExpiration: true,
          });

          const currentTime = Math.floor(Date.now() / 1000);
          const remainingTime = existingPayload.exp - currentTime;

          if (remainingTime > 0) {
            expiresIn = `${remainingTime}s`;
            ttl = remainingTime;
          }
        } catch (error) {
          this.logger.warn(
            `Invalid existing token, using default expiration: ${error.message}`,
          );
        }
      }

      // Tạo token ID duy nhất
      const tokenId = crypto.randomBytes(16).toString('hex');

      const payload: JwtPayload = {
        sub: user.id,
        username: user.username,
        role: user.role,
        type: 'refresh',
        jti: tokenId,
      };

      const token = this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn,
      });
      const fingerprint = this.generateFingerprint(req);
      // Tạo một session key duy nhất cho user
      const sessionKey = `refresh_token:${user.id}:${tokenId}`;

      // Lưu token với thông tin chi tiết để dễ dàng quản lý
      const tokenData: RefreshTokenRedisPayload = {
        token,
        userId: user.id,
        fingerprint,
        expiresAt: new Date(Date.now() + ttl * 1000),
      };

      const userTokenPatterns = await this.redisService.keys(
        `refresh_token:${user.id}:*`,
      );
      if (userTokenPatterns.length >= 3) {
        // Chỉ cho phép 3 session đồng thời
        const oldestToken = userTokenPatterns[0];
        await this.redisService.del(oldestToken);
        this.logger.debug(`Removed oldest token for user ${user.username}`);
      }

      // Lưu token mới
      await this.redisService.set(sessionKey, JSON.stringify(tokenData), ttl);
      this.logger.debug(
        `Generated refresh token for user: ${user.username} with TTL: ${ttl}s`,
      );

      return token;
    } catch (error) {
      this.logger.error(`Error generating refresh token: ${error.message}`);
      throw new UnauthorizedException('Could not generate refresh token');
    }
  }

  async verifyRefreshToken(token: string, req: any): Promise<Account> {
    try {
      if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET not set');
      }

      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      if (!payload.sub || !payload.jti) {
        throw new UnauthorizedException('Invalid token format');
      }

      const sessionKey = `refresh_token:${payload.sub}:${payload.jti}`;
      const storedTokenData = await this.redisService.get(sessionKey);
      const currentFingerprint = this.generateFingerprint(req);
      const parsedTokenData: RefreshTokenRedisPayload =
        JSON.parse(storedTokenData);
      if (parsedTokenData.fingerprint !== currentFingerprint) {
        this.logger.warn(`Fingerprint mismatch for refresh token`);
        throw new UnauthorizedException('Token sent from unknown device');
      }
      if (!storedTokenData) {
        this.logger.warn(`Token not found in store: ${payload.jti}`);
        throw new UnauthorizedException('Invalid or expired refresh token');
      }
      const tokenData = JSON.parse(storedTokenData);
      if (tokenData.token !== token) {
        this.logger.warn(`Token mismatch for ID: ${payload.jti}`);
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.prismaService.account.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        this.logger.warn(
          `User not found for refresh token: ${payload.username}`,
        );
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Error verifying refresh token: ${error.message}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async revokeRefreshToken(token: string): Promise<void> {
    try {
      if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error('JWT_REFRESH_SECRET not set');
      }

      // Giải mã token để lấy payload
      const payload = this.jwtService.decode(token) as JwtPayload;

      if (payload?.sub && payload?.jti) {
        const sessionKey = `refresh_token:${payload.sub}:${payload.jti}`;
        await this.redisService.del(sessionKey);
        this.logger.debug(
          `Revoked refresh token: ${payload.jti} for user: ${payload.username}`,
        );
      }
    } catch (error) {
      this.logger.error(`Error revoking refresh token: ${error.message}`);
    }
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    try {
      const userTokenPatterns = await this.redisService.keys(
        `refresh_token:${userId}:*`,
      );

      for (const tokenKey of userTokenPatterns) {
        await this.redisService.del(tokenKey);
      }

      this.logger.debug(`Revoked all sessions for user ID: ${userId}`);
    } catch (error) {
      this.logger.error(`Error revoking all user sessions: ${error.message}`);
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const account = await this.prismaService.account.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!account) {
      throw new BadRequestException('Email không hợp lệ');
    }

    // Kiểm tra xem user đã có yêu cầu reset mật khẩu chưa
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

    // Lưu thông tin reset password vào Redis với ID user làm khóa
    await Promise.all([
      // Lưu token với ID làm khóa để dễ tìm kiếm
      this.redisService.set(`reset_token:${resetToken}`, account.id, expiresIn),
      this.redisService.set(`reset_pending:${account.id}`, true, expiresIn),
    ]);

    // Tạo link reset password
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

    // Gửi email
    await this.resend.emails.send({
      from: 'None Group <no-reply@nonegroup.io.vn>',
      to: account.email,
      subject: 'Reset mật khẩu Social Media',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset mật khẩu Social Media</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 font-sans">
          <div class="max-w-md mx-auto my-10 bg-white p-6 rounded-lg shadow-md">
            <!-- Header -->

            <!-- Content -->
            <div class="py-6">
              <h1 class="text-2xl font-bold text-gray-800 mb-4">Yêu cầu reset mật khẩu</h1>

              <p class="text-gray-600 mb-4">Xin chào,</p>

              <p class="text-gray-600 mb-4">Chúng tôi đã nhận được yêu cầu reset mật khẩu cho tài khoản Social của bạn. Để tiếp tục quá trình này, vui lòng nhấn vào nút bên dưới.</p>

              <div class="text-center my-6">
                <a href="${resetLink}" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-300">
                  Reset mật khẩu ngay
                </a>
              </div>


              <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p class="text-sm text-yellow-700">
                  <span class="font-bold">Lưu ý:</span> Liên kết này sẽ hết hạn sau 1 giờ kể từ khi nhận được email và chỉ có thể sử dụng một lần.
                </p>
              </div>

              <p class="text-gray-600 mb-4">Nếu bạn không yêu cầu reset mật khẩu, vui lòng bỏ qua email này hoặc liên hệ với đội hỗ trợ của chúng tôi nếu bạn có thắc mắc.</p>

              <p class="text-gray-600">
                Trân trọng,<br>
                Đội ngũ None Group
              </p>
            </div>

            <!-- Footer -->
            <div class="border-t border-gray-200 pt-4 text-center text-sm text-gray-500">
              <p>&copy; ${new Date().getFullYear()} None Group. Tất cả các quyền được bảo lưu.</p>
              <p>None Group Inc., Việt Nam</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    // Tìm tất cả các key reset token trong Redis
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
}
