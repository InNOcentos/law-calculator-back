import { Module } from '@nestjs/common';
import { MailerModule as NodeMailerModule, MailerService } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  providers: [],
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
