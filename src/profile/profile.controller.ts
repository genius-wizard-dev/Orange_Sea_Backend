import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { UpdateProfileDTO } from './dto/update.profile.dto';
import { ProfileService } from './profile.service';
@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin profile của người dùng hiện tại' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getMyProfile(@Req() req: any) {
    this.logger.debug(`getMyProfile called for account: ${req.account.id}`);
    try {
      this.logger.debug(`Getting profile with ID: ${req.account.profileId}`);
      const profile = await this.profileService.getProfileById(
        req.account.profileId,
      );
      this.logger.debug(
        `Profile retrieved successfully: ${JSON.stringify(profile)}`,
      );
      return {
        status: 'success',
        message: 'Lấy thông tin profile thành công',
        data: profile,
      };
    } catch (error) {
      this.logger.error(`Error in getMyProfile: ${error.message}`);
      this.logger.error(error.stack);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật profile của người dùng hiện tại' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async updateMyProfile(
    @Req() req: any,
    @Body() updateProfileDTO: UpdateProfileDTO,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    this.logger.debug(`updateMyProfile called for account: ${req.account.id}`);
    this.logger.debug(`Request body: ${JSON.stringify(updateProfileDTO)}`);
    this.logger.debug(`File included: ${file ? 'Yes' : 'No'}`);
    if (file) {
      this.logger.debug(
        `File details: name=${file.originalname}, size=${file.size}, mimetype=${file.mimetype}`,
      );
    }

    try {
      this.logger.debug(`Updating profile for account ID: ${req.account.id}`);
      const profile = await this.profileService.updateProfile(
        req.account.id,
        updateProfileDTO,
        file,
      );
      this.logger.debug(
        `Profile updated successfully: ${JSON.stringify(profile)}`,
      );
      return {
        status: 'success',
        message: 'Cập nhật profile thành công',
        data: profile,
      };
    } catch (error) {
      this.logger.error(`Error in updateMyProfile: ${error.message}`);
      this.logger.error(error.stack);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin profile theo ID' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy profile' })
  async getProfileById(@Param('id') id: string) {
    this.logger.debug(`getProfileById called with ID: ${id}`);
    try {
      this.logger.debug(`Fetching profile with ID: ${id}`);
      const profile = await this.profileService.getProfileById(id);
      this.logger.debug(
        `Profile fetched successfully: ${JSON.stringify(profile)}`,
      );
      return {
        status: 'success',
        message: 'Lấy thông tin profile thành công',
        data: profile,
      };
    } catch (error) {
      this.logger.error(`Error in getProfileById: ${error.message}`);
      this.logger.error(error.stack);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('username/:username')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tìm kiếm profile theo username' })
  @ApiResponse({ status: 200, description: 'Tìm kiếm thành công' })
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy profile' })
  async findProfileByUsername(@Param('username') username: string) {
    this.logger.debug(
      `findProfileByUsername called with username: ${username}`,
    );
    try {
      this.logger.debug(`Finding profile with username: ${username}`);
      const result = await this.profileService.findByUsername(username);
      const data = {
        id: result.profile.id,
        name: result.profile.name,
        avatar: result.profile.avatar,
      };
      this.logger.debug(`Profile found successfully: ${JSON.stringify(data)}`);
      return {
        status: 'success',
        message: 'Tìm kiếm profile thành công',
        data: data,
      };
    } catch (error) {
      this.logger.error(`Error in findProfileByUsername: ${error.message}`);
      this.logger.error(error.stack);
      return {
        status: 'fail',
        message: error.message,
        data: {},
      };
    }
  }
}
