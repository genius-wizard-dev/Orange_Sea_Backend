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
  ) {}

  private appConnections = new Map<string, Set<string>>();

  private activeGroupViewers = new Map<string, Set<string>>();

  private socketToProfile = new Map<string, string>();

  private socketToActiveGroup = new Map<string, string>();

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

      this.socketToProfile.set(client.id, profileId);

      if (!this.appConnections.has(profileId)) {
        this.appConnections.set(profileId, new Set());
      }
      const connections = this.appConnections.get(profileId);
      if (connections) {
        connections.add(client.id);
      }

      this.logger.debug(
        `User ${profileId} registered with socket ${client.id}`,
      );
      this.logger.debug(
        `Current app connections: ${this.logMapToString(this.appConnections)}`,
      );
      this.logger.debug(
        `Current socket to profile mapping: ${this.logMapToString(this.socketToProfile)}`,
      );

      this.broadcastUserStatus(profileId, true);

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

  handleDisconnect(client: Socket) {
    try {
      const profileId = this.socketToProfile.get(client.id);
      const activeGroupId = this.socketToActiveGroup.get(client.id);

      this.logger.debug(
        `Client disconnecting: ${client.id}, profileId: ${profileId}, activeGroupId: ${activeGroupId}`,
      );

      // Remove from active group if viewing one
      if (activeGroupId && profileId) {
        const viewers = this.activeGroupViewers.get(activeGroupId);
        if (viewers) {
          viewers.delete(profileId);
          if (viewers.size === 0) {
            this.activeGroupViewers.delete(activeGroupId);
          }
          // Notify group members about user leaving
          this.server.to(activeGroupId).emit('userStatusUpdate', {
            profileId,
            isActive: false,
            groupId: activeGroupId,
          });

          this.logger.debug(
            `User ${profileId} removed from active viewers of group ${activeGroupId}, remaining viewers: ${
              Array.from(viewers || []).join(', ') || 'none'
            }`,
          );
        }

        this.socketToActiveGroup.delete(client.id);
      }

      // Remove from app connections
      if (profileId) {
        const sockets = this.appConnections.get(profileId);
        if (sockets) {
          sockets.delete(client.id);
          this.logger.debug(
            `Socket ${client.id} removed from connections for user ${profileId}, remaining sockets: ${
              Array.from(sockets).join(', ') || 'none'
            }`,
          );

          if (sockets.size === 0) {
            this.appConnections.delete(profileId);
            // User is completely offline, broadcast to all relevant groups
            this.broadcastUserStatus(profileId, false);
            this.logger.debug(`User ${profileId} is now completely offline`);
          }
        }

        this.socketToProfile.delete(client.id);
      }

      this.logger.debug(
        `Client ${client.id} disconnected, remaining clients: ${this.server.engine.clientsCount}`,
      );
      this.logger.debug(
        `Current active viewers by group: ${this.logMapToString(this.activeGroupViewers)}`,
      );
      this.logger.debug(
        `Current app connections: ${this.logMapToString(this.appConnections)}`,
      );
    } catch (error) {
      this.logger.error(`Error handling disconnect: ${error.message}`);
    }
  }

  private broadcastUserStatus(profileId: string, isOnline: boolean) {
    this.logger.debug(
      `Broadcasting ${isOnline ? 'online' : 'offline'} status for user ${profileId}`,
    );

    this.groupService
      .getGroupsByProfileId(profileId)
      .then((groups) => {
        this.logger.debug(
          `User ${profileId} is a member of ${groups.length} groups`,
        );

        groups.forEach((group) => {
          const isActive =
            this.activeGroupViewers.get(group.id)?.has(profileId) || false;

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
        });
      })
      .catch((err) => {
        this.logger.error(`Error broadcasting user status: ${err.message}`);
      });
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
      const previousGroup = this.socketToActiveGroup.get(client.id);
      if (previousGroup && previousGroup !== data.groupId) {
        this.logger.debug(
          `User ${data.profileId} was previously in group ${previousGroup}, leaving that group first`,
        );
        this.handleLeaveRoom(
          { profileId: data.profileId, groupId: previousGroup },
          client,
        );
      }

      // Update active group for this socket
      this.socketToActiveGroup.set(client.id, data.groupId);
      this.logger.debug(
        `Updated socketToActiveGroup mapping: ${client.id} -> ${data.groupId}`,
      );

      // Add to active viewers for this group
      if (!this.activeGroupViewers.has(data.groupId)) {
        this.activeGroupViewers.set(data.groupId, new Set());
      }
      const viewers = this.activeGroupViewers.get(data.groupId);
      if (viewers) {
        viewers.add(data.profileId);
        this.logger.debug(
          `Active viewers for group ${data.groupId}: ${Array.from(viewers).join(', ')}`,
        );
      }

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

      // Return list of active users in this group to the client
      const activeUsers = Array.from(
        this.activeGroupViewers.get(data.groupId) || [],
      );
      this.logger.debug(
        `Returning active users for group ${data.groupId}: ${activeUsers.join(', ')}`,
      );

      return {
        status: 'success',
        activeUsers,
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
  handleLeaveRoom(
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

      // Remove from active viewers
      const viewers = this.activeGroupViewers.get(data.groupId);
      if (viewers) {
        viewers.delete(data.profileId);
        this.logger.debug(
          `User ${data.profileId} removed from active viewers of group ${data.groupId}, remaining viewers: ${
            Array.from(viewers).join(', ') || 'none'
          }`,
        );

        if (viewers.size === 0) {
          this.activeGroupViewers.delete(data.groupId);
          this.logger.debug(
            `No more active viewers for group ${data.groupId}, removing group from tracking`,
          );
        }
      }

      // Clear active group for this socket
      if (this.socketToActiveGroup.get(client.id) === data.groupId) {
        this.socketToActiveGroup.delete(client.id);
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
        isOnline: this.appConnections.has(data.profileId),
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

  @SubscribeMessage('getActiveUsers')
  handleGetActiveUsers(
    @MessageBody() data: { groupId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { groupId } = data;
      if (!groupId) {
        throw new Error('groupId is required');
      }

      const activeUsers = Array.from(
        this.activeGroupViewers.get(groupId) || [],
      );
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
      const activeReaders = Array.from(
        this.activeGroupViewers.get(groupId) || [],
      );
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
      participants.forEach((participantId) => {
        // Skip if user is actively viewing the group
        if (this.activeGroupViewers.get(groupId)?.has(participantId)) {
          this.logger.debug(
            `Skipping notification for user ${participantId} who is actively viewing the group`,
          );
          return;
        }

        // If user is online but not viewing this group, send notification
        const userSockets = this.appConnections.get(participantId);
        if (userSockets && userSockets.size > 0) {
          this.logger.debug(
            `Sending notification to user ${participantId} who is online but not viewing the group, via sockets: ${Array.from(userSockets).join(', ')}`,
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

      this.logger.debug('Message sent successfully to group:', groupId);

      return { status: 'success', data: messageResult };
    } catch (error) {
      console.error('Error sending message via socket:', error);
      return { status: 'error', message: error.message };
    }
  }

  // Helper function to log Maps in a readable format
  private logMapToString(map: Map<string, any>): string {
    const entries = Array.from(map.entries()).map(([key, value]) => {
      if (value instanceof Set) {
        return `${key}: [${Array.from(value).join(', ')}]`;
      } else if (value instanceof Map) {
        return `${key}: ${this.logMapToString(value)}`;
      } else {
        return `${key}: ${value}`;
      }
    });

    return `{${entries.join(', ')}}`;
  }
}
