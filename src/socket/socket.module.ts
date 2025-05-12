import { Module } from '@nestjs/common';
import { ChatModule } from 'src/chat/chat.module';
import { ChatSocketService } from 'src/chat/services/socket';
import { CloudinaryModule } from 'src/config/cloudinary/cloudinary.module';
import { FcmModule } from 'src/config/firebase/fcm.module';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { FriendshipModule } from 'src/friend/friend.module';
import { FriendSocketService } from 'src/friend/services/socket';
import { GroupModule } from 'src/group/group.module';
import { GroupSocketService } from 'src/group/services/socket';
import { ProfileModule } from 'src/profile/profile.module';
import { ProfileSocketService } from 'src/profile/services/socket';
import { TokenModule } from 'src/token/token.module';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
@Module({
  imports: [
    ChatModule,
    GroupModule,
    PrismaModule,
    CloudinaryModule,
    TokenModule,
    ProfileModule,
    FriendshipModule,
    FcmModule,
  ],
  providers: [
    SocketService,
    SocketGateway,
    FriendSocketService,
    ChatSocketService,
    GroupSocketService,
    ProfileSocketService,
  ],
  exports: [SocketService],
})
export class SocketModule {}
