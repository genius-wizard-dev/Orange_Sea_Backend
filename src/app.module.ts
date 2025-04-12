import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AccountModule } from './account/account.module';
import { AuthModule } from './auth/auth.module';
import { ChatController } from './chat/chat.controller';
import { ChatModule } from './chat/chat.module';
import { ChatService } from './chat/chat.service';
import { CloudinaryModule } from './config/cloudinary/cloudinary.module';
import { CloudinaryService } from './config/cloudinary/cloudinary.service';
import { FcmModule } from './config/firebase/fcm.module';
import { RedisModule } from './config/redis/redis.module';
import { ResendModule } from './config/resend/resend.module';
import { ProfileModule } from './profile/profile.module';
import { TokenModule } from './token/token.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    AuthModule,
    RedisModule,
    AccountModule,
    ProfileModule,
    FcmModule,
    ChatModule,
    TokenModule,
    ResendModule,
    CloudinaryModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, CloudinaryService],
})
export class AppModule {}
