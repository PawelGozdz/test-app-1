import { BaseError, ErrorOptions } from './base.error';
import { DomainErrorCode, DomainErrorType } from './error.enum';

export type DomainErrorOptions = ErrorOptions & {
  domain?: DomainErrorType;
  code?: DomainErrorCode;
  data?: unknown;
  error?: Error;
};

export abstract class DomainError extends BaseError implements DomainErrorOptions {
  domain?: DomainErrorType;

  code: DomainErrorCode;

  data?: unknown;

  timestamp?: Date;

  error?: Error;

  constructor(message: string, options: DomainErrorOptions | Error = {}) {
    super(message);

    if (options instanceof Error) {
      this.error = options;
    } else if (options && 'code' in options) {
      this.domain = options?.domain;
      this.code = options?.code != null ? options?.code : DomainErrorCode.UnknownError;
      this.data = options?.data ?? {};
      this.error = options?.error;
    }

    this.timestamp = DomainError.generateTimestamp();
  }

  private static generateTimestamp(): Date {
    return new Date();
  }
}

export class DuplicateError extends DomainError {
  static withEntityId(id: string, data?: DomainErrorOptions): DuplicateError {
    const message = `Entity with id ${id} already exists`;
    const options = {
      code: DomainErrorCode.DuplicateEntry,
      data,
    };
    return new DuplicateError(message, options);
  }
}
