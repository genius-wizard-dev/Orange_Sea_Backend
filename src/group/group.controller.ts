import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import {
  AddParticipantDto,
  CreateGroupDto,
  GroupResponseDto,
  UpdateGroupAvatarDto,
} from './dto';
import { GroupService } from './group.service';

@ApiTags('Group')
@ApiBearerAuth('JWT-auth')
@Controller('group')
export class GroupController {
  private readonly logger = new Logger(GroupController.name);
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo nhóm mới hoặc cuộc trò chuyện trực tiếp' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Nhóm đã được tạo thành công',
    type: GroupResponseDto,
  })
  async createGroup(@Request() req, @Body() createGroupDto: CreateGroupDto) {
    const accountId = req.account.id;
    if (createGroupDto.name) {
      return this.groupService.createGroup(
        accountId,
        createGroupDto.participantIds,
        true,
        createGroupDto.name,
      );
    } else {
      return this.groupService.createGroup(
        accountId,
        createGroupDto.participantIds,
      );
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách nhóm của người dùng hiện tại' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách nhóm',
    type: [GroupResponseDto],
  })
  async getGroups(@Request() req) {
    const accountId = req.account.id;
    return this.groupService.getGroupByAccountId(accountId);
  }

  @Put(':groupId/participant')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Thêm thành viên vào nhóm' })
  @ApiParam({ name: 'groupId', description: 'ID của nhóm' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thành viên đã được thêm vào nhóm',
  })
  async addParticipant(
    @Request() req,
    @Param('groupId') groupId: string,
    @Body() body: AddParticipantDto,
  ) {
    try {
      const accountId = req.account.id;
      const isOwner = await this.groupService.isGroupOwner(accountId, groupId);
      this.logger.debug(
        `Account ID: ${accountId}, Group ID: ${groupId}, Is Owner: ${isOwner}`,
      );
      if (body.participantIds.length === 0)
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Vui lòng chọn user cần thêm vào nhóm',
        };
      if (isOwner) {
        return this.groupService.addParticipant(
          groupId,
          accountId,
          body.participantIds,
        );
      } else {
        return {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Bạn không có quyền thêm thành viên vào nhóm này',
        };
      }
    } catch (error: any) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Đã xảy ra lỗi khi thêm thành viên vào nhóm',
      };
    }
  }

  @Delete(':groupId/participant')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Xóa thành viên khỏi nhóm' })
  @ApiParam({ name: 'groupId', description: 'ID của nhóm' })
  @ApiParam({ name: 'participantId', description: 'ID của thành viên cần xóa' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thành viên đã bị xóa khỏi nhóm',
  })
  async removeParticipant(
    @Request() req,
    @Param('groupId') groupId: string,
    @Body() body: { participantIds: string[] },
  ) {
    try {
      const accountId = req.account.id;
      const isOwner = await this.groupService.isGroupOwner(accountId, groupId);
      this.logger.debug(
        `Account ID: ${accountId}, Group ID: ${groupId}, Is Owner: ${isOwner}`,
      );
      if (body.participantIds.length === 0)
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Vui lòng chọn user cần xóa khỏi nhóm',
        };
      if (isOwner) {
        const result = await this.groupService.removeParticipants(
          groupId,
          accountId,
          body.participantIds,
        );

        // If there were non-members, include them in the response
        if (result.nonMembers) {
          this.logger.debug(
            `Some users were not members of the group: ${JSON.stringify(result.nonMembers)}`,
          );
        }

        return result;
      } else {
        return {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Bạn không có quyền xóa thành viên khỏi nhóm này',
        };
      }
    } catch (error: any) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Đã xảy ra lỗi khi xóa thành viên khỏi nhóm',
      };
    }
  }

  @Delete(':groupId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Xóa nhóm' })
  @ApiParam({ name: 'groupId', description: 'ID của nhóm cần xóa' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Nhóm đã được xóa thành công',
  })
  async deleteGroup(@Request() req, @Param('groupId') groupId: string) {
    const accountId = req.account.id;
    return this.groupService.deleteGroup(groupId, accountId);
  }

  @Delete(':groupId/leave')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Rời khỏi nhóm' })
  @ApiParam({ name: 'groupId', description: 'ID của nhóm muốn rời' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Đã rời khỏi nhóm thành công',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Không thể rời khỏi nhóm (không phải nhóm hoặc bạn là chủ nhóm)',
  })
  async leaveGroup(@Request() req, @Param('groupId') groupId: string) {
    try {
      const accountId = req.account.id;
      return this.groupService.leaveGroup(groupId, accountId);
    } catch (error: any) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || 'Đã xảy ra lỗi khi rời khỏi nhóm',
      };
    }
  }

  @Put(':groupId/owner')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Chuyển quyền chủ nhóm' })
  @ApiParam({ name: 'groupId', description: 'ID của nhóm' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Đã chuyển quyền chủ nhóm thành công',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Không thể chuyển quyền chủ nhóm',
  })
  async transferOwnership(
    @Request() req,
    @Param('groupId') groupId: string,
    @Body() body: { newOwnerId: string },
  ) {
    try {
      const accountId = req.account.id;
      if (!body.newOwnerId) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Vui lòng chọn thành viên để chuyển quyền chủ nhóm',
        };
      }
      return this.groupService.transferOwnership(
        groupId,
        accountId,
        body.newOwnerId,
      );
    } catch (error: any) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || 'Đã xảy ra lỗi khi chuyển quyền chủ nhóm',
      };
    }
  }

  @Get('search/:keyword')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tìm kiếm nhóm theo tên' })
  @ApiParam({ name: 'keyword', description: 'Từ khóa tìm kiếm' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách nhóm phù hợp với từ khóa tìm kiếm',
    type: [GroupResponseDto],
  })
  async searchGroups(@Request() req, @Param('keyword') keyword: string) {
    const accountId = req.account.id;
    return this.groupService.searchGroups(accountId, keyword);
  }

  @Get(':groupId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy thông tin của nhóm' })
  @ApiParam({ name: 'groupId', description: 'ID của nhóm' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Thông tin chi tiết của nhóm',
    type: GroupResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Người dùng không phải là thành viên của nhóm',
  })
  async getGroupInfo(@Request() req: any, @Param('groupId') groupId: string) {
    try {
      const accountId = req.account.id;
      return this.groupService.getGroupInfo(groupId, accountId);
    } catch (error: any) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Đã xảy ra lỗi khi lấy thông tin nhóm',
      };
    }
  }

  @Post(':groupId/rename')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Đổi tên nhóm' })
  @ApiParam({ name: 'groupId', description: 'ID của nhóm' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tên nhóm đã được đổi thành công',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Không thể đổi tên nhóm',
  })
  async renameGroup(
    @Request() req: any,
    @Param('groupId') groupId: string,
    @Body() body: { name: string },
  ) {
    try {
      const accountId = req.account.id;
      if (!body.name) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Vui lòng nhập tên nhóm mới',
        };
      }
      return this.groupService.renameGroup(groupId, accountId, body.name);
    } catch (error: any) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Đã xảy ra lỗi khi đổi tên nhóm',
      };
    }
  }

  @Put(':groupId/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Cập nhật avatar nhóm' })
  @ApiParam({ name: 'groupId', description: 'ID của nhóm' })
  @ApiBody({ type: UpdateGroupAvatarDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Avatar nhóm đã được cập nhật thành công',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Không thể cập nhật avatar nhóm (không phải nhóm hoặc bạn không phải chủ nhóm)',
  })
  async updateGroupAvatar(
    @Request() req,
    @Param('groupId') groupId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const accountId = req.account.id;
      if (!file) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Vui lòng chọn ảnh avatar cho nhóm',
        };
      }
      return this.groupService.updateGroupAvatar(groupId, accountId, file);
    } catch (error: any) {
      this.logger.error(
        `Lỗi cập nhật avatar nhóm: ${error.message}`,
        error.stack,
      );
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || 'Đã xảy ra lỗi khi cập nhật avatar nhóm',
      };
    }
  }
}
