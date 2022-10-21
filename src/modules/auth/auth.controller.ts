import { BadRequestException, Body, Controller, Get, HttpException, Param, Post, Req, UseFilters } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dtos/auth.dto';
import { JwtAuthGuard, RefreshAuthGuard } from '../common/guards/auth.guard';
import { AuthTokens } from './auth.type';
import { ApiTags } from '@nestjs/swagger';
import { CreateAccountDto } from './dtos/create-account.dto';

@Controller('auth')
@ApiTags('Авторизация/Регистрация')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signUp(@Body() createAccountDto: CreateAccountDto): Promise<void> {
    return this.authService.signUp(createAccountDto);
  }

  @Post('signin')
  signIn(@Body() data: AuthDto): Promise<AuthTokens> {
    return this.authService.signIn(data);
  }

  @JwtAuthGuard()
  @Get('logout')
  async logOut(@Req() req: Request): Promise<void> {
    return this.authService.logout(req.user['sub']);
  }

  @RefreshAuthGuard()
  @Get('refresh')
  refreshTokens(@Req() req: Request): Promise<AuthTokens> {
    const accountId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    return this.authService.refreshTokens(accountId, refreshToken);
  }

  @Get(':code/confirm')
  confirm(@Param('code') codeHash: string): Promise<AuthTokens> {
    return this.authService.confirm(codeHash);
  }

  @JwtAuthGuard()
  @Get('test')
  test() {
    return 'works';
  }
}
