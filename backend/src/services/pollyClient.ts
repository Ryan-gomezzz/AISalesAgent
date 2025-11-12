import {
  PollyClient,
  SynthesizeSpeechCommand,
  OutputFormat,
  VoiceId,
} from '@aws-sdk/client-polly'
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'

const awsPollyClient = new PollyClient({
  region: process.env.AWS_REGION || 'ap-south-1',
})

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
})

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'aisales-assets-dev'
const VOICE_ID = (process.env.POLLY_VOICE as VoiceId) || VoiceId.Joanna
const AUDIO_EXPIRY_SECONDS = 3600 // 1 hour

interface SynthesizeOptions {
  voiceId?: VoiceId
  outputFormat?: OutputFormat
  returnBase64?: boolean
}

/**
 * Synthesize speech using Amazon Polly
 * Returns either a signed S3 URL or base64-encoded audio
 * TODO: Add support for SSML
 * TODO: Add caching to avoid re-synthesizing same text
 */
export const synthesizeSpeech = async (
  text: string,
  options: SynthesizeOptions = {}
): Promise<{ audioUrl?: string; audioBase64?: string }> => {
  try {
    const voiceId = options.voiceId || VOICE_ID
    const outputFormat = options.outputFormat || OutputFormat.MP3
    const returnBase64 = options.returnBase64 || false

    const command = new SynthesizeSpeechCommand({
      Text: text,
      VoiceId: voiceId,
      OutputFormat: outputFormat,
      Engine: 'neural', // Use neural engine for better quality
    })

    const response = await awsPollyClient.send(command)

    if (!response.AudioStream) {
      throw new Error('No audio stream returned from Polly')
    }

    const audioBuffer = await streamToBuffer(response.AudioStream as ReadableStream)

    if (returnBase64) {
      // Return base64 for immediate playback
      const audioBase64 = audioBuffer.toString('base64')
      const dataUri = `data:audio/${outputFormat.toLowerCase()};base64,${audioBase64}`

      // Also upload to S3 in background for caching
      uploadToS3InBackground(audioBuffer, outputFormat)

      return { audioBase64: dataUri }
    } else {
      // Upload to S3 and return signed URL
      const key = `audio/${uuidv4()}.${outputFormat.toLowerCase()}`
      const audioUrl = await uploadToS3(audioBuffer, key, outputFormat)

      return { audioUrl }
    }
  } catch (error: any) {
    console.error('Error synthesizing speech:', error)
    throw new Error(`Failed to synthesize speech: ${error.message}`)
  }
}

const streamToBuffer = async (stream: ReadableStream): Promise<Buffer> => {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }

  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)))
}

const uploadToS3 = async (
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: `audio/${contentType.toLowerCase()}`,
  })

  await s3Client.send(command)

  // Generate signed URL
  const getObjectCommand = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  const signedUrl = await getSignedUrl(s3Client, getObjectCommand, {
    expiresIn: AUDIO_EXPIRY_SECONDS,
  })

  return signedUrl
}

const uploadToS3InBackground = async (
  buffer: Buffer,
  contentType: string
): Promise<void> => {
  try {
    const key = `audio/${uuidv4()}.${contentType.toLowerCase()}`
    await uploadToS3(buffer, key, contentType)
  } catch (error) {
    console.error('Error uploading audio to S3 in background:', error)
    // Don't throw - this is a background operation
  }
}

export const pollyClient = {
  synthesizeSpeech,
}

