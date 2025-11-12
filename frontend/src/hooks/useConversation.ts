import { useState, useCallback } from 'react'
import { Message } from '../components/ChatArea'
import { apiService } from '../services/apiService'

export const useConversation = (sessionId: string) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(
    async (
      text: string,
      emotion?: { label: string; valence: number; arousal: number }
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
      } catch (error) {
        console.error('Error sending message:', error)
        const errorMessage: Message = {
          id: `msg-${Date.now()}-error`,
          text: 'Sorry, I encountered an error. Please try again.',
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

