import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MessageType } from '@prisma/client';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { GroupService } from 'src/group/services/group';
import { errorResponse, successResponse } from 'src/utils/api.response.factory';
import {
  SwaggerErrorResponse,
  SwaggerSuccessResponse,
} from 'src/utils/swagger.helper';
import { ApiResponseDto } from './dto/chat.response.dto';
import { EditMessageDto } from './dto/edit.message.dto';
import { ForwardMessageDto } from './dto/forward.message.dto';
import { GetMediaDto, MediaMessageType } from './dto/get.media.dto';
import { MessageIdResponseDTO, SendMessageDto } from './dto/send.message.dto';
import { ChatService } from './services/chat';

@ApiTags('Chat')
@ApiBearerAuth('JWT-AUTH')
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
  @ApiOkResponse({
    description: 'Gửi tin nhắn thành công',
    type: SwaggerSuccessResponse(
      'Send_Message',
      'message',
      MessageIdResponseDTO,
    ),
  })
  @ApiBadRequestResponse({
    description: 'Gửi tin nhắn thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Gửi tin nhắn thất bại',
      'Send_Message',
      'message',
    ),
  })
  @ApiUnauthorizedResponse({
    description: 'Không có quyền truy cập',
    type: SwaggerErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Không có quyền truy cập',
      'Send_Message',
      'message',
    ),
  })
  async sendMessage(
    @Body() data: SendMessageDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      const { groupId, message = '', type = MessageType.TEXT } = data;
      let messageType = type;
      if (file) {
        const decodedName = Buffer.from(file.originalname, 'latin1').toString(
          'utf8',
        );
        file.originalname = decodedName;

        if (file.mimetype.startsWith('image/')) {
          messageType = MessageType.IMAGE;
        } else if (file.mimetype.startsWith('video/')) {
          messageType = MessageType.VIDEO;
        } else {
          messageType = MessageType.RAW;
        }
      }

      const result = await this.chatService.sendMessage(
        req.user.id,
        groupId,
        message,
        messageType,
        [],
        file,
      );
      return res
        .status(HttpStatus.OK)
        .send(successResponse(result, 'Gửi tin nhắn thành công'));
    } catch (error) {
      this.logger.error(`Error sending friend request: ${error.message}`);
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(errorResponse('Gửi tin nhắn thất bại', 400, error.message));
    }
  }

  @Put('recall/:messageId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Thu hồi tin nhắn' })
  @ApiParam({ name: 'messageId', description: 'ID của tin nhắn cần thu hồi' })
  @ApiOkResponse({
    description: 'Thu hồi tin nhắn thành công',
    type: SwaggerSuccessResponse(
      'Recall_Message',
      'messageId',
      MessageIdResponseDTO,
    ),
  })
  @ApiBadRequestResponse({
    description: 'Thu hồi tin nhắn thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Thu hồi tin nhắn thất bại',
      'Recall_Message',
      'messageId',
    ),
  })
  @ApiUnauthorizedResponse({
    description: 'Không có quyền truy cập',
    type: SwaggerErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Không có quyền truy cập',
      'Recall_Message',
      'messageId',
    ),
  })
  async recallMessage(
    @Param('messageId') messageId: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      // Thu hồi tin nhắn
      const result = await this.chatService.recallMessage(
        messageId,
        req.user.id,
      );

      return res
        .status(HttpStatus.OK)
        .send(successResponse(result, 'Thu hồi tin nhắn thành công'));
    } catch (error) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(errorResponse('Thu hồi tin nhắn thất bại', 400, error.message));
    }
  }

  @Delete('delete/:messageId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Xóa tin nhắn' })
  @ApiParam({ name: 'messageId', description: 'ID của tin nhắn cần xóa' })
  @ApiOkResponse({
    description: 'Xóa tin nhắn thành công',
    type: SwaggerSuccessResponse(
      'Delete_Message',
      'messageId',
      MessageIdResponseDTO,
    ),
  })
  @ApiBadRequestResponse({
    description: 'Xóa tin nhắn thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Xóa tin nhắn thất bại',
      'Delete_Message',
      'messageId',
    ),
  })
  @ApiUnauthorizedResponse({
    description: 'Không có quyền truy cập',
    type: SwaggerErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Không có quyền truy cập',
      'Delete_Message',
      'messageId',
    ),
  })
  async deleteMessage(
    @Param('messageId') messageId: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      const result = await this.chatService.deleteMessage(
        messageId,
        req.user.id,
      );

      return res
        .status(HttpStatus.OK)
        .send(successResponse(result, 'Xóa tin nhắn thành công'));
    } catch (error) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(errorResponse('Xóa tin nhắn thất bại', 400, error.message));
    }
  }

  @Post('forward')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Chuyển tiếp tin nhắn' })
  @ApiBody({ type: ForwardMessageDto })
  @ApiOkResponse({
    description: 'Chuyển tiếp tin nhắn thành công',
    type: SwaggerSuccessResponse(
      'Forward_Message',
      'messageId',
      MessageIdResponseDTO,
    ),
  })
  @ApiBadRequestResponse({
    description: 'Chuyển tiếp tin nhắn thất bại',
    type: SwaggerErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Chuyển tiếp tin nhắn thất bại',
      'Forward_Message',
      'messageId',
    ),
  })
  @ApiUnauthorizedResponse({
    description: 'Không có quyền truy cập',
    type: SwaggerErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Không có quyền truy cập',
      'Forward_Message',
      'messageId',
    ),
  })
  async forwardMessage(
    @Body() data: ForwardMessageDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      const { messageId, groupId } = data;

      const result = await this.chatService.forwardMessage(
        messageId,
        groupId,
        req.user.id,
      );

      return res
        .status(HttpStatus.OK)
        .send(successResponse(result, 'Chuyển tiếp tin nhắn thành công'));
    } catch (error) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(
          errorResponse('Chuyển tiếp tin nhắn thất bại', 400, error.message),
        );
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
  @ApiResponse({ status: 401, description: 'Không có quyền truy cập' })
  async getMessages(
    @Param('groupId') groupId: string,
    @Req() req: any,
    @Res() res: Response,
    @Query('cursor') cursor?: string,
  ) {
    try {
      const limit = 10;
      const messageData = await this.chatService.getMessagesPaginated(
        groupId,
        req.user.id,
        limit,
        cursor,
      );
      return res
        .status(HttpStatus.OK)
        .send(successResponse(messageData, 'Lấy tin nhắn thành công'));
    } catch (error) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(errorResponse('Lấy tin nhắn thất bại', 400, error.message));
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
    @Res() res: Response,
  ) {
    try {
      const { newContent } = editMessageDto;

      if (!newContent || newContent.trim() === '') {
        throw new BadRequestException('Nội dung tin nhắn không được để trống');
      }

      const editedMessage = await this.chatService.editMessage(
        messageId,
        newContent,
        req.user.id,
      );

      return res
        .status(HttpStatus.OK)
        .send(successResponse(editedMessage, 'Chỉnh sửa tin nhắn thành công'));
    } catch (error) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(errorResponse('Chỉnh sửa tin nhắn thất bại', 400, error.message));
    }
  }

  @Get('media/:groupId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Lấy danh sách media (hình ảnh, video, file) của nhóm chat',
  })
  @ApiParam({ name: 'groupId', description: 'ID của nhóm chat' })
  @ApiQuery({
    name: 'type',
    enum: MediaMessageType,
    required: false,
    description: 'Loại media cần lấy',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Số lượng media tối đa cần lấy',
  })
  @ApiQuery({
    name: 'cursor',
    type: String,
    required: false,
    description: 'Vị trí bắt đầu lấy dữ liệu',
  })
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
    @Query() query: GetMediaDto,
    @Res() res: Response,
  ) {
    try {
      const isGroupMember = await this.groupService.isGroupMember(
        req.user.id,
        groupId,
      );

      if (!isGroupMember) {
        throw new Error('Bạn không có quyền truy cập nhóm này');
      }

      const messageType = query.type || MediaMessageType.IMAGE;
      const limit = query.limit || 10;

      const mediaData = await this.chatService.getMediaByType(
        groupId,
        req.user.id,
        messageType,
        limit,
        query.cursor,
      );

      return res
        .status(HttpStatus.OK)
        .send(successResponse(mediaData, 'Lấy media thành công'));
    } catch (error) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send(errorResponse('Lấy media thất bại', 400, error.message));
    }
  }
}
