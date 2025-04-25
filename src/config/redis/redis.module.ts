import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: RedisService,
      useFactory: () => {
        // Ensure we create only one instance of RedisService
        return new RedisService();
      },
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
