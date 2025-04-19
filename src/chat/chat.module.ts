import { Module } from '@nestjs/common';
import { CloudinaryModule } from 'src/config/cloudinary/cloudinary.module';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { GroupModule } from 'src/group/group.module';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  imports: [GroupModule, PrismaModule, CloudinaryModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
