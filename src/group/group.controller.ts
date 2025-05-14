import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Req,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { ProfileService } from 'src/profile/services/profile';
import { errorResponse, successResponse } from 'src/utils/api.response.factory';
import {
  SwaggerErrorResponse,
  SwaggerSuccessResponse,
} from 'src/utils/swagger.helper';
import {
  ChangeOwnerDTO,
  CreateGroupDTO,
  GroupIdResponseDTO,
  GroupResponseDTO,
  ParticipantIdsDTO,
  RenameGroupDTO,
  UpdateGroupAvatarDTO,
} from './dto';
import { GroupService } from './services/group';
@ApiTags('Group')
@ApiBearerAuth('JWT-AUTH')
@Controller('group')
export class GroupController {
  private readonly logger = new Logger(GroupController.name);
  constructor(
    private readonly groupService: GroupService,
    private readonly profileService: ProfileService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tạo nhóm' })
  @ApiOkResponse({
    description: 'Nhóm đã được tạo thành công',
    type: SwaggerSuccessResponse('Create_Group', 'group', GroupIdResponseDTO),
  })
  @ApiUnauthorizedResponse({
    description: 'Không có quyền truy cập',
    type: SwaggerErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Không có quyền truy cập',
      'Create_Group',
      'group',
    ),
  })
  @ApiBadRequestResponse({
    description: 'Dữ liệu không hợp lệ',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Dữ liệu không hợp lệ',
      'Create_Group',
      'group',
    ),
  })
  async createGroup(
    @Request() req,
    @Body() createGroupDTO: CreateGroupDTO,
    @Res() res: Response,
  ) {
    try {
      const profileId = req.user.id;
      const profile = await this.profileService.getProfileById(profileId);
      if (!profile) {
        throw new Error('Profile not found');
      }
      const result = await this.groupService.createGroup(
        profile.id,
        createGroupDTO.participantIds,
        createGroupDTO.name,
      );
      return res
        .status(HttpStatus.OK)
        .send(successResponse(result, 'Tạo nhóm thành công'));
    } catch (error) {
      this.logger.error(`Error creating group: ${error.message}`);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(errorResponse('Tạo nhóm thất bại', 400, error.message));
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách nhóm của người dùng hiện tại' })
  @ApiOkResponse({
    description: 'Danh sách nhóm',
    type: SwaggerSuccessResponse('Get_Groups', 'group', GroupResponseDTO, true),
  })
  @ApiBadRequestResponse({
    description: 'Lấy danh sách nhóm thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Lấy danh sách nhóm thất bại',
      'Get_Groups',
      'group',
    ),
  })
  @ApiUnauthorizedResponse({
    description: 'Không có quyền truy cập',
    type: SwaggerErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Không có quyền truy cập',
      'Get_Groups',
      'group',
    ),
  })
  async getGroups(@Request() req, @Res() res: Response) {
    try {
      const profileId = req.user.id;
      const profile = await this.profileService.getProfileById(profileId);
      if (!profile) {
        throw new Error('Profile not found');
      }
      const result = await this.groupService.getGroup(profile.id);
      return res
        .status(HttpStatus.OK)
        .send(successResponse(result, 'Lấy danh sách nhóm thành công'));
    } catch (error) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(errorResponse('Lấy danh sách nhóm thất bại', 400, error.message));
    }
  }

  @Put(':groupId/participant')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Thêm thành viên vào nhóm' })
  @ApiOkResponse({
    description: 'Thành viên đã được thêm vào nhóm',
    type: SwaggerSuccessResponse(
      'Add_Participant',
      'group',
      GroupIdResponseDTO,
    ),
  })
  @ApiBadRequestResponse({
    description: 'Thêm thành viên vào nhóm thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Thêm thành viên vào nhóm thất bại',
      'Add_Participant',
      'group',
    ),
  })
  @ApiUnauthorizedResponse({
    description: 'Không có quyền truy cập',
    type: SwaggerErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Không có quyền truy cập',
      'Add_Participant',
      'group',
    ),
  })
  async addParticipant(
    @Request() req,
    @Param('groupId') groupId: string,
    @Body() body: ParticipantIdsDTO,
    @Res() res: Response,
  ) {
    try {
      const profileId = req.user.id;
      const profile = await this.profileService.getProfileById(profileId);
      if (!profile) {
        throw new Error('Profile not found');
      }
      const result = await this.groupService.addParticipant(
        groupId,
        profile.id,
        body.participantIds,
      );
      return res
        .status(HttpStatus.OK)
        .send(successResponse(result, 'Thêm thành viên vào nhóm thành công'));
    } catch (error: any) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(
          errorResponse(
            'Thêm thành viên vào nhóm thất bại',
            400,
            error.message,
          ),
        );
    }
  }

  @Delete(':groupId/participant')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Xóa thành viên khỏi nhóm' })
  @ApiOkResponse({
    description: 'Thành viên đã được xóa khỏi nhóm',
    type: SwaggerSuccessResponse(
      'Remove_Participant',
      'group',
      GroupIdResponseDTO,
    ),
  })
  @ApiBadRequestResponse({
    description: 'Xóa thành viên khỏi nhóm thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Xóa thành viên khỏi nhóm thất bại',
      'Remove_Participant',
      'group',
    ),
  })
  @ApiUnauthorizedResponse({
    description: 'Không có quyền truy cập',
    type: SwaggerErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Không có quyền truy cập',
      'Remove_Participant',
      'group',
    ),
  })
  async removeParticipant(
    @Req() req,
    @Param('groupId') groupId: string,
    @Body() body: ParticipantIdsDTO,
    @Res() res: Response,
  ) {
    try {
      const profileId = req.user.id;
      const profile = await this.profileService.getProfileById(profileId);
      if (!profile) {
        throw new Error('Profile not found');
      }
      const result = await this.groupService.removeParticipants(
        groupId,
        profile.id,
        body.participantIds,
      );
      return res
        .status(HttpStatus.OK)
        .send(successResponse(result, 'Xóa thành viên khỏi nhóm thành công'));
    } catch (error: any) {
      this.logger.error(
        `Error removing participants from group: ${error.message}`,
        error.stack,
      );
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(
          errorResponse(
            'Xóa thành viên khỏi nhóm thất bại',
            400,
            error.message,
          ),
        );
    }
  }

  @Delete(':groupId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Xóa nhóm' })
  @ApiParam({ name: 'groupId', description: 'ID của nhóm cần xóa' })
  @ApiOkResponse({
    description: 'Nhóm đã được xóa thành công',
    type: SwaggerSuccessResponse('Delete_Group', 'group', GroupIdResponseDTO),
  })
  @ApiBadRequestResponse({
    description: 'Xóa nhóm thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Xóa nhóm thất bại',
      'Delete_Group',
      'group',
    ),
  })
  @ApiUnauthorizedResponse({
    description: 'Không có quyền truy cập',
    type: SwaggerErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Không có quyền truy cập',
      'Delete_Group',
      'group',
    ),
  })
  async deleteGroup(
    @Request() req,
    @Param('groupId') groupId: string,
    @Res() res: Response,
  ) {
    try {
      const profileId = req.user.id;
      const profile = await this.profileService.getProfileById(profileId);
      if (!profile) {
        throw new Error('Profile not found');
      }
      const result = await this.groupService.deleteGroup(groupId, profile.id);
      return res
        .status(HttpStatus.OK)
        .send(successResponse(result, 'Xóa nhóm thành công'));
    } catch (error: any) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(errorResponse('Xóa nhóm thất bại', 400, error.message));
    }
  }

  @Delete(':groupId/leave')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Rời khỏi nhóm' })
  @ApiParam({ name: 'groupId', description: 'ID của nhóm muốn rời' })
  async leaveGroup(
    @Request() req,
    @Param('groupId') groupId: string,
    @Res() res: Response,
  ) {
    try {
      const profileId = req.user.id;
      const profile = await this.profileService.getProfileById(profileId);
      if (!profile) {
        throw new Error('Profile not found');
      }

      const result = await this.groupService.leaveGroup(groupId, profile.id);
      return res
        .status(HttpStatus.OK)
        .send(successResponse(result, 'Rời khỏi nhóm thành công'));
    } catch (error: any) {
      this.logger.error(`Error leaving group: ${error.message}`, error.stack);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(errorResponse('Rời khỏi nhóm thất bại', 400, error.message));
    }
  }

  @Put(':groupId/owner')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Chuyển quyền chủ nhóm' })
  @ApiParam({ name: 'groupId', description: 'ID của nhóm' })
  @ApiOkResponse({
    description: 'Quyền chủ nhóm đã được chuyển thành công',
    type: SwaggerSuccessResponse(
      'Transfer_Ownership',
      'group',
      GroupIdResponseDTO,
    ),
  })
  @ApiBadRequestResponse({
    description: 'Chuyển quyền chủ nhóm thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Chuyển quyền chủ nhóm thất bại',
      'Transfer_Ownership',
      'group',
    ),
  })
  @ApiUnauthorizedResponse({
    description: 'Không có quyền truy cập',
    type: SwaggerErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Không có quyền truy cập',
      'Transfer_Ownership',
      'group',
    ),
  })
  async transferOwnership(
    @Req() req,
    @Param('groupId') groupId: string,
    @Body() body: ChangeOwnerDTO,
    @Res() res: Response,
  ) {
    try {
      const profileId = req.user.id;
      const profile = await this.profileService.getProfileById(profileId);
      if (!profile) {
        throw new Error('Profile not found');
      }

      const result = await this.groupService.transferOwnership(
        groupId,
        profile.id,
        body.newOwnerId,
      );
      return res
        .status(HttpStatus.OK)
        .send(successResponse(result, 'Chuyển quyền chủ nhóm thành công'));
    } catch (error: any) {
      this.logger.error(
        `Error transferring ownership: ${error.message}`,
        error.stack,
      );
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(
          errorResponse('Chuyển quyền chủ nhóm thất bại', 400, error.message),
        );
    }
  }

  @Get(':groupId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy thông tin của nhóm' })
  @ApiParam({ name: 'groupId', description: 'ID của nhóm' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thông tin chi tiết của nhóm',
    type: SwaggerSuccessResponse('Get_Group_Info', 'group', GroupResponseDTO),
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Người dùng không phải là thành viên của nhóm',
    type: SwaggerErrorResponse(
      HttpStatus.FORBIDDEN,
      'Người dùng không phải là thành viên của nhóm',
      'Get_Group_Info',
      'group',
    ),
  })
  @ApiUnauthorizedResponse({
    description: 'Không có quyền truy cập',
    type: SwaggerErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Không có quyền truy cập',
      'Get_Group_Info',
      'group',
    ),
  })
  async getGroupInfo(
    @Req() req: any,
    @Param('groupId') groupId: string,
    @Res() res: Response,
  ) {
    try {
      const profileId = req.user.id;
      const profile = await this.profileService.getProfileById(profileId);
      if (!profile) {
        throw new Error('Profile not found');
      }

      const result = await this.groupService.getGroupInfo(groupId, profile.id);
      return res
        .status(HttpStatus.OK)
        .send(successResponse(result, 'Lấy thông tin nhóm thành công'));
    } catch (error: any) {
      this.logger.error(
        `Error getting group info: ${error.message}`,
        error.stack,
      );
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(errorResponse('Lấy thông tin nhóm thất bại', 400, error.message));
    }
  }

  @Post(':groupId/rename')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Đổi tên nhóm' })
  @ApiParam({ name: 'groupId', description: 'ID của nhóm' })
  @ApiOkResponse({
    description: 'Tên nhóm đã được đổi thành công',
    type: SwaggerSuccessResponse('Rename_Group', 'group', GroupIdResponseDTO),
  })
  @ApiBadRequestResponse({
    description: 'Đổi tên nhóm thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Đổi tên nhóm thất bại',
      'Rename_Group',
      'group',
    ),
  })
  @ApiUnauthorizedResponse({
    description: 'Không có quyền truy cập',
    type: SwaggerErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Không có quyền truy cập',
      'Rename_Group',
      'group',
    ),
  })
  async renameGroup(
    @Req() req: any,
    @Param('groupId') groupId: string,
    @Body() body: RenameGroupDTO,
    @Res() res: Response,
  ) {
    try {
      const profileId = req.user.id;
      const profile = await this.profileService.getProfileById(profileId);
      if (!profile) {
        throw new Error('Profile not found');
      }

      const result = await this.groupService.renameGroup(
        groupId,
        profile.id,
        body.name,
      );
      return res
        .status(HttpStatus.OK)
        .send(successResponse(result, 'Đổi tên nhóm thành công'));
    } catch (error: any) {
      this.logger.error(`Error renaming group: ${error.message}`, error.stack);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(errorResponse('Đổi tên nhóm thất bại', 400, error.message));
    }
  }

  @Put(':groupId/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Cập nhật avatar nhóm' })
  @ApiParam({ name: 'groupId', description: 'ID của nhóm' })
  @ApiBody({ type: UpdateGroupAvatarDTO })
  @ApiOkResponse({
    description: 'Avatar nhóm đã được cập nhật thành công',
    type: SwaggerSuccessResponse(
      'Update_Group_Avatar',
      'group',
      GroupIdResponseDTO,
    ),
  })
  @ApiBadRequestResponse({
    description: 'Cập nhật avatar nhóm thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Cập nhật avatar nhóm thất bại',
      'Update_Group_Avatar',
      'group',
    ),
  })
  @ApiUnauthorizedResponse({
    description: 'Không có quyền truy cập',
    type: SwaggerErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Không có quyền truy cập',
      'Update_Group_Avatar',
      'group',
    ),
  })
  async updateGroupAvatar(
    @Request() req,
    @Param('groupId') groupId: string,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      const profileId = req.user.id;
      if (!file) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Vui lòng chọn ảnh avatar cho nhóm',
        };
      }
      const profile = await this.profileService.getProfileById(profileId);
      if (!profile) {
        throw new Error('Profile not found');
      }

      const result = await this.groupService.updateGroupAvatar(
        groupId,
        profile.id,
        file,
      );
      return res
        .status(HttpStatus.OK)
        .send(successResponse(result, 'Cập nhật avatar nhóm thành công'));
    } catch (error: any) {
      this.logger.error(
        `Lỗi cập nhật avatar nhóm: ${error.message}`,
        error.stack,
      );
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(
          errorResponse('Cập nhật avatar nhóm thất bại', 400, error.message),
        );
    }
  }
}
