import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import {
  PROFILE_CONNECTIONS,
  SOCKET_EXPIRATION,
  SOCKET_MAP_DATA,
  SOCKET_TO_ACTIVE_GROUP,
  USER_DEVICE_INFO,
} from 'src/config/redis/key';
import { RedisService } from 'src/config/redis/redis.service';
import { FriendshipService } from 'src/friend/services/friend';
import { ProfileService } from 'src/profile/services/profile';
import { DeviceData } from 'src/token/interfaces/jwt.interface';
@Injectable()
export class SocketService {
  private readonly logger = new Logger(SocketService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly profileService: ProfileService,
    private readonly friendService: FriendshipService,
  ) {}

  async online(profileId: string, server: Server) {
    try {
      const friends = await this.friendService.getFriends(profileId);
      if (friends.length > 0) {
        const friendIds = friends.map((friend) => friend.profileId);
        for (const friendId of friendIds) {
          const friendSocketsKey = `${PROFILE_CONNECTIONS}${friendId}`;
          const friendSocketIds =
            await this.redisService.smembers(friendSocketsKey);

          if (friendSocketIds && friendSocketIds.length > 0) {
            server.to(friendSocketIds).emit('friendOnline', {
              profileId: profileId,
            });
          }
        }

        this.logger.debug(
          `Đã thông báo trạng thái online cho ${friendIds.length} bạn bè`,
        );
      }
    } catch (error) {
      this.logger.error(`Lỗi khi xử lý trạng thái online: ${error.message}`);
      throw error;
    }
  }

  async getProfileFromSocketId(socketId: string) {
    try {
      const socketMapData = `${SOCKET_MAP_DATA}${socketId}`;
      const data = await this.redisService.get<{
        profileId: string;
        deviceId: string;
      }>(socketMapData);
      if (!data) throw new Error('Không tìm thấy profileId');
      return data.profileId;
    } catch (error) {
      this.logger.error(`Lỗi khi lấy profileId từ socketId: ${error.message}`);
      throw error;
    }
  }

  async getDeviceIdFromSocketId(socketId: string) {
    try {
      const socketMapData = `${SOCKET_MAP_DATA}${socketId}`;
      const data = await this.redisService.get<{
        profileId: string;
        deviceId: string;
      }>(socketMapData);
      if (!data) throw new Error('Không tìm thấy deviceId');
      return data.deviceId;
    } catch (error) {
      this.logger.error(`Lỗi khi lấy deviceId từ socketId: ${error.message}`);
      throw error;
    }
  }

  async getAllDeviceOffline(profileId: string) {
    try {
      const deviceKey = USER_DEVICE_INFO(profileId, '*');
      const allDeviceKeys = await this.redisService.keys(deviceKey);

      const allDeviceIds = allDeviceKeys.map((key) => {
        const parts = key.split(':');
        return parts[parts.length - 1];
      });

      const socketIds = await this.redisService.smembers(
        `${PROFILE_CONNECTIONS}${profileId}`,
      );
      const deviceOnline: string[] = [];
      for (const socketId of socketIds) {
        const deviceId = await this.getDeviceIdFromSocketId(socketId);
        if (deviceId) {
          deviceOnline.push(deviceId);
        }
      }
      const deviceOffline = allDeviceIds.filter(
        (deviceId) => !deviceOnline.includes(deviceId),
      );
      this.logger.log({
        message: 'Device offline',
        deviceOffline,
      });
      return deviceOffline;
    } catch (error) {
      this.logger.error(`Lỗi khi lấy tất cả device online: ${error.message}`);
      throw error;
    }
  }

  async getFCMTokenFromDeviceId(profileId: string, deviceId: string) {
    try {
      const deviceData: DeviceData | null =
        await this.redisService.get<DeviceData>(
          USER_DEVICE_INFO(profileId, deviceId),
        );
      if (!deviceData) throw new Error('Không tìm thấy deviceData');
      return deviceData.fcmToken;
    } catch (error) {
      this.logger.error(`Lỗi khi lấy fcmToken từ deviceId: ${error.message}`);
      throw error;
    }
  }

