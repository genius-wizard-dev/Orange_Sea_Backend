import {
  Body,
  Controller,
  HttpStatus,
  Logger,
  Put,
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
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { errorResponse, successResponse } from 'src/utils/api.response.factory';
import {
  SwaggerErrorResponse,
  SwaggerSuccessResponse,
} from 'src/utils/swagger.helper';
import { AccountService } from './account.service';
import { UpdatePasswordDTO } from './dto/update.account.dto';
@ApiTags('Account')
@ApiBearerAuth('JWT-AUTH')
@Controller('account')
export class AccountController {
  private readonly logger = new Logger(AccountController.name);
  constructor(private readonly accountService: AccountService) {}

  @Put('password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cập nhật mật khẩu tài khoản' })
  @ApiOkResponse({
    description: 'Cập nhật mật khẩu thành công',
    type: SwaggerSuccessResponse('password', 'account'),
  })
  @ApiBadRequestResponse({
    description: 'Cập nhật mật khẩu thất bại',
    type: SwaggerErrorResponse(
      400,
      'Cập nhật mật khẩu thất bại',
      'password',
      'account',
    ),
  })
  @ApiUnauthorizedResponse({
    description: 'Không có quyền truy cập',
    type: SwaggerErrorResponse(
      401,
      'Không có quyền truy cập',
      'password',
      'account',
    ),
  })
  async updatePassword(
    @Body() updatePassword: UpdatePasswordDTO,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      await this.accountService.changePassword(req.account.id, updatePassword);
      return res
        .status(HttpStatus.OK)
        .send(successResponse<null>(null, 'Cập nhật mật khẩu thành công'));
    } catch (error) {
      this.logger.error(`Failed to update password: ${error.message}`);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(errorResponse('Cập nhật mật khẩu thất bại', 400, error.message));
    }
  }

  // @Get(':id')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth('JWT-AUTH')
  // @ApiOperation({ summary: 'Lấy thông tin tài khoản theo ID' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Lấy thông tin tài khoản thành công',
  // })
  // @ApiResponse({ status: 404, description: 'Không tìm thấy tài khoản' })
  // async getAccountById(@Param('id') id: string): Promise<ResponeData<any>> {
  //   try {
  //     const result = await this.accountService.findAccountById(id);
  //   } catch (error) {

  //   }
  // }

  // @Get('username/:username')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth('JWT-AUTH')
  // @ApiOperation({ summary: 'Lấy thông tin tài khoản theo username' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Lấy thông tin tài khoản thành công',
  // })
  // @ApiResponse({ status: 404, description: 'Không tìm thấy tài khoản' })
  // async getAccountByUsername(@Param('username') username: string) {
  //   const result = await this.accountService.findAccountByUsername(username);
  //   return {
  //     status: 'success',
  //     message: 'Lấy thông tin tài khoản thành công',
  //     data: result,
  //   };
  // }
}
