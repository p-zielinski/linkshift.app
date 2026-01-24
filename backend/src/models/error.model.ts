import { HttpException } from '@nestjs/common';
import { StatusCodes } from 'http-status-codes';

export class BaseError {
  code!: number;
  key!: string;
  message!: string;
  details?: string;
  requestId: string | undefined;
  constructor({
    code,
    key,
    message,
    details,
    requestId,
  }: {
    code: number;
    key: string;
    message: string;
    details?: string;
    requestId?: string;
  }) {
    Object.assign(this, { code, key, message, details, requestId });
  }
}

export class InvalidPayloadError extends BaseError {
  errors?: any;
  relatedObject: string | undefined;
  relatedObjectId: string | undefined;

  constructor({
    details,
    requestId,
    errors,
    relatedObject,
    relatedObjectId,
  }: {
    details?: string;
    requestId?: string;
    errors?: any;
    relatedObject?: string | undefined;
    relatedObjectId?: string | undefined;
  }) {
    super({
      details,
      requestId,
      code: StatusCodes.BAD_REQUEST,
      key: 'invalid_payload',
      message: 'Invalid payload',
    });
    this.details = details;
    this.requestId = requestId || undefined;
    this.errors = errors;
    this.relatedObject = relatedObject;
    this.relatedObjectId = relatedObjectId;
  }
}

export class NotFoundError extends BaseError {
  relatedObject: string | undefined;
  relatedObjectId: string | undefined;
  relatedObjectKey?: string;

  constructor({
    details,
    requestId,
    relatedObject,
    relatedObjectId,
    relatedObjectKey,
  }: {
    details: string;
    requestId: string;
    relatedObject?: string;
    relatedObjectId?: string;
    relatedObjectKey?: string;
  }) {
    super({
      details,
      requestId,
      code: StatusCodes.NOT_FOUND,
      key: 'not_found',
      message: 'Resource not found',
    });
    this.details = details;
    this.requestId = requestId;
    this.relatedObject = relatedObject;
    this.relatedObjectId = relatedObjectId;
    this.relatedObjectKey = relatedObjectKey;
  }
}

export class UnauthorizedError extends BaseError {
  constructor({ details, requestId }: { details?: string; requestId: string }) {
    super({
      details,
      requestId,
      code: 401,
      key: 'unauthorized',
      message: 'Unauthorized',
    });
    this.details = details ?? 'Missing or invalid authorization header';
    this.requestId = requestId;
  }
}

export class TooManyRequestsError extends BaseError {
  constructor({ details, requestId }: { details: string; requestId: string }) {
    super({
      details,
      requestId,
      code: StatusCodes.TOO_MANY_REQUESTS,
      key: 'too_many_requests',
      message: 'Too many requests',
    });
    this.details = details;
    this.requestId = requestId;
  }
}

export class PaymentRequiredError extends BaseError {
  constructor({ details, requestId }: { details: string; requestId: string }) {
    super({
      details,
      requestId,
      code: StatusCodes.PAYMENT_REQUIRED,
      key: 'payment_required',
      message: 'Payment required',
    });
    this.details = details;
    this.requestId = requestId;
  }
}

export class ConflictError extends BaseError {
  relatedObject: string | undefined;
  relatedObjectId: string | undefined;
  relatedObjectParameter: string | undefined;

  constructor({
    details,
    requestId,
    relatedObject,
    relatedObjectId,
    relatedObjectParameter,
  }: {
    details: string;
    requestId: string;
    relatedObject?: string | undefined;
    relatedObjectId?: string | undefined;
    relatedObjectParameter?: string | undefined;
  }) {
    super({
      details,
      requestId,
      code: StatusCodes.CONFLICT,
      key: 'conflict',
      message: 'Conflict',
    });
    this.details = details;
    this.requestId = requestId;
    this.relatedObject = relatedObject;
    this.relatedObjectId = relatedObjectId;
    this.relatedObjectParameter = relatedObjectParameter;
  }
}

export class ForbiddenError extends BaseError {
  relatedObject: string | undefined;
  relatedObjectId: string | undefined;
  relatedObjectParameter: string | undefined;

  constructor({
    details,
    requestId,
    relatedObject,
    relatedObjectId,
    relatedObjectParameter,
  }: {
    details?: string;
    requestId: string;
    relatedObject?: string | undefined;
    relatedObjectId?: string | undefined;
    relatedObjectParameter?: string | undefined;
  }) {
    super({
      details,
      requestId,
      code: StatusCodes.FORBIDDEN,
      key: 'forbidden',
      message: 'Action not allowed',
    });
    this.details = details;
    this.requestId = requestId;
    this.relatedObject = relatedObject;
    this.relatedObjectId = relatedObjectId;
    this.relatedObjectParameter = relatedObjectParameter;
  }
}

export class BadRequestError extends BaseError {
  relatedObject: string | undefined;
  relatedObjectId: string | undefined;
  relatedObjectParameter: string | undefined;

  constructor({
    details,
    requestId,
    relatedObject,
    relatedObjectId,
    relatedObjectParameter,
  }: {
    details?: string;
    requestId: string;
    relatedObject?: string | undefined;
    relatedObjectId?: string | undefined;
    relatedObjectParameter?: string | undefined;
    errors?: { details: string[] };
  }) {
    super({
      details,
      requestId,
      code: StatusCodes.BAD_REQUEST,
      key: 'bad_request',
      message: 'Bad request',
    });
    this.details = details;
    this.requestId = requestId;
    this.relatedObject = relatedObject;
    this.relatedObjectId = relatedObjectId;
    this.relatedObjectParameter = relatedObjectParameter;
  }
}

export class InternalServerError extends BaseError {
  data?: any;

  constructor({
    details,
    requestId,
    data,
  }: {
    details?: string;
    requestId: string;
    data?: any;
  }) {
    super({
      details: details,
      requestId,
      code: StatusCodes.INTERNAL_SERVER_ERROR,
      key: 'internal_server_error',
      message: 'Internal server error',
    });
    this.details = details || 'Unknown server error';
    this.requestId = requestId;
    this.data = data;
  }
}

export const throwHttpException = (error: BaseError): never => {
  throw new HttpException(error, error.code);
};
