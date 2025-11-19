export type LeadStatus =
  | 'queued'
  | 'calling'
  | 'in-progress'
  | 'completed'
  | 'qualified'
  | 'rejected'
  | 'failed'
  | 'no-consent';

export interface LeadRecord {
  leadId: string;
  name?: string;
  phoneNumber: string;
  inquiryType: 'ca' | 'salon';
  inquiryDetails: string;
  consent: boolean;
  sessionWebhook?: string;
  callSid?: string;
  status: LeadStatus;
  summary?: string;
  score?: number;
  transcriptBucket?: string;
  transcriptKey?: string;
  recordingBucket?: string;
  recordingKey?: string;
  requirements?: string;
  budget?: string | null;
  timeframe?: string | null;
  decisionMaker?: 'yes' | 'no' | 'unknown';
  followUpRecommended?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  initialMessage?: string;
}

export interface CallQueueMessage {
  leadId: string;
  phoneNumber: string;
  inquiryType: 'ca' | 'salon';
  sessionWebhook: string;
}

export interface PostCallPayload {
  leadId: string;
  transcriptBucket: string;
  transcriptKey: string;
  recordingBucket: string;
  recordingKey: string;
  initialMessage?: string;
}
