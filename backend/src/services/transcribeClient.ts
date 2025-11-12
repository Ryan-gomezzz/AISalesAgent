import {
  TranscribeClient,
  StartTranscriptionJobCommand,
  GetTranscriptionJobCommand,
  TranscriptionJobStatus,
} from '@aws-sdk/client-transcribe'
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

const transcribeClient = new TranscribeClient({
  region: process.env.AWS_REGION || 'ap-south-1',
})

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
})

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'aisales-assets-dev'
const TRANSCRIBE_ROLE_ARN = process.env.TRANSCRIBE_ROLE_ARN || ''

/**
 * Upload audio to S3 and start a Transcribe job
 * TODO: Implement streaming transcription for real-time use
 * TODO: Add support for custom vocabulary
 * TODO: Add job status polling with timeout
 */
export const startTranscriptionJob = async (
  audioBuffer: Buffer,
  mediaFormat: string = 'webm'
): Promise<{ jobId: string; s3Key: string }> => {
  try {
    const jobId = `transcribe-${uuidv4()}`
    const s3Key = `transcribe-input/${jobId}.${mediaFormat}`

    // Upload audio to S3
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: audioBuffer,
      ContentType: `audio/${mediaFormat}`,
    })

    await s3Client.send(putCommand)

    const s3Uri = `s3://${BUCKET_NAME}/${s3Key}`

    // Start transcription job
    const startCommand = new StartTranscriptionJobCommand({
      TranscriptionJobName: jobId,
      Media: {
        MediaFileUri: s3Uri,
      },
      MediaFormat: mediaFormat,
      LanguageCode: 'en-US',
      OutputBucketName: BUCKET_NAME,
      OutputKey: `transcribe-output/${jobId}.json`,
      Settings: {
        ShowSpeakerLabels: false,
        MaxAlternatives: 1,
      },
      ...(TRANSCRIBE_ROLE_ARN && { IdentityRoleArn: TRANSCRIBE_ROLE_ARN }),
    })

    await transcribeClient.send(startCommand)

    return { jobId, s3Key }
  } catch (error: any) {
    console.error('Error starting transcription job:', error)
    throw new Error(`Failed to start transcription job: ${error.message}`)
  }
}

/**
 * Get transcription job result
 * TODO: Add polling logic with timeout
 * TODO: Add retry logic for failed jobs
 */
export const getTranscriptionResult = async (
  jobId: string
): Promise<string> => {
  try {
    const command = new GetTranscriptionJobCommand({
      TranscriptionJobName: jobId,
    })

    const response = await transcribeClient.send(command)
    const job = response.TranscriptionJob

    if (!job) {
      throw new Error('Transcription job not found')
    }

    if (job.TranscriptionJobStatus === TranscriptionJobStatus.FAILED) {
      throw new Error(`Transcription job failed: ${job.FailureReason}`)
    }

    if (job.TranscriptionJobStatus !== TranscriptionJobStatus.COMPLETED) {
      throw new Error(
        `Transcription job not completed. Status: ${job.TranscriptionJobStatus}`
      )
    }

    if (!job.Transcript?.TranscriptFileUri) {
      throw new Error('No transcript file URI found')
    }

    // Download transcript from S3
    const transcriptKey = `transcribe-output/${jobId}.json`
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: transcriptKey,
    })

    const transcriptResponse = await s3Client.send(getCommand)
    const transcriptBody = await streamToString(transcriptResponse.Body as ReadableStream)
    const transcriptData = JSON.parse(transcriptBody)

    // Extract transcript text
    const transcript = transcriptData.results.transcripts[0]?.transcript || ''

    return transcript
  } catch (error: any) {
    console.error('Error getting transcription result:', error)
    throw new Error(`Failed to get transcription result: ${error.message}`)
  }
}

/**
 * Poll for transcription job completion
 * TODO: Add timeout and max retries
 */
export const waitForTranscription = async (
  jobId: string,
  maxWaitTime: number = 60000, // 1 minute
  pollInterval: number = 2000 // 2 seconds
): Promise<string> => {
  const startTime = Date.now()

  while (Date.now() - startTime < maxWaitTime) {
    try {
      const command = new GetTranscriptionJobCommand({
        TranscriptionJobName: jobId,
      })

      const response = await transcribeClient.send(command)
      const job = response.TranscriptionJob

      if (!job) {
        throw new Error('Transcription job not found')
      }

      if (job.TranscriptionJobStatus === TranscriptionJobStatus.COMPLETED) {
        return await getTranscriptionResult(jobId)
      }

      if (job.TranscriptionJobStatus === TranscriptionJobStatus.FAILED) {
        throw new Error(`Transcription job failed: ${job.FailureReason}`)
      }

      // Wait before polling again
      await new Promise((resolve) => setTimeout(resolve, pollInterval))
    } catch (error: any) {
      if (error.message.includes('not found') || error.message.includes('failed')) {
        throw error
      }
      // Continue polling on other errors
      await new Promise((resolve) => setTimeout(resolve, pollInterval))
    }
  }

  throw new Error('Transcription job timeout')
}

const streamToString = async (stream: ReadableStream): Promise<string> => {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }

  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString('utf-8')
}

export const transcribeClient = {
  startTranscriptionJob,
  getTranscriptionResult,
  waitForTranscription,
}

