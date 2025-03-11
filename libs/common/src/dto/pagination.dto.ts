import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsPositive, Max } from "class-validator";
import { Type } from "class-transformer";

export class PaginationDto {
  @ApiProperty({
    description: 'The page number',
    example: 1,
    minimum: 1,
    maximum: 1000,
    default: 1
  })
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsPositive()
  @Max(1000)
  _page: number = 1;

  @ApiProperty({
    description: 'The number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10
  })
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsPositive()
  @Max(100)
  _limit: number = 10;
}