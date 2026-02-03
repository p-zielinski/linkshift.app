import { ArgumentsHost, Catch, HttpException, Injectable } from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import * as Sentry from '@sentry/nestjs';

@Catch()
@Injectable()
export class SentryExceptionFilter extends BaseExceptionFilter {
  constructor(
    private readonly logger: Logger,
    adapterHost: HttpAdapterHost,
  ) {
    super(adapterHost.httpAdapter);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest() as {
      id?: string;
      method?: string;
      url?: string;
      headers?: Record<string, string | string[] | undefined>;
    };

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    const requestId =
      request?.id ??
      (Array.isArray(request?.headers?.['x-request-id'])
        ? request?.headers?.['x-request-id'][0]
        : request?.headers?.['x-request-id']);

    this.logger.error('Unhandled exception', {
      err: exception,
      status,
      requestId,
      method: request?.method,
      path: request?.url,
    });

    if (!(exception instanceof HttpException) || status >= 500) {
      Sentry.captureException(exception);
    }

    super.catch(exception, host);
  }
}
