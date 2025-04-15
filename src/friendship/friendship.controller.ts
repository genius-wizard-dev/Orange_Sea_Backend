/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { FriendshipService } from './friendship.service';

@Controller('friendship')
export class FriendshipController {
  private readonly logger = new Logger(FriendshipController.name);
  constructor(private readonly friendshipService: FriendshipService) {}

  @UseGuards(JwtAuthGuard)
  @Post('send')
  async sendFriendRequest(
    @Request() req: any,
    @Body() dto: CreateFriendshipDto,
  ) {
    try {
      this.logger.log(`Sending friend request from account ${req.account.id}`);
      return await this.friendshipService.sendFriendRequest(
        req.account.id,
        dto,
      );
    } catch (error) {
      this.logger.error(`Error sending friend request: ${error.message}`);
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('received')
  async getReceivedRequests(@Request() req: any) {
    try {
      this.logger.log(
        `Fetching received friend requests for account ${req.account.id}`,
      );
      return await this.friendshipService.getReceivedRequests(req.account.id);
    } catch (error) {
      this.logger.error(`Error fetching received requests: ${error.message}`);
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('sending')
  async getSendingRequests(@Request() req: any) {
    try {
      this.logger.log(
        `Fetching sending friend requests for account ${req.account.id}`,
      );
      return await this.friendshipService.getSendingRequests(req.account.id);
    } catch (error) {
      this.logger.error(`Error fetching sending requests: ${error.message}`);
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/action')
  async handleFriendRequest(
    @Request() req: any,
    @Param('id') id: string,
    @Body('action') action: 'ACCEPT' | 'REJECT',
  ) {
    if (!id) {
      throw new HttpException('ID không hợp lệ', HttpStatus.BAD_REQUEST);
    }
    if (!['ACCEPT', 'REJECT'].includes(action)) {
      throw new HttpException('Hành động không hợp lệ', HttpStatus.BAD_REQUEST);
    }
    try {
      await this.friendshipService.handleFriendRequest(
        id,
        req.account.id,
        action,
      );
      return {
        message: `Yêu cầu kết bạn đã được ${action === 'ACCEPT' ? 'chấp nhận' : 'từ chối'}`,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('friends')
  async getFriends(@Request() req: any) {
    try {
      this.logger.log(`Fetching friends for account ${req.account.id}`);
      return await this.friendshipService.getFriends(req.account.id);
    } catch (error) {
      this.logger.error(`Error fetching friends: ${error.message}`);
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
