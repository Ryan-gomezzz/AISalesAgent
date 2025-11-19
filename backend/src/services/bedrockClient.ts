import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { region, requireEnv } from '../utils/env';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const client = new BedrockRuntimeClient({ region: region() });
const modelId = requireEnv('BEDROCK_MODEL_ID');

export async function invokeClaudeJson<T>(args: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<T> {
  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    system: args.system,
    messages: [{ role: 'user', content: [{ type: 'text', text: args.user }] }],
    temperature: args.temperature ?? 0,
    max_tokens: args.maxTokens ?? 1024
  };

  const command = new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(payload)
  });

  const response = await client.send(command);
  const text = Buffer.from(response.body ?? []).toString('utf-8');
  const parsed = JSON.parse(text);
  const completion = parsed?.output?.content?.[0]?.text as string;
  if (!completion) {
    throw new Error('Bedrock response missing text');
  }
  return JSON.parse(completion) as T;
}

export async function invokeClaudeText(
  messages: Message[],
  system: string,
  maxTokens = 512
): Promise<string> {
  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    system,
    messages: messages.map((msg) => ({ role: msg.role, content: [{ type: 'text', text: msg.content }] })),
    max_tokens: maxTokens,
    temperature: 0.3
  };

  const response = await client.send(
    new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload)
    })
  );
  const text = Buffer.from(response.body ?? []).toString('utf-8');
  const parsed = JSON.parse(text);
  const completion = parsed?.output?.content?.[0]?.text as string;
  if (!completion) {
    throw new Error('Bedrock response missing text');
  }
  return completion;
}
