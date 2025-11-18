import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Frontend-Key': import.meta.env.VITE_FRONTEND_KEY || 'dev-key',
  },
})

export interface ConverseRequest {
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

export interface ConverseResponse {
  id: string
  text: string
  audioUrl?: string
  metadata?: any
}

export interface AnalyzeEmotionRequest {
  image: string // base64 encoded image
  imageType: string
}

export interface AnalyzeEmotionResponse {
  emotionLabel: string
  valence: number
  arousal: number
}

export interface UploadAudioRequest {
  audio: Blob
}

export interface UploadAudioResponse {
  transcript: string
  jobId?: string
}

export interface SubmitInquiryRequest {
  inquiryType: 'ca' | 'salon'
  phoneNumber: string
  name?: string
  inquiryDetails: string
}

export interface SubmitInquiryResponse {
  status: string
  message: string
  callSid: string
  inquiryId: string
}

export const apiService = {
  async converse(request: ConverseRequest): Promise<ConverseResponse> {
    const response = await apiClient.post<ConverseResponse>('/api/converse', request)
    return response.data
  },

  async analyzeEmotion(
    request: AnalyzeEmotionRequest
  ): Promise<AnalyzeEmotionResponse> {
    const response = await apiClient.post<AnalyzeEmotionResponse>(
      '/api/analyze-emotion',
      request
    )
    return response.data
  },

  async uploadAudio(request: UploadAudioRequest): Promise<UploadAudioResponse> {
    const formData = new FormData()
    formData.append('audio', request.audio, 'audio.webm')

    const response = await apiClient.post<UploadAudioResponse>(
      '/api/upload-audio',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  async health(): Promise<{ status: string }> {
    const response = await apiClient.get<{ status: string }>('/api/health')
    return response.data
  },

  async submitInquiry(request: SubmitInquiryRequest): Promise<SubmitInquiryResponse> {
    const response = await apiClient.post<SubmitInquiryResponse>('/api/submit-inquiry', request)
    return response.data
  },
}

