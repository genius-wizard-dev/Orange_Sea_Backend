import {
  Body,
  Controller,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import {
  DeviceHeaders,
  DeviceInfo,
} from 'src/common/decorators/client.header.decorator';
import { TokenService } from 'src/token/token.service';
import { errorResponse, successResponse } from 'src/utils/api.response.factory';
import {
  SwaggerErrorResponse,
  SwaggerSuccessResponse,
} from 'src/utils/swagger.helper';

import { GetProfileIdResponseDTO } from 'src/profile/dto/get.profile.dto';
import { AuthService } from './auth.service';
import { ForgotPasswordDTO, ResetPasswordDTO } from './dto/forgot.password.dto';
import { LoginDTO, LoginUserResponseDTO } from './dto/login.dto';
import {
  CheckRegister,
  RegisterDTO,
  RegisterOtpVerifyDTO,
  RegisterResponse,
  RegisterResponseDTO,
  ResendOtpDTO,
} from './dto/register.dto';
import { JwtAuthGuard } from './guards/auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiOkResponse({
    description: 'Đăng ký thành công',
    type: SwaggerSuccessResponse('register', 'auth', RegisterResponse),
  })
  @ApiBadRequestResponse({
    description: 'Đăng ký thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Đăng ký thất bại',
      'register',
      'auth',
    ),
  })
  async register(@Body() registerDTO: RegisterDTO, @Res() res: Response) {
    try {
      const result = await this.authService.register(registerDTO);
      return res
        .status(HttpStatus.OK)
        .send(successResponse(result, 'Đăng ký thành công'));
    } catch (error) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(
          errorResponse(
            'Đăng ký thất bại',
            HttpStatus.BAD_REQUEST,
            error.message,
          ),
        );
    }
  }

  @Post('resend-otp')
  @ApiOperation({ summary: 'Gửi lại OTP sau 2 phút' })
  @ApiOkResponse({
    description: 'OTP mới đã được gửi thành công',
    type: SwaggerSuccessResponse('Resend_Otp', 'auth', ResendOtpDTO),
  })
  @ApiBadRequestResponse({
    description: 'Gửi OTP thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Gửi OTP thất bại',
      'Resend_Otp',
      'auth',
    ),
  })
  async resendOTP(@Body() resendOtpDTO: ResendOtpDTO, @Res() res: Response) {
    try {
      const result = await this.authService.resendOTP(resendOtpDTO.email);
      return res
        .status(HttpStatus.OK)
        .send(successResponse(result, 'OTP mới đã được gửi thành công'));
    } catch (error) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(
          errorResponse(
            'Gửi OTP thất bại',
            HttpStatus.BAD_REQUEST,
            error.message,
          ),
        );
    }
  }

  @Post('is-register')
  @ApiOperation({ summary: 'Kiểm tra tình trạng đăng ký' })
  @ApiOkResponse({
    description: 'Kiểm tra tình trạng đăng ký thành công',
    type: SwaggerSuccessResponse('Is_Register', 'auth'),
  })
  @ApiBadRequestResponse({
    description: 'Kiểm tra tình trạng đăng ký thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Kiểm tra đăng ký thất bại',
      'Is_Register',
      'auth',
    ),
  })
  async checkRegister(@Res() res: any, @Body() body: CheckRegister) {
    try {
      await this.authService.CheckRegister(body);
      return res.status(HttpStatus.OK).send(successResponse());
    } catch (error) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(
          errorResponse(
            'Kiểm tra đăng ký thất bại',
            HttpStatus.BAD_REQUEST,
            error.message,
          ),
        );
    }
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Xác thực OTP và hoàn tất đăng ký' })
  @ApiOkResponse({
    description: 'Xác thực OTP thành công',
    type: SwaggerSuccessResponse('Verify_Otp', 'auth', RegisterResponseDTO),
  })
  @ApiBadRequestResponse({
    description: 'Xác thực OTP thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Xác thực OTP thất bại',
      'Verify_Otp',
      'auth',
    ),
  })
  async verifyOTP(
    @Body() registerOtpVerifyDTO: RegisterOtpVerifyDTO,
    @Res() res: Response,
  ) {
    try {
      const result = await this.authService.verifyOTP(registerOtpVerifyDTO);
      return res
        .status(HttpStatus.CREATED)
        .send(successResponse(result, 'Xác thực OTP thành công'));
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('phone')) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send(
            errorResponse(
              'Số điện thoại đã được sử dụng bởi tài khoản khác',
              HttpStatus.BAD_REQUEST,
              error.message,
            ),
          );
      }
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(
          errorResponse(
            'OTP không hợp lệ hoặc hết hạn',
            HttpStatus.BAD_REQUEST,
            error.message,
          ),
        );
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập với username và mật khẩu' })
  @ApiOkResponse({
    description: 'Đăng nhập thành công',
    type: SwaggerSuccessResponse('Login', 'auth', LoginUserResponseDTO),
  })
  @ApiBadRequestResponse({
    description: 'Đăng nhập thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Đăng nhập thất bại',
      'Login',
      'auth',
    ),
  })
  async login(
    @Body() loginDTO: LoginDTO,
    @DeviceHeaders() deviceInfo: DeviceInfo,
    @Res() res: Response,
  ) {
    if (!deviceInfo.fcmToken) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(
          errorResponse(
            'FCM token là bắt buộc để đăng nhập',
            HttpStatus.BAD_REQUEST,
            '',
          ),
        );
    }
    try {
      const result = await this.authService.login(
        loginDTO,
        deviceInfo.deviceId,
        deviceInfo.fcmToken,
        deviceInfo.ip,
      );

      if (!result) {
        throw new Error('Thông tin đăng nhập không hợp lệ');
      }

      return res
        .status(HttpStatus.OK)
        .send(successResponse(result, 'Đăng nhập thành công'));
    } catch (error) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(errorResponse('Đăng nhập thất bại', 400, error.message));
    }
  }

  @Post('refresh')
  @ApiBearerAuth('JWT-AUTH')
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: 'Làm mới access token bằng refresh token' })
  @ApiOkResponse({
    description: 'Làm mới access token thành công',
    type: SwaggerSuccessResponse('Refresh', 'auth', LoginUserResponseDTO),
  })
  @ApiBadRequestResponse({
    description: 'Làm mới access token thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Làm mới access token thất bại',
      'Refresh',
      'auth',
    ),
  })
  @ApiUnauthorizedResponse({
    description: 'Token không hợp lệ hoặc đã hết hạn',
    type: SwaggerErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Token không hợp lệ hoặc đã hết hạn',
      'Refresh',
      'auth',
    ),
  })
  async refresh(
    @DeviceHeaders() deviceInfo: DeviceInfo,
    @Res() res: Response,
    @Req() req: any,
  ) {
    try {
      const accessToken = await this.tokenService.generateAccessToken(
        req.user.id,
      );
      const refreshToken = req.headers['authorization']?.split(' ')[1];
      const newRefreshToken = await this.tokenService.generateRefreshToken({
        profileId: req.user.id,
        deviceId: deviceInfo.deviceId,
        ip: deviceInfo.ip,
        fcmToken: deviceInfo.fcmToken,
        existingToken: refreshToken,
      });

      return res.status(HttpStatus.OK).send(
        successResponse(
          {
            access_token: accessToken,
            refresh_token: newRefreshToken,
          },
          'Làm mới token thành công',
        ),
      );
    } catch (error) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(
          errorResponse(
            error.message || 'Không thể làm mới token',
            HttpStatus.UNAUTHORIZED,
          ),
        );
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-AUTH')
  @ApiOperation({ summary: 'Đăng xuất và thu hồi token' })
  @ApiOkResponse({
    description: 'Đăng xuất thành công',
    type: SwaggerSuccessResponse('Logout', 'auth'),
  })
  @ApiBadRequestResponse({
    description: 'Đăng xuất thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Đăng xuất thất bại',
      'Logout',
      'auth',
    ),
  })
  @ApiUnauthorizedResponse({
    description: 'Token không hợp lệ hoặc đã hết hạn',
    type: SwaggerErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Token không hợp lệ hoặc đã hết hạn',
      'Logout',
      'auth',
    ),
  })
  async logout(
    @DeviceHeaders() deviceInfo: DeviceInfo,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const accessToken = req.headers['authorization']?.replace('Bearer ', '');
      const refreshToken = (req.body as any)?.refresh_token;
      if (!accessToken) {
        throw new Error('Access token not provided');
      }
      await this.authService.logout(
        accessToken,
        deviceInfo.ip,
        deviceInfo.deviceId,
        refreshToken,
      );

      return res
        .status(HttpStatus.OK)
        .send(successResponse(null, 'Đăng xuất thành công'));
    } catch (error) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(
          errorResponse(
            'Đăng xuất thất bại',
            HttpStatus.BAD_REQUEST,
            error.message,
          ),
        );
    }
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Quên mật khẩu' })
  @ApiOkResponse({
    description: 'Email đã được gửi đến bạn',
    type: SwaggerSuccessResponse('Forgot_Password', 'auth'),
  })
  @ApiBadRequestResponse({
    description: 'Quên mật khẩu thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Quên mật khẩu thất bại',
      'Forgot_Password',
      'auth',
    ),
  })
  async forgotPassword(
    @Body() forgotPasswordDTO: ForgotPasswordDTO,
    @Res() res: Response,
  ): Promise<any> {
    try {
      await this.authService.forgotPassword(forgotPasswordDTO);
      return res
        .status(HttpStatus.OK)
        .send(successResponse(null, 'Email đã được gửi đến bạn'));
    } catch (error) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(
          errorResponse(
            'Quên mật khẩu thất bại',
            HttpStatus.BAD_REQUEST,
            error.message,
          ),
        );
    }
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Đặt lại mật khẩu' })
  @ApiOkResponse({
    description: 'Mật khẩu đã được đặt lại',
    type: SwaggerSuccessResponse(
      'Reset_Password',
      'auth',
      GetProfileIdResponseDTO,
    ),
  })
  @ApiBadRequestResponse({
    description: 'Đặt lại mật khẩu thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Đặt lại mật khẩu thất bại',
      'Reset_Password',
      'auth',
    ),
  })
  async resetPassword(
    @Body() resetPasswordDTO: ResetPasswordDTO,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const result = await this.authService.resetPassword(resetPasswordDTO);
      return res
        .status(HttpStatus.OK)
        .send(successResponse(result, 'Đặt lại mật khẩu thành công'));
    } catch (error) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(
          errorResponse(
            'Đặt lại mật khẩu thất bại',
            HttpStatus.BAD_REQUEST,
            error.message,
          ),
        );
    }
  }
}
