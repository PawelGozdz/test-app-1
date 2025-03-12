import { ErrorOptions, FrameworkErrorCode } from '../errors';

import { BaseError } from './base.error';

export type FrameworkErrorOptions = ErrorOptions & {
  module?: string;
  data?: unknown;
  error?: Error;
};

export class FrameworkError extends BaseError implements FrameworkErrorOptions {
  statusCode: number;

  module?: string;

  code?: FrameworkErrorCode;

  data?: unknown;

  timestamp?: Date;

  error?: Error;

  constructor(statusCode: number, message: string, options: FrameworkErrorOptions | Error = {}) {
    super(message);

    this.statusCode = statusCode;

    if (options instanceof Error) {
      this.error = options;
    } else if (options && 'code' in options) {
      this.module = options?.module ?? '';
      this.code = options.code;
      this.data = options?.data ?? {};
      this.error = options?.error;
    }

    this.timestamp = FrameworkError.generateTimestamp();
  }

  private static generateTimestamp(): Date {
    return new Date();
  }
}

export class NotFoundError extends FrameworkError {
  static statusCode: number = 404;

  static message: string = 'Not Found';

  constructor(message?: string, options: FrameworkErrorOptions | Error = {}) {
    super(NotFoundError.statusCode, message ?? NotFoundError.message, {
      code: FrameworkErrorCode.NotFound,
      ...options,
    });
  }
}


export class ConflictError extends FrameworkError {
  static statusCode: number = 409;

  static message: string = 'Conflict';

  constructor(message?: string, options: FrameworkErrorOptions | Error = {}) {
    super(ConflictError.statusCode, message ?? ConflictError.message, {
      code: FrameworkErrorCode.DuplicateEntry,
      ...options,
    });
  }
}

export class BadRequestError extends FrameworkError {
  static statusCode: number = 400;

  static message: string = 'BadRequest';

  constructor(message?: string, options: FrameworkErrorOptions | Error = {}) {
    super(BadRequestError.statusCode, message ?? BadRequestError.message, {
      code: FrameworkErrorCode.ValidationFailed,
      ...options,
    });
  }
}
