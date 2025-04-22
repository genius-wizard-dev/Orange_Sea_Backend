import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { AddParticipantDto, CreateGroupDto, GroupResponseDto } from './dto';
import { GroupService } from './group.service';

@ApiTags('Groups')
@ApiBearerAuth()
@Controller('group')
export class GroupController {
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
        createGroupDto.isGroup,
        createGroupDto.name,
      );
    } else {
      return this.groupService.createGroup(
        accountId,
        createGroupDto.participantIds,
        createGroupDto.isGroup,
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
    @Body() addParticipantDto: AddParticipantDto,
  ) {
    const accountId = req.account.id;
    return this.groupService.addParticipant(
      groupId,
      accountId,
      addParticipantDto.participantId,
    );
  }

  @Delete(':groupId/participant/:participantId')
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
    @Param('participantId') participantId: string,
  ) {
    const accountId = req.account.id;
    return this.groupService.removeParticipant(
      groupId,
      accountId,
      participantId,
    );
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
}
