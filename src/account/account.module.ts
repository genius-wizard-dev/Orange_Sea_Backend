import { Module } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { RedisService } from 'src/config/redis/redis.service';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  providers: [AccountService, PrismaService, RedisService],
  controllers: [AccountController],
  exports: [AccountService],
})
export class AccountModule {}
