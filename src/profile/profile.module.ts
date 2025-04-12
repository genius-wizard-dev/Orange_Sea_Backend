import { Module } from '@nestjs/common';
import { CloudinaryModule } from '../config/cloudinary/cloudinary.module';
import { PrismaModule } from '../config/prisma/prisma.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
