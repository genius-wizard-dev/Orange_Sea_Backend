import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { PROFILE_CONNECTIONS } from 'src/config/redis/key';
import { RedisService } from 'src/config/redis/redis.service';
import { ProfileService } from 'src/profile/services/profile';
import { SocketService } from 'src/socket/socket.service';
import { FriendshipService } from './friend';
@Injectable()
export class FriendSocketService {
  private readonly logger = new Logger(FriendSocketService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly friendService: FriendshipService,
    private readonly profileService: ProfileService,
    private readonly socketService: SocketService,
  ) {}

  async handleFriend(friendShipId: string, server: Server) {
    try {
      const friendShip =
        await this.friendService.getFriendShipById(friendShipId);
      const { senderId, receiverId } = friendShip;
      const senderSocketIds =
        await this.socketService.getListSocketIdFromProfileId(senderId);
      const receiverSocketIds =
        await this.socketService.getListSocketIdFromProfileId(receiverId);
      const allSocketIds = [...senderSocketIds, ...receiverSocketIds];

      server.to(allSocketIds).emit('handleFriend');
    } catch (error) {
      this.logger.error(`Lỗi khi thêm bạn bè: ${error.message}`);
      throw error;
    }
  }

  async deleteFriend(friendShipId: string, server: Server) {
    try {
      const friendShip =
        await this.friendService.getFriendShipById(friendShipId);
      const { senderId, receiverId } = friendShip;

      // Lấy danh sách socket của cả hai người dùng
      const senderSocketIds =
        await this.socketService.getListSocketIdFromProfileId(senderId);
      const receiverSocketIds =
        await this.socketService.getListSocketIdFromProfileId(receiverId);

      // Thực hiện hủy kết bạn trong database
      await this.friendService.deleteFriendship(friendShipId, senderId);

      // Thông báo cho người gửi đã hủy kết bạn thành công
      if (senderSocketIds.length > 0) {
        server.to(senderSocketIds).emit('friendDeleted', {
          success: true,
          message: 'Đã hủy kết bạn thành công',
          friendshipId: friendShipId,
        });
      }

      // Thông báo cho người nhận biết họ đã bị hủy kết bạn
      if (receiverSocketIds.length > 0) {
        server.to(receiverSocketIds).emit('friendDeleted', {
          success: true,
          message: 'Bạn đã bị hủy kết bạn',
          friendshipId: friendShipId,
        });
      }

      // Thông báo cập nhật danh sách bạn bè cho cả hai người dùng
      const allSocketIds = [...senderSocketIds, ...receiverSocketIds];
      server.to(allSocketIds).emit('handleFriend');

      this.logger.log(`Đã hủy kết bạn giữa ${senderId} và ${receiverId}`);
    } catch (error) {
      this.logger.error(`Lỗi khi hủy kết bạn: ${error.message}`);
      throw error;
    }
  }

  async fetchFriendsStatus(profileId: string, client: Socket) {
    try {
      const friends = await this.friendService.getFriends(profileId);
      if (friends.length > 0) {
        const onlineFriends: string[] = [];
        const offlineFriends: string[] = [];
        const friendIds = friends.map((friend) => friend.profileId);

        for (const friendId of friendIds) {
          const friendSocketsKey = `${PROFILE_CONNECTIONS}${friendId}`;
          const friendSocketIds =
            await this.redisService.smembers(friendSocketsKey);

          if (friendSocketIds && friendSocketIds.length > 0) {
            onlineFriends.push(friendId);
          } else {
            offlineFriends.push(friendId);
          }
        }

        client.emit('friendStatus', {
          online: onlineFriends,
          offline: offlineFriends,
        });

        this.logger.debug(
          `Đã gửi danh sách ${onlineFriends.length} bạn bè đang online và ${offlineFriends.length} bạn bè đang offline cho người dùng ${profileId}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Lỗi khi lấy danh sách bạn bè online: ${error.message}`,
      );
      this.logger.error(error);
    }
  }

  async fetchFriendShipStatus(profileId: string, client: Socket) {
    try {
      const receivedRequests =
        await this.friendService.getReceivedRequests(profileId);
      const sendingRequests =
        await this.friendService.getSendingRequests(profileId);
      client.emit('friendShip', {
        receivedRequests,
        sendingRequests,
      });
    } catch (error) {
      this.logger.error(error);
    }
  }
}
