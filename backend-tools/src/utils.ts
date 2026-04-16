import { HttpException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { BaseError } from '@shared/models/error.model';

export const createRequestId = (): string =>
  `req_${randomUUID().replace(/-/g, '').slice(0, 20)}`;

export const throwHttpException = (error: BaseError): never => {
  throw new HttpException(error, error.code);
};
