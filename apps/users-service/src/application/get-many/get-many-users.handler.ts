import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { GetUsersInternalDto, GetUsersResponseDto } from '@libs/common';
import { IUserQueryRepository, UserInfo } from '../../domain';

@Injectable()
export class GetManyUsersHandler {
  constructor(
    private readonly userRepository: IUserQueryRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  async execute(dto: GetUsersInternalDto): Promise<GetUsersResponseDto[]> {
    this.logger.info(dto, 'Getting users:');

    const users = await this.userRepository.getMany(dto);

    return this.mapResponse(users);
  }

  private mapResponse(users: UserInfo[]) {
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    }));
  }
}
