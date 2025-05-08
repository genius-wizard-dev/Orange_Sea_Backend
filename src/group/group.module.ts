import { Module } from '@nestjs/common';
import { CloudinaryModule } from 'src/config/cloudinary/cloudinary.module';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { ProfileModule } from 'src/profile/profile.module';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';

@Module({
  imports: [ProfileModule, CloudinaryModule],
  controllers: [GroupController],
  providers: [GroupService, PrismaService],
  exports: [GroupService],
})
export class GroupModule {}
