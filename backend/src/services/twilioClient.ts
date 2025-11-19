import { URL } from 'url';
import twilio, { validateRequest } from 'twilio';
import { requireEnv } from '../utils/env';

const accountSid = requireEnv('TWILIO_ACCOUNT_SID');
const authToken = requireEnv('TWILIO_AUTH_TOKEN');
const fromNumber = requireEnv('TWILIO_PHONE_NUMBER');
const sessionManagerHost = requireEnv('SESSION_MANAGER_HOST');
const statusCallbackUrl = requireEnv('TWILIO_STATUS_CALLBACK_URL');

const client = twilio(accountSid, authToken);

function websocketBase(): string {
  if (/^wss?:\/\//.test(sessionManagerHost)) {
    return sessionManagerHost.replace(/\/$/, '');
  }
  if (/^https?:\/\//.test(sessionManagerHost)) {
    return sessionManagerHost.replace('https://', 'wss://').replace('http://', 'ws://').replace(/\/$/, '');
  }
  return `wss://${sessionManagerHost.replace(/\/$/, '')}`;
}

function buildStreamUrl(leadId: string, inquiryType: 'ca' | 'salon'): string {
  const url = new URL(websocketBase());
  url.pathname = '/twilio';
  url.searchParams.set('leadId', leadId);
  url.searchParams.set('inquiryType', inquiryType);
  return url.toString();
}

export interface OutboundCallOptions {
  to: string;
  leadId: string;
  inquiryType: 'ca' | 'salon';
}

export async function startOutboundCall({ to, leadId, inquiryType }: OutboundCallOptions) {
  const streamUrl = buildStreamUrl(leadId, inquiryType);
  const twiml = `<Response><Start><Stream url="${streamUrl}" /></Start><Say>Connecting you to the AISalesAgent.</Say></Response>`;
  return client.calls.create({
    to,
    from: fromNumber,
    twiml,
    statusCallback: `${statusCallbackUrl}?leadId=${leadId}`,
    statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
  });
}

export function isTwilioSignatureValid(args: {
  url: string;
  params: Record<string, string | undefined>;
  signature?: string;
}): boolean {
  return validateRequest(authToken, args.signature ?? '', args.url, args.params);
}
