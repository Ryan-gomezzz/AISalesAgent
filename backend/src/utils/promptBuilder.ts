import { readFileSync } from 'fs'
import { join } from 'path'

interface PromptContext {
  userMessage: string
  recentMessages?: Array<{
    text: string
    sender: 'user' | 'agent'
    timestamp: string
  }>
  emotion?: {
    label: string
    valence: number
    arousal: number
  }
  clientContext?: any
  selectedProduct?: 'accountancy' | 'soil' | 'ai-receptionist' | null
}

/**
 * Load system prompt from persona file
 */
const loadSystemPrompt = (): string => {
  try {
    // Try to load from prompts directory (for deployed Lambda)
    const personaPath = join(__dirname, '../../prompts/persona.md')
    const personaContent = readFileSync(personaPath, 'utf-8')
    return personaContent
  } catch (error) {
    try {
      // Try to load from root prompts directory (for local dev)
      const personaPath = join(process.cwd(), 'prompts/persona.md')
      const personaContent = readFileSync(personaPath, 'utf-8')
      return personaContent
    } catch (error2) {
      console.warn('Could not load persona file, using default prompt')
      return getDefaultSystemPrompt()
    }
  }
}

/**
 * Default system prompt if persona file is not found
 */
const getDefaultSystemPrompt = (): string => {
  return `SYSTEM: You are "Aiden", the AI assistant voice of a chartered accountancy practice. Tone: calm, friendly, confident, concise, and professional. Behavior rules:

1. Your goal is to help prospective clients understand whether this firm is a good fit, book discovery calls, gather basic info, and answer general non-legal/non-financial questions only.

2. You must NOT provide legal or regulated financial advice. If a user asks for legal/financial advice, always respond with a brief refusal and offer to connect them with a human accountant or schedule a consultation.

3. Use non-technical language when possible and explain jargon simply.

4. Use evidence-based claims only (no hallucinations). If unsure, say "I'm not sure — I can get that checked by an expert and connect you."

5. When emotion cues indicate confusion, anxiety, or anger, respond with extra empathy and offer reassurance or to slow down ("I sense you seem uncertain—would you like me to explain that step-by-step?").

6. Always end each short reply with a clear next-step suggestion (e.g., "Would you like to schedule a 15-min discovery call?" or "Can I send you a checklist by email?").

7. Always include a short visible disclaimer at the top of the response text: "Disclaimer: This chat is for general information and lead qualification only; it does not replace professional legal or financial advice."`
}

/**
 * Build prompt with context, emotion, and recent messages
 */
export const buildPrompt = (context: PromptContext): string => {
  const systemPrompt = loadSystemPrompt()

  // Build conversation history
  let conversationHistory = ''
  if (context.recentMessages && context.recentMessages.length > 0) {
    conversationHistory = '\n\nRecent conversation:\n'
    context.recentMessages.slice(-4).forEach((msg) => {
      const sender = msg.sender === 'user' ? 'User' : 'Assistant'
      conversationHistory += `${sender}: ${msg.text}\n`
    })
  }

  // Build emotion snapshot
  let emotionSnapshot = ''
  if (context.emotion) {
    emotionSnapshot = `\n\nEMOTION_SNAPSHOT: label=${context.emotion.label}, valence=${context.emotion.valence.toFixed(2)}, arousal=${context.emotion.arousal.toFixed(2)}. Use this to adapt tone and ask clarifying questions.`
  }

  // Build client context
  let clientContext = ''
  if (context.clientContext) {
    clientContext = `\n\nCLIENT_CONTEXT: ${JSON.stringify(context.clientContext)}`
  }

  // Build product context
  let productContext = ''
  if (context.selectedProduct) {
    const productNames: Record<string, string> = {
      'accountancy': 'Chartered Accountancy Services for Startups',
      'soil': 'SOIL - AI-Powered Business Scaling Platform',
      'ai-receptionist': 'AI Receptionist Solution',
    }
    productContext = `\n\nSELECTED_PRODUCT: The user is interested in "${productNames[context.selectedProduct]}". Focus your responses on this product/service, highlighting relevant benefits and features.`
  }

  // Build full prompt
  const fullPrompt = `${systemPrompt}${conversationHistory}${emotionSnapshot}${clientContext}${productContext}

User: ${context.userMessage}

Assistant:`

  return fullPrompt
}

