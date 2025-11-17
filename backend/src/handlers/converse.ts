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
  selectedProduct?: 'accountancy' | 'soil' | 'ai-receptionist' | null
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
      selectedProduct,
    }: ConverseRequest = req.body

    // Validate and sanitize input
    if (!text || !text.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Text is required',
      })
    }

    // Sanitize text input (remove excessive whitespace, limit length)
    const sanitizedText = text.trim().slice(0, 5000) // Max 5000 characters
    if (sanitizedText.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Text cannot be empty',
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
      userMessage: sanitizedText,
      recentMessages: recentMessages?.slice(0, 10) || [], // Limit to last 10 messages
      emotion,
      clientContext,
      selectedProduct,
    })

    // Invoke Bedrock model
    const responseText = await bedrockClient.invokeModel(prompt, {
      maxTokens: 1024,
      temperature: 0.7,
    })

    // Synthesize speech (with error handling)
    let audioResult: { audioUrl?: string; audioBase64?: string } = { audioUrl: undefined }
    try {
      audioResult = await pollyClient.synthesizeSpeech(responseText, {
        returnBase64: false, // Return S3 URL for production
      })
    } catch (pollyError) {
      console.error('Error synthesizing speech:', pollyError)
      // Continue without audio - don't break the conversation
    }

    // Save conversation to DynamoDB
    const messageId = uuidv4()
    try {
      await saveConversation({
        sessionId: sessionId.slice(0, 200), // Limit sessionId length
        messageId,
        userMessage: sanitizedText,
        agentMessage: responseText?.slice(0, 10000) || '', // Limit response length
        emotion,
        timestamp: new Date().toISOString(),
      })
    } catch (dbError) {
      console.error('Error saving conversation:', dbError)
      // Continue even if DB save fails - don't break the user experience
    }

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

