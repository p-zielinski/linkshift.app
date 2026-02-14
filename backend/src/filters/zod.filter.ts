import * as common from '@nestjs/common';
import _ from 'lodash';
import qs from 'qs';
import { ZodError } from 'zod';
import { fromError } from 'zod-validation-error';
import { InvalidPayloadError } from '@shared/models/error.model';
import { Logger } from 'nestjs-pino';

@common.Catch(ZodError)
export class ZodFilter<T extends ZodError> implements common.ExceptionFilter {
  #isProduction: boolean;
  #logger: Logger;

  constructor(logger: Logger, isProduction: boolean) {
    this.#logger = logger;
    this.#isProduction = isProduction;
  }

  catch(exception: T, host: common.ArgumentsHost) {
    const ctx = host.switchToHttp();

    const log = {
      url: ctx.getRequest().url,
      method: ctx.getRequest().method,
      query: qs.parse(
        _.map(
          ctx.getRequest().query || {},
          (value, key) => `${key}=${value}`,
        ).join('&'),
      ),
      params: ctx.getRequest().params,
      status: ctx.getResponse().statusCode,
      errorMessage: exception.message,
    };
    this.#logger.debug('Zod validation error', {
      ...log,
      issues: exception.issues?.length ?? 0,
    });

    const status = 400;
    ctx
      .getResponse()
      .status(status)
      .json(
        new InvalidPayloadError({
          details: fromError(exception).toString(),
        }),
      );
  }
}
