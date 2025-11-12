import { Request, Response, NextFunction } from 'express'
import { transcribeClient } from '../services/transcribeClient'
import { v4 as uuidv4 } from 'uuid'

export const uploadAudioHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate frontend key
    const frontendKey = req.headers['x-frontend-key'] as string
    const expectedKey = process.env.FRONTEND_KEY || 'dev-key'
    if (frontendKey !== expectedKey) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
      })
    }

    // Get audio file from request
    const audioFile = req.file || (req.body as any).audio
    if (!audioFile) {
      return res.status(400).json({
        status: 'error',
        message: 'Audio file is required',
      })
    }

    // Validate audio size (max 3MB)
    const audioSize = Buffer.isBuffer(audioFile)
      ? audioFile.length
      : audioFile.size || audioFile.data?.length || 0
    const maxSize = 3 * 1024 * 1024 // 3MB
    if (audioSize > maxSize) {
      return res.status(400).json({
        status: 'error',
        message: 'Audio size exceeds 3MB limit',
      })
    }

    // Convert audio to buffer
    const audioBuffer = Buffer.isBuffer(audioFile)
      ? audioFile
      : Buffer.from(audioFile.data || audioFile)

    // Determine media format
    const mediaFormat = audioFile.mimetype?.includes('webm')
      ? 'webm'
      : audioFile.mimetype?.includes('mp3')
      ? 'mp3'
      : 'webm' // Default to webm

    // Start transcription job
    const { jobId } = await transcribeClient.startTranscriptionJob(
      audioBuffer,
      mediaFormat
    )

    // Wait for transcription (with timeout)
    const transcript = await transcribeClient.waitForTranscription(jobId, 60000, 2000)

    // Return response
    res.json({
      transcript,
      jobId,
    })
  } catch (error: any) {
    console.error('Error in uploadAudio handler:', error)
    next(error)
  }
}

