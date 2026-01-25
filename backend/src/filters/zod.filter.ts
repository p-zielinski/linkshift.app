import * as common from '@nestjs/common';
import _ from 'lodash';
import qs from 'qs';
import { ZodError } from 'zod';
import { fromError } from 'zod-validation-error';
import { InvalidPayloadError } from '@shared/models/error.model';

@common.Catch(ZodError)
export class ZodFilter<T extends ZodError> implements common.ExceptionFilter {
  #isProduction = process.env.NODE_ENV !== 'development';
  #logger: common.LoggerService;

  constructor(logger: common.LoggerService) {
    this.#logger = logger;
  }

  catch(exception: T, host: common.ArgumentsHost) {
    if (!this.#isProduction) {
      this.#logger.debug?.(JSON.stringify(exception));
    }
    const ctx = host.switchToHttp();

    const log = {
      url: ctx.getRequest().url,
      method: ctx.getRequest().method,
      body: ctx.getRequest().body,
      query: qs.parse(
        _.map(
          ctx.getRequest().query || {},
          (value, key) => `${key}=${value}`,
        ).join('&'),
      ),
      params: ctx.getRequest().params,
      headers: ctx.getRequest().headers,
      status: ctx.getResponse().statusCode,
      errorMessage: exception.message,
    };
    this.#logger.debug?.(this.#isProduction ? JSON.stringify(log) : log);

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
