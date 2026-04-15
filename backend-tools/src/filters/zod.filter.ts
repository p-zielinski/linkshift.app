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

    this.#logger.debug('Zod validation error', {
      url: ctx.getRequest().url,
      method: ctx.getRequest().method,
      query: qs.parse(
        _.map(
          ctx.getRequest().query || {},
          (value, key) => `${key}=${value}`,
        ).join('&'),
      ),
      status: ctx.getResponse().statusCode,
      issues: exception.issues?.length ?? 0,
      isProduction: this.#isProduction,
    });

    ctx.getResponse().status(400).json(
      new InvalidPayloadError({
        details: fromError(exception).toString(),
      }),
    );
  }
}
