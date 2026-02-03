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

    const path = request?.url;
    const method = request?.method;
    const isFaviconRequest = method === 'GET' && path === '/favicon.ico';

    if (!isFaviconRequest) {
      const logPayload = {
        err: exception,
        status,
        requestId,
        method,
        path,
      };

      if (status >= 500) {
        this.logger.error('Unhandled exception', logPayload);
      } else {
        this.logger.warn('Request error', logPayload);
      }
    }

    if (!(exception instanceof HttpException) || status >= 500) {
      Sentry.captureException(exception);
    }

    super.catch(exception, host);
  }
}
