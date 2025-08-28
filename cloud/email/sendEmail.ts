import type { SendEmailCommandInput } from '@aws-sdk/client-ses';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import assert from 'node:assert';

const footer = '\n\n\nhttps://smartquery.dev\nThe AI-powered, browser-based database UI.';

export const sendEmail = async (to: string, subject: string, body: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Skipping sending email', { to, subject, body });
    return;
  }

  assert(process.env.SES_EMAIL_IDENTITY_ARN, 'SES_EMAIL_IDENTITY_ARN is not set');
  assert(process.env.AWS_REGION, 'AWS_REGION is not set');

  const client = new SESClient({ region: process.env.AWS_REGION });

  const message = `${body}${footer}`;

  const input = {
    Source: '"SmartQuery" <no-reply@smartquery.dev>',
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8',
      },
      Body: {
        Text: {
          Data: message,
          Charset: 'UTF-8',
        },
        Html: {
          Data: message.replace(/\n/g, '<br>'),
          Charset: 'UTF-8',
        },
      },
    },
    ReturnPath: 'email-feedback@smartquery.dev',
    SourceArn: process.env.SES_EMAIL_IDENTITY_ARN,
  } satisfies SendEmailCommandInput;

  const command = new SendEmailCommand(input);

  await client.send(command);
};
