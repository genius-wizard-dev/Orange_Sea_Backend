import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { RedisModule } from 'src/config/redis/redis.module';
import { TokenService } from './token.service';

@Module({
  imports: [PrismaModule, RedisModule, JwtModule.register({})],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
