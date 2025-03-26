import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { ResendModule } from 'src/config/resend/resend.module';

import { TokenModule } from 'src/token/token.module';
import { ProfileModule } from '../profile/profile.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RedisModule } from 'src/config/redis/redis.module';

@Module({
  imports: [
    ConfigModule,
    ProfileModule,
    PrismaModule,
    ResendModule,
    TokenModule,
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
