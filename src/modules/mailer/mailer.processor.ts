import { MailerService } from './mailer.service';
import { OnQueueActive, OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { MAIL_QUEUE_NAME } from '../app.types';
import { UserEntity } from '../user/entities/user.entity';

@Processor(MAIL_QUEUE_NAME)
export class MailerProcessor {
  constructor(private readonly mailerService: MailerService) {}
  private readonly logger = new Logger(this.constructor.name);

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}. Data: ${JSON.stringify(job.data)}`);
  }

  @OnQueueCompleted()
  onComplete(job: Job, result: any) {
    this.logger.debug(`Completed job ${job.id} of type ${job.name}. Result: ${JSON.stringify(result)}`);
  }

  @OnQueueFailed()
  onError(job: Job<any>, error: any) {
    this.logger.error(`Failed job ${job.id} of type ${job.name}: ${error.message}`, error.stack);
  }

  @Process('confirmation')
  async sendConfirmationEmail(job: Job<{ user: UserEntity; code: string }>): Promise<any> {
    this.logger.log(`Sending confirmation email to '${job.data.user.email}'`);

    const url = `http://localhost:3000/api/auth/${job.data.code}/confirm`;

    try {
      const info = await this.mailerService.send({
        to: job.data.user.email, // list of receivers
        from: 'lawcalc@mail.ru', // sender address
        subject: 'Welcome to Law calc Please Confirm Your Email Address', // Subject line
        text: `Verify your email: ${url}`, // plaintext body
        html: `<b>Verify your email: ${url}</b>`, // HTML body content
      });
      console.log(info);

      return info;
    } catch (error) {
      this.logger.error(`Failed to send confirmation email to '${job.data.user.email}'`, error.stack);
      throw error;
    }
  }
}
