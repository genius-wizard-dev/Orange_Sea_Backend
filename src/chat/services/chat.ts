import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { MessageType } from '@prisma/client';
import { CloudinaryService } from 'src/config/cloudinary/cloudinary.service';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { MessageDetailResponseDTO } from '../dto/chat.response.dto';
import { MediaMessageType } from '../dto/get.media.dto';
import { MessageIdResponseDTO } from '../dto/send.message.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private async uploadFileByType(
    file: Express.Multer.File,
    type: MessageType,
  ): Promise<{ url: string; fileSize: number; originalName: string }> {
    let originalName = file.originalname;

    try {
      if (/Ã/.test(originalName)) {
        const decodedName = Buffer.from(originalName, 'latin1').toString(
          'utf8',
        );
        this.logger.debug(`Fixed encoding: ${originalName} → ${decodedName}`);
        originalName = decodedName;
      }
    } catch (e) {
      this.logger.warn(`Error normalizing filename: ${e.message}`);
    }

    this.logger.debug(
      `Uploading file: ${originalName}, type: ${type}, size: ${file.size}`,
    );

    try {
      let fileResult: { url: string; fileSize: number; originalName: string };

      switch (type) {
        case MessageType.IMAGE:
          fileResult = await this.cloudinaryService.uploadBufferToCloudinary(
            file.buffer,
            originalName,
            'chat-images',
          );
          break;

        case MessageType.VIDEO:
          fileResult =
            await this.cloudinaryService.uploadVideoBufferToCloudinary(
              file.buffer,
              originalName,
              'chat-videos',
            );
          break;

        case MessageType.RAW:
          fileResult = await this.cloudinaryService.uploadRawFileToCloudinary(
            file.buffer,
            originalName,
            'chat-files',
          );
          break;

        default:
          throw new Error(`Unsupported file type: ${type}`);
      }

      this.logger.debug(`File uploaded successfully. URL: ${fileResult.url}`);
      return fileResult;
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`, error.stack);
      throw error;
    }
  }

  async sendMessage(
    senderId: string,
    groupId: string,
    content: string,
    type: MessageType,
    readBy: string[] = [],
    file?: Express.Multer.File,
  ): Promise<MessageIdResponseDTO> {
    try {
      const participant = await this.prisma.participant.findUnique({
        where: {
          userId_groupId: {
            userId: senderId,
            groupId: groupId,
          },
        },
      });

      if (!participant) {
        this.logger.warn(
          `User ${senderId} is not a member of group ${groupId}`,
        );
        throw new ForbiddenException(
          `Người dùng không phải là thành viên của nhóm chat này`,
        );
      }

      let fileUrl: string = '';
      let fileSize: number = 0;
      let fileName: string = '';

      // Upload file if present
      if (file) {
        this.logger.debug(`Processing file upload for message type: ${type}`);

        const fileResult = await this.uploadFileByType(file, type);
        fileUrl = fileResult.url;
        fileSize = fileResult.fileSize;
        fileName = fileResult.originalName;
      }

      // Create read receipt data for sender and active readers
      const readByData = [
        { userId: senderId },
        // Add other active readers
        ...readBy.filter((id) => id !== senderId).map((userId) => ({ userId })),
      ];

      this.logger.debug(
        `Creating message with read receipts for: ${readByData.map((item) => item.userId).join(', ')}`,
      );

      const messageData = {
        senderId,
        groupId,
        type,
        content,
        fileUrl: file ? fileUrl : null,

        fileSize: file ? fileSize : null,
        fileName: file ? fileName : null,

        readBy: {
          create: readByData,
        },
      };

      const message = await this.prisma.message.create({
        data: messageData,
      });
      if (!message) {
        throw new BadRequestException('Lỗi khi tạo tin nhắn');
      }
      return {
        messageId: message.id,
      };
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`, error.stack);
      throw error;
    }
  }

  async markMessagesAsRead(userId: string, groupId: string) {
    try {
      this.logger.debug(
        `Đánh dấu tin nhắn đã đọc cho người dùng ${userId} trong nhóm ${groupId}`,
      );

      // Tìm tất cả tin nhắn chưa đọc trong nhóm
      const unreadMessages = await this.prisma.message.findMany({
        where: {
          groupId,
          readBy: {
            none: {
              userId,
            },
          },
        },
        select: {
          id: true,
        },
      });

      this.logger.debug(`Tìm thấy ${unreadMessages.length} tin nhắn chưa đọc`);

      if (unreadMessages.length === 0) {
        return { count: 0, messageIds: [] };
      }

      // Tạo biên nhận đã đọc cho tất cả tin nhắn chưa đọc
      const readReceipts = await this.prisma.$transaction(
        unreadMessages.map((message) =>
          this.prisma.readMessage.create({
            data: {
              messageId: message.id,
              userId,
            },
          }),
        ),
      );

      this.logger.debug(`Đã tạo ${readReceipts.length} biên nhận đã đọc`);
      this.logger.debug(
        `ID tin nhắn đã đánh dấu đã đọc: ${unreadMessages.map((m) => m.id).join(', ')}`,
      );

      return {
        count: readReceipts.length,
        messageIds: unreadMessages.map((m) => m.id),
      };
    } catch (error) {
      this.logger.error(`Lỗi khi đánh dấu tin nhắn đã đọc: ${error.message}`);
      throw error;
    }
  }

  // async getUnreadMessageCount(userId: string, groupId?: string) {
  //   const where = {
  //     readBy: {
  //       none: {
  //         userId,
  //       },
  //     },
  //   };

  //   if (groupId) {
  //     where['groupId'] = groupId;
  //     this.logger.debug(
  //       `Getting unread message count for user ${userId} in group ${groupId}`,
  //     );
  //   } else {
  //     this.logger.debug(
  //       `Getting total unread message count for user ${userId}`,
  //     );
  //   }

  //   const count = await this.prisma.message.count({
  //     where,
  //   });

  //   this.logger.debug(`Unread message count: ${count}`);
  //   return { count };
  // }

  async getUnreadMessageByGroup(
    userId: string,
    groupId: string,
  ): Promise<{ count: number }> {
    this.logger.debug(
      `Getting unread message count for user ${userId} in group ${groupId}`,
    );

    const count = await this.prisma.message.count({
      where: {
        groupId,
        readBy: {
          none: {
            userId,
          },
        },
      },
    });

    this.logger.debug(`Unread message count: ${count}`);
    return { count };
  }

  async getUnreadMessages(userId: string) {
    this.logger.debug(
      `Getting unread message counts by group for user ${userId}`,
    );

    // Get all groups the user is part of
    const groups = await this.prisma.participant.findMany({
      where: {
        userId,
      },
      select: {
        groupId: true,
      },
    });

    const groupIds = groups.map((g) => g.groupId);
    this.logger.debug(
      `User is a member of ${groupIds.length} groups: ${groupIds.join(', ')}`,
    );

    if (groupIds.length === 0) {
      return [];
    }

    // For each group, count unread messages
    const unreadCountsPromises = groupIds.map(async (groupId) => {
      const count = await this.prisma.message.count({
        where: {
          groupId,
          readBy: {
            none: {
              userId,
            },
          },
        },
      });

      return {
        groupId,
        unreadCount: count,
      };
    });

    const results = await Promise.all<{ groupId: string; unreadCount: number }>(
      unreadCountsPromises,
    );
    this.logger.debug(`Unread counts by group: ${JSON.stringify(results)}`);

    return results;
  }

  async getLastMessages(groupId: string, userId: string, limit: number = 10) {
    this.logger.debug(`Fetching last ${limit} messages for group ${groupId}`);

    try {
      const messages = await this.prisma.message.findMany({
        where: {
          groupId,
          deletedBy: {
            none: {
              userId,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        include: {
          readBy: true,
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      this.logger.debug(
        `Retrieved ${messages.length} messages for group ${groupId}`,
      );

      // Return messages in chronological order (oldest first)
      return messages.reverse().map((message) => ({
        ...message,
        readBy: message.readBy.map((read) => read.userId),
      }));
    } catch (error) {
      this.logger.error(
        `Error fetching messages for group ${groupId}: ${error.message}`,
      );
      throw error;
    }
  }

  async getMessagesPaginated(
    groupId: string,
    userId: string,
    limit: number = 10,
    cursor?: string,
  ) {
    this.logger.debug(
      `Fetching paginated messages for group ${groupId}, limit: ${limit}, cursor: ${cursor || 'none'}`,
    );

    try {
      const queryOptions: any = {
        where: {
          groupId,
          deletedBy: {
            none: {
              userId,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        include: {
          readBy: true,
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      };

      // If cursor is provided, get messages older than the cursor
      if (cursor) {
        queryOptions.where.createdAt = {
          lt: (
            await this.prisma.message.findUnique({
              where: { id: cursor },
              select: { createdAt: true },
            })
          )?.createdAt,
        };
      }

      const messages = await this.prisma.message.findMany(queryOptions);

      const nextCursor =
        messages.length === limit ? messages[messages.length - 1].id : null;

      const formattedMessages = messages.map((message: any) => ({
        ...message,
        readBy: message.readBy.map((read) => read.userId),
      }));

      this.logger.debug(
        `Retrieved ${messages.length} messages for group ${groupId}, nextCursor: ${nextCursor || 'none'}`,
      );

      this.logger.debug(`Next cursor: ${nextCursor || 'none'}`);
      this.logger.debug(`Returning ${messages} messages`);
      return {
        messages: formattedMessages.reverse(),
        nextCursor,
        hasMore: messages.length === limit,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching paginated messages for group ${groupId}: ${error.message}`,
      );
      throw error;
    }
  }

  async markMessageAsReadByUsers(messageId: string, userIds: string[]) {
    this.logger.debug(
      `Marking message ${messageId} as read by users: ${userIds.join(', ')}`,
    );

    if (userIds.length === 0) {
      this.logger.debug('No users to mark message as read for');
      return { count: 0 };
    }

    try {
      // Lấy danh sách user chưa đọc tin nhắn
      const message = await this.prisma.message.findUnique({
        where: { id: messageId },
        include: { readBy: true },
      });

      if (!message) {
        this.logger.warn(`Message with ID ${messageId} not found`);
        return { count: 0 };
      }

      // Lọc ra những user chưa đọc tin nhắn
      const existingReaders = message.readBy.map((read) => read.userId);
      const newReaders = userIds.filter(
        (userId) => !existingReaders.includes(userId),
      );

      if (newReaders.length === 0) {
        this.logger.debug('All specified users have already read the message');
        return { count: 0 };
      }

      // Tạo read receipts cho các user chưa đọc
      const readReceipts = await this.prisma.$transaction(
        newReaders.map((userId) =>
          this.prisma.readMessage.create({
            data: {
              messageId,
              userId,
            },
          }),
        ),
      );

      this.logger.debug(`Created ${readReceipts.length} read receipts`);
      return {
        count: readReceipts.length,
        userIds: newReaders,
      };
    } catch (error) {
      this.logger.error(
        `Error marking message ${messageId} as read: ${error.message}`,
      );
      throw error;
    }
  }

  async recallMessage(
    messageId: string,
    profileId: string,
  ): Promise<MessageIdResponseDTO> {
    try {
      // Kiểm tra tin nhắn tồn tại
      const message = await this.prisma.message.findUnique({
        where: { id: messageId },
        include: {
          sender: true,
        },
      });

      if (!message) {
        throw new BadRequestException('Tin nhắn không tồn tại');
      }

      if (message.senderId !== profileId) {
        throw new ForbiddenException('Bạn không có quyền thu hồi tin nhắn này');
      }

      const messageTime = new Date(message.createdAt);
      const currentTime = new Date();
      const timeDiffInMinutes =
        (currentTime.getTime() - messageTime.getTime()) / (1000 * 60);

      if (timeDiffInMinutes > 15) {
        throw new BadRequestException('Không thể thu hồi tin nhắn sau 15 phút');
      }

      const recalledMessage = await this.prisma.message.update({
        where: { id: messageId },
        data: {
          isRecalled: true,
          recalledAt: new Date(),
        },
      });

      if (!recalledMessage) {
        throw new BadRequestException('Lỗi khi thu hồi tin nhắn');
      }

      return {
        messageId: recalledMessage.id,
      };
    } catch (error) {
      this.logger.error(
        `Error recalling message ${messageId}: ${error.message}`,
      );
      throw error;
    }
  }

  async deleteMessage(
    messageId: string,
    profileId: string,
  ): Promise<MessageIdResponseDTO> {
    try {
      const message = await this.prisma.message.findUnique({
        where: { id: messageId },
        include: {
          deletedBy: true,
          group: {
            include: {
              participants: true,
            },
          },
        },
      });

      if (!message) {
        throw new BadRequestException('Tin nhắn không tồn tại');
      }

      const isGroupMember = message.group.participants.some(
        (participant) => participant.userId === profileId,
      );

      if (!isGroupMember) {
        throw new ForbiddenException(
          'Bạn không có quyền truy cập tin nhắn này',
        );
      }

      const alreadyDeleted = message.deletedBy.some(
        (del) => del.userId === profileId,
      );
      if (alreadyDeleted) {
        throw new BadRequestException('Tin nhắn đã được xóa trước đó');
      }

      const deletedMessage = await this.prisma.deletedMessage.create({
        data: {
          messageId,
          userId: profileId,
        },
      });

      if (!deletedMessage) {
        throw new BadRequestException('Lỗi khi xóa tin nhắn');
      }

      return {
        messageId: deletedMessage.id,
      };
    } catch (error) {
      this.logger.error(
        `Error deleting message ${messageId}: ${error.message}`,
      );
      throw error;
    }
  }

  async forwardMessage(
    messageId: string,
    targetGroupId: string,
    senderId: string,
  ): Promise<MessageIdResponseDTO> {
    try {
      // Tìm tin nhắn gốc kèm theo thông tin nhóm và người tham gia
      const originalMessage = await this.prisma.message.findUnique({
        where: { id: messageId },
        include: {
          group: {
            include: {
              participants: true,
            },
          },
        },
      });

      if (!originalMessage) {
        throw new BadRequestException('Tin nhắn không tồn tại');
      }

      // Kiểm tra nếu tin nhắn đã bị thu hồi
      if (originalMessage.isRecalled) {
        throw new BadRequestException(
          'Không thể chuyển tiếp tin nhắn đã thu hồi',
        );
      }

      // Kiểm tra người dùng có quyền đọc tin nhắn gốc không
      const isGroupMember = originalMessage.group.participants.some(
        (participant) => participant.userId === senderId,
      );

      if (!isGroupMember) {
        throw new ForbiddenException(
          'Bạn không có quyền truy cập tin nhắn này để chuyển tiếp',
        );
      }

      // Kiểm tra người dùng có quyền gửi tin nhắn đến nhóm đích không
      const targetGroup = await this.prisma.group.findUnique({
        where: { id: targetGroupId },
        include: {
          participants: true,
        },
      });

      if (!targetGroup) {
        throw new BadRequestException('Nhóm đích không tồn tại');
      }

      const isTargetGroupMember = targetGroup.participants.some(
        (participant) => participant.userId === senderId,
      );

      if (!isTargetGroupMember) {
        throw new ForbiddenException(
          'Bạn không có quyền gửi tin nhắn đến nhóm đích',
        );
      }

      const forwardedMessage = await this.prisma.message.create({
        data: {
          senderId,
          groupId: targetGroupId,
          type: originalMessage.type,
          content: originalMessage.content,
          fileUrl: originalMessage.fileUrl,
          fileName: originalMessage.fileName,
          fileSize: originalMessage.fileSize,
          readBy: {
            create: [{ userId: senderId }],
          },
        },
      });

      if (!forwardedMessage) {
        throw new BadRequestException('Lỗi khi chuyển tiếp tin nhắn');
      }

      return {
        messageId: forwardedMessage.id,
      };
    } catch (error) {
      this.logger.error(
        `Error forwarding message ${messageId}: ${error.message}`,
      );
      throw error;
    }
  }

  async editMessage(messageId: string, newContent: string, profileId: string) {
    this.logger.debug(`Editing message ${messageId} by user ${profileId}`);

    try {
      // Kiểm tra tin nhắn tồn tại
      const message = await this.prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        throw new BadRequestException('Tin nhắn không tồn tại');
      }

      // Chỉ cho phép người gửi chỉnh sửa tin nhắn
      if (message.senderId !== profileId) {
        throw new ForbiddenException(
          'Bạn không có quyền chỉnh sửa tin nhắn này',
        );
      }

      if (message.type !== MessageType.TEXT) {
        throw new BadRequestException(
          'Chỉ tin nhắn văn bản mới có thể chỉnh sửa',
        );
      }

      const updatedMessage = await this.prisma.message.update({
        where: { id: messageId },
        data: {
          content: newContent,
          originalContent: message.originalContent || message.content,
          updatedAt: new Date(),
        },
      });

      return updatedMessage;
    } catch (error) {
      this.logger.error(`Error editing message ${messageId}: ${error.message}`);
      throw error;
    }
  }

  async isLastMessageInGroup(
    messageId: string,
    groupId: string,
  ): Promise<boolean> {
    const lastMessage = await this.prisma.message.findFirst({
      where: {
        groupId: groupId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
      },
    });

    return lastMessage?.id === messageId;
  }

  async getMediaByType(
    groupId: string,
    profileId: string,
    messageType: MediaMessageType,
    limit: number = 10,
    cursor?: string,
  ) {
    this.logger.debug(
      `Fetching ${messageType} media for group ${groupId}, limit: ${limit}, cursor: ${cursor || 'none'}`,
    );

    try {
      // Kiểm tra xem nhóm có tồn tại không
      const group = await this.prisma.group.findUnique({
        where: { id: groupId },
      });

      if (!group) {
        throw new BadRequestException('Nhóm chat không tồn tại');
      }

      const queryOptions: any = {
        where: {
          groupId,
          type: messageType,
          deletedBy: {
            none: {
              userId: profileId,
            },
          },
          isRecalled: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: Number(limit),
        select: {
          id: true,
          fileUrl: true,
          fileSize: true,
          fileName: true,
          createdAt: true,
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      };

      if (cursor) {
        const cursorMessage = await this.prisma.message.findUnique({
          where: { id: cursor },
          select: { createdAt: true },
        });

        if (cursorMessage) {
          queryOptions.where.createdAt = {
            lt: cursorMessage.createdAt,
          };
        }
      }

      const mediaMessages = await this.prisma.message.findMany(queryOptions);

      // Ghi log chi tiết hơn để debug
      this.logger.debug(`Query options: ${JSON.stringify(queryOptions)}`);

      if (mediaMessages.length === 0) {
        this.logger.debug(
          `Không tìm thấy media nào cho nhóm ${groupId} với loại ${messageType}`,
        );
      }

      const nextCursor =
        mediaMessages.length === limit
          ? mediaMessages[mediaMessages.length - 1].id
          : null;

      this.logger.debug(
        `Retrieved ${mediaMessages.length} ${messageType} media items for group ${groupId}, nextCursor: ${nextCursor || 'none'}`,
      );

      return {
        media: mediaMessages,
        nextCursor,
        hasMore: mediaMessages.length === limit,
      };
    } catch (error) {
      this.logger.error(
        `Error fetching ${messageType} media for group ${groupId}: ${error.message}`,
      );
      throw error;
    }
  }

  async getMessageById(messageId: string): Promise<MessageDetailResponseDTO> {
    try {
      const message = await this.prisma.message.findUnique({
        where: {
          id: messageId,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          readBy: {
            select: {
              userId: true,
            },
          },
        },
      });

      if (!message) {
        throw new BadRequestException('Tin nhắn không tồn tại');
      }

      return {
        ...message,
        content: message.content || '',
        fileUrl: message.fileUrl || '',
        fileName: message.fileName || '',
        fileSize: message.fileSize || undefined,
        sender: {
          ...message.sender,
          name: message.sender.name || '',
          avatar: message.sender.avatar || '',
        },
        readBy: message.readBy.map((read) => read.userId),
      };
    } catch (error) {
      this.logger.error(
        `Error getting message by ID: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
