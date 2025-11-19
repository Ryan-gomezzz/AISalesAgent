import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { env } from './config';

type Message = { role: 'user' | 'assistant'; content: string };

export class BedrockAgent {
  private client = new BedrockRuntimeClient({ region: env.region });
  private history: Message[] = [];

  constructor(private persona: string) {}

  addAssistantMessage(text: string) {
    this.history.push({ role: 'assistant', content: text });
    this.trimHistory();
  }

  addUserMessage(text: string) {
    this.history.push({ role: 'user', content: text });
    this.trimHistory();
  }

  private trimHistory() {
    const tokenBuffer = 6;
    if (this.history.length > tokenBuffer) {
      this.history = this.history.slice(this.history.length - tokenBuffer);
    }
  }

  async generateResponse(userText: string): Promise<string> {
    this.addUserMessage(userText);

    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      system: this.persona,
      messages: this.history.map((message) => ({
        role: message.role,
        content: [{ type: 'text', text: message.content }]
      })),
      max_tokens: 400,
      temperature: 0.4
    };

    const command = new InvokeModelCommand({
      modelId: env.bedrockModelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload)
    });

    const response = await this.client.send(command);
    const body = Buffer.from(response.body ?? []).toString('utf-8');
    const parsed = JSON.parse(body);
    const completion = parsed?.output?.content?.[0]?.text as string;
    if (!completion) {
      throw new Error('Bedrock response missing text');
    }

    this.addAssistantMessage(completion);
    return completion;
  }
}
