import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dtos/auth.dto';
import { JwtAuthGuard, RefreshAuthGuard } from '../common/guards/auth.guard';
import { AuthTokens, UserConfirmed } from './auth.type';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dtos/create-user.dto';
import { AuthTokensDto } from './dtos/auth-tokens.dto';
import { UserConfirmedDto } from './dtos/user-confirmed.dto';

@Controller('auth')
@ApiTags('Авторизация/Регистрация')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: 'Регистрация',
  })
  @ApiResponse({ status: HttpStatus.OK, type: AuthTokensDto })
  @HttpCode(HttpStatus.OK)
  @Post('signup')
  signUp(@Body() createUserDto: CreateUserDto): Promise<AuthTokens> {
    return this.authService.signUp(createUserDto);
  }

  @ApiOperation({
    summary: 'Авторизация',
  })
  @ApiResponse({ status: HttpStatus.OK, type: AuthTokensDto })
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signIn(@Body() data: AuthDto): Promise<AuthTokens> {
    return this.authService.signIn(data);
  }

  @JwtAuthGuard()
  @ApiOperation({
    summary: 'Выход',
  })
  @ApiResponse({ status: HttpStatus.OK })
  @HttpCode(HttpStatus.OK)
  @Get('logout')
  async logOut(@Req() req: Request): Promise<void> {
    return this.authService.logout(req.user['sub']);
  }

  @RefreshAuthGuard()
  @ApiOperation({
    summary: 'Обновление токена',
  })
  @ApiResponse({ status: HttpStatus.OK, type: AuthTokensDto })
  @HttpCode(HttpStatus.OK)
  @Get('refresh')
  refreshTokens(@Req() req: Request): Promise<AuthTokens> {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @ApiOperation({
    summary: 'Вебхук для подтверждения почты',
  })
  @ApiResponse({ status: HttpStatus.OK, type: UserConfirmedDto })
  @HttpCode(HttpStatus.OK)
  @Get(':code/confirm')
  confirm(@Param('code') codeHash: string): Promise<UserConfirmed> {
    return this.authService.confirm(codeHash);
  }

  @JwtAuthGuard()
  @ApiOperation({
    summary: 'Тестовый защищенный эндпоинт',
  })
  @ApiResponse({ status: HttpStatus.OK })
  @HttpCode(HttpStatus.OK)
  @Get('test')
  test(): string {
    return 'works';
  }
}
