import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AccessTokenGuard } from './access-token.guard';
import { RefreshTokenGuard } from './refresh-token.guard';

export function JwtAuthGuard(): MethodDecorator {
  return applyDecorators(ApiBearerAuth(), UseGuards(AccessTokenGuard));
}

export function RefreshAuthGuard(): MethodDecorator {
  return applyDecorators(ApiBearerAuth(), UseGuards(RefreshTokenGuard));
}
