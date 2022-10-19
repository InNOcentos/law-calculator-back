import { MailerService as NodeMailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: NodeMailerService) {}

  async send(): Promise<void> {
    const info = await this.mailerService.sendMail({
      to: 'smrnvbrs@gmail.com', // list of receivers
      from: 'lawcalc@mail.ru', // sender address
      subject: 'Testing Nest MailerModuleeee 123123123 ✔', // Subject line
      text: 'welcome', // plaintext body
      html: '<b>welcome</b>', // HTML body content
    });
  }
}
