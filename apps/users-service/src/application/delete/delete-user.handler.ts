import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { DeleteUserInternalDto } from '@libs/common';
import { IUserCommandRepository, UserNotFoundExistsError } from '../../domain';

@Injectable()
export class DeleteUserHandler {
  constructor(
    private readonly userRepository: IUserCommandRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  async execute(dto: DeleteUserInternalDto): Promise<void> {
    this.logger.info(dto, 'Deleting user:');

    const data = dto.data;

    const currentUser = await this.userRepository.getOneById(data.id);
    
    if (!currentUser) {
      throw UserNotFoundExistsError.withId(data.id);
    }

    // Additional logic here if needed

    await this.userRepository.delete(currentUser.id);

    return;
  }
}
