import React, { useEffect, useRef } from 'react'
import { Message } from './ChatArea'
import './MessageBubble.css'

interface MessageBubbleProps {
  message: Message
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (message.audioUrl && audioRef.current) {
      audioRef.current.src = message.audioUrl
    }
  }, [message.audioUrl])

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div
      className={`message-bubble message-${message.sender}`}
      role="article"
      aria-label={`Message from ${message.sender}`}
    >
      <div className="message-content">
        <p>{message.text}</p>
        {message.audioUrl && (
          <audio
            ref={audioRef}
            controls
            className="message-audio"
            aria-label="Audio playback"
          >
            Your browser does not support the audio element.
          </audio>
        )}
      </div>
      <div className="message-timestamp">{formatTime(message.timestamp)}</div>
    </div>
  )
}

export default MessageBubble

