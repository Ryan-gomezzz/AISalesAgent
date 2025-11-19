import { WebSocket } from 'ws';
import { BedrockAgent } from './bedrock';
import { TranscribeStreamer, TranscriptEvent } from './transcribe';
import { PollySynthesizer } from './polly';
import { SessionRecorder } from './recorder';
import { personaForInquiry } from './persona';
import { env } from './config';
import { logger } from './logger';

interface TwilioMessage {
  event: string;
  streamSid?: string;
  media?: { payload: string };
  start?: { streamSid: string };
  stop?: Record<string, unknown>;
}

export class Session {
  private bedrock: BedrockAgent;
  private transcribe = new TranscribeStreamer();
  private polly = new PollySynthesizer();
  private recorder: SessionRecorder;
  private streamSid?: string;
  private closed = false;
  private lowConfidenceCount = 0;

  constructor(
    private socket: WebSocket,
    private leadId: string,
    private inquiryType?: string
  ) {
    this.bedrock = new BedrockAgent(personaForInquiry(this.inquiryType));
    this.recorder = new SessionRecorder(leadId);
    this.transcribe.on('transcript', (event: TranscriptEvent | undefined) => {
      if (event) void this.onTranscript(event);
    });
    this.transcribe.on('error', (error) => {
      logger.error({ err: error, leadId: this.leadId }, 'Transcribe stream error');
      void this.sendSpeech('I am having trouble hearing you. Let me bring a human teammate on the line.');
      void this.terminate();
    });
  }

  handleRawMessage(raw: string) {
    const payload = JSON.parse(raw) as TwilioMessage;
    switch (payload.event) {
      case 'connected':
        break;
      case 'start':
        this.streamSid = payload.start?.streamSid;
        void this.sayConsentMessage();
        break;
      case 'media':
        if (payload.media?.payload) {
          this.recorder.addInboundChunk(payload.media.payload);
          this.transcribe.pushAudio(payload.media.payload);
        }
        break;
      case 'stop':
        void this.terminate();
        break;
      default:
        break;
    }
  }

  private async sayConsentMessage() {
    await this.sendSpeech(
      'This call may be recorded for quality and training purposes. If you do not consent, please hang up now.'
    );
  }

  private async onTranscript(event: TranscriptEvent) {
    if (!event.isFinal) {
      return;
    }
    this.recorder.addTranscriptLine(event.text);
    await this.safeFlushTranscript();

    const confidence = event.confidence ?? 1;
    if (confidence < 0.7) {
      this.lowConfidenceCount += 1;
      if (this.lowConfidenceCount >= 3) {
        await this.sendSpeech('Let me bring a human teammate on since I am having trouble hearing you.');
        await this.terminate();
        return;
      }
      await this.sendSpeech("I'm sorry, I didn't catch that. Could you please repeat it?");
      return;
    }
    this.lowConfidenceCount = 0;

    const thinkingTimeout = setTimeout(() => {
      void this.sendSpeech('Give me just a moment while I check that for you.');
    }, 800);

    try {
      const response = await this.bedrock.generateResponse(event.text);
      clearTimeout(thinkingTimeout);
      await this.sendSpeech(response);
    } catch (error) {
      clearTimeout(thinkingTimeout);
      logger.error({ err: error }, 'Failed to generate response');
      await this.sendSpeech('I am having trouble responding right now. Let me transfer you to a human shortly.');
    }
  }

  private async safeFlushTranscript() {
    try {
      await this.recorder.flushPartialTranscript();
    } catch (error) {
      logger.warn({ err: error, leadId: this.leadId }, 'Failed to flush partial transcript');
    }
  }

  private async sendSpeech(text: string) {
    if (!text.trim() || !this.streamSid) return;
    try {
      const audio = await this.polly.synthesize(text);
      const payload = audio.toString('base64');
      this.socket.send(
        JSON.stringify({
          event: 'media',
          streamSid: this.streamSid,
          track: 'outbound',
          media: { payload }
        })
      );
    } catch (error) {
      logger.error({ err: error, leadId: this.leadId }, 'Failed to stream audio to Twilio');
    }
  }

  async terminate() {
    if (this.closed) return;
    this.closed = true;
    await this.transcribe.stop();
    const { recordingKey, transcriptKey } = await this.recorder.finalize();

    try {
      const response = await fetch(env.postCallWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: this.leadId,
          recordingBucket: env.recordingsBucket,
          recordingKey,
          transcriptBucket: env.transcriptsBucket,
          transcriptKey
        })
      });
      if (!response.ok) {
        logger.error(
          { leadId: this.leadId, status: response.status },
          'Post-call webhook responded with error'
        );
      }
    } catch (error) {
      logger.error({ err: error }, 'Failed to notify post-call webhook');
    }
  }
}
