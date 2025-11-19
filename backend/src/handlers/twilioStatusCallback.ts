import { parse } from 'querystring';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { updateLeadStatus } from '../services/dynamoClient';
import { isTwilioSignatureValid } from '../services/twilioClient';
import { badRequest, forbidden, internalError, noContent } from '../utils/http';
import { twilioStatusSchema } from '../utils/validators';

const twilioToLeadStatus: Record<string, Parameters<typeof updateLeadStatus>[1]> = {
  initiated: 'calling',
  ringing: 'calling',
  answered: 'in-progress',
  completed: 'completed',
  failed: 'failed',
  busy: 'failed'
};

export const twilioStatusCallbackHandler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    if (!event.body) {
      return badRequest('Missing body');
    }

    const params = parse(event.body) as Record<string, string>;
    const protocol = event.headers['x-forwarded-proto'] ?? 'https';
    const host =
      event.headers['x-forwarded-host'] ?? event.headers.host ?? event.requestContext.domainName;
    if (!host) {
      console.error('Twilio callback missing host header');
      return internalError('Unable to verify request');
    }
    const requestPath = event.requestContext.http?.path ?? '';
    const baseUrl = `${protocol}://${host}${requestPath}`;
    const url = event.rawQueryString ? `${baseUrl}?${event.rawQueryString}` : baseUrl;
    const signature = event.headers['X-Twilio-Signature'] ?? event.headers['x-twilio-signature'];

    if (!signature) {
      return forbidden('Missing Twilio signature');
    }

    if (!isTwilioSignatureValid({ url, params, signature })) {
      return forbidden('Signature mismatch');
    }

    const payload = twilioStatusSchema.parse(params);
    const leadId = event.queryStringParameters?.leadId ?? payload.LeadId;

    if (!leadId) {
      return badRequest('Missing leadId');
    }

    const statusKey = payload.CallStatus.toLowerCase();
    const status = twilioToLeadStatus[statusKey] ?? 'in-progress';

    await updateLeadStatus(leadId, status, {
      callSid: payload.CallSid,
      lastTwilioStatus: payload.CallStatus,
      endTime: payload.Timestamp
    });

    return noContent();
  } catch (error) {
    console.error('Twilio callback error', error);
    return internalError('Twilio callback failed');
  }
};
