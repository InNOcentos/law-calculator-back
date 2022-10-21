import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({
    description: 'Почта',
    type: String,
    required: true,
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Пароль',
    type: String,
    required: true,
  })
  @IsString()
  password: string;
}
