import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { SignOptions } from 'jsonwebtoken';
import { AuthDto } from './dtos/auth.dto';
import { InjectQueue } from '@nestjs/bull';
import { MAIL_QUEUE_NAME } from '../app.types';
import { Queue } from 'bull';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectQueue(MAIL_QUEUE_NAME)
    private mailQueue: Queue,
  ) {}
  async signUp(createUserDto: CreateUserDto): Promise<any> {
    // Check if user exists
    const userExists = await this.userService.findOne({ email: createUserDto.email });
    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    const passwordHash = await this.hashData(createUserDto.password);

    const user = await this.userService.save({
      email: createUserDto.email,
      passwordHash,
    });

    const tokens = await this.getTokens({ sub: user.userId, email: user.email });
    await this.updateRefreshToken(user.userId, tokens.refreshToken);
    const mailHash = crypto.createHash('sha1').update(crypto.randomBytes(30).toString('hex')).digest('hex');
    await this.mailQueue.add('confirmation', {
      user,
      code: mailHash,
    });
    return tokens;
  }

  async signIn(data: AuthDto): Promise<Record<string, string>> {
    // Check if user exists
    const user = await this.userService.findOne({ email: data.email });
    if (!user) throw new BadRequestException('User does not exist');

    const passwordMatches = await argon2.verify(user.password, data.password);
    if (!passwordMatches) throw new BadRequestException('Password is incorrect');

    const tokens = await this.getTokens({ sub: user.userId, email: user.email });
    await this.updateRefreshToken(user.userId, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.userService.update({ userId, refreshToken: null });
  }

  async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.userService.update({ userId: userId, refreshToken: hashedRefreshToken });
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

  async refreshTokens(userId: string, refreshToken: string): Promise<Record<string, string>> {
    const user = await this.userService.findOne({ userId });
    if (!user || !user.refreshToken) throw new ForbiddenException('Access Denied');
    const refreshTokenMatches = await argon2.verify(user.refreshToken, refreshToken);
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
    const tokens = await this.getTokens({ sub: user.userId, email: user.email });
    await this.updateRefreshToken(user.userId, tokens.refreshToken);
    return tokens;
  }

  async getTokens(payload: { sub: string; email: string }): Promise<Record<string, string>> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: '30s',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: '30d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
