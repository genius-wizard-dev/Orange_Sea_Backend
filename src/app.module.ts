import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AccountModule } from './account/account.module';
import { AuthModule } from './auth/auth.module';
import { ChatController } from './chat/chat.controller';
import { ChatModule } from './chat/chat.module';
import { ChatService } from './chat/chat.service';
import { RedisModule } from './config/redis/redis.module';
import { ResendModule } from './config/resend/resend.module';
import { FcmModule } from './config/firebase/fcm.module';
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
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class AppModule {}
