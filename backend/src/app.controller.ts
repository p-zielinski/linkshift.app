import {
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
} from '@nestjs/common';
import { Logger } from 'nestjs-pino';

@Controller()
export class AppController {
  constructor(private readonly logger: Logger) {}

  @Get('debug-sentry')
  triggerSentryError(): void {
    this.logger.warn('Sentry debug endpoint triggered');
    throw new InternalServerErrorException('Test Sentry Integration');
  }

  @Get('api/status')
  @HttpCode(204)
  getStatus(): void {
    return;
  }
}
