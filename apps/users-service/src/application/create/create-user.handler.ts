import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { CreateUserInternalDto, CreateUserResponseDto } from '@libs/common';
import { IUserCommandRepository, User, UserAlreadyExistsError } from '../../domain';

@Injectable()
export class CreateUserHandler {
  constructor(
    private readonly userRepository: IUserCommandRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  async execute(dto: CreateUserInternalDto): Promise<CreateUserResponseDto> {
    this.logger.info(dto, 'Creating user:');

    const data = dto.data;

    const currentUsers = await this.userRepository.getOneByNameOrEmail(data.name, data.email);

    if (currentUsers.length) {
      if (currentUsers.find(u => u.name === data.name)) {
        throw UserAlreadyExistsError.withName(data.name);
      }

      throw UserAlreadyExistsError.withEmail(data.email);
    }

    // Additional logic here if needed

    const userInstance = this.createInstance(dto);

    await this.userRepository.save(userInstance);

    return { id: userInstance.id };
  }

  private createInstance(dto: CreateUserInternalDto) {
    return User.create({
      name: dto.data.name,
      email: dto.data.email,
    });
  }
}
