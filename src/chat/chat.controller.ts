import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MessageType } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { GroupService } from 'src/group/group.service';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly groupService: GroupService,
  ) {}

  @Post('send')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async sendMessage(
    @Body() data: SendMessageDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    try {
      const { groupId, message = '', type = MessageType.TEXT } = data;
      const senderId = data.senderId;

      // Kiểm tra xem người dùng có phải là thành viên của nhóm chat không
      const isMember = await this.groupService.isGroupMember(senderId, groupId);
      if (!isMember) {
        throw new ForbiddenException('Bạn không phải là thành viên của nhóm chat này');
      }

      // Gọi service để lưu tin nhắn nhưng không gửi socket notification
      const messageResult = await this.chatService.sendMessage(
        senderId,
        groupId,
        message,
        type,
        [], // không có active readers vì sẽ xử lý qua socket sau
        file,
      );

      return {
        status: 'success',
        statusCode: 200,
        data: {
          messageId: messageResult.id,
          groupId: messageResult.groupId,
          senderId: messageResult.senderId
          // message: messageResult,
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

  @Post('sticker')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadSticker(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return {
        status: 'error',
        message: 'No file uploaded',
      };
    }

    const stickerUrl = await this.chatService.uploadSticker(file);

    return {
      status: 'success',
      data: { stickerUrl },
    };
  }

  @Put('recall/:messageId')
  @UseGuards(JwtAuthGuard)
  async recallMessage(@Param('messageId') messageId: string, @Req() req: any) {
    try {
      const profileId = req.user.id;

      // Lấy thông tin tin nhắn
      const message = await this.chatService.getMessageById(messageId);
      if (!message) {
        throw new BadRequestException('Tin nhắn không tồn tại');
      }

      // Kiểm tra người dùng có phải thành viên của nhóm không
      const isMember = await this.groupService.isGroupMember(profileId, message.groupId);
      if (!isMember) {
        throw new ForbiddenException('Bạn không phải là thành viên của nhóm chat này');
      }

      // Kiểm tra người gửi tin nhắn
      if (message.senderId !== profileId) {
        throw new ForbiddenException('Bạn không thể thu hồi tin nhắn của người khác');
      }

      const recalledMessage = await this.chatService.recallMessage(messageId, profileId);

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
  async deleteMessage(@Param('messageId') messageId: string, @Req() req: any) {
    try {
      const profileId = req.user.id;

      // Lấy thông tin tin nhắn
      const message = await this.chatService.getMessageById(messageId);
      if (!message) {
        throw new BadRequestException('Tin nhắn không tồn tại');
      }

      // Kiểm tra người dùng có phải thành viên của nhóm không
      const isMember = await this.groupService.isGroupMember(profileId, message.groupId);
      if (!isMember) {
        throw new ForbiddenException('Bạn không phải là thành viên của nhóm chat này');
      }

      const result = await this.chatService.deleteMessage(messageId, profileId);

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
  async forwardMessage(
    @Body() data: { messageId: string, targetGroupId: string },
    @Req() req: any,
  ) {
    try {
      const profileId = req.user.id;
      const { messageId, targetGroupId } = data;

      // Lấy thông tin tin nhắn
      const message = await this.chatService.getMessageById(messageId);
      if (!message) {
        throw new BadRequestException('Tin nhắn không tồn tại');
      }

      // Kiểm tra người dùng có phải thành viên của nhóm gốc không
      const isSourceMember = await this.groupService.isGroupMember(profileId, message.groupId);
      if (!isSourceMember) {
        throw new ForbiddenException('Bạn không phải là thành viên của nhóm chat chứa tin nhắn này');
      }

      // Kiểm tra người dùng có phải thành viên của nhóm đích không
      const isTargetMember = await this.groupService.isGroupMember(profileId, targetGroupId);
      if (!isTargetMember) {
        throw new ForbiddenException('Bạn không phải là thành viên của nhóm chat đích');
      }

      const forwardedMessage = await this.chatService.forwardMessage(
        messageId,
        targetGroupId,
        profileId,
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
}
