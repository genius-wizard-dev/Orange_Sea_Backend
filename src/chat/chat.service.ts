import { Injectable, Logger } from '@nestjs/common';
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
      // Always add sender to readBy
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
}
