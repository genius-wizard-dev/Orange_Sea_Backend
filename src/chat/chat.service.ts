import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { MessageType } from '@prisma/client';
import { CloudinaryService } from 'src/config/cloudinary/cloudinary.service';
import { PrismaService } from 'src/config/prisma/prisma.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async sendMessage(
    senderId: string,
    groupId: string,
    message: string,
    type: MessageType = MessageType.TEXT,
    activeReaders: string[] = [],
    file?: Express.Multer.File,
  ) {
    this.logger.log(
      `Sending message from ${senderId} to group ${groupId}: ${message} with type ${type}`,
    );
    this.logger.debug(`Active readers: ${activeReaders.join(', ') || 'none'}`);

    // Kiểm tra người dùng có trong group không trước khi gửi tin nhắn
    const participant = await this.prisma.participant.findUnique({
      where: {
        userId_groupId: {
          userId: senderId,
          groupId: groupId,
        },
      },
    });

    if (!participant) {
      this.logger.warn(`User ${senderId} is not a member of group ${groupId}`);
      throw new ForbiddenException(
        `Người dùng không phải là thành viên của nhóm chat này`,
      );
    }

    let imageUrl: string | undefined;
    let videoUrl: string | undefined;

    if (file) {
      try {
        const filename = `message_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        const folder =
          type === MessageType.IMAGE ? 'chat-images' : 'chat-videos';

        this.logger.debug(`Uploading file: ${filename} to folder ${folder}`);

        const fileUrl = await this.cloudinaryService.uploadBufferToCloudinary(
          file.buffer,
          filename,
          folder,
        );

        if (type === MessageType.IMAGE) {
          imageUrl = fileUrl;
          this.logger.debug(`Image uploaded: ${imageUrl}`);
        } else if (type === MessageType.VIDEO) {
          videoUrl = fileUrl;
          this.logger.debug(`Video uploaded: ${videoUrl}`);
        }

        this.logger.debug(`File uploaded successfully, URL: ${fileUrl}`);
      } catch (error) {
        this.logger.error(`Error uploading file: ${error.message}`);
        throw error;
      }
    }

    // Create read receipt data for sender and active readers
    const readByData = [
      { userId: senderId },
      // Add other active readers
      ...activeReaders
        .filter((id) => id !== senderId)
        .map((userId) => ({ userId })),
    ];

    this.logger.debug(
      `Creating message with read receipts for: ${readByData.map((item) => item.userId).join(', ')}`,
    );

    const chat = await this.prisma.message.create({
      data: {
        senderId,
        groupId,
        type,
        content: message,
        ...(imageUrl && { imageUrl }),
        ...(videoUrl && { videoUrl }),
        // Create read receipts for active users in the group
        readBy: {
          create: readByData,
        },
      },
      include: {
        readBy: true,
        sender: true,
      },
    });

    this.logger.debug(`Message created with ID: ${chat.id}`);
    this.logger.debug(`Read receipts created: ${chat.readBy.length}`);

    return chat;
  }

  async markMessagesAsRead(userId: string, groupId: string) {
    this.logger.debug(
      `Marking messages as read for user ${userId} in group ${groupId}`,
    );

    // Find all unread messages in the group
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

    this.logger.debug(`Found ${unreadMessages.length} unread messages`);

    if (unreadMessages.length === 0) {
      return { count: 0 };
    }

    // Create read receipts for all unread messages
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

    this.logger.debug(`Created ${readReceipts.length} read receipts`);
    this.logger.debug(
      `Message IDs marked as read: ${unreadMessages.map((m) => m.id).join(', ')}`,
    );

    return {
      count: readReceipts.length,
      messageIds: unreadMessages.map((m) => m.id),
    };
  }

  async getUnreadMessageCount(userId: string, groupId?: string) {
    const where = {
      readBy: {
        none: {
          userId,
        },
      },
    };

    if (groupId) {
      where['groupId'] = groupId;
      this.logger.debug(
        `Getting unread message count for user ${userId} in group ${groupId}`,
      );
    } else {
      this.logger.debug(
        `Getting total unread message count for user ${userId}`,
      );
    }

    const count = await this.prisma.message.count({
      where,
    });

    this.logger.debug(`Unread message count: ${count}`);
    return { count };
  }

  async getUnreadMessageCountsByGroups(userId: string) {
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

    const results = await Promise.all(unreadCountsPromises);
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

  async uploadSticker(file: Express.Multer.File): Promise<string> {
    try {
      const filename = `sticker_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const stickerUrl = await this.cloudinaryService.uploadBufferToCloudinary(
        file.buffer,
        filename,
        'stickers',
      );

      this.logger.debug(`Sticker uploaded successfully, URL: ${stickerUrl}`);
      return stickerUrl;
    } catch (error) {
      this.logger.error(`Error uploading sticker: ${error.message}`);
      throw error;
    }
  }

  async getMessageById(messageId: string, userId?: string) {
    this.logger.debug(`Fetching message with ID: ${messageId}`);

    try {
      // Xây dựng điều kiện where dựa trên có userId hay không
      const where: any = { id: messageId };

      if (userId) {
        // Sử dụng cách viết đúng cú pháp Prisma
        where.NOT = {
          deletedBy: {
            some: {
              userId,
            },
          },
        };
      }

      const message = await this.prisma.message.findFirst({
        where,
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

      if (!message) {
        this.logger.warn(
          `Message with ID ${messageId} not found or deleted by user`,
        );
        return null;
      }

      this.logger.debug(`Retrieved message with ID: ${messageId}`);
      return message;
    } catch (error) {
      this.logger.error(
        `Error fetching message with ID ${messageId}: ${error.message}`,
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

  async recallMessage(messageId: string, userId: string) {
    this.logger.debug(`Recalling message ${messageId} by user ${userId}`);

    try {
      // Kiểm tra tin nhắn tồn tại
      const message = await this.prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        throw new BadRequestException('Tin nhắn không tồn tại');
      }

      // Kiểm tra thời gian giới hạn thu hồi (15 phút)
      const messageTime = new Date(message.createdAt);
      const currentTime = new Date();
      const timeDiffInMinutes =
        (currentTime.getTime() - messageTime.getTime()) / (1000 * 60);

      if (timeDiffInMinutes > 15) {
        throw new BadRequestException('Không thể thu hồi tin nhắn sau 15 phút');
      }

      // Cập nhật trạng thái thu hồi tin nhắn
      const recalledMessage = await this.prisma.message.update({
        where: { id: messageId },
        data: {
          isRecalled: true,
          recalledAt: new Date(),
        },
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

      return recalledMessage;
    } catch (error) {
      this.logger.error(
        `Error recalling message ${messageId}: ${error.message}`,
      );
      throw error;
    }
  }

  async deleteMessage(messageId: string, accountId: string) {
    this.logger.debug(`Deleting message ${messageId} for user ${accountId}`);

    try {
      // Kiểm tra tin nhắn tồn tại
      const profile = await this.prisma.profile.findUnique({
        where: { accountId },
      });

      if (!profile) {
        throw new Error('Profile not found');
      }
      const message = await this.prisma.message.findUnique({
        where: { id: messageId },
        include: { deletedBy: true },
      });

      if (!message) {
        throw new BadRequestException('Tin nhắn không tồn tại');
      }

      // Kiểm tra người dùng đã xóa tin nhắn này chưa
      const alreadyDeleted = message.deletedBy.some(
        (del) => del.userId === profile.id,
      );
      if (alreadyDeleted) {
        throw new BadRequestException('Tin nhắn đã được xóa trước đó');
      }

      // Cập nhật trạng thái xóa tin nhắn cho người dùng
      await this.prisma.deletedMessage.create({
        data: {
          messageId,
          userId: profile.id,
        },
      });

      return { success: true, message: 'Đã xóa tin nhắn thành công' };
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
  ) {
    this.logger.debug(
      `Forwarding message ${messageId} to group ${targetGroupId} by user ${senderId}`,
    );

    try {
      // Lấy thông tin tin nhắn cần chuyển tiếp
      const originalMessage = await this.prisma.message.findUnique({
        where: { id: messageId },
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

      // Tạo tin nhắn mới với nội dung từ tin nhắn gốc
      const forwardedMessage = await this.prisma.message.create({
        data: {
          senderId,
          groupId: targetGroupId,
          type: originalMessage.type,
          content: originalMessage.content,
          imageUrl: originalMessage.imageUrl,
          videoUrl: originalMessage.videoUrl,
          stickerUrl: originalMessage.stickerUrl,
          forwardedFrom: messageId,
          forwardedAt: new Date(),
          readBy: {
            create: [{ userId: senderId }],
          },
        },
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

      return forwardedMessage;
    } catch (error) {
      this.logger.error(
        `Error forwarding message ${messageId}: ${error.message}`,
      );
      throw error;
    }
  }
}
