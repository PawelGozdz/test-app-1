import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { TCPPatterns } from '@libs/common';

import { CreateUserHandler, DeleteUserHandler, GetManyUsersHandler, UpdateUserHandler } from './application';

@Controller()
export class UsersServiceController {
  constructor(
    private readonly createHandler: CreateUserHandler,
    private readonly updateHandler: UpdateUserHandler,
    private readonly deleteHandler: DeleteUserHandler,
    private readonly getManyHandler: GetManyUsersHandler,
  ) {}

  @MessagePattern(TCPPatterns.GET_USERS, Transport.TCP)
  getUsers(
    @Payload() data: any
  ) {
    return this.getManyHandler.execute(data);
  }

  @MessagePattern(TCPPatterns.CREATE_USER, Transport.TCP)
  create(
    @Payload() data: any
  ) {
    return this.createHandler.execute(data);
  }
  
  @MessagePattern(TCPPatterns.UPDATE_USER, Transport.TCP)
  update(
    @Payload() data: any
  ) {
    return this.updateHandler.execute(data);
  }

  @MessagePattern(TCPPatterns.DELETE_USER, Transport.TCP)
  delete(
    @Payload() data: any
  ) {
    return this.deleteHandler.execute(data);
  }
}
