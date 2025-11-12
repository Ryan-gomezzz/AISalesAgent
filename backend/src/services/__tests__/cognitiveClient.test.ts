import { cognitiveClient } from '../cognitiveClient'

// Mock AWS SDK
jest.mock('@aws-sdk/client-rekognition', () => ({
  RekognitionClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  DetectFacesCommand: jest.fn(),
}))

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(),
}))

describe('cognitiveClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.COGNITIVE_API_URL = ''
    process.env.USE_REKOGNITION_FALLBACK = 'true'
  })

  it('should analyze emotion with Rekognition when no external API is configured', async () => {
    const { RekognitionClient, DetectFacesCommand } = require('@aws-sdk/client-rekognition')
    const mockSend = jest.fn().mockResolvedValue({
      FaceDetails: [
        {
          Emotions: [
            {
              Type: 'HAPPY',
              Confidence: 85,
            },
          ],
        },
      ],
    })

    RekognitionClient.mockImplementation(() => ({
      send: mockSend,
    }))

    const imageBuffer = Buffer.from('test-image-data')

    const result = await cognitiveClient.analyzeEmotion(imageBuffer)

    expect(result).toHaveProperty('emotionLabel')
    expect(result).toHaveProperty('valence')
    expect(result).toHaveProperty('arousal')
    expect(result.emotionLabel).toBe('happy')
    expect(mockSend).toHaveBeenCalled()
  })

  it('should return neutral emotion when no faces are detected', async () => {
    const { RekognitionClient } = require('@aws-sdk/client-rekognition')
    const mockSend = jest.fn().mockResolvedValue({
      FaceDetails: [],
    })

    RekognitionClient.mockImplementation(() => ({
      send: mockSend,
    }))

    const imageBuffer = Buffer.from('test-image-data')

    await expect(cognitiveClient.analyzeEmotion(imageBuffer)).rejects.toThrow(
      'No faces detected'
    )
  })

  it('should call external Cognitive API when configured', async () => {
    const axios = require('axios')
    process.env.COGNITIVE_API_URL = 'https://api.example.com/emotion'
    process.env.COGNITIVE_API_KEY = 'test-key'

    axios.post.mockResolvedValue({
      data: {
        emotionLabel: 'happy',
        valence: 0.8,
        arousal: 0.7,
      },
    })

    const imageBuffer = Buffer.from('test-image-data')

    const result = await cognitiveClient.analyzeEmotion(imageBuffer)

    expect(result).toHaveProperty('emotionLabel', 'happy')
    expect(result).toHaveProperty('valence', 0.8)
    expect(result).toHaveProperty('arousal', 0.7)
    expect(axios.post).toHaveBeenCalledWith(
      'https://api.example.com/emotion',
      expect.objectContaining({
        image: expect.any(String),
        imageType: 'image/jpeg',
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-key',
        }),
      })
    )
  })

  it('should fallback to Rekognition when external API fails', async () => {
    const axios = require('axios')
    const { RekognitionClient } = require('@aws-sdk/client-rekognition')
    process.env.COGNITIVE_API_URL = 'https://api.example.com/emotion'
    process.env.USE_REKOGNITION_FALLBACK = 'true'

    axios.post.mockRejectedValue(new Error('API Error'))
    const mockSend = jest.fn().mockResolvedValue({
      FaceDetails: [
        {
          Emotions: [
            {
              Type: 'SAD',
              Confidence: 70,
            },
          ],
        },
      ],
    })

    RekognitionClient.mockImplementation(() => ({
      send: mockSend,
    }))

    const imageBuffer = Buffer.from('test-image-data')

    const result = await cognitiveClient.analyzeEmotion(imageBuffer)

    expect(result).toHaveProperty('emotionLabel', 'sad')
    expect(mockSend).toHaveBeenCalled()
  })
})

