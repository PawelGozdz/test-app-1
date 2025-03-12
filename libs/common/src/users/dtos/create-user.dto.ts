import { PickType } from "@nestjs/swagger";

import { UserDto } from "./user.dto";
import { IMetadata } from "../../microservices";

export class CreateUserDto extends PickType(UserDto, ['name', 'email']) {}

export class CreateUserInternalDto {
  data: CreateUserDto;
  _metadata?: IMetadata
}

export class CreateUserResponseDto extends PickType(UserDto, ['id']) {}
