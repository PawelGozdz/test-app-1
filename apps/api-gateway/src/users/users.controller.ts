import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { CreateUserDto, CreateUserResponseDto, GetUsersParamsDto, GetUsersResponseDto, IdDto, PaginationDto, UpdateUserResponseDto } from '@libs/common';

import { UsersService } from './users.service';

@Controller('/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getGetUsers(
    @Query() paramDto: GetUsersParamsDto,
    @Query() paginationDto: PaginationDto,
    @Req() req: Request
  ): Observable<[GetUsersResponseDto]> {
    const correlationId = req['correlationId'] as string;

    return this.usersService.getUsers(paramDto, paginationDto, {
      correlationId
    });
  }

  @Post()
  create(
    @Body() bodyDto: CreateUserDto,
    @Req() req: Request
  ): Observable<CreateUserResponseDto> {
    const correlationId = req['correlationId'] as string;

    return this.usersService.create(bodyDto, {
      correlationId
    });
  }

  @Patch('/:id')
  update(
    @Body() bodyDto: CreateUserDto,
    @Param() paramDto: IdDto,
    @Req() req: Request
  ): Observable<UpdateUserResponseDto> {
    const correlationId = req['correlationId'] as string;

    return this.usersService.update({
      ...bodyDto,
      ...paramDto,
    }, {
      correlationId
    });
  }

  @Delete('/:id')
  delete(
    @Param() paramDto: IdDto,
    @Req() req: Request
  ): Observable<void> {
    const correlationId = req['correlationId'] as string;

    return this.usersService.delete(paramDto, {
      correlationId
    });
  }
}
