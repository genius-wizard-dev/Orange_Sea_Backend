/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { FriendshipController } from './friend.controller';
import { FriendshipService } from './friend.service';

@Module({
  controllers: [FriendshipController],
  providers: [FriendshipService],
})
export class FriendshipModule {}
