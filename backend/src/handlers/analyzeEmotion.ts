import { Request, Response, NextFunction } from 'express'
import { cognitiveClient } from '../services/cognitiveClient'

interface AnalyzeEmotionRequest {
  image: string // base64 encoded image
  imageType?: string
}

export const analyzeEmotionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { image, imageType = 'image/jpeg' }: AnalyzeEmotionRequest = req.body

    if (!image) {
      return res.status(400).json({
        status: 'error',
        message: 'Image is required',
      })
    }

    // Validate image size (max 3MB)
    const imageSize = Buffer.from(image, 'base64').length
    const maxSize = 3 * 1024 * 1024 // 3MB
    if (imageSize > maxSize) {
      return res.status(400).json({
        status: 'error',
        message: 'Image size exceeds 3MB limit',
      })
    }

    // Validate frontend key
    const frontendKey = req.headers['x-frontend-key'] as string
    const expectedKey = process.env.FRONTEND_KEY || 'dev-key'
    if (frontendKey !== expectedKey) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
      })
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(image, 'base64')

    // Analyze emotion
    const emotion = await cognitiveClient.analyzeEmotion(imageBuffer)

    // Return response
    res.json({
      emotionLabel: emotion.emotionLabel,
      valence: emotion.valence,
      arousal: emotion.arousal,
    })
  } catch (error: any) {
    console.error('Error in analyzeEmotion handler:', error)
    next(error)
  }
}

