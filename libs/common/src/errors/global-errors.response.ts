import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorResponse {
  @ApiProperty({
    description: 'A list of validation errors',
    example: ['email must be an email', 'password should not be empty'],
    required: false,
    nullable: false,
  })
  subErrors: string[];

  @ApiProperty({
    description: 'Data validation exception',
    example: 'Bad Request',
    nullable: false,
  })
  error: string;
}

export class ConflictErrorResponse {
  @ApiProperty({
    description: 'Entity already exists exception',
    example: 'Entity already exists',
    required: true,
    nullable: false,
  })
  error: string;
}

export class NotFoundErrorResponse {
  @ApiProperty({
    description: 'Resource not found exception',
    example: 'Not Found',
    required: true,
    nullable: false,
  })
  error: string;
}

export class ForbiddenErrorResponse {
  @ApiProperty({
    description: 'Resource forbidden exception',
    example: 'Forbidden',
    required: true,
    nullable: false,
  })
  error: string;
}

export class UnauthorizedErrorResponse {
  @ApiProperty({
    description: 'Unauthorized exception',
    example: 'Unaothorized',
    required: true,
    nullable: false,
  })
  error: string;
}
