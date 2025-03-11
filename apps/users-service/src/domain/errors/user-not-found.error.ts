import { DomainError, DomainErrorCode, DomainErrorOptions, } from '@libs/common';

export class UserNotFoundExistsError extends DomainError {
  static withId(id: string, data?: DomainErrorOptions): UserNotFoundExistsError {
    const message = `User with id [${id}] not found!`;
    const options = {
      code: DomainErrorCode.NotFound,
      data,
    };
    return new UserNotFoundExistsError(message, options);
  }

}
