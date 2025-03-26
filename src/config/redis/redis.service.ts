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

  onModuleInit() {
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

  async get<T=any>(key: string): Promise<T | null> {
    try {
      const value = await this.redisClient.get(key);
      if (!value) {
        this.logger.debug(`Key not found: ${key}`);
        return null;
      }
      return JSON.parse(value) as T;
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

  async hset(key: string, field: string, value: any): Promise<void> {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      await this.redisClient.hset(key, field, serializedValue);
    } catch (error) {
      console.error(`Lỗi khi lưu hash ${field} vào ${key}: ${error.message}`);
      throw error;
    }
  }

  async hget<T = any>(key: string, field: string): Promise<T | null> {
    try {


      const value = await this.redisClient.hget(key, field);
      if (value === null) {
        this.logger.debug(`Field ${field} not found in hash key: ${key}`);
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Error getting hash field ${field} from key ${key}: ${error.message}`);
      throw error;
    }
  }

  async hdel(key: string, ...fields: string[]): Promise<void> {
    try {
      await this.redisClient.hdel(key, ...fields);
      this.logger.debug(`Successfully deleted hash fields: ${fields} in key: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting fields from hash ${key}: ${error.message}`);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const exists = await this.redisClient.exists(key);
      return exists === 1;
    } catch (error) {
      this.logger.error(`Error checking existence for key ${key}: ${error.message}`);
      throw error;
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.redisClient.expire(key, ttl);
      this.logger.debug(`Successfully set TTL ${ttl}s for key: ${key}`);
    } catch (error) {
      this.logger.error(`Error setting TTL for key ${key}: ${error.message}`);
      throw error;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      const ttl = await this.redisClient.ttl(key);
      this.logger.debug(`TTL for key ${key}: ${ttl}s`);
      return ttl;
    } catch (error) {
      this.logger.error(`Error getting TTL for key ${key}: ${error.message}`);
      throw error;
    }
  }

  async setex(key: string, value: any, seconds: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await this.redisClient.setex(key, seconds, serialized);
      this.logger.debug(`Successfully set key with expiry: ${key}, TTL: ${seconds}s`);
    } catch (error) {
      this.logger.error(`Error setting key ${key} with expiry: ${error.message}`);
      throw error;
    }
  }


}
