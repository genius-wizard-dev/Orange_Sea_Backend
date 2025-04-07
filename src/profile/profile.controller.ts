import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { UpdateProfileDTO } from './dto/update.profile.dto';
import { ProfileService } from './profile.service';
@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Lấy thông tin profile của người dùng hiện tại' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getMyProfile(@Req() req: any) {
    try {
      const profile = await this.profileService.getProfileByAccountId(
        req.account.id,
      );
      return {
        status: 'success',
        message: 'Lấy thông tin profile thành công',
        data: profile,
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  @ApiOperation({ summary: 'Cập nhật profile của người dùng hiện tại' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async updateMyProfile(
    @Req() req: any,
    @Body() updateProfileDTO: UpdateProfileDTO,
  ) {
    try {
      const profile = await this.profileService.updateProfile(
        req.account.id,
        updateProfileDTO,
      );
      return {
        status: 'success',
        message: 'Cập nhật profile thành công',
        data: profile,
      };
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin profile theo ID' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy profile' })
  async getProfileById(@Param('id') id: string) {
    try {
      const profile = await this.profileService.getProfileById(id);
      return {
        status: 'success',
        message: 'Lấy thông tin profile thành công',
        data: profile,
      };
    } catch (error) {
      throw error;
    }
  }
}
