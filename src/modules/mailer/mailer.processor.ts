import { MailerService } from './mailer.service';
import { OnQueueActive, OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { MAIL_QUEUE_NAME } from '../app.types';
import { MailerProcess } from './mailer.types';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { UserEntity } from '../user/entities/user.entity';

@Processor(MAIL_QUEUE_NAME)
export class MailerProcessor {
  constructor(private readonly mailerService: MailerService, private readonly configService: ConfigService) {}
  private readonly logger = new Logger(this.constructor.name);

  @OnQueueActive()
  onActive(job: Job): void {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}. Data: ${JSON.stringify(job.data)}`);
  }

  @OnQueueCompleted()
  onComplete(job: Job, result: any): void {
    this.logger.debug(`Completed job ${job.id} of type ${job.name}. Result: ${JSON.stringify(result)}`);
  }

  @OnQueueFailed()
  onError(job: Job<any>, error: any): void {
    this.logger.error(`Failed job ${job.id} of type ${job.name}: ${error.message}`, error.stack);
  }

  @Process(MailerProcess.Confirmation)
  async sendConfirmationEmail(job: Job<{ user: UserEntity; code: string }>): Promise<any> {
    this.logger.log(`Sending confirmation email to '${job.data.user.email}'`);

    let url;

    if (this.configService.get('NODE_ENV') === 'local') {
      url = `http://${this.configService.get('app.httpHost')}:${this.configService.get('app.httpPort')}${this.configService.get(
        'app.httpPrefix',
      )}/auth/${job.data.code}/confirm`;
    } else {
      url = `https://${this.configService.get('app.httpHost')}${this.configService.get('app.httpPrefix')}/auth/${job.data.code}/confirm`;
    }

    try {
      const mail = await this.mailerService.send({
        template: MailerProcess.Confirmation,
        context: {
          ...plainToClass(UserEntity, job.data.user),
          url: url,
        },
        subject: `Добро пожаловать в ${this.configService.get('app.serviceName')}! Пожалуйста, подтвердите ваш адрес электронной почты.`,
        to: job.data.user.email,
      });

      return mail;
    } catch (error) {
      this.logger.error(`Failed to send confirmation email to '${job.data.user.email}'`, error.stack);
      throw error;
    }
  }
}
