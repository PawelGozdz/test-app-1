import { IsAlphanumeric, IsDefined, IsEmail, IsISO8601, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IdDto } from "../../dto";

export class UserDto extends IdDto {
  @ApiProperty({
    description: 'Alphanumeric name of the user containing only letters and numbers',
    example: 'IamUser',
    minLength: 2,
    maxLength: 20,
    required: true,
  })
  @IsDefined()
  @Length(2, 20)
  @IsAlphanumeric()
  name: string;
  
  @ApiProperty({
    description: 'Email of the user',
    example: 'test@test.com',
    minLength: 5,
    maxLength: 40,
    required: true,
  })
  @IsDefined()
  @Length(5, 40)
  @IsEmail()
  email: string;
  
  @ApiProperty({
    description: 'Date of creation of the user',
    example: '2021-10-01T00:00:00.000Z',
    required: true,
  })
  @IsDefined()
  @IsISO8601()
  createdAt: string;
}