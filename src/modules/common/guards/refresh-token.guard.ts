import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {
  override canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    return super.canActivate(context);
  }

  override handleRequest(err, user, info): any {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException('Пользователь не авторизован');
    }
    return user;
  }
}
