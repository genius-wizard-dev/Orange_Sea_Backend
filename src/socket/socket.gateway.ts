import { Logger } from '@nestjs/common';
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
import { ChatSocketService } from 'src/chat/services/socket';
import { FriendSocketService } from 'src/friend/services/socket';
import { GroupSocketService } from 'src/group/services/socket';
import { ProfileSocketService } from 'src/profile/services/socket';
import { SocketService } from './socket.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/ws',
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SocketGateway.name, { timestamp: true });

  constructor(
    private readonly socketService: SocketService,
    private readonly friendSocketService: FriendSocketService,
    private readonly chatSocketService: ChatSocketService,
    private readonly groupSocketService: GroupSocketService,
    private readonly profileSocketService: ProfileSocketService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log({ message: 'Socket connected', socketId: client.id });
  }

  async handleDisconnect(client: Socket) {
    try {
      await this.socketService.offline(client, this.server);
      await this.socketService.disconnect(client, this.server);
    } catch (error) {
      this.logger.error({
        message: `Lỗi khi xử lý ngắt kết nối: ${error.message}`,
        socketId: client.id,
        error,
      });
    }
  }

  @SubscribeMessage('register')
  async register(
    @MessageBody() data: { profileId: string; deviceId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { profileId, deviceId } = data;
      if (!profileId) throw new Error('profileId is required');
      await this.socketService.register(profileId, deviceId, client);
      await this.friendSocketService.fetchFriendsStatus(profileId, client);
      await this.friendSocketService.fetchFriendShipStatus(profileId, client);
      await this.chatSocketService.unReadMessages(profileId, client);
      await this.socketService.online(profileId, this.server);
      return {
        success: true,
        message: 'Đăng ký thành công',
      };
    } catch (error) {
      this.logger.error(`Lỗi khi đăng ký: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @SubscribeMessage('updateProfile')
  async updateProfile(@ConnectedSocket() client: Socket) {
    try {
      await this.profileSocketService.updateProfile(client, this.server);
      return {
        success: true,
        message: 'Cập nhật profile thành công',
      };
    } catch (error) {
      this.logger.error(`Lỗi khi cập nhật profile: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @SubscribeMessage('updatePassword')
  async updatePassword(@ConnectedSocket() client: Socket) {
    try {
      await this.profileSocketService.updatePassword(client, this.server);
      return {
        success: true,
        message: 'Cập nhật password thành công',
      };
    } catch (error) {
      this.logger.error(`Lỗi khi cập nhật password: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @SubscribeMessage('resetPassword')
  async resetPassword(@MessageBody() data: { profileId: string }) {
    try {
      const { profileId } = data;
      await this.profileSocketService.resetPassword(profileId, this.server);
    } catch (error) {
      this.logger.error(`Lỗi khi đặt lại password: ${error.message}`);
    }
  }

  @SubscribeMessage('handleFriend')
  async handleFriend(@MessageBody() data: { friendShipId: string }) {
    try {
      const { friendShipId } = data;
      await this.friendSocketService.handleFriend(friendShipId, this.server);
      return {
        success: true,
        message: 'Xử lý yêu cầu kết bạn thành công',
      };
    } catch (error) {
      this.logger.error(`Lỗi khi xử lý yêu cầu kết bạn: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @SubscribeMessage('handleGroup')
  async handleGroup(@MessageBody() data: { groupId: string }) {
    try {
      const { groupId } = data;
      await this.groupSocketService.handleGroup(groupId, this.server);
      return {
        success: true,
        message: 'Xử lý yêu cầu nhóm thành công',
      };
    } catch (error) {
      this.logger.error(`Lỗi khi xử lý yêu cầu nhóm: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @SubscribeMessage('handleMemberGroup')
  async handleMemberGroup(@MessageBody() data: { groupId: string }) {
    try {
      const { groupId } = data;
      await this.groupSocketService.handleMemberGroup(groupId, this.server);
      return {
        success: true,
        message: 'Xử lý yêu cầu nhóm thành công',
      };
    } catch (error) {
      this.logger.error(`Lỗi khi xử lý yêu cầu nhóm: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }
  @SubscribeMessage('open')
  async openGroup(
    @MessageBody() data: { profileId: string; groupId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { profileId, groupId } = data;
      await this.groupSocketService.openGroup(
        profileId,
        groupId,
        client,
        this.server,
      );
      return {
        success: true,
        message: 'Mở nhóm thành công',
      };
    } catch (error) {
      this.logger.error(`Lỗi khi mở nhóm: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @SubscribeMessage('close')
  async closeGroup(
    @MessageBody() data: { profileId: string; groupId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { profileId, groupId } = data;
      await this.groupSocketService.closeGroup(
        profileId,
        groupId,
        this.server,
        client,
      );
      return {
        success: true,
        message: 'Đóng nhóm thành công',
      };
    } catch (error) {
      this.logger.error(`Lỗi khi đóng nhóm: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(@MessageBody() data: { messageId: string }) {
    try {
      const { messageId } = data;
      await this.chatSocketService.sendMessage(messageId, this.server);
      return {
        success: true,
        message: 'Gửi tin nhắn thành công',
      };
    } catch (error) {
      this.logger.error(`Lỗi khi gửi tin nhắn: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @SubscribeMessage('recallMessage')
  async recallMessage(@MessageBody() data: { messageId: string }) {
    try {
      const { messageId } = data;
      await this.chatSocketService.recallMessage(messageId, this.server);
      return {
        success: true,
        message: 'Thu hồi tin nhắn thành công',
      };
    } catch (error) {
      this.logger.error(`Lỗi khi gọi lại tin nhắn: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @SubscribeMessage('editMessage')
  async editMessage(@MessageBody() data: { messageId: string }) {
    try {
      const { messageId } = data;
      await this.chatSocketService.editMessage(messageId, this.server);
      return {
        success: true,
        message: 'Chỉnh sửa tin nhắn thành công',
      };
    } catch (error) {
      this.logger.error(`Lỗi khi chỉnh sửa tin nhắn: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @SubscribeMessage('deleteMessage')
  async deleteMessage(
    @MessageBody() data: { messageId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { messageId } = data;
      await this.chatSocketService.deleteMessage(
        messageId,
        this.server,
        client,
      );
      return {
        success: true,
        message: 'Xóa tin nhắn thành công',
      };
    } catch (error) {
      this.logger.error(`Lỗi khi xóa tin nhắn: ${error.message}`);
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
