import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Почта',
    type: String,
    required: true,
  })
  @IsString()
  email: string;

  @ApiProperty({
    description: 'Пароль',
    type: String,
    required: true,
  })
  @IsString()
  password: string;
}
