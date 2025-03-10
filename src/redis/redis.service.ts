import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redisClient: Redis;

  async onModuleInit() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('REDIS_URL is not defined');
    }

    this.redisClient = new Redis(redisUrl);

    this.redisClient.on('connect', () => {
      this.logger.debug('Redis client connected');
    });

    this.redisClient.on('error', (error) => {
      this.logger.error('Redis client error:', error);
    });
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.redisClient.set(key, JSON.stringify(value), 'EX', ttl);
      } else {
        await this.redisClient.set(key, JSON.stringify(value));
      }
      this.logger.debug(`Successfully set key: ${key}`);
    } catch (error) {
      this.logger.error(`Error setting key ${key}: ${error.message}`);
      throw error;
    }
  }

  async get(key: string): Promise<any> {
    try {
      const value = await this.redisClient.get(key);
      if (!value) {
        this.logger.debug(`Key not found: ${key}`);
        return null;
      }
      return JSON.parse(value);
    } catch (error) {
      this.logger.error(`Error getting key ${key}: ${error.message}`);
      throw error;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
      this.logger.debug(`Successfully deleted key: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting key ${key}: ${error.message}`);
      throw error;
    }
  }

  async reset(): Promise<void> {
    try {
      await this.redisClient.flushall();
      this.logger.debug('Successfully reset cache');
    } catch (error) {
      this.logger.error(`Error resetting cache: ${error.message}`);
      throw error;
    }
  }

  // Thêm phương thức keys để tìm kiếm theo pattern
  async keys(pattern: string): Promise<string[]> {
    try {
      const keys = await this.redisClient.keys(pattern);
      this.logger.debug(
        `Found ${keys.length} keys matching pattern: ${pattern}`,
      );
      return keys;
    } catch (error) {
      this.logger.error(
        `Error finding keys with pattern ${pattern}: ${error.message}`,
      );
      throw error;
    }
  }
}