  async getListSocketIdFromProfileId(profileId: string) {
    try {
      const profileConnectionsKey = `${PROFILE_CONNECTIONS}${profileId}`;
      const socketIds = await this.redisService.smembers(profileConnectionsKey);
      return socketIds;
    } catch (error) {
      this.logger.error(
        `Lỗi khi lấy danh sách socketId từ profileId: ${error.message}`,
      );
      throw error;
    }
  }

  async isProfileOnline(profileId: string) {
    try {
      const socketIds = await this.getListSocketIdFromProfileId(profileId);
      return socketIds.length > 0;
    } catch (error) {
      this.logger.error(
        `Lỗi khi kiểm tra trạng thái online của profile: ${error.message}`,
      );
      throw error;
    }
  }

  async offline(client: Socket, server: Server) {
    try {
      const profileId = await this.getProfileFromSocketId(client.id);
      if (!profileId) {
        throw new Error('Không tìm thấy profileId');
      }
      const friends = await this.friendService.getFriends(profileId);
      if (friends.length > 0) {
        const friendIds = friends.map((friend) => friend.profileId);

        for (const friendId of friendIds) {
          const friendSocketsKey = `${PROFILE_CONNECTIONS}${friendId}`;
          const friendSocketIds =
            await this.redisService.smembers(friendSocketsKey);

          if (friendSocketIds && friendSocketIds.length > 0) {
            server.to(friendSocketIds).emit('friendOffline', {
              profileId: profileId,
            });
          }
        }

        this.logger.debug(
          `Đã thông báo trạng thái offline cho ${friendIds.length} bạn bè`,
        );
      }
    } catch (error) {
      this.logger.error(`Lỗi khi xử lý trạng thái offline: ${error.message}`);
      throw error;
    }
  }

  async disconnect(client: Socket, server: Server) {
    try {
      const pipeline = this.redisService.multi();
      const socketMapData = `${SOCKET_MAP_DATA}${client.id}`;
      const profileId = await this.getProfileFromSocketId(client.id);
      const profileConnectionsKey = `${PROFILE_CONNECTIONS}${profileId}`;
      const socketToActiveGroupKey = `${SOCKET_TO_ACTIVE_GROUP}${client.id}`;
      const activeGroup = await this.redisService.get(socketToActiveGroupKey);

      if (activeGroup) {
        pipeline.srem(`${SOCKET_TO_ACTIVE_GROUP}${activeGroup}`, client.id);
      }

      pipeline.del(socketToActiveGroupKey);
      pipeline.del(socketMapData);
      pipeline.srem(profileConnectionsKey, client.id);
      await pipeline.exec();
      client.leave(activeGroup);
      server.to(activeGroup).emit('memberCloseGroup', {
        profileId,
      });
    } catch (error) {
      this.logger.error({
        message: `Lỗi khi xử lý ngắt kết nối: ${error.message}`,
        socketId: client.id,
        error,
      });
      throw error;
    }
  }

  async register(profileId: string, deviceId: string, client: Socket) {
    try {
      const pipeline = this.redisService.multi();
      const profile = await this.profileService.getProfileById(profileId);

      if (!profile) throw new Error('Không tìm thấy profile');
      const deviceData: DeviceData | null =
        await this.redisService.get<DeviceData>(
          USER_DEVICE_INFO(profileId, deviceId),
        );
      if (!deviceData) {
        throw new Error('Không tìm thấy thiết bị');
      }

      const socketMapData = `${SOCKET_MAP_DATA}${client.id}`;
      const profileConnectionsKey = `${PROFILE_CONNECTIONS}${profileId}`;

      pipeline.set(
        socketMapData,
        JSON.stringify({ profileId, deviceId }),
        'EX',
        SOCKET_EXPIRATION,
      );

      pipeline.sadd(profileConnectionsKey, client.id);
      pipeline.expire(profileConnectionsKey, SOCKET_EXPIRATION);

      await pipeline.exec();

      this.logger.log({
        message: 'Đăng ký thành công',
        socketId: client.id,
        profileId: profileId,
      });
    } catch (error) {
      throw error;
    }
  }
}
