import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
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
import { AuthTokens } from './auth.type';
import { AccountService } from '../account/account.service';
import { AccountStatus } from '../account/account.types';
import { CreateAccountDto } from './dtos/create-account.dto';

@Injectable()
export class AuthService {
  constructor(
    private accountService: AccountService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectQueue(MAIL_QUEUE_NAME)
    private mailQueue: Queue,
  ) {}
  async signUp(createAccountDto: CreateAccountDto): Promise<void> {
    const accountExists = await this.accountService.findOne({ email: createAccountDto.email });
    if (accountExists) {
      throw new BadRequestException('Пользователь с таким почтовым адресом уже зарегистрирован');
    }

    const passwordHash = await this.hashData(createAccountDto.password);

    const mailHash = crypto.createHash('sha1').update(crypto.randomBytes(30).toString('hex')).digest('hex');
    const account = await this.accountService.save({
      codeHash: mailHash,
      email: createAccountDto.email,
      passwordHash,
    });

    console.log('sending to queue...')
    await this.mailQueue.add(MailerProcess.Confirmation, {
      account,
      code: mailHash,
    });
    console.log('done')
  }

  async confirm(codeHash: string): Promise<AuthTokens> {
    const account = await this.accountService.findOne({ codeHash });

    if (!account) {
      throw new BadRequestException('Пользователь не найден');
    }

    const tokens = await this.getTokens({ sub: account.id, email: account.email });
    const hashedRefreshToken = await this.hashRefreshToken(tokens.refreshToken);

    account.status = AccountStatus.Confirmed;
    account.refreshToken = hashedRefreshToken;
    account.codeHash = null;

    await this.accountService.update(account);

    return tokens;
  }

  async signIn(data: AuthDto): Promise<AuthTokens> {
    const account = await this.accountService.findOne({ email: data.email });
    if (!account) throw new BadRequestException('Пользователь не найден');

    const passwordMatches = await argon2.verify(account.password, data.password);
    if (!passwordMatches) throw new BadRequestException('Пользователь не найден');

    const tokens = await this.getTokens({ sub: account.id, email: account.email });

    const hashedRefreshToken = await this.hashRefreshToken(tokens.refreshToken);

    account.refreshToken = hashedRefreshToken;
    await this.accountService.update(account);
    return tokens;
  }

  async logout(accountId: string): Promise<void> {
    await this.accountService.update({ id: accountId, refreshToken: null });
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

  async refreshTokens(accountId: string, refreshToken: string): Promise<AuthTokens> {
    const account = await this.accountService.findOne({ id: accountId });
    if (!account || !account.refreshToken) throw new ForbiddenException('Нет доступа');
    const refreshTokenMatches = await argon2.verify(account.refreshToken, refreshToken);
    if (!refreshTokenMatches) throw new ForbiddenException('Нет доступа');

    const tokens = await this.getTokens({ sub: account.id, email: account.email });
    const hashedRefreshToken = await this.hashRefreshToken(tokens.refreshToken);

    account.refreshToken = hashedRefreshToken;
    await this.accountService.update(account);

    return tokens;
  }

  async getTokens(payload: { sub: string; email: string }): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.accessExp'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.refreshExp'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
