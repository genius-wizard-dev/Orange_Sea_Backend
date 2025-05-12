import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import Redis, { Pipeline } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name, { timestamp: true });
  private redisClient: Redis;

  // Static properties to ensure singleton behavior
  private static instance: RedisService;
  private static isConnected = false;
  private static connectionPromise: Promise<void> | null = null;

  constructor() {
    // Ensure we only create one instance
    if (RedisService.instance) {
      return RedisService.instance;
    }
    RedisService.instance = this;
  }

  async onModuleInit() {
    try {
      // If already connected or in the process of connecting, return
      if (RedisService.isConnected) {
        this.logger.debug(
          'Redis client already connected, skipping connection',
        );
        return;
      }

      // If connection is in progress, wait for it
      if (RedisService.connectionPromise) {
        this.logger.debug('Redis connection in progress, waiting...');
        await RedisService.connectionPromise;
        return;
      }

      // Start connection process
      RedisService.connectionPromise = this.connect();
      await RedisService.connectionPromise;
    } catch (error) {
      this.logger.error({
        message: 'Failed to initialize Redis connection',
        error: error.message,
        stack: error.stack,
      });
      // Reset the connection promise so it can be retried
      RedisService.connectionPromise = null;
      // Don't throw here to allow the application to start even if Redis is down
    }
  }

  private async connect(): Promise<void> {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('REDIS_URL is not defined');
    }

    this.redisClient = new Redis(redisUrl, {
      retryStrategy: (times) => Math.min(times * 50, 2000), // Exponential backoff
      maxRetriesPerRequest: 3,
      connectTimeout: 10000, // 10 seconds timeout for initial connection
      enableReadyCheck: true,
      enableOfflineQueue: true,
    });

    return new Promise<void>((resolve, reject) => {
      // Set a timeout for connection
      const connectionTimeout = setTimeout(() => {
        if (!RedisService.isConnected) {
          const error = new Error('Redis connection timeout after 10 seconds');
          this.logger.error({
            message: 'Redis connection timeout',
            error: error.message,
          });
          reject(error);
          try {
            this.redisClient.disconnect();
          } catch (e) {
            // Ignore disconnect errors
          }
        }
      }, 10000);

      this.redisClient.on('connect', () => {
        this.logger.log({ message: 'Redis client connecting...' });
      });

      this.redisClient.on('ready', () => {
        clearTimeout(connectionTimeout);
        RedisService.isConnected = true;
        this.logger.log({ message: 'Redis client ready and connected' });
        resolve();
      });

      this.redisClient.on('error', (error) => {
        this.logger.error({
          message: 'Redis client error',
          error: error.message,
        });
        if (!RedisService.isConnected) {
          clearTimeout(connectionTimeout);
          reject(error);
        }
      });

      this.redisClient.on('close', () => {
        this.logger.warn({ message: 'Redis connection closed' });
        if (RedisService.isConnected) {
          RedisService.isConnected = false;
        }
      });
    });
  }

  async onModuleDestroy() {
    try {
      if (this.redisClient && RedisService.isConnected) {
        await this.redisClient.quit();
        RedisService.isConnected = false;
        RedisService.connectionPromise = null;
        this.logger.log({ message: 'Redis client disconnected' });
      }
    } catch (error) {
      this.logger.error({
        message: 'Error disconnecting Redis client',
        error: error.message,
      });
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = this.serialize(value);
      if (ttl) {
        await this.redisClient.set(key, serialized, 'EX', ttl);
      } else {
        await this.redisClient.set(key, serialized);
      }
      this.logger.debug({ message: 'Set key', key });
    } catch (error) {
      this.logger.error({
        message: 'Error setting key',
        key,
        error: error.message,
      });
      throw error;
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.redisClient.get(key);
      if (value === null) {
        this.logger.debug({ message: 'Key not found', key });
        return null;
      }
      return this.deserialize<T>(value);
    } catch (error) {
      this.logger.error({
        message: 'Error getting key',
        key,
        error: error.message,
      });
      throw error;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
      this.logger.debug({ message: 'Deleted key', key });
    } catch (error) {
      this.logger.error({
        message: 'Error deleting key',
        key,
        error: error.message,
      });
      throw error;
    }
  }

  async setex(key: string, value: any, seconds: number): Promise<void> {
    try {
      const serialized = this.serialize(value);
      await this.redisClient.setex(key, seconds, serialized);
      this.logger.debug({ message: 'Set key with expiry', key, ttl: seconds });
    } catch (error) {
      this.logger.error({
        message: 'Error setting key with expiry',
        key,
        error: error.message,
      });
      throw error;
    }
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      const result = await this.redisClient.sadd(key, ...members);
      this.logger.debug({
        message: 'Added members to set',
        key,
        count: result,
      });
      return result;
    } catch (error) {
      this.logger.error({
        message: 'Error adding members to set',
        key,
        error: error.message,
      });
      throw error;
    }
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    try {
      const result = await this.redisClient.srem(key, ...members);
      this.logger.debug({
        message: 'Removed members from set',
        key,
        count: result,
      });
      return result;
    } catch (error) {
      this.logger.error({
        message: 'Error removing members from set',
        key,
        error: error.message,
      });
      throw error;
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      const members = (await this.redisClient.smembers(key)) || [];
      this.logger.debug({
        message: 'Retrieved members from set',
        key,
        count: members.length,
      });
      return members;
    } catch (error) {
      this.logger.error({
        message: 'Error getting members from set',
        key,
        error: error.message,
      });
      throw error;
    }
  }

  async sismember(key: string, member: string): Promise<boolean> {
    try {
      const result = await this.redisClient.sismember(key, member);
      this.logger.debug({
        message: 'Checked if member exists in set',
        key,
        member,
        exists: result === 1,
      });
      return result === 1;
    } catch (error) {
      this.logger.error({
        message: 'Error checking member existence in set',
        key,
        member,
        error: error.message,
      });
      throw error;
    }
  }

  async scard(key: string): Promise<number> {
    try {
      const count = await this.redisClient.scard(key);
      this.logger.debug({ message: 'Retrieved set cardinality', key, count });
      return count;
    } catch (error) {
      this.logger.error({
        message: 'Error getting set cardinality',
        key,
        error: error.message,
      });
      throw error;
    }
  }

  async incr(key: string): Promise<number> {
    try {
      const result = await this.redisClient.incr(key);
      this.logger.debug({ message: 'Incremented key', key, value: result });
      return result;
    } catch (error) {
      this.logger.error({
        message: 'Error incrementing key',
        key,
        error: error.message,
      });
      throw error;
    }
  }

  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.redisClient.expire(key, seconds);
      this.logger.debug({ message: 'Set TTL for key', key, ttl: seconds });
    } catch (error) {
      this.logger.error({
        message: 'Error setting TTL for key',
        key,
        error: error.message,
      });
      throw error;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      const ttl = await this.redisClient.ttl(key);
      this.logger.debug({ message: 'Retrieved TTL for key', key, ttl });
      return ttl;
    } catch (error) {
      this.logger.error({
        message: 'Error getting TTL for key',
        key,
        error: error.message,
      });
      throw error;
    }
  }

  multi(): Pipeline {
    try {
      if (!this.redisClient || !RedisService.isConnected) {
        this.logger.error({
          message: 'Cannot create Redis pipeline, client not connected',
          isConnected: RedisService.isConnected,
          hasClient: !!this.redisClient,
        });
        throw new Error('Redis client not connected');
      }
      return this.redisClient.multi() as Pipeline;
    } catch (error) {
      this.logger.error({
        message: 'Error creating Redis pipeline',
        error: error.message,
      });
      throw error;
    }
  }

  async exec(pipeline: Pipeline): Promise<Array<[Error | null, any]>> {
    try {
      if (!pipeline) {
        throw new Error('Invalid Redis pipeline');
      }

      if (!this.redisClient || !RedisService.isConnected) {
        throw new Error('Redis client not connected');
      }

      const results = await pipeline.exec();
      this.logger.debug({
        message: 'Executed Redis pipeline',
        results: results ? results.length : 0,
      });
      return results || [];
    } catch (error) {
      this.logger.error({
        message: 'Error executing Redis pipeline',
        error: error.message,
      });
      throw error;
    }
  }

  private serialize(value: any): string {
    return typeof value === 'string' ? value : JSON.stringify(value);
  }

  private deserialize<T>(value: string): T {
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T; // Fallback for non-JSON strings
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      const keys = await this.redisClient.keys(pattern);
      this.logger.debug({
        message: 'Retrieved keys matching pattern',
        pattern,
        count: keys.length,
      });
      return keys;
    } catch (error) {
      this.logger.error({
        message: 'Error getting keys with pattern',
        pattern,
        error: error.message,
      });
      throw error;
    }
  }
}
