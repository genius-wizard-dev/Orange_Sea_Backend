import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Req,
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
import { MessageType } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { GroupService } from 'src/group/group.service';
import { ProfileService } from 'src/profile/profile.service';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ApiResponseDto } from './dto/chat.response.dto';
import { EditMessageDto } from './dto/edit.message.dto';
import { ForwardMessageDto } from './dto/forward.message.dto';
import { GetMediaDto, MediaMessageType } from './dto/get.media.dto';
import { SendMessageDto } from './dto/send.message.dto';

@ApiTags('Chat')
@ApiBearerAuth('JWT-auth')
@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly profileService: ProfileService,
    private readonly groupService: GroupService,
    @Inject(ChatGateway) private readonly chatGateway: ChatGateway,
  ) {}

  private async getUserProfile(accountId: string) {
    return this.profileService.getProfileFromAccountId(accountId);
  }

  private async validateGroupMembership(
    profileId: string,
    groupId: string,
  ): Promise<void> {
    const isMember = await this.groupService.isGroupMember(profileId, groupId);
    if (!isMember) {
      throw new ForbiddenException(
        'Bạn không phải là thành viên của nhóm chat này',
      );
    }
  }

  private async validateMessageAccess(messageId: string, profileId: string) {
    const message = await this.chatService.getMessageById(messageId);
    if (!message) {
      throw new BadRequestException('Tin nhắn không tồn tại');
    }

    await this.validateGroupMembership(profileId, message.groupId);

    return message;
  }

  private async validateMessageOwnership(messageId: string, profileId: string) {
    const message = await this.validateMessageAccess(messageId, profileId);

    if (message.senderId !== profileId) {
      throw new ForbiddenException(
        'Bạn không có quyền thực hiện tác vụ này với tin nhắn',
      );
    }

    return message;
  }

  private createSuccessResponse(data: any) {
    return {
      status: 'success',
      statusCode: 200,
      data: data,
    };
  }

  private createErrorResponse(error: any) {
    this.logger.error(`Error: ${error.message}`, error.stack);
    return {
      status: 'error',
      statusCode: error.status || 400,
      message: error.message,
    };
  }

  @Post('send')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Gửi tin nhắn đến nhóm chat' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({
    status: 200,
    description: 'Tin nhắn đã được gửi thành công',
    type: ApiResponseDto,
    schema: {
      properties: {
        status: { type: 'string', example: 'success' },
        statusCode: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            messageId: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            groupId: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174001',
            },
            senderId: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174002',
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({
    status: 403,
    description: 'Người dùng không có quyền truy cập',
  })
  async sendMessage(
    @Body() data: SendMessageDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    try {
      const { groupId, message = '', type = MessageType.TEXT } = data;
      const profile = await this.getUserProfile(req.account.id);

      // Xác thực thành viên nhóm
      await this.validateGroupMembership(profile.id, groupId);

      // Xác định loại tin nhắn dựa vào file nếu có
      let messageType = type;
      if (file) {
        this.logger.debug(
          `File received: mimetype=${file.mimetype}, size=${file.size} bytes`,
        );

        // Sửa lỗi mã hóa tên file nếu cần
        try {
          const decodedName = Buffer.from(file.originalname, 'latin1').toString(
            'utf8',
          );
          file.originalname = decodedName;
        } catch (e) {
          this.logger.warn(`Error fixing filename encoding: ${e.message}`);
        }

        // Xác định loại tin nhắn dựa trên MIME type
        if (file.mimetype.startsWith('image/')) {
          messageType = MessageType.IMAGE;
        } else if (file.mimetype.startsWith('video/')) {
          messageType = MessageType.VIDEO;
        } else {
          messageType = MessageType.RAW;
        }
      }

      // Gửi tin nhắn qua service
      const messageResult = await this.chatService.sendMessage(
        profile.id,
        groupId,
        message,
        messageType,
        [],
        file,
      );

      return this.createSuccessResponse(messageResult);
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  @Put('recall/:messageId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Thu hồi tin nhắn' })
  @ApiParam({ name: 'messageId', description: 'ID của tin nhắn cần thu hồi' })
  @ApiResponse({
    status: 200,
    description: 'Tin nhắn đã được thu hồi thành công',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Tin nhắn không tồn tại' })
  @ApiResponse({
    status: 403,
    description: 'Người dùng không có quyền thu hồi tin nhắn này',
  })
  async recallMessage(@Param('messageId') messageId: string, @Req() req: any) {
    try {
      const profile = await this.getUserProfile(req.account.id);

      // Xác thực quyền sở hữu tin nhắn
      const message = await this.validateMessageOwnership(
        messageId,
        profile.id,
      );

      // Thu hồi tin nhắn
      const recalledMessage = await this.chatService.recallMessage(
        messageId,
        profile.id,
      );

      // Kiểm tra xem đây có phải là tin nhắn cuối cùng trong nhóm không
      const wasLastMessage = await this.chatService.isLastMessageInGroup(
        messageId,
        message.groupId,
      );

      // Gửi thông báo qua socket
      this.chatGateway.server.to(message.groupId).emit('messageRecalled', {
        messageId,
        groupId: message.groupId,
        recalledMessage,
        wasLastMessage,
      });

      return this.createSuccessResponse(recalledMessage);
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  @Delete('delete/:messageId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Xóa tin nhắn' })
  @ApiParam({ name: 'messageId', description: 'ID của tin nhắn cần xóa' })
  @ApiResponse({
    status: 200,
    description: 'Tin nhắn đã được xóa thành công',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Tin nhắn không tồn tại' })
  @ApiResponse({
    status: 403,
    description: 'Người dùng không có quyền xóa tin nhắn này',
  })
  async deleteMessage(@Param('messageId') messageId: string, @Req() req: any) {
    try {
      const profile = await this.getUserProfile(req.account.id);

      // Xác thực quyền truy cập tin nhắn
      await this.validateMessageAccess(messageId, profile.id);

      // Xóa tin nhắn
      const result = await this.chatService.deleteMessage(
        messageId,
        req.account.id,
      );

      return this.createSuccessResponse(result);
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  @Post('forward')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Chuyển tiếp tin nhắn' })
  @ApiBody({ type: ForwardMessageDto })
  @ApiResponse({
    status: 200,
    description: 'Tin nhắn đã được chuyển tiếp thành công',
    type: ApiResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Tin nhắn không tồn tại' })
  @ApiResponse({
    status: 403,
    description: 'Người dùng không có quyền chuyển tiếp tin nhắn',
  })
  async forwardMessage(@Body() data: ForwardMessageDto, @Req() req: any) {
    try {
      const profile = await this.getUserProfile(req.account.id);
      const { messageId, groupId } = data;

      // Xác thực tin nhắn và quyền truy cập
      const message = await this.validateMessageAccess(messageId, profile.id);

      // Xác thực quyền truy cập vào nhóm đích
      await this.validateGroupMembership(profile.id, groupId);

      // Chuyển tiếp tin nhắn
      const forwardedMessage = await this.chatService.forwardMessage(
        messageId,
        groupId,
        profile.id,
      );

      return this.createSuccessResponse(forwardedMessage);
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  @Get('messages/:groupId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy tin nhắn theo trang của nhóm chat' })
  @ApiParam({ name: 'groupId', description: 'ID của nhóm chat' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tin nhắn của nhóm chat',
    schema: {
      properties: {
        status: { type: 'string', example: 'success' },
        statusCode: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            messages: { type: 'array', items: { type: 'object' } },
            nextCursor: { type: 'string', nullable: true },
            hasMore: { type: 'boolean' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  async getMessages(
    @Param('groupId') groupId: string,
    @Req() req: any,
    @Query('cursor') cursor?: string,
  ) {
    try {
      const profile = await this.getUserProfile(req.account.id);

      // Xác thực quyền truy cập nhóm
      await this.validateGroupMembership(profile.id, groupId);

      const limit = 10;
      const messageData = await this.chatService.getMessagesPaginated(
        groupId,
        profile.id,
        limit,
        cursor,
      );

      return this.createSuccessResponse(messageData);
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  @Put('edit/:messageId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Chỉnh sửa tin nhắn' })
  @ApiParam({ name: 'messageId', description: 'ID của tin nhắn cần chỉnh sửa' })
  @ApiBody({ type: EditMessageDto })
  @ApiResponse({
    status: 200,
    description: 'Tin nhắn đã được chỉnh sửa thành công',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Tin nhắn không tồn tại hoặc không phải tin nhắn văn bản',
  })
  @ApiResponse({
    status: 403,
    description: 'Người dùng không có quyền chỉnh sửa tin nhắn này',
  })
  async editMessage(
    @Param('messageId') messageId: string,
    @Body() editMessageDto: EditMessageDto,
    @Req() req: any,
  ) {
    try {
      const { newContent } = editMessageDto;

      if (!newContent || newContent.trim() === '') {
        throw new BadRequestException('Nội dung tin nhắn không được để trống');
      }

      const profile = await this.getUserProfile(req.account.id);

      // Xác thực quyền sở hữu tin nhắn
      const message = await this.validateMessageOwnership(
        messageId,
        profile.id,
      );

      // Chỉnh sửa tin nhắn
      const editedMessage = await this.chatService.editMessage(
        messageId,
        newContent,
        profile.id,
      );

      // Kiểm tra xem đây có phải là tin nhắn cuối cùng trong nhóm không
      const wasLastMessage = await this.chatService.isLastMessageInGroup(
        messageId,
        message.groupId,
      );

      // Gửi thông báo qua socket
      this.chatGateway.server.to(message.groupId).emit('messageEdited', {
        messageId,
        groupId: message.groupId,
        editedMessage,
        wasLastMessage,
      });

      return this.createSuccessResponse(editedMessage);
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  @Get('media/:groupId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Lấy danh sách media (hình ảnh, video, file) của nhóm chat',
  })
  @ApiParam({ name: 'groupId', description: 'ID của nhóm chat' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách media của nhóm chat',
    schema: {
      properties: {
        status: { type: 'string', example: 'success' },
        statusCode: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            media: { type: 'array', items: { type: 'object' } },
            nextCursor: { type: 'string', nullable: true },
            hasMore: { type: 'boolean' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  async getGroupMedia(
    @Param('groupId') groupId: string,
    @Req() req: any,
    @Body() body: GetMediaDto,
  ) {
    try {
      const profile = await this.getUserProfile(req.account.id);

      await this.validateGroupMembership(profile.id, groupId);

      const messageType = body.type || MediaMessageType.IMAGE;
      const limit = body.limit || 10;

      const mediaData = await this.chatService.getMediaByType(
        groupId,
        profile.id,
        messageType,
        limit,
        body.cursor,
      );

      return this.createSuccessResponse(mediaData);
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }
}
