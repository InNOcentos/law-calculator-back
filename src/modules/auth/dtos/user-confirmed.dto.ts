import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UserConfirmedDto {
  @ApiProperty()
  @IsBoolean()
  userConfirmed: boolean;
}
