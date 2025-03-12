import { PickType } from "@nestjs/swagger";

import { UserDto } from "./user.dto";
import { IMetadata } from "../../microservices";

export class UpdateUserDto extends PickType(UserDto, ['name', 'email', 'id']) {}

export class UpdateUserInternalDto {
  data: UpdateUserDto;
  _metadata?: IMetadata
}

export class UpdateUserResponseDto extends UserDto {}
