import { Module } from '@nestjs/common';
import { MailerModule as NodeMailerModule } from '@nestjs-modules/mailer';
import { MailerService } from './mailer.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerProcessor } from './mailer.processor';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { BullModule } from '@nestjs/bull';
import { MAIL_QUEUE_NAME } from '../app.types';

@Module({
  providers: [MailerService, MailerProcessor],
  // controllers: [MailerProcessor],
  exports: [],
  imports: [
    NodeMailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('mailer.host'),
          port: 465,
          secure: true,
          auth: {
            user: config.get('mailer.user'),
            pass: config.get('mailer.password'),
          },
        },
        template: {
          dir: __dirname + '/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
        defaults: {
          from: config.get('mailer.user'),
        },
      }),
    }),
  ],
})
export class MailerModule {}
