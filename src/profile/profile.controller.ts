import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  Put,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { errorResponse, successResponse } from 'src/utils/api.response.factory';
import {
  SwaggerErrorResponse,
  SwaggerSuccessResponse,
} from 'src/utils/swagger.helper';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { GetProfileDTO, GetProfileIdResponseDTO } from './dto/get.profile.dto';
import { UpdateProfileDTO } from './dto/update.profile.dto';
import { ProfileService } from './services/profile';
@ApiTags('Profile')
@Controller('profile')
@ApiBearerAuth('JWT-AUTH')
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Lấy thông tin profile của người dùng hiện tại' })
  @ApiOkResponse({
    description: 'Lấy thông tin profile thành công',
    type: SwaggerSuccessResponse('Get_My_Profile', 'profile', GetProfileDTO),
  })
  @ApiUnauthorizedResponse({
    description: 'Không có quyền truy cập',
    type: SwaggerErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Không có quyền truy cập',
      'Get_My_Profile',
      'profile',
    ),
  })
  @ApiBadRequestResponse({
    description: 'Lấy thông tin profile thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Lấy thông tin profile thất bại',
      'Get_My_Profile',
      'profile',
    ),
  })
  async getMyProfile(@Req() req: any, @Res() res: Response) {
    try {
      const profile = await this.profileService.getProfileById(
        req.account.profileId,
      );
      return res
        .status(HttpStatus.OK)
        .send(successResponse(profile, 'Lấy thông tin profile thành công'));
    } catch (error) {
      this.logger.error(`Error in getMyProfile: ${error}`);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(
          errorResponse(
            'Lấy thông tin profile thất bại',
            HttpStatus.BAD_REQUEST,
            error.message,
          ),
        );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Cập nhật profile của người dùng hiện tại' })
  @ApiOkResponse({
    description: 'Cập nhật profile thành công',
    type: SwaggerSuccessResponse(
      'Update_My_Profile',
      'profile',
      GetProfileIdResponseDTO,
    ),
  })
  @ApiUnauthorizedResponse({
    description: 'Không có quyền truy cập',
    type: SwaggerErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Không có quyền truy cập',
      'Update_My_Profile',
      'profile',
    ),
  })
  @ApiBadRequestResponse({
    description: 'Cập nhật profile thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Cập nhật profile thất bại',
      'Update_My_Profile',
      'profile',
    ),
  })
  async updateMyProfile(
    @Req() req: any,
    @Body() updateProfileDTO: UpdateProfileDTO,
    @Res() res: Response,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      const profile = await this.profileService.updateProfile(
        req.account.profileId,
        updateProfileDTO,
        file,
      );
      return res
        .status(HttpStatus.OK)
        .send(successResponse(profile, 'Cập nhật profile thành công'));
    } catch (error) {
      this.logger.error(error.stack);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(errorResponse('Cập nhật profile thất bại', 400, error.message));
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin profile theo ID' })
  @ApiOkResponse({
    description: 'Lấy thông tin profile thành công',
    type: SwaggerSuccessResponse('Get_Profile_By_ID', 'profile', GetProfileDTO),
  })
  @ApiUnauthorizedResponse({
    description: 'Không có quyền truy cập',
    type: SwaggerErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Không có quyền truy cập',
      'Get_Profile_By_ID',
      'profile',
    ),
  })
  @ApiBadRequestResponse({
    description: 'Lấy thông tin profile thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Lấy thông tin profile thất bại',
      'Get_Profile_By_ID',
      'profile',
    ),
  })
  async getProfileById(@Param('id') id: string, @Res() res: Response) {
    this.logger.debug(`getProfileById called with ID: ${id}`);
    try {
      const profile = await this.profileService.getProfileById(id);
      return res
        .status(HttpStatus.OK)
        .send(successResponse(profile, 'Lấy thông tin profile thành công'));
    } catch (error) {
      this.logger.error(error.stack);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(
          errorResponse('Lấy thông tin profile thất bại', 400, error.message),
        );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('username/:username')
  @ApiOperation({ summary: 'Tìm kiếm profile theo username' })
  @ApiOkResponse({
    description: 'Tìm kiếm profile thành công',
    type: SwaggerSuccessResponse(
      'Find_Profile_By_Username',
      'profile',
      GetProfileDTO,
    ),
  })
  @ApiUnauthorizedResponse({
    description: 'Không có quyền truy cập',
    type: SwaggerErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Không có quyền truy cập',
      'Find_Profile_By_Username',
      'profile',
    ),
  })
  @ApiBadRequestResponse({
    description: 'Tìm kiếm profile thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Tìm kiếm profile thất bại',
      'Find_Profile_By_Username',
      'profile',
    ),
  })
  async findProfileByUsername(
    @Param('username') username: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.profileService.findByUsername(username);
      return res
        .status(HttpStatus.OK)
        .send(successResponse(result, 'Tìm kiếm profile thành công'));
    } catch (error) {
      this.logger.error(error.stack);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(errorResponse('Tìm kiếm profile thất bại', 400, error.message));
    }
  }
}
