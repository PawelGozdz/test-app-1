import { PickType } from "@nestjs/swagger";

import { UserDto } from "./user.dto";
import { IMetadata } from "../../microservices";

export class DeleteUserDto extends PickType(UserDto, ['id']) {}

export class DeleteUserInternalDto {
  data: DeleteUserDto;
  _metadata?: IMetadata
}

