import { MailerModule } from './mailer/mailer.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Configuration from './app.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseOptionsFactory } from './database/options/factory';
import { AuthModule } from './auth/auth.module';
import { BullModule } from '@nestjs/bull';
import { UserModule } from './user/user.module';
import { APP_FILTER } from '@nestjs/core';
import { ApplicationExceptionFilter } from './common/filters/application.filter';
import { CbrModule } from './cbr/cbr.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('queue.host'),
          port: config.get('queue.port'),
        },
      }),
    }),
    ConfigModule.forRoot({
      load: [Configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => databaseOptionsFactory(config),
    }),
    MailerModule,
    UserModule,
    AuthModule,
    MailerModule,
    CbrModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: ApplicationExceptionFilter }],
})
export class AppModule {}
