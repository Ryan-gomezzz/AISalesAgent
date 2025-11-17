import { useCallback, useRef, useState } from 'react'

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const speak = useCallback((text: string) => {
    // Cancel any ongoing speech
    if (synthRef.current) {
      synthRef.current.cancel()
    }

    // Check if browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported')
      return
    }

    synthRef.current = window.speechSynthesis

    // Clean up previous utterance
    if (utteranceRef.current) {
      utteranceRef.current = null
    }

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    utterance.pitch = 1.0
    utterance.volume = 0.9

    // Try to use a natural-sounding voice
    const voices = synthRef.current.getVoices()
    const preferredVoice = voices.find(
      (voice) =>
        voice.name.includes('Google') ||
        voice.name.includes('Microsoft') ||
        voice.name.includes('Samantha') ||
        voice.name.includes('Alex')
    )
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      utteranceRef.current = null
    }

    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error)
      setIsSpeaking(false)
      utteranceRef.current = null
    }

    utteranceRef.current = utterance
    synthRef.current.speak(utterance)
  }, [])

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
      utteranceRef.current = null
    }
  }, [])

  return { speak, stop, isSpeaking }
}

