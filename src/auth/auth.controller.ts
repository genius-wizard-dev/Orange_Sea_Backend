import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { ForgotPasswordDTO, ResetPasswordDTO } from './dto/forgot.password.dto';
import { LoginDTO } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ short: { limit: 2, ttl: 1000 }, long: { limit: 5, ttl: 60000 } })
  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập với username và mật khẩu' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
  @ApiResponse({ status: 401, description: 'Thông tin đăng nhập không hợp lệ' })
  async login(@Body() loginDto: LoginDTO, @Req() req: any) {
    try {
      const result = await this.authService.login(loginDto, req);
      return {
        status: 'success',
        message: 'Đăng nhập thành công',
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
  @ApiResponse({ status: 409, description: 'Username hoặc email đã tồn tại' })
  async register(@Body() registerDto: RegisterDto) {
    try {
      const result = await this.authService.register(registerDto);
      return {
        status: 'success',
        message: 'Đăng ký tài khoản thành công',
        data: result,
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Làm mới access token bằng refresh token' })
  @ApiResponse({ status: 200, description: 'Làm mới token thành công' })
  @ApiResponse({
    status: 401,
    description: 'Refresh token không hợp lệ hoặc hết hạn',
  })
  async refresh(@Body('refresh_token') refreshToken: string, @Req() req: any) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token là bắt buộc');
    }
    try {
      // Xác thực refresh token
      const account = await this.authService.verifyRefreshToken(
        refreshToken,
        req,
      );

      // Tạo access token mới
      const accessToken = await this.authService.generateAccessToken(account);

      // Tạo refresh token mới, giữ thời gian hết hạn ban đầu
      const newRefreshToken = await this.authService.generateRefreshToken(
        account,
        req,
        refreshToken,
      );

      // Thu hồi refresh token cũ
      await this.authService.revokeRefreshToken(refreshToken);

      return {
        status: 'success',
        message: 'Làm mới token thành công',
        data: {
          access_token: accessToken,
          refresh_token: newRefreshToken,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('logout')
  @ApiOperation({ summary: 'Đăng xuất và thu hồi token' })
  @ApiResponse({ status: 200, description: 'Đăng xuất thành công' })
  async logout(
    @Headers('authorization') authHeader: string,
    @Body('refresh_token') refreshToken: string,
  ) {
    try {
      if (!authHeader || !refreshToken) {
        throw new UnauthorizedException(
          'Access token và refresh token là bắt buộc',
        );
      }

      const accessToken = authHeader.replace('Bearer ', '');
      await this.authService.logout(accessToken, refreshToken);

      return {
        status: 'success',
        message: 'Đăng xuất thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDTO,
  ): Promise<void> {
    await this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDTO,
  ): Promise<void> {
    await this.authService.resetPassword(resetPasswordDto);
  }
}
