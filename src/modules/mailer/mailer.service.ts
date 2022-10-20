import { MailerService as NodeMailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Mail } from './mailer.types';

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: NodeMailerService) {}

  async send(data: Mail): Promise<void> {
    const info = await this.mailerService.sendMail({
      to: data.to, // list of receivers
      from: data.from,
      subject: data.subject,
      text: data.text,
      html: data.html,
    });
    return info;
  }
}
