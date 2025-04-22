import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import {
  DeviceHeaders,
  DeviceInfo,
} from 'src/common/decorators/client-header.decorator';
import { TokenService } from 'src/token/token.service';
import { AuthService } from './auth.service';
import { ForgotPasswordDTO, ResetPasswordDTO } from './dto/forgot.password.dto';
import { LoginDTO } from './dto/login.dto';
import {
  CheckRegister,
  RegisterDTO,
  RegisterOtpVerifyDTO,
  ResendOtpDto,
} from './dto/register.dto';
import { JwtAuthGuard } from './guards/auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới và gửi OTP' })
  @ApiResponse({ status: 201, description: 'Gửi OTP thành công' })
  @ApiResponse({ status: 409, description: 'Username hoặc email đã tồn tại' })
  async register(@Body() registerDto: RegisterDTO, @Res() res: Response) {
    try {
      const result = await this.authService.register(registerDto);

      return res.status(HttpStatus.OK).send({
        status: 'success',
        message: result.isPending
          ? 'OTP đã được gửi và còn hiệu lực. Vui lòng kiểm tra email.'
          : 'Email đã được gửi đến vui lòng cung cấp OTP để tiếp tục',
        data: {
          email: result.email,
          isPending: result.isPending,
          key: result.key,
        },
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        status: 'fail',
        message: error.message,
      });
    }
  }

  @Post('resend-otp')
  @ApiOperation({ summary: 'Gửi lại OTP sau 2 phút' })
  @ApiResponse({ status: 200, description: 'Gửi lại OTP thành công' })
  @ApiResponse({ status: 400, description: 'Không thể gửi lại OTP' })
  async resendOTP(@Body() resendOtpDto: ResendOtpDto, @Res() res: Response) {
    try {
      const result = await this.authService.resendOTP(resendOtpDto.email);
      return res.status(HttpStatus.OK).send({
        status: 'success',
        message: 'OTP mới đã được gửi thành công',
        data: result,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        status: 'fail',
        message: error.message,
      });
    }
  }

  @Post('is-register')
  @ApiOperation({ summary: 'Xác thực OTP và hoàn tất đăng ký' })
  @ApiResponse({ status: 200, description: 'Đăng ký thành công' })
  @ApiResponse({ status: 400, description: 'OTP không hợp lệ hoặc hết hạn' })
  async checkRegister(@Res() res: any, @Body() body: CheckRegister) {
    try {
      if (body) {
        const key = body.key;
        const email = body.email;
        if (key && email) {
          const check: boolean = await this.authService.CheckRegister({
            key,
            email,
          });
          return res.status(HttpStatus.OK).send({
            status: check ? 'success' : 'fail',
          });
        }
      }
    } catch (error) {
      return res.status(400).send({
        status: 'fail',
        message: error.message,
      });
    }
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Xác thực OTP và hoàn tất đăng ký' })
  @ApiResponse({ status: 200, description: 'Đăng ký thành công' })
  @ApiResponse({ status: 400, description: 'OTP không hợp lệ hoặc hết hạn' })
  async verifyOTP(
    @Body() registerOtpVerifyDTO: RegisterOtpVerifyDTO,
    @Res() res: Response,
  ) {
    try {
      const result = await this.authService.verifyOTP(registerOtpVerifyDTO);
      return res.status(HttpStatus.CREATED).send({
        status: 'success',
        message: 'Đăng ký thành công',
        data: result,
      });
    } catch (error) {
      // Check for Prisma unique constraint error
      if (error.code === 'P2002' && error.meta?.target?.includes('phone')) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          status: 'fail',
          message: 'Số điện thoại đã được sử dụng bởi tài khoản khác',
        });
      }

      return res.status(HttpStatus.BAD_REQUEST).send({
        status: 'fail',
        message: error.message,
      });
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập với username và mật khẩu' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
  @ApiResponse({ status: 400, description: 'Thiếu thông tin FCM token' })
  @ApiResponse({ status: 401, description: 'Thông tin đăng nhập không hợp lệ' })
  @ApiResponse({ status: 500, description: 'Lỗi server nội bộ' })
  async login(
    @Body() loginDto: LoginDTO,
    @DeviceHeaders() deviceInfo: DeviceInfo,
    @Res() res: Response,
  ) {
    if (!deviceInfo.fcmToken) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        status: 'fail',
        message: 'FCM token là bắt buộc để đăng nhập',
      });
    }
    const result = await this.authService.login(
      loginDto,
      deviceInfo.deviceId,
      deviceInfo.fcmToken,
      deviceInfo.ip,
    );

    if (!result) {
      return res.status(HttpStatus.UNAUTHORIZED).send({
        status: 'fail',
        message: 'Thông tin đăng nhập không hợp lệ',
      });
    }

    return res.status(HttpStatus.OK).send({
      status: 'success',
      message: 'Đăng nhập thành công',
      data: result,
    });
  }

  @Post('refresh')
  @ApiBearerAuth()
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: 'Làm mới access token bằng refresh token' })
  @ApiResponse({ status: 200, description: 'Làm mới token thành công' })
  @ApiResponse({
    status: 401,
    description: 'Refresh token không hợp lệ hoặc hết hạn',
  })
  async refresh(
    @DeviceHeaders() deviceInfo: DeviceInfo,
    @Res() res: Response,
    @Req() req: any,
  ) {
    try {
      this.logger.log('Refresh token request received', req.account);
      if (!req.account) {
        return res.status(HttpStatus.UNAUTHORIZED).send({
          status: 'fail',
          message: 'Token không hợp lệ hoặc đã hết hạn',
        });
      }

      const accessToken = await this.tokenService.generateAccessToken(
        req.account,
      );

      const refreshToken = req.headers['authorization']?.split(' ')[1];
      const newRefreshToken = await this.tokenService.generateRefreshToken({
        account: req.account,
        deviceId: deviceInfo.deviceId,
        ip: deviceInfo.ip,
        existingToken: refreshToken,
      });

      return res.status(HttpStatus.OK).send({
        status: 'success',
        message: 'Làm mới token thành công',
        data: {
          access_token: accessToken,
          refresh_token: newRefreshToken,
        },
      });
    } catch (error) {
      return res.status(HttpStatus.UNAUTHORIZED).send({
        status: 'fail',
        message: error.message || 'Không thể làm mới token',
      });
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Đăng xuất và thu hồi token' })
  @ApiResponse({ status: 200, description: 'Đăng xuất thành công' })
  async logout(
    @DeviceHeaders() deviceInfo: DeviceInfo,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const accessToken = req.headers['authorization']?.replace('Bearer ', '');
      if (!accessToken) {
        throw new Error('Access token not provided');
      }
      await this.authService.logout(
        accessToken,
        deviceInfo.ip,
        deviceInfo.deviceId,
      );

      return res.status(HttpStatus.OK).send({
        status: 'success',
        message: 'Đăng xuất thành công',
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        status: 'fail',
        message: error.message,
      });
    }
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDTO,
    @Res() res: Response,
  ): Promise<any> {
    try {
      await this.authService.forgotPassword(forgotPasswordDto);
      return res.status(HttpStatus.OK).send({
        status: 'success',
        message: 'Email đã được gửi đến bạn',
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        status: 'success',
        message: error.message,
      });
    }
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDTO,
    @Res() res: Response,
  ): Promise<any> {
    try {
      await this.authService.resetPassword(resetPasswordDto);
      return res.status(HttpStatus.OK).send({
        status: 'success',
        message: 'Email đã được gửi đến bạn',
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        status: 'success',
        message: error.message,
      });
    }
  }
}
