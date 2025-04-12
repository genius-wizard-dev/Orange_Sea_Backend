import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Cloudinary } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [ConfigModule],
  providers: [Cloudinary, CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
