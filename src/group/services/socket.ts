import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from 'src/chat/services/chat';
import {
  SOCKET_EXPIRATION,
  SOCKET_TO_ACTIVE_GROUP,
} from 'src/config/redis/key';
import { RedisService } from 'src/config/redis/redis.service';
import { SocketService } from 'src/socket/socket.service';
import { GroupService } from './group';
@Injectable()
export class GroupSocketService {
  private readonly logger = new Logger(GroupSocketService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly groupService: GroupService,
    private readonly chatService: ChatService,
    private readonly socketService: SocketService,
  ) {}

  async handleGroup(groupId: string, server: Server) {
    try {
      const participantIds =
        await this.groupService.getPaticipantsInGroup(groupId);

      const allSocketIds: string[] = [];

      for (const profileId of participantIds) {
        const userSocketIds =
          await this.socketService.getListSocketIdFromProfileId(profileId);
        if (userSocketIds && userSocketIds.length > 0) {
          allSocketIds.push(...userSocketIds);
        }
      }

      if (allSocketIds.length > 0) {
        server.to(allSocketIds).emit('handleGroup', { groupId });
      }
    } catch (error) {
      this.logger.error(`Lỗi khi xử lý yêu cầu nhóm: ${error.message}`);
    }
  }

  async handleMemberGroup(groupId: string, server: Server) {
    try {
      const participantIds =
        await this.groupService.getPaticipantsInGroup(groupId);
      const allSocketIds: string[] = [];

      for (const profileId of participantIds) {
        const userSocketIds =
          await this.socketService.getListSocketIdFromProfileId(profileId);
        if (userSocketIds && userSocketIds.length > 0) {
          allSocketIds.push(...userSocketIds);
        }
      }

      if (allSocketIds.length > 0) {
        server.to(allSocketIds).emit('handleMemberGroup', {
          groupId,
        });
      }
    } catch (error) {
      this.logger.error(`Lỗi khi xử lý yêu cầu nhóm: ${error.message}`);
    }
  }

  async getGroupMemberStatus(groupId: string): Promise<{
    open: string[];
    online: string[];
    offline: string[];
  }> {
    try {
      const openGroupSocketIds = await this.redisService.smembers(
        `${SOCKET_TO_ACTIVE_GROUP}${groupId}`,
      );
      const groupMembers =
        await this.groupService.getPaticipantsInGroup(groupId);

      const open: string[] = [];
      const online: string[] = [];
      const offline: string[] = [];

      if (openGroupSocketIds.length > 0) {
        for (const socketId of openGroupSocketIds) {
          const openGroupProfile =
            await this.socketService.getProfileFromSocketId(socketId);
          if (openGroupProfile && !open.includes(openGroupProfile)) {
            open.push(openGroupProfile);
          }
        }
      }

      if (groupMembers && groupMembers.length > 0) {
        for (const member of groupMembers) {
          if (!open.includes(member)) {
            if (await this.socketService.isProfileOnline(member)) {
              online.push(member);
            } else {
              offline.push(member);
            }
          }
        }
      }

      return {
        open,
        online,
        offline,
      };
    } catch (error) {
      this.logger.error(`Lỗi khi xử lý yêu cầu nhóm: ${error.message}`);
      throw error;
    }
  }

  async openGroup(
    profileId: string,
    groupId: string,
    client: Socket,
    server: Server,
  ) {
    try {
      const isMember = await this.groupService.isGroupMember(
        profileId,
        groupId,
      );
      if (!isMember) {
        throw new Error('You are not a member of this group');
      }

      const currentGroupKey = await this.redisService.get(
        `${SOCKET_TO_ACTIVE_GROUP}${client.id}`,
      );

      const pipeline = this.redisService.multi();

      if (currentGroupKey && currentGroupKey !== groupId) {
        pipeline.srem(`${SOCKET_TO_ACTIVE_GROUP}${currentGroupKey}`, client.id);
      }

      pipeline.sadd(`${SOCKET_TO_ACTIVE_GROUP}${groupId}`, client.id);

      pipeline.set(
        `${SOCKET_TO_ACTIVE_GROUP}${client.id}`,
        groupId,
        'EX',
        SOCKET_EXPIRATION,
      );

      await pipeline.exec();

      client.join(groupId);

      // Mark all unread messages as read when user opens the group
      const readMessagesResult = await this.markAllMessagesAsRead(
        profileId,
        groupId,
      );

      server.to(groupId).emit('memberOpenGroup', {
        profileId,
      });

      if (
        readMessagesResult &&
        readMessagesResult.messageIds &&
        readMessagesResult.messageIds.length > 0
      ) {
        server.to(groupId).emit('messagesRead', {
          profileId,
          groupId,
          messageIds: readMessagesResult.messageIds,
        });
        const { online } = await this.getGroupMemberStatus(groupId);
        if (online && online.length > 0) {
          server.to(online).emit('messagesRead', {
            profileId,
            groupId,
            messageIds: readMessagesResult.messageIds,
          });
        }
      }

      this.logger.log(`User ${profileId} ctive in group ${groupId}`);
    } catch (error) {
      this.logger.error(`Failed to open group: ${error.message}`, error.stack);
      client.emit('error', { message: 'Failed to open group' });
    }
  }

  private async markAllMessagesAsRead(
    profileId: string,
    groupId: string,
  ): Promise<{ count: number; messageIds: string[] }> {
    try {
      const result = await this.chatService.markMessagesAsRead(
        profileId,
        groupId,
      );

      if (result.count > 0) {
        this.logger.log(
          `Marked ${result.count} messages as read for user ${profileId} in group ${groupId}`,
        );
      }

      return {
        count: result.count,
        messageIds: result.messageIds || [],
      };
    } catch (error) {
      this.logger.error(
        `Failed to mark messages as read: ${error.message}`,
        error.stack,
      );
      return { count: 0, messageIds: [] };
    }
  }

  async closeGroup(
    profileId: string,
    groupId: string,
    server: Server,
    client: Socket,
  ) {
    try {
      const isMember = await this.groupService.isGroupMember(
        profileId,
        groupId,
      );
      if (!isMember) {
        throw new Error('You are not a member of this group');
      }
      const pipeline = this.redisService.multi();
      const socketToActiveGroupKey = `${SOCKET_TO_ACTIVE_GROUP}${client.id}`;
      const activeGroup = await this.redisService.get(socketToActiveGroupKey);
      if (activeGroup) {
        pipeline.srem(`${SOCKET_TO_ACTIVE_GROUP}${activeGroup}`, client.id);
      }
      pipeline.del(socketToActiveGroupKey);
      await pipeline.exec();
      client.leave(groupId);
      server.to(groupId).emit('memberCloseGroup', {
        profileId,
      });

      this.logger.log(`User ${profileId} is now inactive in group ${groupId}`);
    } catch (error) {
      this.logger.error(`Failed to close group: ${error.message}`, error.stack);
      client.emit('error', { message: 'Failed to close group' });
    }
  }
}
