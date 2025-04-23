import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
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
import { ChatService } from './chat.service';
import { ApiResponseDto } from './dto/chat-response.dto';
import { ForwardMessageDto } from './dto/forward-message.dto';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly groupService: GroupService,
  ) {}

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
      let { groupId, message = '', type = MessageType.TEXT } = data;
      this.logger.debug(`File received: ${file ? 'yes' : 'no'}`);

      if (file) {
        // Fix filename encoding if needed
        let originalFilename = file.originalname;
        try {
          const decodedName = Buffer.from(originalFilename, 'latin1').toString(
            'utf8',
          );
          this.logger.debug(
            `Fixed filename encoding: ${originalFilename} → ${decodedName}`,
          );
          file.originalname = decodedName;
        } catch (e) {
          this.logger.warn(`Error fixing filename encoding: ${e.message}`);
        }

        this.logger.debug(
          `File details - filename: ${file.originalname}, mimetype: ${file.mimetype}, size: ${file.size} bytes`,
        );
      }

      // Get the sender's profile from account
      const accountId = req.account.id;
      this.logger.debug(`Sender accountId: ${accountId}`);

      const profile =
        await this.groupService.getProfileFromAccountId(accountId);
      const senderId = profile.id;
      this.logger.debug(`Resolved profile ID: ${senderId}`);

      // Determine message type based on file if present
      if (file) {
        const mimeType = file.mimetype;
        this.logger.debug(
          `Processing file with mimetype: ${mimeType}, original filename: ${file.originalname}`,
        );

        if (mimeType.startsWith('image/')) {
          type = MessageType.IMAGE;
          this.logger.debug('Setting message type to IMAGE');
        } else if (mimeType.startsWith('video/')) {
          type = MessageType.VIDEO;
          this.logger.debug('Setting message type to VIDEO');
        } else {
          type = MessageType.RAW;
          this.logger.debug('Setting message type to RAW');
        }
      }

      // Kiểm tra xem người dùng có phải là thành viên của nhóm chat không
      this.logger.debug(
        `Checking if user ${senderId} is a member of group ${groupId}`,
      );
      const isMember = await this.groupService.isGroupMember(senderId, groupId);
      if (!isMember) {
        this.logger.warn(
          `User ${senderId} is not a member of group ${groupId}`,
        );
        throw new ForbiddenException(
          'Bạn không phải là thành viên của nhóm chat này',
        );
      }

      // Gọi service để lưu tin nhắn
      this.logger.debug(`Sending message to chatService with type: ${type}`);
      const messageResult = await this.chatService.sendMessage(
        senderId,
        groupId,
        message,
        type,
        [], // không có active readers vì sẽ xử lý qua socket sau
        file,
      );

      this.logger.debug(`Message sent successfully, id: ${messageResult.id}`);
      if (file) {
        this.logger.debug(
          `Message file URL: ${messageResult.fileUrl || 'NOT SET'}`,
        );
      }

      return {
        status: 'success',
        statusCode: 200,
        data: {
          messageId: messageResult.id,
          groupId: messageResult.groupId,
          senderId: messageResult.senderId,
          message: messageResult,
        },
      };
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`, error.stack);
      return {
        status: 'error',
        statusCode: error.status || 400,
        message: error.message,
      };
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
      const accountId = req.account.id;
      const profile =
        await this.groupService.getProfileFromAccountId(accountId);
      // Lấy thông tin tin nhắn
      const message = await this.chatService.getMessageById(messageId);
      if (!message) {
        throw new BadRequestException('Tin nhắn không tồn tại');
      }

      // Kiểm tra người dùng có phải thành viên của nhóm không
      const isMember = await this.groupService.isGroupMember(
        profile.id,
        message.groupId,
      );
      if (!isMember) {
        throw new ForbiddenException(
          'Bạn không phải là thành viên của nhóm chat này',
        );
      }

      // Kiểm tra người gửi tin nhắn
      if (message.senderId !== accountId) {
        throw new ForbiddenException(
          'Bạn không thể thu hồi tin nhắn của người khác',
        );
      }

      const recalledMessage = await this.chatService.recallMessage(
        messageId,
        profile.id,
      );

      return {
        status: 'success',
        statusCode: 200,
        data: {
          messageId: recalledMessage.id,
          groupId: recalledMessage.groupId,
          message: recalledMessage,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        statusCode: error.status || 400,
        message: error.message,
      };
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
      const accountId = req.account.id;
      const profile =
        await this.groupService.getProfileFromAccountId(accountId);
      const message = await this.chatService.getMessageById(messageId);
      if (!message) {
        throw new BadRequestException('Tin nhắn không tồn tại');
      }

      // Kiểm tra người dùng có phải thành viên của nhóm không
      const isMember = await this.groupService.isGroupMember(
        profile.id,
        message.groupId,
      );
      if (!isMember) {
        throw new ForbiddenException(
          'Bạn không phải là thành viên của nhóm chat này',
        );
      }

      const result = await this.chatService.deleteMessage(messageId, accountId);

      return {
        status: 'success',
        statusCode: 200,
        data: result,
      };
    } catch (error) {
      return {
        status: 'error',
        statusCode: error.status || 400,
        message: error.message,
      };
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
      const accountId = req.account.id;
      const profile =
        await this.groupService.getProfileFromAccountId(accountId);
      const { messageId, targetGroupId } = data;

      const message = await this.chatService.getMessageById(messageId);
      if (!message) {
        throw new BadRequestException('Tin nhắn không tồn tại');
      }

      // Kiểm tra người dùng có phải thành viên của nhóm gốc không
      const isSourceMember = await this.groupService.isGroupMember(
        profile.id,
        message.groupId,
      );
      if (!isSourceMember) {
        throw new ForbiddenException(
          'Bạn không phải là thành viên của nhóm chat chứa tin nhắn này',
        );
      }

      // Kiểm tra người dùng có phải thành viên của nhóm đích không
      const isTargetMember = await this.groupService.isGroupMember(
        profile.id,
        targetGroupId,
      );
      if (!isTargetMember) {
        throw new ForbiddenException(
          'Bạn không phải là thành viên của nhóm chat đích',
        );
      }

      const forwardedMessage = await this.chatService.forwardMessage(
        messageId,
        targetGroupId,
        profile.id,
      );

      return {
        status: 'success',
        statusCode: 200,
        data: {
          messageId: forwardedMessage.id,
          groupId: forwardedMessage.groupId,
          message: forwardedMessage,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        statusCode: error.status || 400,
        message: error.message,
      };
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
    @Query('limit') limit: string = '10',
    @Query('cursor') cursor?: string,
  ) {
    try {
      const accountId = req.account.id;
      const profile =
        await this.groupService.getProfileFromAccountId(accountId);

      // Kiểm tra người dùng có phải thành viên của nhóm không
      const isMember = await this.groupService.isGroupMember(
        profile.id,
        groupId,
      );
      if (!isMember) {
        throw new ForbiddenException(
          'Bạn không phải là thành viên của nhóm chat này',
        );
      }

      const parsedLimit = Math.min(parseInt(limit) || 10, 50);

      const messageData = await this.chatService.getMessagesPaginated(
        groupId,
        profile.id,
        parsedLimit,
        cursor,
      );

      return {
        status: 'success',
        statusCode: 200,
        data: messageData,
      };
    } catch (error) {
      this.logger.error(`Error getting messages: ${error.message}`);
      return {
        status: 'error',
        statusCode: error.status || 400,
        message: error.message,
      };
    }
  }
}
