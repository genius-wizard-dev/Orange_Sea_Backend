import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // @Post('message')
  // @UseGuards(JwtAuthGuard)
  // @UseInterceptors(FileInterceptor('file'))
  // async sendMessage(
  //   @Req() req,
  //   @Body() sendMessageDto: SendMessageDto,
  //   @UploadedFile() file?: Express.Multer.File,
  // ) {
  //   const { id } = req.account;
  //   const { groupId, message = '', type = MessageType.TEXT } = sendMessageDto;

  //   let messageType = type;
  //   if (file) {
  //     if (file.mimetype.startsWith('image/')) {
  //       messageType = MessageType.IMAGE;
  //     } else if (file.mimetype.startsWith('video/')) {
  //       messageType = MessageType.VIDEO;
  //     }
  //   }

  //   const messageResult = await this.chatService.sendMessage(
  //     id,
  //     groupId,
  //     message,
  //     messageType,
  //     file,
  //   );

  //   return {
  //     status: 'success',
  //     data: messageResult,
  //   };
  // }

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
}
