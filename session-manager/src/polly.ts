import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import { env } from './config';

export class PollySynthesizer {
  private client = new PollyClient({ region: env.region });

  async synthesize(text: string): Promise<Buffer> {
    const response = await this.client.send(
      new SynthesizeSpeechCommand({
        OutputFormat: 'pcm',
        VoiceId: env.pollyVoice,
        SampleRate: '16000',
        Text: text
      })
    );

    const arrayBuffer = await response.AudioStream?.transformToByteArray();
    if (!arrayBuffer) {
      throw new Error('Polly returned empty audio stream');
    }
    return Buffer.from(arrayBuffer);
  }
}
