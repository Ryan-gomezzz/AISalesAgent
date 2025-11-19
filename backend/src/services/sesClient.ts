import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { requireEnv, region } from '../utils/env';

const ses = new SESClient({ region: region() });
const fromEmail = requireEnv('SES_FROM_EMAIL');
const toEmail = requireEnv('SES_TO_EMAIL');

export interface LeadEmailPayload {
  leadId: string;
  phoneNumber: string;
  score: number;
  summary: string;
  name?: string;
  serviceType?: 'ca' | 'salon';
  transcriptUrl?: string;
  recordingUrl?: string;
}

export async function sendLeadSummaryEmail(payload: LeadEmailPayload): Promise<void> {
  const subject = `AISalesAgent lead ${payload.leadId} scored ${payload.score}`;
  const bodyLines = [
    `Lead ID: ${payload.leadId}`,
    payload.name ? `Name: ${payload.name}` : undefined,
    payload.serviceType ? `Service: ${payload.serviceType}` : undefined,
    `Phone: ${payload.phoneNumber}`,
    `Score: ${payload.score}`,
    `Summary: ${payload.summary}`,
    payload.transcriptUrl ? `Transcript: ${payload.transcriptUrl}` : undefined,
    payload.recordingUrl ? `Recording: ${payload.recordingUrl}` : undefined
  ]
    .filter(Boolean)
    .join('\n');

  await ses.send(
    new SendEmailCommand({
      Destination: { ToAddresses: [toEmail] },
      Source: fromEmail,
      Message: {
        Subject: { Data: subject },
        Body: { Text: { Data: bodyLines } }
      }
    })
  );
}
