import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RedisService } from 'src/config/redis/redis.service';
import { ProfileService } from 'src/profile/services/profile';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class ProfileSocketService {
  private readonly logger = new Logger(ProfileSocketService.name);



  constructor(
    private readonly redisService: RedisService,
    private readonly profileService: ProfileService,
    private readonly socketService: SocketService,
  ) {}

  async updateProfile(client: Socket, server: Server) {
    try {
      const profileId = await this.socketService.getProfileFromSocketId(
        client.id,
      );
      if (!profileId) throw new Error('Không tìm thấy profileId');
      const socketIds =
        await this.socketService.getListSocketIdFromProfileId(profileId);
      server.to(socketIds).emit('profileUpdated');
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async updatePassword(client: Socket, server: Server) {
    try {
      const profileId = await this.socketService.getProfileFromSocketId(
        client.id,
      );
      if (!profileId) throw new Error('Không tìm thấy profileId');
      const socketIds =
        await this.socketService.getListSocketIdFromProfileId(profileId);
      server.to(socketIds).emit('passwordUpdated');
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async resetPassword(profileId: string, server: Server) {
    try {
      const socketIds =
        await this.socketService.getListSocketIdFromProfileId(profileId);
      server.to(socketIds).emit('passwordReset');
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
