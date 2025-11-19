import { EventEmitter } from 'events';
import {
  StartStreamTranscriptionCommand,
  TranscribeStreamingClient,
  TranscriptEvent as AwsTranscriptEvent,
  Result
} from '@aws-sdk/client-transcribe-streaming';
import { env } from './config';

export interface TranscriptEvent {
  text: string;
  isFinal: boolean;
  confidence?: number;
}

export class TranscribeStreamer extends EventEmitter {
  private client = new TranscribeStreamingClient({ region: env.region });
  private audioQueue: Buffer[] = [];
  private closed = false;
  private resolvers: Array<() => void> = [];

  constructor(private languageCode: string = env.transcribeLanguage) {
    super();
    void this.start().catch((error) => {
      this.emit('error', error);
    });
  }

  pushAudio(base64Audio: string) {
    this.audioQueue.push(Buffer.from(base64Audio, 'base64'));
    this.resolvers.forEach((resolve) => resolve());
    this.resolvers = [];
  }

  async stop() {
    this.closed = true;
    this.resolvers.forEach((resolve) => resolve());
    this.resolvers = [];
  }

  private async start() {
    try {
      const command = new StartStreamTranscriptionCommand({
        LanguageCode: this.languageCode,
        MediaEncoding: 'pcm',
        MediaSampleRateHertz: 16000,
        AudioStream: this.audioStream()
      });

      const response = await this.client.send(command);
      for await (const event of response.TranscriptResultStream ?? []) {
        const transcripts = (event as AwsTranscriptEvent).Transcript?.Results;
        if (!transcripts) continue;
        for (const result of transcripts) {
          this.emit('transcript', this.mapResult(result));
        }
      }
    } catch (error) {
      this.emit('error', error);
    }
  }

  private mapResult(result: Result | undefined): TranscriptEvent | undefined {
    if (!result) return undefined;
    const text = result.Alternatives?.[0]?.Transcript;
    if (!text) return undefined;
    const firstItem = result.Alternatives?.[0]?.Items?.[0];
    const confidence = firstItem?.Confidence ? Number(firstItem.Confidence) : undefined;
    const isFinal = result.IsPartial === false;
    return { text, isFinal, confidence };
  }

  private async *audioStream() {
    while (!this.closed || this.audioQueue.length > 0) {
      if (!this.audioQueue.length) {
        await new Promise<void>((resolve) => this.resolvers.push(resolve));
        continue;
      }
      const chunk = this.audioQueue.shift();
      if (!chunk) {
        continue;
      }
      yield { AudioEvent: { AudioChunk: chunk } };
    }
    yield { AudioEvent: { AudioChunk: new Uint8Array() } };
  }
}
