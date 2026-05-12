import { ConfigModule, ConfigService } from '@nestjs/config';
import { Global, Module } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';
import { RedisService } from './redis.service';
import { Logger } from 'nestjs-pino';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    Logger,
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService, logger: Logger) => {
        const requiredKeys = {
          host: 'REDIS_HOST',
          port: 'REDIS_PORT',
          username: 'REDIS_USERNAME',
          password: 'REDIS_PASSWORD',
        };

        const missingKeys: string[] = [];
        const config = Object.entries(requiredKeys).reduce(
          (acc, [key, envVar]) => {
            const value = configService.get(envVar);
            if (value === undefined || value === null) {
              missingKeys.push(envVar);
            }
            return { ...acc, [key]: value };
          },
          {} as Record<keyof typeof requiredKeys, string>,
        );

        if (missingKeys.length > 0) {
          const errorMessage = `Missing required Redis environment variables: ${missingKeys.join(', ')}`;
          throw new Error(`Failed to initialize Redis: ${errorMessage}`);
        }

        const maskedPassword = config.password
          ? '#'.repeat(config.password.length)
          : '';

        logger.debug('Configuring Redis connection', {
          host: config.host,
          port: config.port,
          user: config.username,
          password: maskedPassword,
        });

        const client = new Redis({
          db: 0,
          host: config.host,
          port: Number(config.port),
          username: config.username,
          password: config.password,
          retryStrategy: () => 3000,
        } as RedisOptions);

        client.on('connect', () => {
          logger.debug('Redis connected');
        });
        client.on('ready', () => {
          logger.log('Redis cache ready');
        });
        client.on('error', (error) => {
          logger.error('Redis connection error', {
            error: error?.message ?? 'unknown_error',
          });
        });

        return client;
      },
      inject: [ConfigService, Logger],
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}
