import { Logger, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from 'src/config/redis/redis.service';
import { GroupService } from 'src/group/group.service';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name, { timestamp: true });

  // Redis key prefixes
  private readonly SOCKET_TO_PROFILE = 'socket:profile:';
  private readonly PROFILE_CONNECTIONS = 'profile:connections:';
  private readonly ACTIVE_GROUP_VIEWERS = 'group:viewers:';
  private readonly SOCKET_TO_ACTIVE_GROUP = 'socket:group:';

  constructor(
    private readonly groupService: GroupService,
    private readonly chatService: ChatService,
    private readonly redisService: RedisService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log({ message: 'Socket connected', socketId: client.id });
  }

  async handleDisconnect(client: Socket) {
    try {
      const socketToProfileKey = `${this.SOCKET_TO_PROFILE}${client.id}`;
      const socketToGroupKey = `${this.SOCKET_TO_ACTIVE_GROUP}${client.id}`;

      const [profileId, activeGroupId] = await Promise.all([
        this.redisService.get<string>(socketToProfileKey),
        this.redisService.get<string>(socketToGroupKey),
      ]);

      if (!profileId) return;

      const pipeline = this.redisService.multi();
      const connectionsKey = `${this.PROFILE_CONNECTIONS}${profileId}`;
      pipeline.srem(connectionsKey, client.id);
      pipeline.del(socketToProfileKey);

      if (activeGroupId) {
        const viewersKey = `${this.ACTIVE_GROUP_VIEWERS}${activeGroupId}`;
        pipeline.srem(viewersKey, profileId);
        pipeline.del(socketToGroupKey);
      }

      await pipeline.exec();

      if (activeGroupId && profileId) {
        const remainingViewers = await this.redisService.smembers(
          `${this.ACTIVE_GROUP_VIEWERS}${activeGroupId}`,
        );
        if (remainingViewers.length === 0) {
          await this.redisService.del(
            `${this.ACTIVE_GROUP_VIEWERS}${activeGroupId}`,
          );
        }
        this.server.to(activeGroupId).emit('userStatusUpdate', {
          profileId,
          isActive: false,
          groupId: activeGroupId,
        });
      }

      const remainingConnections =
        await this.redisService.scard(connectionsKey);
      if (remainingConnections === 0) {
        await this.redisService.del(connectionsKey);
        await this.broadcastUserStatus(profileId, false);
      }

      this.logger.log({
        message: 'Client disconnected',
        socketId: client.id,
        profileId,
      });
    } catch (error) {
      this.logger.error({
        message: 'Error handling disconnect',
        error: error.message,
      });
    }
  }

  @SubscribeMessage('register')
  async handleRegister(
    @MessageBody() data: { profileId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { profileId } = data;
      if (!profileId) throw new Error('profileId is required');

      const pipeline = this.redisService.multi();
      pipeline.set(`${this.SOCKET_TO_PROFILE}${client.id}`, profileId);
      pipeline.sadd(`${this.PROFILE_CONNECTIONS}${profileId}`, client.id);
      await pipeline.exec();

      await this.broadcastUserStatus(profileId, true);
      const unreadCounts =
        await this.chatService.getUnreadMessageCountsByGroups(profileId);
      client.emit('initialUnreadCounts', unreadCounts);

      this.logger.log({
        message: 'User registered',
        profileId,
        socketId: client.id,
      });
      return { status: 'success', message: 'Registered successfully' };
    } catch (error) {
      this.logger.error({
        message: 'Error registering user',
        error: error.message,
      });
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('open')
  async handleJoinRoom(
    @MessageBody() data: { profileId: string; groupId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { profileId, groupId } = data;
      if (!profileId || !groupId)
        throw new Error('profileId and groupId are required');

      await this.validateGroupMembership(profileId, groupId);
      await this.handlePreviousGroup(client, profileId, groupId);

      const pipeline = this.redisService.multi();
      pipeline.set(`${this.SOCKET_TO_ACTIVE_GROUP}${client.id}`, groupId);
      pipeline.sadd(`${this.ACTIVE_GROUP_VIEWERS}${groupId}`, profileId);
      await pipeline.exec();

      client.join(groupId);
      this.server.to(groupId).emit('userStatusUpdate', {
        profileId,
        isOnline: true,
        isActive: true,
        groupId,
      });

      const markResult = await this.chatService.markMessagesAsRead(
        profileId,
        groupId,
      );
      if (markResult.count > 0) {
        this.server.to(groupId).emit('messagesRead', {
          profileId,
          groupId,
          messageIds: markResult.messageIds,
        });
        const unreadCounts =
          await this.chatService.getUnreadMessageCountsByGroups(profileId);
        this.server.to(client.id).emit('unreadCountUpdated', unreadCounts);
      }

      const [messageData, activeUsers] = await Promise.all([
        this.chatService.getMessagesPaginated(groupId, profileId, 10),
        this.redisService.smembers(`${this.ACTIVE_GROUP_VIEWERS}${groupId}`),
      ]);

      this.logger.log({ message: 'User joined group', profileId, groupId });
      return {
        status: 'success',
        activeUsers,
        messages: messageData.messages,
        nextCursor: messageData.nextCursor,
        hasMore: messageData.hasMore,
      };
    } catch (error) {
      this.logger.error({
        message: 'Error opening chat',
        error: error.message,
      });
      client.emit('socketError', {
        message: 'Failed to open chat',
        error: error.message,
      });
    }
  }

  @SubscribeMessage('send')
  async handleSendMessage(
    @MessageBody(new ValidationPipe())
    data: { messageId: string; groupId: string; senderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { messageId, groupId, senderId } = data;
      if (!messageId || !groupId || !senderId)
        throw new Error('messageId, groupId and senderId are required');

      await this.validateGroupMembership(senderId, groupId);
      const messageResult = await this.chatService.getMessageById(messageId);
      if (!messageResult) throw new Error('Message not found');

      const activeReaders = await this.getActiveViewers(groupId);
      if (activeReaders.length > 0) {
        await this.chatService.markMessageAsReadByUsers(
          messageId,
          activeReaders,
        );
      }

      const participants = await this.getCachedGroupParticipants(groupId);
      const messageData = {
        ...messageResult,
        readBy: messageResult.readBy?.map((r) => r.userId) || [],
      };

      this.server.to(groupId).emit('newMessage', messageData);

      const notificationPromises = participants.map(async (participantId) => {
        if (activeReaders.includes(participantId)) return;

        const userSockets = await this.redisService.smembers(
          `${this.PROFILE_CONNECTIONS}${participantId}`,
        );
        if (userSockets.length > 0) {
          const unreadCounts =
            await this.chatService.getUnreadMessageCountsByGroups(
              participantId,
            );
          userSockets.forEach((socketId) => {
            this.server.to(socketId).emit('messageUpdate', {
              type: 'NEW_MESSAGE',
              groupId,
              message: messageData,
              unreadCounts,
            });
          });
        }
      });

      await Promise.all(notificationPromises);
      this.logger.log({
        message: 'Message sent',
        messageId,
        groupId,
        senderId,
      });
      return { status: 'success', data: messageResult };
    } catch (error) {
      this.logger.error({
        message: 'Error processing message',
        error: error.message,
      });
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('recall')
  async handleRecallMessage(
    @MessageBody() data: { messageId: string; groupId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { messageId, groupId } = data;
      if (!messageId || !groupId)
        throw new Error('messageId and groupId are required');

      this.server.to(groupId).emit('messageRecalled', { messageId, groupId });
      this.logger.log({ message: 'Message recalled', messageId, groupId });
      return { status: 'success' };
    } catch (error) {
      this.logger.error({
        message: 'Error recalling message',
        error: error.message,
      });
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('forward')
  async handleForwardMessage(
    @MessageBody()
    data: { messageId: string; targetGroupId: string; senderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { messageId, targetGroupId, senderId } = data;
      if (!messageId || !targetGroupId || !senderId)
        throw new Error('messageId, targetGroupId and senderId are required');

      await this.validateGroupMembership(senderId, targetGroupId);
      const messageResult = await this.chatService.getMessageById(messageId);
      if (!messageResult) throw new Error('Message not found');

      const activeReaders = await this.getActiveViewers(targetGroupId);
      const messageData = {
        ...messageResult,
        readBy: messageResult.readBy?.map((r) => r.userId) || [],
        isForwarded: true,
        originalMessageId: messageId,
      };

      this.server.to(targetGroupId).emit('newMessage', messageData);

      const participants = await this.getCachedGroupParticipants(targetGroupId);
      const notificationPromises = participants.map(async (participantId) => {
        if (activeReaders.includes(participantId)) return;

        const userSockets = await this.redisService.smembers(
          `${this.PROFILE_CONNECTIONS}${participantId}`,
        );
        if (userSockets.length > 0) {
          const unreadCounts =
            await this.chatService.getUnreadMessageCountsByGroups(
              participantId,
            );
          userSockets.forEach((socketId) => {
            this.server.to(socketId).emit('messageUpdate', {
              type: 'NEW_MESSAGE',
              groupId: targetGroupId,
              message: messageData,
              unreadCounts,
            });
          });
        }
      });

      await Promise.all(notificationPromises);
      this.logger.log({
        message: 'Message forwarded',
        messageId,
        targetGroupId,
        senderId,
      });
      return { status: 'success' };
    } catch (error) {
      this.logger.error({
        message: 'Error forwarding message',
        error: error.message,
      });
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('getActiveUsers')
  async handleGetActiveUsers(
    @MessageBody() data: { groupId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { groupId } = data;
      if (!groupId) throw new Error('groupId is required');

      const activeUsers = await this.getActiveViewers(groupId);
      this.logger.log({
        message: 'Fetched active users',
        groupId,
        activeUsers,
      });
      return { status: 'success', activeUsers };
    } catch (error) {
      this.logger.error({
        message: 'Error getting active users',
        error: error.message,
      });
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { profileId: string; groupId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { profileId, groupId } = data;
      if (!profileId || !groupId)
        throw new Error('profileId and groupId are required');

      const markResult = await this.chatService.markMessagesAsRead(
        profileId,
        groupId,
      );
      if (markResult.count > 0) {
        this.server.to(groupId).emit('messagesRead', {
          profileId,
          groupId,
          messageIds: markResult.messageIds,
        });
        const unreadCounts =
          await this.chatService.getUnreadMessageCountsByGroups(profileId);
        client.emit('unreadCountUpdated', unreadCounts);
      }

      this.logger.log({
        message: 'Messages marked as read',
        profileId,
        groupId,
        count: markResult.count,
      });
      return { status: 'success', count: markResult.count };
    } catch (error) {
      this.logger.error({
        message: 'Error marking messages as read',
        error: error.message,
      });
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('getUnreadCounts')
  async handleGetUnreadCounts(
    @MessageBody() data: { profileId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { profileId } = data;
      if (!profileId) throw new Error('profileId is required');

      const unreadCounts =
        await this.chatService.getUnreadMessageCountsByGroups(profileId);
      this.logger.log({
        message: 'Fetched unread counts',
        profileId,
        unreadCounts,
      });
      return { status: 'success', unreadCounts };
    } catch (error) {
      this.logger.error({
        message: 'Error getting unread counts',
        error: error.message,
      });
      return { status: 'error', message: error.message };
    }
  }

  private async broadcastUserStatus(profileId: string, isOnline: boolean) {
    try {
      const groups = await this.groupService.getGroupsByProfileId(profileId);
      for (const group of groups) {
        const viewers = await this.getActiveViewers(group.id);
        const isActive = viewers.includes(profileId);
        this.server.to(group.id).emit('userStatusUpdate', {
          profileId,
          isOnline,
          isActive,
        });
      }
    } catch (error) {
      this.logger.error({
        message: 'Error broadcasting user status',
        error: error.message,
      });
    }
  }

  private async validateGroupMembership(profileId: string, groupId: string) {
    const isMember = await this.groupService.isGroupMember(profileId, groupId);
    if (!isMember) {
      throw new Error('You are not a member of this group');
    }
  }

  private async handlePreviousGroup(
    client: Socket,
    profileId: string,
    groupId: string,
  ) {
    const previousGroup = await this.redisService.get<string>(
      `${this.SOCKET_TO_ACTIVE_GROUP}${client.id}`,
    );
    if (previousGroup && previousGroup !== groupId) {
      await this.leaveGroup(client, profileId, previousGroup);
    }
  }

  private async leaveGroup(client: Socket, profileId: string, groupId: string) {
    const pipeline = this.redisService.multi();
    pipeline.srem(`${this.ACTIVE_GROUP_VIEWERS}${groupId}`, profileId);
    pipeline.del(`${this.SOCKET_TO_ACTIVE_GROUP}${client.id}`);
    await pipeline.exec();

    client.leave(groupId);
    const remainingViewers = await this.redisService.smembers(
      `${this.ACTIVE_GROUP_VIEWERS}${groupId}`,
    );
    if (remainingViewers.length === 0) {
      await this.redisService.del(`${this.ACTIVE_GROUP_VIEWERS}${groupId}`);
    }

    this.server.to(groupId).emit('userStatusUpdate', {
      profileId,
      isOnline: await this.isProfileOnline(profileId),
      isActive: false,
      groupId,
    });
  }

  private async isProfileOnline(profileId: string): Promise<boolean> {
    const count = await this.redisService.scard(
      `${this.PROFILE_CONNECTIONS}${profileId}`,
    );
    return count > 0;
  }

  private async getActiveViewers(groupId: string): Promise<string[]> {
    return (
      (await this.redisService.smembers(
        `${this.ACTIVE_GROUP_VIEWERS}${groupId}`,
      )) || []
    );
  }

  private async getCachedGroupParticipants(groupId: string): Promise<string[]> {
    const cacheKey = `group:participants:${groupId}`;
    let participants = await this.redisService.get<string>(cacheKey);
    if (!participants) {
      participants = JSON.stringify(
        await this.groupService.getGroupById(groupId),
      );
      await this.redisService.setex(cacheKey, participants, 3600);
    }
    return JSON.parse(participants);
  }
}
