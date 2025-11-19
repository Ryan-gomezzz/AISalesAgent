import { config as loadEnv } from 'dotenv';
loadEnv();

const number = (value: string | undefined, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  port: number(process.env.PORT, 8080),
  region: process.env.AWS_REGION ?? 'us-east-1',
  bedrockModelId: process.env.BEDROCK_MODEL_ID ?? 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  pollyVoice: process.env.POLLY_VOICE ?? 'Joanna',
  transcribeLanguage: process.env.TRANSCRIBE_LANGUAGE ?? 'en-US',
  recordingsBucket: process.env.S3_RECORDINGS_BUCKET ?? '',
  transcriptsBucket: process.env.S3_TRANSCRIPTS_BUCKET ?? '',
  postCallWebhook: process.env.POST_CALL_WEBHOOK ?? '',
  maxParallelSessions: number(process.env.MAX_PARALLEL_SESSIONS, 15),
  logLevel: process.env.LOG_LEVEL ?? 'info'
};

if (!env.recordingsBucket || !env.transcriptsBucket || !env.postCallWebhook) {
  throw new Error('Missing S3 bucket configuration or POST_CALL_WEBHOOK for session manager');
}
