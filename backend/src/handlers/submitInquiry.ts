import { URL } from 'url';
import { APIGatewayProxyHandlerV2, SQSEvent } from 'aws-lambda';
import { v4 as uuid } from 'uuid';
import { ZodError } from 'zod';
import { putLead, updateLeadStatus } from '../services/dynamoClient';
import { enqueueCallJob } from '../services/sqsClient';
import { startOutboundCall } from '../services/twilioClient';
import { CallQueueMessage, LeadRecord } from '../types/lead';
import { requireEnv } from '../utils/env';
import { badRequest, internalError, ok } from '../utils/http';
import { leadFormSchema } from '../utils/validators';

const sessionManagerHost = requireEnv('SESSION_MANAGER_HOST');

function normalizeSessionManagerHost(): string {
  if (/^wss?:\/\//.test(sessionManagerHost)) {
    return sessionManagerHost.replace(/\/$/, '');
  }
  if (/^https?:\/\//.test(sessionManagerHost)) {
    return sessionManagerHost.replace('https://', 'wss://').replace('http://', 'ws://').replace(/\/$/, '');
  }
  return `wss://${sessionManagerHost.replace(/\/$/, '')}`;
}

function buildSessionWebhook(params: Record<string, string>): string {
  const base = normalizeSessionManagerHost();
  const url = new URL(base);
  url.pathname = '/twilio';
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return url.toString();
}

export const submitInquiryHandler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    if (!event.body) {
      return badRequest('Body is required');
    }
    const parsed = leadFormSchema.parse(JSON.parse(event.body));
    const leadId = uuid();
    const now = new Date().toISOString();
    const sessionWebhook = buildSessionWebhook({ leadId, inquiryType: parsed.inquiryType });

    const record: LeadRecord = {
      leadId,
      name: parsed.name,
      phoneNumber: parsed.phoneNumber,
      inquiryType: parsed.inquiryType,
      inquiryDetails: parsed.inquiryDetails,
      consent: parsed.consent,
      sessionWebhook,
      status: 'queued',
      createdAt: now,
      updatedAt: now,
      initialMessage: parsed.inquiryDetails
    };

    await putLead(record);

    const job: CallQueueMessage = {
      leadId,
      phoneNumber: parsed.phoneNumber,
      inquiryType: parsed.inquiryType,
      sessionWebhook
    };
    await enqueueCallJob(job);

    return ok({ status: 'success', inquiryId: leadId });
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest('Validation failed');
    }
    console.error('submitInquiry error', error);
    return internalError('Unable to submit inquiry');
  }
};

export const initiateCallWorker = async (event: SQSEvent) => {
  for (const record of event.Records) {
    let message: CallQueueMessage | undefined;
    try {
      message = JSON.parse(record.body) as CallQueueMessage;
      const call = await startOutboundCall({
        to: message.phoneNumber,
        leadId: message.leadId,
        inquiryType: message.inquiryType
      });
      await updateLeadStatus(message.leadId, 'calling', {
        callSid: call.sid,
        sessionWebhook: message.sessionWebhook
      });
    } catch (err) {
      console.error('call worker failed', err);
      if (message?.leadId) {
        await updateLeadStatus(message.leadId, 'failed', {
          failureReason: (err as Error).message
        });
      }
    }
  }
};
