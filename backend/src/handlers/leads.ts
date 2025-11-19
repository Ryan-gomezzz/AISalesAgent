import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { listRecentLeads } from '../services/dynamoClient';
import { getSignedAssetUrl } from '../services/s3Client';
import { requireEnv } from '../utils/env';
import { forbidden, ok } from '../utils/http';

const frontendKey = requireEnv('FRONTEND_KEY');

export const listLeadsHandler: APIGatewayProxyHandlerV2 = async (event) => {
  const token = event.headers['x-frontend-key'] ?? event.headers['X-Frontend-Key'];
  if (frontendKey && token !== frontendKey) {
    return forbidden('Invalid admin token');
  }

  const leads = await listRecentLeads(100);
  leads.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));

  const enriched = await Promise.all(
    leads.map(async (lead) => ({
      leadId: lead.leadId,
      name: lead.name,
      phoneNumber: lead.phoneNumber,
      inquiryType: lead.inquiryType,
      inquiryDetails: lead.inquiryDetails,
      status: lead.status,
      score: lead.score,
      summary: lead.summary,
      tags: lead.tags ?? [],
      recordingUrl:
        lead.recordingBucket && lead.recordingKey
          ? await getSignedAssetUrl(lead.recordingBucket, lead.recordingKey)
          : undefined,
      transcriptUrl:
        lead.transcriptBucket && lead.transcriptKey
          ? await getSignedAssetUrl(lead.transcriptBucket, lead.transcriptKey)
          : undefined
    }))
  );

  return ok(enriched);
};
