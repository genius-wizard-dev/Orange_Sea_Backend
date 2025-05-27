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
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
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
  CheckFriendshipResponseDto,
  CreateFriendshipDTO,
  CreateFriendshipResponseDTO,
  FriendResponse,
  HandleFriendRequestDTO,
  UserSearchResponseDTO,
} from './dto';
import { FriendshipService } from './services/friend';

@ApiTags('Friend')
@ApiBearerAuth('JWT-AUTH')
@Controller('friend')
export class FriendshipController {
  private readonly logger = new Logger(FriendshipController.name);
  constructor(
    private readonly friendshipService: FriendshipService,
    private readonly profileService: ProfileService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Gửi yêu cầu kết bạn' })
  @ApiOkResponse({
    description: 'Gửi yêu cầu kết bạn thành công',
    type: SwaggerSuccessResponse(
      'Send_Friend_Request',
      'friend',
      CreateFriendshipResponseDTO,
    ),
  })
  @ApiUnauthorizedResponse({
    description: 'Không có quyền truy cập',
    type: SwaggerErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Không có quyền truy cập',
      'Send_Friend_Request',
      'friend',
    ),
  })
  @ApiBadRequestResponse({
    description: 'Tìm kiếm profile thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Gửi yêu cầu kết bạn thất bại',
      'Send_Friend_Request',
      'friend',
    ),
  })
  async sendFriendRequest(
    @Req() req: any,
    @Body() data: CreateFriendshipDTO,
    @Res() res: Response,
  ) {
    try {
      const result = await this.friendshipService.sendFriendRequest(
        req.user.id,
        data.receiverId,
      );
      return res
        .status(HttpStatus.OK)
        .send(successResponse(result, 'Gửi yêu cầu kết bạn thành công'));
    } catch (error) {
      this.logger.error(`Error sending friend request: ${error.message}`);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(
          errorResponse('Gửi yêu cầu kết bạn thất bại', 400, error.message),
        );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('requests/received')
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu kết bạn đã nhận' })
  @ApiOkResponse({
    description: 'Lấy danh sách yêu cầu kết bạn đã nhận thành công',
    type: SwaggerSuccessResponse(
      'Get_Received_Requests',
      'friend',
      FriendResponse,
      true,
    ),
  })
  @ApiBadRequestResponse({
    description: 'Lấy danh sách yêu cầu kết bạn đã nhận thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Lấy danh sách yêu cầu kết bạn đã nhận thất bại',
      'Get_Received_Requests',
      'friend',
    ),
  })
  @ApiUnauthorizedResponse({
    description: 'Không có quyền truy cập',
    type: SwaggerErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Không có quyền truy cập',
      'Get_Received_Requests',
      'friend',
    ),
  })
  async getReceivedRequests(@Req() req: any, @Res() res: Response) {
    try {
      const result = await this.friendshipService.getReceivedRequests(
        req.user.id,
      );
      return res
        .status(HttpStatus.OK)
        .send(
          successResponse(
            result,
            'Lấy danh sách yêu cầu kết bạn đã nhận thành công',
          ),
        );
    } catch (error) {
      this.logger.error(`Error fetching received requests: ${error.message}`);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(
          errorResponse(
            'Lấy danh sách yêu cầu kết bạn đã nhận thất bại',
            400,
            error.message,
          ),
        );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('requests/sent')
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu kết bạn đã gửi' })
  @ApiOkResponse({
    description: 'Lấy danh sách yêu cầu kết bạn đã gửi thành công',
    type: SwaggerSuccessResponse(
      'Get_Sent_Requests',
      'friend',
      FriendResponse,
      true,
    ),
  })
  @ApiBadRequestResponse({
    description: 'Lấy danh sách yêu cầu kết bạn đã gửi thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Lấy danh sách yêu cầu kết bạn đã gửi thất bại',
      'Get_Sent_Requests',
      'friend',
    ),
  })
  @ApiUnauthorizedResponse({
    description: 'Không có quyền truy cập',
    type: SwaggerErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Không có quyền truy cập',
      'Get_Sent_Requests',
      'friend',
    ),
  })
  async getSentRequests(@Req() req: any, @Res() res: Response) {
    try {
      const result = await this.friendshipService.getSendingRequests(
        req.user.id,
      );
      return res
        .status(HttpStatus.OK)
        .send(
          successResponse(
            result,
            'Lấy danh sách yêu cầu kết bạn đã gửi thành công',
          ),
        );
    } catch (error) {
      this.logger.error(`Error fetching sending requests: ${error.message}`);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(
          errorResponse(
            'Lấy danh sách yêu cầu kết bạn đã gửi thất bại',
            400,
            error.message,
          ),
        );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('requests/:id')
  @ApiOperation({ summary: 'Xử lý yêu cầu kết bạn' })
  @ApiOkResponse({
    description: 'Xử lý yêu cầu kết bạn thành công',
    type: SwaggerSuccessResponse(
      'Handle_Friend_Request',
      'friend',
      CreateFriendshipResponseDTO,
    ),
  })
  @ApiBadRequestResponse({
    description: 'Xử lý yêu cầu kết bạn thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Xử lý yêu cầu kết bạn thất bại',
      'Handle_Friend_Request',
      'friend',
    ),
  })
  @ApiUnauthorizedResponse({
    description: 'Không có quyền truy cập',
    type: SwaggerErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Không có quyền truy cập',
      'Handle_Friend_Request',
      'friend',
    ),
  })
  async handleFriendRequest(
    @Req() req: any,
    @Param('id') friendShipId: string,
    @Body() body: HandleFriendRequestDTO,
    @Res() res: Response,
  ) {
    try {
      if (!friendShipId) {
        throw new HttpException('ID không hợp lệ', HttpStatus.BAD_REQUEST);
      }
      if (!['ACCEPT', 'REJECT'].includes(body.action)) {
        throw new HttpException(
          'Hành động không hợp lệ',
          HttpStatus.BAD_REQUEST,
        );
      }
      const result = await this.friendshipService.handleFriendRequest(
        friendShipId,
        req.user.id,
        body.action,
      );
      return res
        .status(HttpStatus.OK)
        .send(
          successResponse(
            result,
            `Yêu cầu kết bạn ${body.action === 'ACCEPT' ? 'đã được chấp nhận' : 'đã bị từ chối'}`,
          ),
        );
    } catch (error) {
      this.logger.error(`Error handling friend request: ${error.message}`);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(
          errorResponse('Xử lý yêu cầu kết bạn thất bại', 400, error.message),
        );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách bạn bè' })
  @ApiOkResponse({
    description: 'Lấy danh sách bạn bè thành công',
    type: SwaggerSuccessResponse('Get_Friends', 'friend', FriendResponse, true),
  })
  @ApiBadRequestResponse({
    description: 'Lấy danh sách bạn bè thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Lấy danh sách bạn bè thất bại',
      'Get_Friends',
      'friend',
    ),
  })
  @ApiUnauthorizedResponse({
    description: 'Không có quyền truy cập',
    type: SwaggerErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Không có quyền truy cập',
      'Get_Friends',
      'friend',
    ),
  })
  async getFriends(@Req() req: any, @Res() res: Response) {
    try {
      const result = await this.friendshipService.getFriends(req.user.id);
      return res
        .status(HttpStatus.OK)
        .send(successResponse(result, 'Lấy danh sách bạn bè thành công'));
    } catch (error) {
      this.logger.error(`Error fetching friends: ${error.message}`);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(
          errorResponse('Lấy danh sách bạn bè thất bại', 400, error.message),
        );
    }
  }

  // @UseGuards(JwtAuthGuard)
  // @Put('delete/:id')
  // @ApiOperation({ summary: 'Xóa mối quan hệ bạn bè' })
  // @ApiOkResponse({
  //   description: 'Xóa mối quan hệ bạn bè thành công',
  //   type: SwaggerSuccessResponse('Delete_Friendship', 'friend'),
  // })
  // @ApiBadRequestResponse({
  //   description: 'Xóa mối quan hệ bạn bè thất bại',
  //   type: SwaggerErrorResponse(
  //     HttpStatus.BAD_REQUEST,
  //     'Xóa mối quan hệ bạn bè thất bại',
  //     'Delete_Friendship',
  //     'friend',
  //   ),
  // })
  // @ApiUnauthorizedResponse({
  //   description: 'Không có quyền truy cập',
  //   type: SwaggerErrorResponse(
  //     HttpStatus.UNAUTHORIZED,
  //     'Không có quyền truy cập',
  //     'Delete_Friendship',
  //     'friend',
  //   ),
  // })
  // async deleteFriendship(
  //   @Req() req: any,
  //   @Param('id') id: string,
  //   @Res() res: Response,
  // ) {
  //   try {
  //     await this.friendshipService.deleteFriendship(id, req.user.id);
  //     return res
  //       .status(HttpStatus.OK)
  //       .send(successResponse(null, 'Mối quan hệ bạn bè đã được xóa'));
  //   } catch (error) {
  //     this.logger.error(`Error deleting friendship: ${error.message}`);
  //     return res
  //       .status(HttpStatus.BAD_REQUEST)
  //       .send(
  //         errorResponse('Xóa mối quan hệ bạn bè thất bại', 400, error.message),
  //       );
  //   }
  // }

  @UseGuards(JwtAuthGuard)
  @Get('search/:keyword')
  @ApiOperation({ summary: 'Tìm kiếm người dùng' })
  @ApiOkResponse({
    description: 'Tìm kiếm người dùng thành công',
    type: SwaggerSuccessResponse(
      'Search_User',
      'friend',
      UserSearchResponseDTO,
      true,
    ),
  })
  @ApiBadRequestResponse({
    description: 'Tìm kiếm người dùng thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Tìm kiếm người dùng thất bại',
      'Search_User',
      'friend',
    ),
  })
  @ApiUnauthorizedResponse({
    description: 'Không có quyền truy cập',
    type: SwaggerErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Không có quyền truy cập',
      'Search_User',
      'friend',
    ),
  })
  async searchUser(
    @Req() req: any,
    @Param('keyword') keyword: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.friendshipService.searchUser(
        req.user.id,
        keyword,
      );
      return res
        .status(HttpStatus.OK)
        .send(successResponse(result, 'Tìm kiếm người dùng thành công'));
    } catch (error) {
      this.logger.error(`Error searching user: ${error.message}`);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(
          errorResponse('Tìm kiếm người dùng thất bại', 400, error.message),
        );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('check/:profileId')
  @ApiOperation({ summary: 'Kiểm tra mối quan hệ bạn bè' })
  @ApiOkResponse({
    description: 'Kiểm tra mối quan hệ bạn bè thành công',
    type: SwaggerSuccessResponse(
      'Check_Friendship',
      'friend',
      CheckFriendshipResponseDto,
    ),
  })
  @ApiBadRequestResponse({
    description: 'Kiểm tra mối quan hệ bạn bè thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Kiểm tra mối quan hệ bạn bè thất bại',
      'Check_Friendship',
      'friend',
    ),
  })
  @ApiUnauthorizedResponse({
    description: 'Không có quyền truy cập',
    type: SwaggerErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Không có quyền truy cập',
      'Check_Friendship',
      'friend',
    ),
  })
  async isFriend(
    @Req() req: any,
    @Param('profileId') profileId: string,
    @Res() res: Response,
  ) {
    try {
      const isFriend = await this.friendshipService.isFriend(
        req.user.id,
        profileId,
      );
      return res
        .status(HttpStatus.OK)
        .send(
          successResponse(isFriend, 'Kiểm tra mối quan hệ bạn bè thành công'),
        );
    } catch (error) {
      this.logger.error(`Error checking friendship status: ${error.message}`);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(
          errorResponse(
            'Kiểm tra mối quan hệ bạn bè thất bại',
            400,
            error.message,
          ),
        );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('rejected')
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu kết bạn đã từ chối' })
  @ApiOkResponse({
    description: 'Lấy danh sách yêu cầu kết bạn đã từ chối thành công',
    type: SwaggerSuccessResponse(
      'Get_Rejected_Requests',
      'friend',
      FriendResponse,
      true,
    ),
  })
  async getRejectedRequests(@Req() req: any, @Res() res: Response) {
    try {
      const result = await this.friendshipService.getRejectedRequests(
        req.user.id,
      );
      return res
        .status(HttpStatus.OK)
        .send(
          successResponse(
            result,
            'Lấy danh sách yêu cầu kết bạn đã từ chối thành công',
          ),
        );
    } catch (error) {
      this.logger.error(`Error fetching rejected requests: ${error.message}`);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(
          errorResponse(
            'Lấy danh sách yêu cầu kết bạn đã từ chối thất bại',
            400,
            error.message,
          ),
        );
    }
  }
}
