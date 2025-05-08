import { Module } from '@nestjs/common';
import { CloudinaryModule } from 'src/config/cloudinary/cloudinary.module';
import { FcmService } from 'src/config/firebase/fcm.service';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { GroupModule } from 'src/group/group.module';
import { ProfileModule } from 'src/profile/profile.module';
import { TokenModule } from 'src/token/token.module';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  imports: [
    GroupModule,
    PrismaModule,
    CloudinaryModule,
    TokenModule,
    ProfileModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, FcmService],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
