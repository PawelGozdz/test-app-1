import { ApiProperty, IntersectionType, PickType } from "@nestjs/swagger";

import { IMetadata } from "../../microservices";
import { PaginationDto } from "../../dto";

import { UserDto } from "./user.dto";
import { IsOptional } from "class-validator";

class FilterDto extends PickType(UserDto, ['name', 'id', 'email']) {
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  id: string;
  
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  name: string;
  
  @ApiProperty({
    required: false,
  })
  @IsOptional()
  email: string;
}

export class GetUsersParamsDto extends FilterDto {}

export class GetUsersInternalDto {
  data: GetUsersParamsDto & PaginationDto;
  _metadata?: IMetadata;
}

export class GetUsersResponseDto extends UserDto {}