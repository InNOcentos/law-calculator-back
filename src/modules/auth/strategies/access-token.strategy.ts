import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';
import { UserStatus } from '../../user/user.types';
import { JwtPayload } from '../auth.type';
@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ACCESS_JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const user = await this.userService.findOne({ email: payload.email });

    if (user.status !== UserStatus.Confirmed) {
      throw new ForbiddenException('Аккаунт не подтвержден. Перейдите по ссылке в письме для завершения регистрации.');
    }
    return payload;
  }
}
