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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import {
  CreateFriendshipDto,
  FriendResponse,
  FriendshipResponseDto,
  HandleFriendRequestDto,
  UserSearchResponseDto,
} from './dto';
import { FriendshipService } from './friend.service';

@ApiTags('friends')
@ApiBearerAuth()
@Controller('friend')
export class FriendshipController {
  private readonly logger = new Logger(FriendshipController.name);
  constructor(private readonly friendshipService: FriendshipService) {}

  @ApiOperation({ summary: 'Gửi yêu cầu kết bạn' })
  @ApiResponse({
    status: 201,
    description: 'Yêu cầu kết bạn đã được gửi',
    type: FriendshipResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Yêu cầu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @UseGuards(JwtAuthGuard)
  @Post()
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

  @ApiOperation({ summary: 'Lấy danh sách yêu cầu kết bạn đã nhận' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách yêu cầu kết bạn đã nhận',
    type: [FriendResponse],
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @UseGuards(JwtAuthGuard)
  @Get('requests/received')
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

  @ApiOperation({ summary: 'Lấy danh sách yêu cầu kết bạn đã gửi' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách yêu cầu kết bạn đã gửi',
    type: [FriendResponse],
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @UseGuards(JwtAuthGuard)
  @Get('requests/sent')
  async getSentRequests(@Request() req: any) {
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

  @ApiOperation({ summary: 'Xử lý yêu cầu kết bạn' })
  @ApiParam({
    name: 'id',
    description: 'ID của yêu cầu kết bạn',
    example: 'profile-id',
  })
  @ApiBody({ type: HandleFriendRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Yêu cầu kết bạn đã được xử lý',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: {
          type: 'string',
          example: 'Yêu cầu kết bạn đã được chấp nhận',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Yêu cầu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @UseGuards(JwtAuthGuard)
  @Put('requests/:id')
  async handleFriendRequest(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: HandleFriendRequestDto,
  ) {
    if (!id) {
      throw new HttpException('ID không hợp lệ', HttpStatus.BAD_REQUEST);
    }
    if (!['ACCEPT', 'REJECT'].includes(dto.action)) {
      throw new HttpException('Hành động không hợp lệ', HttpStatus.BAD_REQUEST);
    }
    try {
      await this.friendshipService.handleFriendRequest(
        id,
        req.account.id,
        dto.action,
      );
      return {
        status: 'success',
        message: `Yêu cầu kết bạn đã được ${dto.action === 'ACCEPT' ? 'chấp nhận' : 'từ chối'}`,
      };
    } catch (error) {
      this.logger.error(`Error handling friend request: ${error.message}`);
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Lấy danh sách bạn bè' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách bạn bè',
    type: [FriendResponse],
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @UseGuards(JwtAuthGuard)
  @Get()
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

  @ApiOperation({ summary: 'Xóa mối quan hệ bạn bè' })
  @ApiParam({
    name: 'id',
    description: 'ID của mối quan hệ bạn bè',
    example: 'profile-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Mối quan hệ bạn bè đã được xóa',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Mối quan hệ bạn bè đã được xóa' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Yêu cầu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @UseGuards(JwtAuthGuard)
  @Put('delete/:id')
  async deleteFriendship(@Request() req: any, @Param('id') id: string) {
    try {
      this.logger.log(
        `Deleting friendship ${id} for account ${req.account.id}`,
      );
      await this.friendshipService.deleteFriendship(id, req.account.id);
      return {
        status: 'success',
        message: 'Mối quan hệ bạn bè đã được xóa',
      };
    } catch (error) {
      this.logger.error(`Error deleting friendship: ${error.message}`);
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({ summary: 'Tìm kiếm người dùng' })
  @ApiParam({
    name: 'keyword',
    description: 'Từ khóa tìm kiếm (tên người dùng hoặc số điện thoại)',
    example: 'nguyen',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách người dùng tìm thấy',
    type: [UserSearchResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  @UseGuards(JwtAuthGuard)
  @Get('search/:keyword')
  async searchUser(@Request() req: any, @Param('keyword') keyword: string) {
    try {
      this.logger.log(
        `Searching for user ${keyword} for account ${req.account.id}`,
      );
      return await this.friendshipService.searchUser(req.account.id, keyword);
    } catch (error) {
      this.logger.error(`Error searching user: ${error.message}`);
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
