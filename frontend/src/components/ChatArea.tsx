import React, { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import './ChatArea.css'

export interface Message {
  id: string
  text: string
  sender: 'user' | 'agent'
  timestamp: Date
  audioUrl?: string
}

interface ChatAreaProps {
  messages: Message[]
  isLoading: boolean
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="chat-area" role="log" aria-live="polite" aria-label="Conversation">
      <div className="chat-messages">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="message-loading" aria-label="Agent is typing">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

export default ChatArea

