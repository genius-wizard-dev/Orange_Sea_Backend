import { Module } from '@nestjs/common';
import { CloudinaryModule } from 'src/config/cloudinary/cloudinary.module';
import { FcmService } from 'src/config/firebase/fcm.service';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { GroupModule } from 'src/group/group.module';
import { TokenModule } from 'src/token/token.module';

import { GroupService } from 'src/group/services/group';
import { GroupSocketService } from 'src/group/services/socket';
import { ProfileService } from 'src/profile/services/profile';
import { ChatController } from './chat.controller';
import { ChatService } from './services/chat';
import { SocketService } from 'src/socket/socket.service';
import { FriendshipService } from 'src/friend/services/friend';

@Module({
  imports: [GroupModule, PrismaModule, CloudinaryModule, TokenModule],
  controllers: [ChatController],
  providers: [
    ChatService,
    FcmService,
    GroupSocketService,
    GroupService,
    ProfileService,
    SocketService,
    FriendshipService,
  ],
  exports: [ChatService],
})
export class ChatModule {}
