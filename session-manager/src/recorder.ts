import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { env } from './config';

export class SessionRecorder {
  private inboundAudio: Buffer[] = [];
  private transcriptParts: string[] = [];
  private s3 = new S3Client({ region: env.region });

  constructor(private leadId: string) {}

  addInboundChunk(base64Audio: string) {
    this.inboundAudio.push(Buffer.from(base64Audio, 'base64'));
  }

  addTranscriptLine(line: string) {
    this.transcriptParts.push(line);
  }

  async flushPartialTranscript(): Promise<void> {
    const key = `transcripts/${this.leadId}.partial.txt`;
    await this.s3.send(
      new PutObjectCommand({
        Bucket: env.transcriptsBucket,
        Key: key,
        Body: this.transcriptParts.join('\n'),
        ContentType: 'text/plain'
      })
    );
  }

  async finalize(): Promise<{ recordingKey: string; transcriptKey: string }> {
    const recordingKey = `recordings/${this.leadId}-${Date.now()}.pcm`;
    const transcriptKey = `transcripts/${this.leadId}-${Date.now()}.txt`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: env.recordingsBucket,
        Key: recordingKey,
        Body: Buffer.concat(this.inboundAudio),
        ContentType: 'audio/pcm'
      })
    );

    await this.s3.send(
      new PutObjectCommand({
        Bucket: env.transcriptsBucket,
        Key: transcriptKey,
        Body: this.transcriptParts.join('\n'),
        ContentType: 'text/plain'
      })
    );

    return { recordingKey, transcriptKey };
  }
}
