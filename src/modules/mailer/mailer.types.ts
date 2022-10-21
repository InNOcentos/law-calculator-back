export type Mail = {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
};

export enum MailerProcess {
  Confirmation = 'confirmation',
}
