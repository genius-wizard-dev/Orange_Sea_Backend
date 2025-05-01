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

  private async uploadFileByType(
    file: Express.Multer.File,
    type: MessageType,
  ): Promise<{ url: string; fileSize: number; originalName: string }> {
    // Fix Vietnamese filename encoding issues
    let originalName = file.originalname;

    // Try to normalize the filename if it's incorrectly encoded
    try {
      // Check if filename has incorrect encoding (like "NhÃ³m" instead of "Nhóm")
      if (/Ã/.test(originalName)) {
        // Try to decode and re-normalize
        const decodedName = Buffer.from(originalName, 'latin1').toString(
          'utf8',
        );
        this.logger.debug(`Fixed encoding: ${originalName} → ${decodedName}`);
        originalName = decodedName;
      }
    } catch (e) {
      this.logger.warn(`Error normalizing filename: ${e.message}`);
      // Keep original if error occurs
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
  ): Promise<any> {
    this.logger.log(
      `Sending message from ${senderId} to group ${groupId}: ${content} with type ${type}`,
    );
    this.logger.debug(`Active readers: ${readBy.join(', ') || 'none'}`);

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

    // Add file metadata to the message
    const messageData = {
      senderId,
      groupId,
      type,
      content,
      fileUrl: file ? fileUrl : null,
      // Store file metadata if applicable
      fileSize: file ? fileSize : null,
      fileName: file ? fileName : null,
      // Create read receipts for active users in the group
      readBy: {
        create: readByData,
      },
    };

    const message = await this.prisma.message.create({
      data: messageData,
      include: {
        readBy: {
          select: {
            userId: true,
          },
        },
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    this.logger.debug(`Message created with ID: ${message.id}`);
    this.logger.debug(`Read receipts created: ${message.readBy.length}`);

    return message;
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

      // Get the next cursor (oldest message in the batch)
      const nextCursor =
        messages.length === limit ? messages[messages.length - 1].id : null;

      // Format messages and their read receipts
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
        messages: formattedMessages.reverse(), // Return in chronological order
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

      const forwardedMessage = await this.prisma.message.create({
        data: {
          senderId,
          groupId: targetGroupId,
          type: originalMessage.type,
          content: originalMessage.content,
          fileUrl: originalMessage.fileUrl,
          readBy: {
            create: [{ userId: senderId }],
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

  /**
   * Check if a message is the last message in a group
   */
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
}
