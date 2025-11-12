import {
  RekognitionClient,
  DetectFacesCommand,
  Emotion,
} from '@aws-sdk/client-rekognition'
import axios from 'axios'

const rekognitionClient = new RekognitionClient({
  region: process.env.AWS_REGION || 'ap-south-1',
})

const COGNITIVE_API_URL = process.env.COGNITIVE_API_URL
const COGNITIVE_API_KEY = process.env.COGNITIVE_API_KEY
const USE_REKOGNITION_FALLBACK =
  process.env.USE_REKOGNITION_FALLBACK !== 'false'

interface EmotionResult {
  emotionLabel: string
  valence: number
  arousal: number
}

/**
 * Map Rekognition emotions to valence-arousal space
 * Valence: -1 (negative) to 1 (positive)
 * Arousal: 0 (calm) to 1 (excited)
 */
const mapEmotionToValenceArousal = (emotions: Emotion[]): EmotionResult => {
  // Find the emotion with highest confidence
  const primaryEmotion = emotions.reduce((prev, current) =>
    (current.Confidence || 0) > (prev.Confidence || 0) ? current : prev
  )

  const emotionType = primaryEmotion.Type || 'UNKNOWN'
  const confidence = primaryEmotion.Confidence || 0

  // Map emotions to valence-arousal
  // Based on Russell's Circumplex Model of Affect
  const emotionMap: Record<string, { valence: number; arousal: number }> = {
    HAPPY: { valence: 0.8, arousal: 0.7 },
    SAD: { valence: -0.8, arousal: -0.3 },
    ANGRY: { valence: -0.7, arousal: 0.8 },
    CONFUSED: { valence: -0.3, arousal: 0.2 },
    SURPRISED: { valence: 0.3, arousal: 0.9 },
    CALM: { valence: 0.5, arousal: -0.5 },
    FEAR: { valence: -0.6, arousal: 0.9 },
    DISGUSTED: { valence: -0.7, arousal: 0.5 },
  }

  const defaultMapping = { valence: 0, arousal: 0 }
  const mapping = emotionMap[emotionType] || defaultMapping

  // Normalize to 0-1 range (for valence: -1 to 1 becomes 0 to 1)
  const valence = (mapping.valence + 1) / 2
  const arousal = (mapping.arousal + 1) / 2

  // Use confidence to adjust the values
  const adjustedValence = 0.5 + (valence - 0.5) * (confidence / 100)
  const adjustedArousal = 0.5 + (arousal - 0.5) * (confidence / 100)

  return {
    emotionLabel: emotionType.toLowerCase(),
    valence: Math.max(0, Math.min(1, adjustedValence)),
    arousal: Math.max(0, Math.min(1, adjustedArousal)),
  }
}

/**
 * Call external Cognitive API if configured, otherwise use Rekognition
 * TODO: Add caching for emotion detection results
 * TODO: Add support for batch emotion detection
 */
export const analyzeEmotion = async (
  imageBuffer: Buffer
): Promise<EmotionResult> => {
  try {
    // Try external Cognitive API first if configured
    if (COGNITIVE_API_URL) {
      try {
        const response = await axios.post<EmotionResult>(
          COGNITIVE_API_URL,
          {
            image: imageBuffer.toString('base64'),
            imageType: 'image/jpeg',
          },
          {
            headers: {
              'Content-Type': 'application/json',
              ...(COGNITIVE_API_KEY && {
                Authorization: `Bearer ${COGNITIVE_API_KEY}`,
              }),
            },
            timeout: 10000, // 10 second timeout
          }
        )

        return response.data
      } catch (error: any) {
        console.warn('External Cognitive API failed, falling back to Rekognition:', error.message)
        if (!USE_REKOGNITION_FALLBACK) {
          throw error
        }
      }
    }

    // Fallback to Rekognition
    if (USE_REKOGNITION_FALLBACK) {
      return await analyzeEmotionWithRekognition(imageBuffer)
    }

    throw new Error('No emotion analysis service configured')
  } catch (error: any) {
    console.error('Error analyzing emotion:', error)
    throw new Error(`Failed to analyze emotion: ${error.message}`)
  }
}

/**
 * Analyze emotion using AWS Rekognition
 */
const analyzeEmotionWithRekognition = async (
  imageBuffer: Buffer
): Promise<EmotionResult> => {
  try {
    const command = new DetectFacesCommand({
      Image: {
        Bytes: imageBuffer,
      },
      Attributes: ['EMOTIONS'],
    })

    const response = await rekognitionClient.send(command)

    if (!response.FaceDetails || response.FaceDetails.length === 0) {
      throw new Error('No faces detected in image')
    }

    // Use the first face detected
    const faceDetails = response.FaceDetails[0]
    const emotions = faceDetails.Emotions || []

    if (emotions.length === 0) {
      return {
        emotionLabel: 'neutral',
        valence: 0.5,
        arousal: 0.5,
      }
    }

    return mapEmotionToValenceArousal(emotions)
  } catch (error: any) {
    console.error('Error analyzing emotion with Rekognition:', error)
    throw new Error(`Failed to analyze emotion with Rekognition: ${error.message}`)
  }
}

export const cognitiveClient = {
  analyzeEmotion,
}

