import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { FcmService } from 'src/config/firebase/fcm.service';
import { SOCKET_TO_ACTIVE_GROUP, USER_DEVICE_INFO } from 'src/config/redis/key';
import { RedisService } from 'src/config/redis/redis.service';
import { GroupService } from 'src/group/services/group';
import { GroupSocketService } from 'src/group/services/socket';
import { ProfileService } from 'src/profile/services/profile';
import { SocketService } from 'src/socket/socket.service';
import { DeviceData } from 'src/token/interfaces/jwt.interface';
import { TokenService } from 'src/token/token.service';
import { ChatService } from './chat';
@Injectable()
export class ChatSocketService {
  private readonly logger = new Logger(ChatSocketService.name);

  constructor(
    private readonly groupService: GroupService,
    private readonly chatService: ChatService,
    private readonly redisService: RedisService,
    private readonly fcmService: FcmService,
    private readonly tokenService: TokenService,
    private readonly profileService: ProfileService,
    private readonly socketService: SocketService,
    private readonly groupSocketService: GroupSocketService,
  ) {}

  async unReadMessages(profileId: string, client: Socket) {
    try {
      const unRead = await this.chatService.getUnreadMessages(profileId);
      client.emit('unReadMessages', unRead);
    } catch (error) {}
  }

  async sendMessage(messageId: string, server: Server) {
    try {
      this.logger.debug(`Bắt đầu gửi tin nhắn với ID: ${messageId}`);

      const message = await this.chatService.getMessageById(messageId);
      this.logger.debug(`Thông tin tin nhắn: ${JSON.stringify(message)}`);

      const sender = await this.profileService.getProfileById(message.senderId);
      this.logger.debug(`Thông tin người gửi: ${JSON.stringify(sender)}`);

      const openPayload = message;
      const notifyPayload = this.createNotificationPayload(message, sender);
      this.logger.debug(`Payload thông báo: ${JSON.stringify(notifyPayload)}`);

      const groupId = message.groupId;
      const { open, online, offline } =
        await this.groupSocketService.getGroupMemberStatus(groupId);

      this.logger.debug(
        `Trạng thái thành viên nhóm - Mở: ${open.length}, Trực tuyến: ${online.length}, Ngoại tuyến: ${offline.length}`,
      );
      this.logger.debug(
        `Chi tiết - Mở: ${JSON.stringify(open)}, Trực tuyến: ${JSON.stringify(online)}, Ngoại tuyến: ${JSON.stringify(offline)}`,
      );

      // Xử lý người dùng đang mở nhóm chat
      await this.handleOpenUsers(
        open,
        openPayload,
        notifyPayload,
        messageId,
        groupId,
        sender.name,
        server,
      );

      // Xử lý người dùng trực tuyến
      await this.handleOnlineUsers(
        online,
        notifyPayload,
        groupId,
        sender.name,
        server,
      );

      // Xử lý người dùng ngoại tuyến
      await this.handleOfflineUsers(
        offline,
        notifyPayload,
        groupId,
        sender.name,
      );

      this.logger.debug(`Hoàn thành gửi tin nhắn với ID: ${messageId}`);
    } catch (error) {
      this.logger.error(`Không thể gửi tin nhắn: ${error.message}`);
      this.logger.error(`Chi tiết lỗi: ${error.stack}`);
      throw error;
    }
  }

  private createNotificationPayload(message: any, sender: any) {
    return {
      messageId: message.id,
      groupId: message.groupId,
      senderName: sender.name,
      content: message.content,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      type: message.type,
      isRecalled: message.isRecalled,
    };
  }

  private async handleOpenUsers(
    openUsers: string[],
    openPayload: any,
    notifyPayload: any,
    messageId: string,
    groupId: string,
    senderName: string,
    server: Server,
  ) {
    if (openUsers.length === 0) return;

    this.logger.debug(
      `Gửi tin nhắn đến ${openUsers.length} người dùng đang mở nhóm chat`,
    );
    server.to(groupId).emit('receiveMessage', openPayload);

    const markReadResult = await this.chatService.markMessageAsReadByUsers(
      messageId,
      openUsers,
    );
    this.logger.debug(
      `Đánh dấu đã đọc cho ${markReadResult.count} người dùng: ${JSON.stringify(markReadResult.userIds || [])}`,
    );

    const fcmTokensMap = await this.collectOfflineDeviceTokens(openUsers);

    this.logger.debug(
      `Tổng số người dùng cần gửi FCM (đang mở): ${fcmTokensMap.size}`,
    );
    await this.sendFCMNotificationsToUsers(
      fcmTokensMap,
      senderName,
      notifyPayload,
      groupId,
    );
  }

