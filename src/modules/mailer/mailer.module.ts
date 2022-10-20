import { Module } from '@nestjs/common';
import { MailerModule as NodeMailerModule } from '@nestjs-modules/mailer';
import { MailerService } from './mailer.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerProcessor } from './mailer.processor';

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
        defaults: {
          from: `"nest-modulessdadas" <${config.get('mailer.user')}>`,
        },
      }),
    }),
  ],
})
export class MailerModule {}
