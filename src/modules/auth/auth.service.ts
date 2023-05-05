import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignOptions } from 'jsonwebtoken';
import { AuthDto } from './dtos/auth.dto';
import { InjectQueue } from '@nestjs/bull';
import { MAIL_QUEUE_NAME } from '../app.types';
import { Queue } from 'bull';
import * as crypto from 'crypto';
import { MailerProcess } from '../mailer/mailer.types';
import { AuthTokens, JwtPayload, SignupResponse, UserConfirmed } from './auth.type';
import { UserService } from '../user/user.service';
import { UserStatus } from '../user/user.types';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectQueue(MAIL_QUEUE_NAME)
    private mailQueue: Queue,
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<AuthTokens> {
    const userExists = await this.userService.findOne({ email: createUserDto.email });
    if (userExists) {
      throw new BadRequestException('Пользователь с таким почтовым адресом уже зарегистрирован');
    }

    const passwordHash = await this.hashData(createUserDto.password);

    const mailHash = crypto.createHash('sha1').update(crypto.randomBytes(30).toString('hex')).digest('hex');
    const user = await this.userService.save({
      codeHash: mailHash,
      email: createUserDto.email,
      passwordHash,
    });
    try {
      await this.mailQueue.add(MailerProcess.Confirmation, {
        user,
        code: mailHash,
      });
    } catch (err) {
      console.log(err);
      await this.userService.delete({ email: createUserDto.email });
      throw new BadRequestException('Произошла неизвестная ошибка. Попробуйте позднее');
    }

    const tokens = await this.getTokens({ sub: user.id, email: user.email });
    const hashedRefreshToken = await this.hashRefreshToken(tokens.refreshToken);

    user.refreshToken = hashedRefreshToken;

    await this.userService.update(user);

    return tokens;
  }

  async confirm(codeHash: string): Promise<UserConfirmed> {
    const user = await this.userService.findOne({ codeHash });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    user.status = UserStatus.Confirmed;
    user.codeHash = null;

    try {
      await this.userService.update(user);
    } catch (err) {
      return {
        userConfirmed: false,
      };
    }

    return {
      userConfirmed: true,
    };
  }

  async signIn(data: AuthDto): Promise<AuthTokens> {
    const user = await this.userService.findOne({ email: data.email });
    if (!user) throw new NotFoundException('Пользователь не найден');

    const passwordMatches = await argon2.verify(user.password, data.password);
    if (!passwordMatches) throw new NotFoundException('Пользователь не найден');

    const tokens = await this.getTokens({ sub: user.id, email: user.email });

    const hashedRefreshToken = await this.hashRefreshToken(tokens.refreshToken);

    user.refreshToken = hashedRefreshToken;
    await this.userService.update(user);
    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.userService.update({ id: userId, refreshToken: null });
  }

  async hashRefreshToken(refreshToken: string): Promise<string> {
    const hashedRefreshToken = await this.hashData(refreshToken);
    return hashedRefreshToken;
  }

  hashData(data: string): Promise<string> {
    return argon2.hash(data);
  }

  get signOptions(): Partial<SignOptions> {
    return {
      algorithm: this.configService.get('jwt.alg'),
      audience: this.configService.get('jwt.aud'),
      issuer: this.configService.get('jwt.iss'),
    };
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<AuthTokens> {
    const user = await this.userService.findOne({ id: userId });
    if (!user || !user.refreshToken) throw new ForbiddenException('Нет доступа');
    const refreshTokenMatches = await argon2.verify(user.refreshToken, refreshToken);
    if (!refreshTokenMatches) throw new ForbiddenException('Нет доступа');

    const tokens = await this.getTokens({ sub: user.id, email: user.email });
    const hashedRefreshToken = await this.hashRefreshToken(tokens.refreshToken);

    user.refreshToken = hashedRefreshToken;
    await this.userService.update(user);

    return tokens;
  }

  async getTokens(payload: JwtPayload): Promise<AuthTokens> {
    console.log(this.configService.get('jwt'));
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: this.configService.get<string>('jwt.accessExp'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExp'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
