import { Request, Response, NextFunction } from 'express'
import { bedrockClient } from '../services/bedrockClient'
import { pollyClient } from '../services/pollyClient'
import { buildPrompt } from '../utils/promptBuilder'
import { saveConversation } from '../utils/conversationStore'
import { v4 as uuidv4 } from 'uuid'

interface ConverseRequest {
  text: string
  sessionId?: string
  emotion?: {
    label: string
    valence: number
    arousal: number
  }
  recentMessages?: Array<{
    text: string
    sender: 'user' | 'agent'
    timestamp: string
  }>
  clientContext?: any
}

export const converseHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      text,
      sessionId = `session-${Date.now()}`,
      emotion,
      recentMessages = [],
      clientContext,
    }: ConverseRequest = req.body

    if (!text || !text.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Text is required',
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

    // Build prompt with context and emotion
    const prompt = buildPrompt({
      userMessage: text,
      recentMessages,
      emotion,
      clientContext,
    })

    // Invoke Bedrock model
    const responseText = await bedrockClient.invokeModel(prompt, {
      maxTokens: 1024,
      temperature: 0.7,
    })

    // Synthesize speech
    const audioResult = await pollyClient.synthesizeSpeech(responseText, {
      returnBase64: false, // Return S3 URL for production
    })

    // Save conversation to DynamoDB
    const messageId = uuidv4()
    await saveConversation({
      sessionId,
      messageId,
      userMessage: text,
      agentMessage: responseText,
      emotion,
      timestamp: new Date().toISOString(),
    })

    // Return response
    res.json({
      id: messageId,
      text: responseText,
      audioUrl: audioResult.audioUrl,
      metadata: {
        sessionId,
        timestamp: new Date().toISOString(),
        emotion,
      },
    })
  } catch (error: any) {
    console.error('Error in converse handler:', error)
    next(error)
  }
}

