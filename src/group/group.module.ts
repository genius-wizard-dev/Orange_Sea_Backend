import { Module } from '@nestjs/common';
import { ChatService } from 'src/chat/services/chat';
import { AiService } from 'src/config/ai/ai.service';
import { CloudinaryModule } from 'src/config/cloudinary/cloudinary.module';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { ProfileModule } from 'src/profile/profile.module';
import { GroupController } from './group.controller';
import { GroupService } from './services/group';

@Module({
  imports: [ProfileModule, CloudinaryModule],
  controllers: [GroupController],
  providers: [GroupService, PrismaService, ChatService, AiService],
  exports: [GroupService],
})
export class GroupModule {}
