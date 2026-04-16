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
        const host = configService.get<string>('REDIS_HOST') ?? 'localhost';
        const port = Number(configService.get<string>('REDIS_PORT') ?? '6767');
        const username = configService.get<string>('REDIS_USERNAME') ?? 'default';
        const password = configService.get<string>('REDIS_PASSWORD') ?? '';

        logger.log('Configuring Redis connection', {
          host,
          port,
          username,
        });

        const client = new Redis({
          db: 0,
          host,
          port,
          username,
          password: password || undefined,
          retryStrategy: () => 3000,
        } as RedisOptions);

        client.on('ready', () => {
          logger.log('Redis ready');
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
