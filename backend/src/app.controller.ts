import {
  Controller,
  Get,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { PrismaService } from './prisma.service';
import { RedisService } from './redis/redis.service';
import { EmailService } from './email/email.service';

type DependencyState = 'up' | 'down';

type StatusResponse = {
  status: 'ok' | 'degraded';
  timestamp: string;
  dependencies: {
    database: DependencyState;
    redis: DependencyState;
    mailClient: DependencyState;
  };
};

@Controller()
export class AppController {
  constructor(
    private readonly logger: Logger,
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
  ) {}

  @Get('debug-sentry')
  triggerSentryError(): void {
    this.logger.warn('Sentry debug endpoint triggered');
    throw new InternalServerErrorException('Test Sentry Integration');
  }

  @Get('api/status')
  async getStatus(): Promise<StatusResponse> {
    const mailClientReady = this.emailService.isMailClientReady();
    const [databaseResult, redisResult] = await Promise.allSettled([
      this.prismaService.checkHealth(),
      this.redisService.checkHealth(),
    ]);

    const statusResponse: StatusResponse = {
      status:
        databaseResult.status === 'fulfilled' &&
        redisResult.status === 'fulfilled' &&
        mailClientReady
          ? 'ok'
          : 'degraded',
      timestamp: new Date().toISOString(),
      dependencies: {
        database: databaseResult.status === 'fulfilled' ? 'up' : 'down',
        redis: redisResult.status === 'fulfilled' ? 'up' : 'down',
        mailClient: mailClientReady ? 'up' : 'down',
      },
    };

    if (statusResponse.status === 'degraded') {
      this.logger.error('Infrastructure dependency healthcheck failed', {
        dependencies: statusResponse.dependencies,
      });
      throw new ServiceUnavailableException(statusResponse);
    }

    return statusResponse;
  }
}
