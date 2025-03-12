import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Apps, CreateUserDto, CreateUserInternalDto, CreateUserResponseDto, DeleteUserDto, DeleteUserInternalDto, GetUsersInternalDto, GetUsersParamsDto, GetUsersResponseDto, IMetadata, ITCPRequest, PaginationDto, TCPPatterns, UpdateUserDto, UpdateUserInternalDto, UpdateUserResponseDto } from '@libs/common';
import { Observable } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(
    @Inject(Apps.USERS_SERVICE)
    private readonly usersService: ClientProxy,
  ) {}

  getUsers(paramDto: GetUsersParamsDto, paginationDto: PaginationDto, _metadata?: IMetadata): Observable<[GetUsersResponseDto]> {
    const pattern = TCPPatterns.GET_USERS;
    const payload: ITCPRequest<GetUsersInternalDto['data']> = {
      data: {
        email: paramDto.email,
        name: paramDto.name,
        id: paramDto.id,
        _limit: paginationDto._limit,
        _page: paginationDto._page,
      },
      _metadata,
    };

    return this.usersService.send<[GetUsersResponseDto]>(
      pattern,
      payload,
    );
  }

  getHealth(): Observable<{ status: 'UP' | 'DOWN' }> {
    const pattern = TCPPatterns.HEALTH_CHECK;
    const payload: ITCPRequest<{}> = {
      data: {
      },
      _metadata: {},
    };

    return this.usersService.send<{ status: 'UP' | 'DOWN' }>(
      pattern,
      payload,
    );
  }

  create(bodyDto: CreateUserDto, _metadata?: IMetadata): Observable<CreateUserResponseDto> {
    const pattern = TCPPatterns.CREATE_USER;
    const payload: ITCPRequest<CreateUserInternalDto['data']> = {
      data: {
        email: bodyDto.email,
        name: bodyDto.name,
      },
      _metadata,
    };

    return this.usersService.send<CreateUserResponseDto>(
      pattern,
      payload,
    );
  }

  update(bodyDto: UpdateUserDto, _metadata?: IMetadata): Observable<UpdateUserResponseDto> {
    const pattern = TCPPatterns.UPDATE_USER;
    const payload: ITCPRequest<UpdateUserInternalDto['data']> = {
      data: {
        email: bodyDto.email,
        name: bodyDto.name,
        id: bodyDto.id,
      },
      _metadata,
    };
    
    return this.usersService.send<UpdateUserResponseDto>(
      pattern,
      payload,
    );
  }

  delete(bodyDto: DeleteUserDto, _metadata?: IMetadata): Observable<void> {
    const pattern = TCPPatterns.DELETE_USER;
    const payload: ITCPRequest<DeleteUserInternalDto['data']> = {
      data: {
        id: bodyDto.id,
      },
      _metadata,
    };

    return this.usersService.send<void>(
      pattern,
      payload,
    );
  }
}
