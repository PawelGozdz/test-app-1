import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsUUID } from "class-validator";

export class IdDto {
  @ApiProperty({
    description: 'Unique identifier of the entity in UUID format',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: true,
  })
  @IsUUID()
  @IsDefined() 
  id: string;
}
