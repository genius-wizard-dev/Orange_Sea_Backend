import { Module } from '@nestjs/common';
import { AiModule } from 'src/config/ai/ai.module';
import { CloudinaryModule } from 'src/config/cloudinary/cloudinary.module';
import { FcmService } from 'src/config/firebase/fcm.service';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { GroupModule } from 'src/group/group.module';
import { TokenModule } from 'src/token/token.module';

import { AiService } from 'src/config/ai/ai.service';
import { FriendshipService } from 'src/friend/services/friend';
import { GroupService } from 'src/group/services/group';
import { GroupSocketService } from 'src/group/services/socket';
import { ProfileService } from 'src/profile/services/profile';
import { SocketService } from 'src/socket/socket.service';
import { ChatController } from './chat.controller';
import { ChatService } from './services/chat';

@Module({
  imports: [GroupModule, PrismaModule, CloudinaryModule, TokenModule, AiModule],
  controllers: [ChatController],
  providers: [
    ChatService,
    FcmService,
    GroupSocketService,
    GroupService,
    ProfileService,
    SocketService,
    FriendshipService,
    AiService,
  ],
  exports: [ChatService],
})
export class ChatModule {}
