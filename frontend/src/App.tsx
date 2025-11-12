import React, { useState, useEffect, useRef } from 'react'
import ChatArea from './components/ChatArea'
import VideoPreview from './components/VideoPreview'
import ControlPanel from './components/ControlPanel'
import EmotionIndicator from './components/EmotionIndicator'
import Disclaimer from './components/Disclaimer'
import { useConversation } from './hooks/useConversation'
import { useSpeechRecognition } from './hooks/useSpeechRecognition'
import { useEmotionDetection } from './hooks/useEmotionDetection'
import './styles/App.css'

const App: React.FC = () => {
  const [sessionId] = useState(() => `session-${Date.now()}`)
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [useTranscribe, setUseTranscribe] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState<{
    label: string
    valence: number
    arousal: number
  } | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const { messages, sendMessage, isLoading } = useConversation(sessionId)
  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition()
  const { detectEmotion } = useEmotionDetection()

  // Handle video stream
  useEffect(() => {
    if (isVideoEnabled) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            streamRef.current = stream
          }
        })
        .catch((err) => {
          console.error('Error accessing webcam:', err)
          setIsVideoEnabled(false)
        })
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [isVideoEnabled])

  // Capture video frames for emotion detection
  useEffect(() => {
    if (!isVideoEnabled || !videoRef.current) {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current)
        captureIntervalRef.current = null
      }
      return
    }

    captureIntervalRef.current = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        const canvas = document.createElement('canvas')
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0)
          canvas.toBlob(async (blob) => {
            if (blob) {
              const emotion = await detectEmotion(blob)
              if (emotion) {
                setCurrentEmotion(emotion)
              }
            }
          }, 'image/jpeg')
        }
      }
    }, 5000) // Capture every 5 seconds

    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current)
        captureIntervalRef.current = null
      }
    }
  }, [isVideoEnabled, detectEmotion])

  // Handle voice input
  useEffect(() => {
    if (isVoiceEnabled && !useTranscribe) {
      startListening()
    } else {
      stopListening()
    }
  }, [isVoiceEnabled, useTranscribe, startListening, stopListening])

  // Send transcript as message when speech recognition completes
  useEffect(() => {
    if (transcript && !isListening && transcript.trim()) {
      handleSendMessage(transcript, currentEmotion || undefined)
    }
  }, [transcript, isListening])

  const handleSendMessage = async (text: string, emotion?: typeof currentEmotion) => {
    if (!text.trim()) return

    await sendMessage(text, emotion || currentEmotion || undefined)
  }

  const handleToggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled)
  }

  const handleToggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled)
  }

  return (
    <div className="app">
      <Disclaimer />
      <div className="app-container">
        <div className="app-left">
          <ChatArea messages={messages} isLoading={isLoading} />
          <ControlPanel
            onSendMessage={(text) => handleSendMessage(text, currentEmotion || undefined)}
            isVoiceEnabled={isVoiceEnabled}
            isVideoEnabled={isVideoEnabled}
            useTranscribe={useTranscribe}
            onToggleVoice={handleToggleVoice}
            onToggleVideo={handleToggleVideo}
            onToggleTranscribe={() => setUseTranscribe(!useTranscribe)}
            isListening={isListening}
            transcript={transcript}
          />
        </div>
        <div className="app-right">
          <VideoPreview
            videoRef={videoRef}
            isEnabled={isVideoEnabled}
            onToggle={handleToggleVideo}
          />
          {currentEmotion && <EmotionIndicator emotion={currentEmotion} />}
        </div>
      </div>
    </div>
  )
}

export default App
