/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ProfileModule } from 'src/profile/profile.module';
import { SocketService } from 'src/socket/socket.service';
import { FriendshipController } from './friend.controller';
import { FriendshipService } from './services/friend';

@Module({
  imports: [ProfileModule],
  controllers: [FriendshipController],
  providers: [FriendshipService, SocketService],
  exports: [FriendshipService],
})
export class FriendshipModule {}
