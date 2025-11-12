import { useCallback } from 'react'
import { apiService } from '../services/apiService'

export const useEmotionDetection = () => {
  const detectEmotion = useCallback(async (imageBlob: Blob): Promise<{
    label: string
    valence: number
    arousal: number
  } | null> => {
    try {
      // Convert blob to base64
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          if (reader.result) {
            const base64String = (reader.result as string).split(',')[1]
            resolve(base64String)
          } else {
            reject(new Error('Failed to convert image to base64'))
          }
        }
        reader.onerror = reject
        reader.readAsDataURL(imageBlob)
      })

      const base64Image = await base64Promise
      const response = await apiService.analyzeEmotion({
        image: base64Image,
        imageType: 'image/jpeg',
      })

      return {
        label: response.emotionLabel,
        valence: response.valence,
        arousal: response.arousal,
      }
    } catch (error) {
      console.error('Error detecting emotion:', error)
      return null
    }
  }, [])

  return { detectEmotion }
}