  private async handleOnlineUsers(
    onlineUsers: string[],
    notifyPayload: any,
    groupId: string,
    senderName: string,
    server: Server,
  ) {
    if (onlineUsers.length === 0) return;

    this.logger.debug(`Xử lý ${onlineUsers.length} người dùng trực tuyến`);
    const allSocketIds = await this.collectSocketIds(onlineUsers);
    const fcmTokensMap = await this.collectOfflineDeviceTokens(onlineUsers);

    if (allSocketIds.length > 0) {
      this.logger.debug(
        `Gửi thông báo đến ${allSocketIds.length} socket IDs: ${JSON.stringify(allSocketIds)}`,
      );
      server.to(allSocketIds).emit('notifyMessage', notifyPayload);
    }

    this.logger.debug(
      `Tổng số người dùng cần gửi FCM (trực tuyến): ${fcmTokensMap.size}`,
    );
    await this.sendFCMNotificationsToUsers(
      fcmTokensMap,
      senderName,
      notifyPayload,
      groupId,
    );
  }

  private async handleOfflineUsers(
    offlineUsers: string[],
    notifyPayload: any,
    groupId: string,
    senderName: string,
  ) {
    if (offlineUsers.length === 0) return;

    this.logger.debug(`Xử lý ${offlineUsers.length} người dùng ngoại tuyến`);
    const fcmTokensMap = await this.collectOfflineDeviceTokens(offlineUsers);

    this.logger.debug(
      `Tổng số người dùng cần gửi FCM (ngoại tuyến): ${fcmTokensMap.size}`,
    );
    await this.sendFCMNotificationsToUsers(
      fcmTokensMap,
      senderName,
      notifyPayload,
      groupId,
    );
  }

  private async collectSocketIds(profileIds: string[]): Promise<string[]> {
    const allSocketIds: string[] = [];

    for (const profileId of profileIds) {
      this.logger.debug(`Lấy socket IDs cho người dùng: ${profileId}`);
      const socketIds =
        await this.socketService.getListSocketIdFromProfileId(profileId);
      this.logger.debug(
        `Socket IDs của ${profileId}: ${JSON.stringify(socketIds)}`,
      );

      if (socketIds && socketIds.length > 0) {
        allSocketIds.push(...socketIds);
      }
    }

    return allSocketIds;
  }

  private async collectOfflineDeviceTokens(
    profileIds: string[],
  ): Promise<Map<string, string[]>> {
    const fcmTokensMap: Map<string, string[]> = new Map();

    for (const profileId of profileIds) {
      this.logger.debug(
        `Xử lý thiết bị ngoại tuyến cho người dùng: ${profileId}`,
      );
      const deviceOffline =
        await this.socketService.getAllDeviceOffline(profileId);
      this.logger.debug(
        `Số thiết bị ngoại tuyến của ${profileId}: ${deviceOffline?.length || 0}`,
      );

      if (deviceOffline && deviceOffline.length > 0) {
        const deviceTokens = await Promise.all(
          deviceOffline.map(async (deviceId) => {
            try {
              const deviceData = await this.redisService.get<DeviceData>(
                USER_DEVICE_INFO(profileId, deviceId),
              );
              this.logger.debug(
                `Thông tin thiết bị ${deviceId}: ${JSON.stringify(deviceData)}`,
              );
              return deviceData?.fcmToken || null;
            } catch (error) {
              this.logger.error(
                `Lỗi khi lấy thông tin thiết bị ${deviceId}: ${error.message}`,
              );
              return null;
            }
          }),
        );

        const validTokens = deviceTokens.filter(Boolean) as string[];
        this.logger.debug(
          `Số token FCM hợp lệ cho ${profileId}: ${validTokens.length}`,
        );

        if (validTokens.length > 0) {
          fcmTokensMap.set(profileId, validTokens);
        }
      }
    }

    return fcmTokensMap;
  }

  private async sendFCMNotificationsToUsers(
    fcmTokensMap: Map<string, string[]>,
    senderName: string,
    notifyPayload: any,
    groupId: string,
  ) {
    for (const [profileId, tokens] of fcmTokensMap.entries()) {
      this.logger.debug(
        `Gửi thông báo FCM đến ${tokens.length} thiết bị của người dùng ${profileId}`,
      );
      this.sendPushNotificationsToTokens(
        tokens,
        senderName,
        notifyPayload,
        profileId,
        groupId,
      );
    }
  }

