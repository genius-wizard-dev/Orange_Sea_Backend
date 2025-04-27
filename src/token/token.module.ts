import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { RedisModule } from 'src/config/redis/redis.module';
import { ProfileModule } from 'src/profile/profile.module';
import { JwtRefreshStrategy } from './strategy/jwt.refresh.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { TokenService } from './token.service';

@Module({
  imports: [
    PassportModule,
    RedisModule,
    ProfileModule,
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
        },
        refreshToken: {
          secret: configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
        },
      }),
    }),
  ],
  providers: [TokenService, JwtStrategy, JwtRefreshStrategy],
  exports: [TokenService],
})
export class TokenModule {}
