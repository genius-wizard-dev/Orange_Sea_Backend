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

import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { GroupService } from './group.service';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createGroup(
    @Request() req,
    @Body()
    body: { name?: string; participantIds: string[]; isGroup?: boolean },
  ) {
    const accountId = req.account.id;
    if (body.name) {
      return this.groupService.createGroup(
        accountId,
        body.participantIds,
        body.isGroup,
        body.name,
      );
    } else {
      return this.groupService.createGroup(
        accountId,
        body.participantIds,
        body.isGroup,
      );
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getGroups(@Request() req) {
    const accountId = req.account.id;
    return this.groupService.getGroupsByUserId(accountId);
  }

  @Put(':groupId/participant')
  @UseGuards(JwtAuthGuard)
  async addParticipant(
    @Request() req,
    @Param('groupId') groupId: string,
    @Body() body: { participantId: string },
  ) {
    const accountId = req.account.id;
    return this.groupService.addParticipant(
      groupId,
      accountId,
      body.participantId,
    );
  }

  @Delete(':groupId/participant/:participantId')
  @UseGuards(JwtAuthGuard)
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
  async deleteGroup(@Request() req, @Param('groupId') groupId: string) {
    const accountId = req.account.id;
    return this.groupService.deleteGroup(groupId, accountId);
  }
}