  private async sendPushNotificationsToTokens(
    tokens: string[],
    senderName: string,
    messageData: any,
    profileId: string,
    groupId: string,
  ) {
    try {
      if (!tokens || tokens.length === 0) return;

      let notificationBody = '';

      if (messageData.type === 'TEXT') {
        notificationBody = messageData.content;
      } else if (messageData.type === 'IMAGE') {
        notificationBody = '📷 Sent a photo';
      } else if (messageData.type === 'VIDEO') {
        notificationBody = '📷 Sent a video';
      } else if (messageData.type === 'RAW') {
        notificationBody = '📎 Sent a file';
      } else {
        notificationBody = 'Sent a message';
      }

      const data = {
        groupId,
        messageId: messageData.messageId,
        senderId: messageData.senderId || '',
        messageType: messageData.type,
        timestamp: messageData.createdAt?.toString() || Date.now().toString(),
        notificationType: 'NEW_MESSAGE',
      };

      await this.fcmService.sendNotificationToMultipleDevices(
        tokens,
        senderName,
        notificationBody,
        data,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send batch push notifications to user ${profileId}: ${error.message}`,
      );
    }
  }

  async recallMessage(messageId: string, server: Server) {
    try {
      const message = await this.chatService.getMessageById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      const groupId = message.groupId;
      const { open, online, offline } =
        await this.groupSocketService.getGroupMemberStatus(groupId);

      this.logger.log({
        message: 'Thu hồi tin nhắn',
        messageId,
        groupId,
        openMembers: open,
        onlineMembers: online,
        offlineMembers: offline,
      });

      if (open.length > 0) {
        server.to(groupId).emit('messageRecall', {
          messageId,
        });
      }

      // Kiểm tra xem tin nhắn có phải là tin nhắn cuối cùng không
      const isLastMessage = await this.chatService.isLastMessageInGroup(
        messageId,
        groupId,
      );

      if (isLastMessage && online.length > 0) {
        const onlineSocketIds = await this.collectSocketIds(online);
        server.to(onlineSocketIds).emit('notifyRecallMessage', {
          groupId,
        });
      }
    } catch (error) {
      this.logger.error(`Lỗi khi gọi lại tin nhắn: ${error.message}`);
      throw error;
    }
  }

  async editMessage(messageId: string, server: Server) {
    try {
      const message = await this.chatService.getMessageById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }
      const groupId = message.groupId;
      const { open, online, offline } =
        await this.groupSocketService.getGroupMemberStatus(groupId);

      this.logger.log({
        message: 'Thu hồi tin nhắn',
        messageId,
        groupId,
        openMembers: open,
        onlineMembers: online,
        offlineMembers: offline,
      });

      if (open.length > 0) {
        server.to(groupId).emit('messageEdit', {
          messageId,
        });
      }
      if (online.length > 0) {
        const onlineSocketIds = await this.collectSocketIds(online);
        server.to(onlineSocketIds).emit('notifyEditMessage', {
          groupId,
        });
      }
    } catch (error) {
      this.logger.error(`Lỗi khi chỉnh sửa tin nhắn: ${error.message}`);
      throw error;
    }
  }

  async deleteMessage(messageId: string, server: Server, client: Socket) {
    try {
      const message = await this.chatService.getMessageById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      const userProfileId = await this.socketService.getProfileFromSocketId(
        client.id,
      );

      const isLastMessage = await this.chatService.isLastMessageInGroup(
        messageId,
        message.groupId,
      );

      const groupId = message.groupId;

      // Lấy danh sách tất cả socket ID của profile đang gửi yêu cầu
      const userSocketIds =
        await this.socketService.getListSocketIdFromProfileId(userProfileId);

      // Phân loại các socket của cùng profile
      const activeSocketIds: string[] = []; // Socket đang mở group chat
      const otherSocketIds: string[] = []; // Socket online nhưng không mở group chat

      // Phân loại các socket
      for (const socketId of userSocketIds) {
        const isInGroup = await this.redisService.sismember(
          `${SOCKET_TO_ACTIVE_GROUP}${groupId}`,
          socketId,
        );

        if (isInGroup) {
          activeSocketIds.push(socketId);
        } else {
          otherSocketIds.push(socketId);
        }
      }

      // Gửi thông báo đến các socket đang mở group chat
      if (activeSocketIds.length > 0) {
        server.to(activeSocketIds).emit('messageDelete', {
          messageId,
        });
      }

      // Nếu là tin nhắn cuối cùng, gửi thông báo đến các socket khác của cùng profile
      if (isLastMessage && otherSocketIds.length > 0) {
        server.to(otherSocketIds).emit('notifyMessageDelete', {
          groupId,
        });
      }
    } catch (error) {
      this.logger.error(`Lỗi khi xóa tin nhắn: ${error.message}`);
      throw error;
    }
  }
}
