import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export const Cloudinary = {
  provide: 'CLOUDINARY',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return cloudinary.config({
      cloud_name: 'dubwmognz',
      api_key: configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: configService.get<string>('CLOUDINARY_SECRET_KEY'),
    });
  },
};
