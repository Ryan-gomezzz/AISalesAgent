import { useState, useCallback } from 'react'
import { Message } from '../components/ChatArea'
import { apiService } from '../services/apiService'

export const useConversation = (sessionId: string) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(
    async (
      text: string,
      emotion?: { label: string; valence: number; arousal: number },
      selectedProduct?: 'accountancy' | 'soil' | 'ai-receptionist' | null
    ) => {
      // Add user message immediately
      const userMessage: Message = {
        id: `msg-${Date.now()}-user`,
        text,
        sender: 'user',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])

      setIsLoading(true)

      try {
        const response = await apiService.converse({
          text,
          sessionId,
          emotion,
          selectedProduct,
          recentMessages: messages.slice(-4).map((m) => ({
            text: m.text,
            sender: m.sender,
            timestamp: m.timestamp.toISOString(),
          })),
        })

        const agentMessage: Message = {
          id: response.id || `msg-${Date.now()}-agent`,
          text: response.text,
          sender: 'agent',
          timestamp: new Date(),
          audioUrl: response.audioUrl,
        }

        setMessages((prev) => [...prev, agentMessage])
      } catch (error: any) {
        console.error('Error sending message:', error)
        let errorText = 'Sorry, I encountered an error. Please try again.'
        
        // Provide more specific error messages
        if (error?.response?.data?.message) {
          errorText = error.response.data.message
        } else if (error?.message?.includes('CORS') || error?.code === 'ERR_NETWORK') {
          errorText = 'Connection error. Please check your internet connection and try again.'
        } else if (error?.response?.status === 401) {
          errorText = 'Authentication error. Please refresh the page.'
        } else if (error?.response?.status === 400) {
          errorText = error.response.data?.message || 'Invalid request. Please check your input.'
        }
        
        const errorMessage: Message = {
          id: `msg-${Date.now()}-error`,
          text: errorText,
          sender: 'agent',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
      }
    },
    [sessionId, messages]
  )

  return { messages, sendMessage, isLoading }
}

