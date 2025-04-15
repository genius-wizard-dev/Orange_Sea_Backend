/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Post, Get, Patch, Param, Body, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';

@Controller('friendship')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @UseGuards(JwtAuthGuard)
  @Post('send')
  async sendFriendRequest(@Request() req, @Body() dto: CreateFriendshipDto) {
    try {
      return await this.friendshipService.sendFriendRequest(req.user.id, dto);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('received')
  async getReceivedRequests(@Request() req) {
    try {
      return await this.friendshipService.getReceivedRequests(req.user.id);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/action')
  async handleFriendRequest(@Request() req, @Param('id') id: string, @Body('action') action: 'ACCEPT' | 'REJECT') {
    if (!id) {
      throw new HttpException('ID không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    if (action !== 'ACCEPT' && action !== 'REJECT') {
      throw new HttpException('Hành động không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.friendshipService.handleFriendRequest(id, req.user.id, action);
      return { message: `Yêu cầu kết bạn đã được ${action === 'ACCEPT' ? 'chấp nhận' : 'từ chối'}` };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}