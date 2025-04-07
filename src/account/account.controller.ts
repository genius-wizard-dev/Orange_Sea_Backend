import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { AccountService } from './account.service';
import { UpdatePasswordDTO } from './dto/update.account.dto';
@ApiTags('account')
@Controller('account')
export class AccountController {
  private readonly logger = new Logger(AccountController.name);
  constructor(private readonly accountService: AccountService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin tài khoản theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin tài khoản thành công',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tài khoản' })
  async getAccountById(@Param('id') id: string) {
    const result = await this.accountService.findAccountById(id);
    return {
      status: 'success',
      message: 'Lấy thông tin tài khoản thành công',
      data: result,
    };
  }

  @Get('username/:username')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin tài khoản theo username' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin tài khoản thành công',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tài khoản' })
  async getAccountByUsername(@Param('username') username: string) {
    const result = await this.accountService.findAccountByUsername(username);
    return {
      status: 'success',
      message: 'Lấy thông tin tài khoản thành công',
      data: result,
    };
  }

  @Put(':id/password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật mật khẩu tài khoản' })
  @ApiResponse({ status: 200, description: 'Cập nhật mật khẩu thành công' })
  async updatePassword(
    @Param('id') id: string,
    @Body() updatePassword: UpdatePasswordDTO,
    @Req() req: any, // req.account contains decoded JWT payload after JwtAuthGuard processes the request
  ) {
    this.logger.debug('Account object:', req.account);
    this.logger.debug(`ID param: ${id}`);

    if (req.account.id !== id && req.account.role !== 'ADMIN') {
      return {
        status: 'error',
        message: 'Bạn chỉ có thể cập nhật tài khoản của chính mình',
      };
    }

    const result = await this.accountService.updateAccount(id, updatePassword);
    return {
      status: 'success',
      message: 'Cập nhật mật khẩu thành công',
      data: result,
    };
  }

  // @Delete(':id')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Xóa tài khoản' })
  // @ApiResponse({ status: 200, description: 'Xóa tài khoản thành công' })
  // async deleteAccount(@Param('id') id: string, @Req() req: any) {
  //   // Đảm bảo người dùng chỉ có thể xóa tài khoản của chính họ trừ khi họ là admin
  //   if (req.account.id !== id && req.account.role !== 'ADMIN') {
  //     return {
  //       status: 'error',
  //       message: 'Bạn chỉ có thể xóa tài khoản của chính mình',
  //     };
  //   }

  //   await this.accountService.deleteAccount(id);
  //   return {
  //     status: 'success',
  //     message: 'Xóa tài khoản thành công',
  //   };
  // }
}
