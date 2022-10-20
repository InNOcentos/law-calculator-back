import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dtos/auth.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { RefreshTokenGuard } from '../common/guards/refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signUp(@Body() createUserDto: CreateUserDto): Promise<Record<string, string>> {
    return this.authService.signUp(createUserDto);
  }

  @Post('signin')
  signIn(@Body() data: AuthDto): Promise<Record<string, string>> {
    return this.authService.signIn(data);
  }

  @JwtAuthGuard()
  @Get('logout')
  async logOut(@Req() req: Request): Promise<void> {
    this.authService.logout(req.user['sub']);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@Req() req: Request): Promise<Record<string, string>> {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @Get(':code/confirm')
  verify(@Param('code') code: string): string {
    return 'works';
  }

  @JwtAuthGuard()
  @Get('test')
  test() {
    return 'works';
  }
}
