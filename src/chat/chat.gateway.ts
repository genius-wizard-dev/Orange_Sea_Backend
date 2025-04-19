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
import { MessageType } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { RedisService } from 'src/config/redis/redis.service';
import { GroupService } from 'src/group/group.service';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly groupService: GroupService,
    private readonly chatService: ChatService,
    private readonly redisService: RedisService,
  ) {}

  // Redis key prefixes
  private readonly SOCKET_TO_PROFILE = 'socket:profile:';
  private readonly PROFILE_CONNECTIONS = 'profile:connections:';
  private readonly ACTIVE_GROUP_VIEWERS = 'group:viewers:';
  private readonly SOCKET_TO_ACTIVE_GROUP = 'socket:group:';

  @SubscribeMessage('register')
  async handleRegister(
    @MessageBody() data: { profileId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { profileId } = data;
      if (!profileId) {
        throw new Error('profileId is required');
      }

      // Store socket to profile mapping in Redis
      await this.redisService.set(
        `${this.SOCKET_TO_PROFILE}${client.id}`,
        profileId,
      );

      // Add socket id to profile's connections SET (guarantees uniqueness)
      const connectionsKey = `${this.PROFILE_CONNECTIONS}${profileId}`;
      await this.redisService.sadd(connectionsKey, client.id);

      this.logger.debug(
        `User ${profileId} registered with socket ${client.id}`,
      );

      await this.broadcastUserStatus(profileId, true);

      const unreadCounts =
        await this.chatService.getUnreadMessageCountsByGroups(profileId);
      this.logger.debug(
        `Initial unread counts for user ${profileId}: ${JSON.stringify(unreadCounts)}`,
      );
      client.emit('initialUnreadCounts', unreadCounts);

      return { status: 'success', message: 'Registered successfully' };
    } catch (error) {
      this.logger.error(`Error registering user: ${error.message}`);
      return { status: 'error', message: error.message };
    }
  }

  handleConnection(client: Socket) {
    try {
      this.logger.debug('Socket connected:', client.id);
    } catch (error) {
      console.error('Error in handleConnection:', error);
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      // Get profile ID associated with this socket
      const profileId = await this.redisService.get<string>(
        `${this.SOCKET_TO_PROFILE}${client.id}`,
      );

      // Get active group associated with this socket
      const activeGroupId = await this.redisService.get<string>(
        `${this.SOCKET_TO_ACTIVE_GROUP}${client.id}`,
      );

      this.logger.debug(
        `Client disconnecting: ${client.id}, profileId: ${profileId}, activeGroupId: ${activeGroupId}`,
      );

      // Remove from active group if viewing one
      if (activeGroupId && profileId) {
        const viewersKey = `${this.ACTIVE_GROUP_VIEWERS}${activeGroupId}`;
        // Remove user from active viewers set
        await this.redisService.srem(viewersKey, profileId);

        // Check if the set is now empty
        const remainingViewers = await this.redisService.smembers(viewersKey);
        if (remainingViewers.length === 0) {
          await this.redisService.del(viewersKey);
        }

        // Notify group members about user leaving
        this.server.to(activeGroupId).emit('userStatusUpdate', {
          profileId,
          isActive: false,
          groupId: activeGroupId,
        });

        // Delete the socket to group mapping
        await this.redisService.del(
          `${this.SOCKET_TO_ACTIVE_GROUP}${client.id}`,
        );
      }

      // Remove socket from user's connections
      if (profileId) {
        const connectionsKey = `${this.PROFILE_CONNECTIONS}${profileId}`;
        // Remove socket from the user's connections set
        await this.redisService.srem(connectionsKey, client.id);

        // Check if the user has any remaining connections
        const remainingConnections =
          await this.redisService.smembers(connectionsKey);

        if (remainingConnections.length === 0) {
          await this.redisService.del(connectionsKey);
          // User is completely offline, broadcast to all relevant groups
          await this.broadcastUserStatus(profileId, false);
          this.logger.debug(`User ${profileId} is now completely offline`);
        } else {
          this.logger.debug(
            `Socket ${client.id} removed from connections for user ${profileId}, remaining sockets: ${remainingConnections.length}`,
          );
        }
      }

      // Delete the socket to profile mapping
      await this.redisService.del(`${this.SOCKET_TO_PROFILE}${client.id}`);

      this.logger.debug(`Client ${client.id} disconnected`);
    } catch (error) {
      this.logger.error(`Error handling disconnect: ${error.message}`);
    }
  }

  private async broadcastUserStatus(profileId: string, isOnline: boolean) {
    this.logger.debug(
      `Broadcasting ${isOnline ? 'online' : 'offline'} status for user ${profileId}`,
    );

    try {
      const groups = await this.groupService.getGroupsByProfileId(profileId);
      this.logger.debug(
        `User ${profileId} is a member of ${groups.length} groups`,
      );

      for (const group of groups) {
        const viewersKey = `${this.ACTIVE_GROUP_VIEWERS}${group.id}`;
        const viewers = (await this.redisService.smembers(viewersKey)) || [];
        const isActive = viewers.includes(profileId);

        this.logger.debug(
          `Broadcasting status to group ${group.id}: user ${profileId} is ${isOnline ? 'online' : 'offline'} and ${
            isActive ? 'active' : 'inactive'
          } in this group`,
        );

        this.server.to(group.id).emit('userStatusUpdate', {
          profileId,
          isOnline,
          isActive,
        });
      }
    } catch (err) {
      this.logger.error(`Error broadcasting user status: ${err.message}`);
    }
  }

  @SubscribeMessage('open')
  async handleJoinRoom(
    @MessageBody() data: { profileId: string; groupId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (!data.profileId || !data.groupId) {
        throw new Error('profileId and groupId are required');
      }

      this.logger.debug(
        `User ${data.profileId} is opening group ${data.groupId}`,
      );

      const isMember = await this.groupService.isGroupMember(
        data.profileId,
        data.groupId,
      );

      if (!isMember) {
        this.logger.warn(
          `User ${data.profileId} tried to open group ${data.groupId} but is not a member`,
        );
        throw new Error('You are not a member of this group');
      }

      // Check if socket was previously in another room
      const previousGroup = await this.redisService.get<string>(
        `${this.SOCKET_TO_ACTIVE_GROUP}${client.id}`,
      );
      if (previousGroup && previousGroup !== data.groupId) {
        this.logger.debug(
          `User ${data.profileId} was previously in group ${previousGroup}, leaving that group first`,
        );
        await this.handleLeaveRoom(
          { profileId: data.profileId, groupId: previousGroup },
          client,
        );
      }

      // Update active group for this socket in Redis
      await this.redisService.set(
        `${this.SOCKET_TO_ACTIVE_GROUP}${client.id}`,
        data.groupId,
      );
      this.logger.debug(
        `Updated socketToActiveGroup mapping: ${client.id} -> ${data.groupId}`,
      );

      // Add to active viewers for this group in Redis using SET
      const viewersKey = `${this.ACTIVE_GROUP_VIEWERS}${data.groupId}`;
      await this.redisService.sadd(viewersKey, data.profileId);

      const viewers = await this.redisService.smembers(viewersKey);
      this.logger.debug(
        `Active viewers for group ${data.groupId}: ${viewers.join(', ')}`,
      );

      // Join socket room to receive messages
      client.join(data.groupId);

      this.logger.debug(
        `User ${data.profileId} is now viewing chat in group ${data.groupId}`,
      );

      // Notify other group members about active user
      this.server.to(data.groupId).emit('userStatusUpdate', {
        profileId: data.profileId,
        isOnline: true,
        isActive: true,
        groupId: data.groupId,
      });

      // Mark messages as read since user is now viewing this group
      const markResult = await this.chatService.markMessagesAsRead(
        data.profileId,
        data.groupId,
      );

      this.logger.debug(
        `Marked ${markResult.count} messages as read for user ${data.profileId} in group ${data.groupId}`,
      );

      if (markResult.count > 0) {
        this.logger.debug(
          `Message IDs marked as read: ${markResult.messageIds?.join(', ')}`,
        );

        // Notify group that user has read messages
        this.server.to(data.groupId).emit('messagesRead', {
          profileId: data.profileId,
          groupId: data.groupId,
          messageIds: markResult.messageIds,
        });

        // Update unread count for this user
        const unreadCounts =
          await this.chatService.getUnreadMessageCountsByGroups(data.profileId);
        this.logger.debug(
          `Updated unread counts: ${JSON.stringify(unreadCounts)}`,
        );
        this.server.to(client.id).emit('unreadCountUpdated', unreadCounts);
      }

      // Get last 10 messages for this group
      const lastMessages = await this.chatService.getLastMessages(
        data.groupId,
        10,
      );
      this.logger.debug(
        `Retrieved ${lastMessages.length} messages for group ${data.groupId}`,
      );

      // Return active users and last messages
      const activeUsers = await this.redisService.smembers(
        `${this.ACTIVE_GROUP_VIEWERS}${data.groupId}`,
      );

      this.logger.debug(
        `Returning active users for group ${data.groupId}: ${activeUsers.join(', ')}`,
      );

      return {
        status: 'success',
        activeUsers,
        lastMessages, // Include last messages in the response
      };
    } catch (error) {
      this.logger.error(`Error opening chat: ${error.message}`);
      client.emit('socketError', {
        message: 'Failed to open chat',
        error: error.message,
      });
    }
  }

  @SubscribeMessage('leave')
  async handleLeaveRoom(
    @MessageBody() data: { profileId: string; groupId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (!data.profileId || !data.groupId) {
        throw new Error('profileId and groupId are required');
      }

      this.logger.debug(
        `User ${data.profileId} is leaving group ${data.groupId}`,
      );

      // Leave socket room
      client.leave(data.groupId);

      // Remove from active viewers in Redis using srem
      const viewersKey = `${this.ACTIVE_GROUP_VIEWERS}${data.groupId}`;
      await this.redisService.srem(viewersKey, data.profileId);

      // Check if anyone is still viewing this group
      const remainingViewers = await this.redisService.smembers(viewersKey);

      if (remainingViewers.length > 0) {
        this.logger.debug(
          `User ${data.profileId} removed from active viewers of group ${data.groupId}, remaining viewers: ${remainingViewers.join(', ') || 'none'}`,
        );
      } else {
        await this.redisService.del(viewersKey);
        this.logger.debug(
          `No more active viewers for group ${data.groupId}, removing group from tracking`,
        );
      }

      // Clear active group for this socket in Redis
      const currentActiveGroup = await this.redisService.get<string>(
        `${this.SOCKET_TO_ACTIVE_GROUP}${client.id}`,
      );
      if (currentActiveGroup === data.groupId) {
        await this.redisService.del(
          `${this.SOCKET_TO_ACTIVE_GROUP}${client.id}`,
        );
        this.logger.debug(
          `Removed socket ${client.id} from activeGroup mapping`,
        );
      }

      this.logger.debug(
        `User ${data.profileId} closed chat in group ${data.groupId}`,
      );

      // Notify group members about user leaving
      this.server.to(data.groupId).emit('userStatusUpdate', {
        profileId: data.profileId,
        isOnline: await this.isProfileOnline(data.profileId),
        isActive: false,
        groupId: data.groupId,
      });

      return { status: 'success' };
    } catch (error) {
      this.logger.error(`Error closing chat: ${error.message}`);
      client.emit('socketError', {
        message: 'Failed to close chat',
        error: error.message,
      });
    }
  }

  // Helper method to check if a profile is online
  private async isProfileOnline(profileId: string): Promise<boolean> {
    const connections = await this.redisService.smembers(
      `${this.PROFILE_CONNECTIONS}${profileId}`,
    );
    return connections.length > 0;
  }

  // Get active viewers for a group
  private async getActiveViewers(groupId: string): Promise<string[]> {
    return await this.redisService.smembers(
      `${this.ACTIVE_GROUP_VIEWERS}${groupId}`,
    );
  }

  @SubscribeMessage('getActiveUsers')
  async handleGetActiveUsers(
    @MessageBody() data: { groupId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { groupId } = data;
      if (!groupId) {
        throw new Error('groupId is required');
      }

      const activeUsers = await this.getActiveViewers(groupId);
      this.logger.debug(
        `Active users for group ${groupId}: ${activeUsers.join(', ')}`,
      );
      return { status: 'success', activeUsers };
    } catch (error) {
      this.logger.error(`Error getting active users: ${error.message}`);
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
      if (!profileId || !groupId) {
        throw new Error('profileId and groupId are required');
      }

      this.logger.debug(
        `User ${profileId} is manually marking messages as read in group ${groupId}`,
      );

      const markResult = await this.chatService.markMessagesAsRead(
        profileId,
        groupId,
      );

      this.logger.debug(
        `Manually marked ${markResult.count} messages as read for user ${profileId} in group ${groupId}`,
      );

      if (markResult.count > 0) {
        this.logger.debug(
          `Message IDs manually marked as read: ${markResult.messageIds?.join(', ')}`,
        );

        // Notify the group that messages have been read
        this.server.to(groupId).emit('messagesRead', {
          profileId,
          groupId,
          messageIds: markResult.messageIds,
        });

        // Update unread counts for this user
        const unreadCounts =
          await this.chatService.getUnreadMessageCountsByGroups(profileId);
        this.logger.debug(
          `Updated unread counts after marking as read: ${JSON.stringify(unreadCounts)}`,
        );
        client.emit('unreadCountUpdated', unreadCounts);
      }

      return {
        status: 'success',
        count: markResult.count,
      };
    } catch (error) {
      this.logger.error(`Error marking messages as read: ${error.message}`);
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
      if (!profileId) {
        throw new Error('profileId is required');
      }

      this.logger.debug(`Getting unread counts for user ${profileId}`);

      const unreadCounts =
        await this.chatService.getUnreadMessageCountsByGroups(profileId);

      this.logger.debug(
        `Unread counts for user ${profileId}: ${JSON.stringify(unreadCounts)}`,
      );

      return {
        status: 'success',
        unreadCounts,
      };
    } catch (error) {
      this.logger.error(`Error getting unread counts: ${error.message}`);
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('send')
  async handleSendMessage(
    @MessageBody(new ValidationPipe()) data: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.logger.debug('Received send message event:', data);
      if (!data.senderId || !data.groupId) {
        throw new Error('senderId and groupId are required');
      }
      const profileId = data.senderId;
      const isMember = await this.groupService.isGroupMember(
        profileId,
        data.groupId,
      );
      if (!isMember) {
        this.logger.warn(
          `User ${profileId} tried to send a message to group ${data.groupId} but is not a member`,
        );
        throw new Error('You are not a member of this group');
      }

      const {
        groupId,
        message = '',
        type = MessageType.TEXT,
        fileData,
        fileName,
        mimeType,
      } = data;

      let file: Express.Multer.File | undefined = undefined;
      let messageType = type;

      // Handle file if present
      if (fileData && mimeType) {
        const buffer = Buffer.from(fileData, 'base64');
        this.logger.debug(
          `Processing file upload: filename=${fileName}, mimetype=${mimeType}, size=${buffer.length} bytes`,
        );

        file = {
          buffer,
          originalname: fileName || 'file',
          mimetype: mimeType,
          fieldname: 'file',
          encoding: '7bit',
          size: buffer.length,
          destination: '',
          filename: '',
          path: '',
        } as Express.Multer.File;

        // Determine message type based on mimetype
        if (mimeType.startsWith('image/')) {
          messageType = MessageType.IMAGE;
          this.logger.debug('File determined to be an image');
        } else if (mimeType.startsWith('video/')) {
          messageType = MessageType.VIDEO;
          this.logger.debug('File determined to be a video');
        }
      }

      // Get active readers (users currently viewing this group)
      const activeReaders = await this.getActiveViewers(groupId);
      this.logger.debug(
        `Active readers for message in group ${groupId}: ${activeReaders.join(', ') || 'none'}`,
      );

      const messageResult = await this.chatService.sendMessage(
        profileId,
        groupId,
        message,
        messageType,
        activeReaders,
        file,
      );

      this.logger.debug(
        `Message created successfully: id=${messageResult.id}, type=${messageResult.type}`,
      );
      this.logger.debug(
        `Read by: ${messageResult.readBy.map((r) => r.userId).join(', ') || 'none'}`,
      );

      // Get all participants for this group
      const participants = await this.groupService.getGroupById(groupId);
      this.logger.debug(
        `Group ${groupId} participants: ${participants.join(', ')}`,
      );

      // Emit the message to everyone in the group chat room (active viewers)
      this.server.to(groupId).emit('newMessage', {
        ...messageResult,
        readBy: messageResult.readBy.map((r) => r.userId),
      });
      this.logger.debug(`Emitted 'newMessage' event to group ${groupId}`);

      // For participants not actively viewing the group but online, send unread notification
      participants.forEach(async (participantId) => {
        // Skip if user is actively viewing the group
        if (activeReaders.includes(participantId)) {
          this.logger.debug(
            `Skipping notification for user ${participantId} who is actively viewing the group`,
          );
          return;
        }

        // If user is online but not viewing this group, send notification
        const userSockets = await this.redisService.smembers(
          `${this.PROFILE_CONNECTIONS}${participantId}`,
        );

        if (userSockets.length > 0) {
          this.logger.debug(
            `Sending notification to user ${participantId} who is online but not viewing the group, via sockets: ${userSockets.join(', ')}`,
          );

          userSockets.forEach((socketId) => {
            this.server.to(socketId).emit('newNotification', {
              type: 'NEW_MESSAGE',
              groupId,
              message: {
                ...messageResult,
                readBy: messageResult.readBy.map((r) => r.userId),
              },
            });
          });

          // Also update unread counts for these users
          userSockets.forEach(async (socketId) => {
            const unreadCounts =
              await this.chatService.getUnreadMessageCountsByGroups(
                participantId,
              );
            this.logger.debug(
              `Updated unread counts for user ${participantId}: ${JSON.stringify(unreadCounts)}`,
            );
            this.server.to(socketId).emit('unreadCountUpdated', unreadCounts);
          });
        } else {
          this.logger.debug(
            `User ${participantId} is offline, no notification sent`,
          );
        }
      });

      this.logger.debug(`Message sent successfully to group: ${groupId}`);

      return { status: 'success', data: messageResult };
    } catch (error) {
      console.error('Error sending message via socket:', error);
      return { status: 'error', message: error.message };
    }
  }
}
