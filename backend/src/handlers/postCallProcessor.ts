import { APIGatewayProxyHandlerV2, SQSEvent } from 'aws-lambda';
import { ZodError } from 'zod';
import { invokeClaudeJson } from '../services/bedrockClient';
import { getLead, updateLeadStatus, updateLeadSummary } from '../services/dynamoClient';
import { getObjectAsString } from '../services/s3Client';
import { sendLeadSummaryEmail } from '../services/sesClient';
import { enqueuePostCallJob } from '../services/sqsClient';
import { LeadRecord, PostCallPayload } from '../types/lead';
import { badRequest, internalError, ok } from '../utils/http';
import { parseExtractedLead } from '../utils/leadSummary';
import { postCallPayloadSchema } from '../utils/validators';

const systemPrompt = [
  'You extract structured lead information and score CA & Salon inquiries.',
  'WHEN YOU RESPOND: output valid JSON ONLY, no prose.',
  'Required JSON schema:',
  '{"name":"","phone":"","serviceType":"","requirements":"","budget":"","timeframe":"","decisionMaker":"","score":1,"summary":"","followUpRecommended":false,"tags":[]}'
].join('\n');

async function processPayload(payload: PostCallPayload): Promise<void> {
  const transcript = await getObjectAsString(payload.transcriptBucket, payload.transcriptKey);
  const lead = await getLead(payload.leadId);
  const phoneNumber = lead?.phoneNumber ?? payload.leadId;
  const serviceType = lead?.inquiryType ?? 'ca';
  const initialMessage = payload.initialMessage ?? lead?.initialMessage ?? lead?.inquiryDetails ?? '';

  const response = await invokeClaudeJson<unknown>({
    system: systemPrompt,
    user: JSON.stringify({
      leadId: payload.leadId,
      phoneNumber,
      serviceType,
      transcript,
      initialMessage
    }),
    maxTokens: 800
  });

  const summary = parseExtractedLead(response);
  const status = summary.score >= 7 ? 'qualified' : summary.score <= 3 ? 'rejected' : 'completed';
  const summaryUpdate: Partial<LeadRecord> = {
    inquiryType: serviceType,
    summary: summary.summary,
    score: summary.score,
    requirements: summary.requirements,
    budget: summary.budget,
    timeframe: summary.timeframe,
    decisionMaker: summary.decisionMaker,
    followUpRecommended: summary.followUpRecommended,
    tags: summary.tags,
    transcriptBucket: payload.transcriptBucket,
    transcriptKey: payload.transcriptKey,
    recordingBucket: payload.recordingBucket,
    recordingKey: payload.recordingKey,
    status
  };

  if (summary.name?.trim()) {
    summaryUpdate.name = summary.name.trim();
  } else if (lead?.name) {
    summaryUpdate.name = lead.name;
  }

  if (summary.phone?.trim()) {
    summaryUpdate.phoneNumber = summary.phone.trim();
  } else if (lead?.phoneNumber) {
    summaryUpdate.phoneNumber = lead.phoneNumber;
  }

  await updateLeadSummary(payload.leadId, summaryUpdate);

  await updateLeadStatus(payload.leadId, status);

  const emailPhone = summary.phone?.trim() || lead?.phoneNumber || phoneNumber;
  const emailName = summary.name?.trim() || lead?.name;

  await sendLeadSummaryEmail({
    leadId: payload.leadId,
    phoneNumber: emailPhone,
    score: summary.score,
    summary: summary.summary,
    name: emailName,
    serviceType,
    transcriptUrl: `s3://${payload.transcriptBucket}/${payload.transcriptKey}`,
    recordingUrl: `s3://${payload.recordingBucket}/${payload.recordingKey}`
  });
}

function parsePayload(raw: unknown): PostCallPayload {
  return postCallPayloadSchema.parse(raw) as PostCallPayload;
}

export const postCallProcessorHandler = async (event: SQSEvent | PostCallPayload) => {
  if ('Records' in event) {
    for (const record of event.Records) {
      try {
        const payload = parsePayload(JSON.parse(record.body));
        await processPayload(payload);
      } catch (error) {
        console.error('Failed to process post-call message', error);
      }
    }
    return;
  }
  const payload = parsePayload(event);
  await processPayload(payload);
};

export const postCallWebhookHandler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    if (!event.body) {
      return badRequest('Missing body');
    }
    const payload = parsePayload(JSON.parse(event.body));
    await enqueuePostCallJob(payload);
    return ok({ status: 'queued', leadId: payload.leadId });
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest('Invalid payload');
    }
    console.error('postCallWebhook error', error);
    return internalError('Unable to queue post-call job');
  }
};
