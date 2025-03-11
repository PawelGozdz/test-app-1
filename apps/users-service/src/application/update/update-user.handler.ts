import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { UpdateUserInternalDto, UpdateUserResponseDto } from '@libs/common';

import { IUserCommandRepository, UserAlreadyExistsError, UserNotFoundExistsError } from '../../domain';

@Injectable()
export class UpdateUserHandler {
  constructor(
    private readonly userRepository: IUserCommandRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  async execute(dto: UpdateUserInternalDto): Promise<UpdateUserResponseDto> {
    this.logger.info(dto, 'Updating user:');

    const data = dto.data;

    const usersWithRequestedEmailOrName = await this.userRepository.getOneByNameOrEmail(data.name, data.email);
    const currentUser = await this.userRepository.getOneById(data.id);

    if (usersWithRequestedEmailOrName.find(u => u.id !== data.id)) {
      throw UserAlreadyExistsError.withData();
    }

    if (!currentUser) {
      throw UserNotFoundExistsError.withId(data.id);
    }

    // Additional logic checking if user uses his own name/email, etc

    currentUser.update({
      email: data.email,
      name: data.name,
    })

    await this.userRepository.save(currentUser);

    return;
  }
}
