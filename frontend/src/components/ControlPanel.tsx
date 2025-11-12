import React, { useState, KeyboardEvent } from 'react'
import './ControlPanel.css'

interface ControlPanelProps {
  onSendMessage: (text: string) => void
  isVoiceEnabled: boolean
  isVideoEnabled: boolean
  useTranscribe: boolean
  onToggleVoice: () => void
  onToggleVideo: () => void
  onToggleTranscribe: () => void
  isListening: boolean
  transcript: string
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onSendMessage,
  isVoiceEnabled,
  isVideoEnabled,
  useTranscribe,
  onToggleVoice,
  onToggleVideo,
  onToggleTranscribe,
  isListening,
  transcript,
}) => {
  const [textInput, setTextInput] = useState('')

  const handleSend = () => {
    if (textInput.trim()) {
      onSendMessage(textInput.trim())
      setTextInput('')
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="control-panel" role="toolbar" aria-label="Chat controls">
      <div className="control-buttons">
        <button
          onClick={onToggleVoice}
          className={`control-button ${isVoiceEnabled ? 'active' : ''}`}
          aria-label={isVoiceEnabled ? 'Stop voice input' : 'Start voice input'}
          aria-pressed={isVoiceEnabled}
        >
          {isVoiceEnabled ? 'Stop Voice' : 'Start Voice'}
        </button>
        <button
          onClick={onToggleVideo}
          className={`control-button ${isVideoEnabled ? 'active' : ''}`}
          aria-label={isVideoEnabled ? 'Stop video' : 'Start video'}
          aria-pressed={isVideoEnabled}
        >
          {isVideoEnabled ? 'Stop Video' : 'Start Video'}
        </button>
        <label className="control-toggle">
          <input
            type="checkbox"
            checked={useTranscribe}
            onChange={onToggleTranscribe}
            aria-label="Use AWS Transcribe"
          />
          <span>Use Transcribe</span>
        </label>
      </div>
      {isListening && (
        <div className="transcript-indicator" role="status" aria-live="polite">
          Listening... {transcript && `(${transcript})`}
        </div>
      )}
      <div className="input-container">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="text-input"
          aria-label="Message input"
        />
        <button
          onClick={handleSend}
          className="send-button"
          aria-label="Send message"
          disabled={!textInput.trim()}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default ControlPanel

