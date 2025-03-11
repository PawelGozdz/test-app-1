import { DomainError, DomainErrorCode, DomainErrorOptions, } from '@libs/common';

export class UserAlreadyExistsError extends DomainError {
  static withEmail(email: string, data?: DomainErrorOptions): UserAlreadyExistsError {
    const message = `User with email [${email}] already exists`;
    const options = {
      code: DomainErrorCode.DuplicateEntry,
      data,
    };
    return new UserAlreadyExistsError(message, options);
  }

  static withName(name: string, data?: DomainErrorOptions): UserAlreadyExistsError {
    const message = `User with name [${name}] already exists`;
    const options = {
      code: DomainErrorCode.DuplicateEntry,
      data,
    };
    return new UserAlreadyExistsError(message, options);
  }

  static withData(data?: DomainErrorOptions): UserAlreadyExistsError {
    const message = `User with provided data already exists`;
    const options = {
      code: DomainErrorCode.Forbidden,
      data,
    };
    return new UserAlreadyExistsError(message, options);
  }
}
