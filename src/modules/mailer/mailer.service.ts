import { ISendMailOptions, MailerService as NodeMailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Mail } from './mailer.types';

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: NodeMailerService) {}

  async send(data: ISendMailOptions): Promise<void> {
    const info = await this.mailerService.sendMail(data);
    return info;
  }
}
