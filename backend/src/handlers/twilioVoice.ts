import { Request, Response, NextFunction } from 'express'
import { twilioClient } from '../services/twilioClient'
import { bedrockClient } from '../services/bedrockClient'
import { leadStore, Lead } from '../services/leadStore'
import { emailService } from '../services/emailService'
import { readFileSync } from 'fs'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

/**
 * Load voice agent prompt
 */
function loadVoicePrompt(): string {
  try {
    // Try Lambda path first
    const promptPath = join(__dirname, '../../prompts/voice-agent.md')
    return readFileSync(promptPath, 'utf-8')
  } catch {
    try {
      // Try root prompts directory
      const promptPath = join(process.cwd(), 'prompts/voice-agent.md')
      return readFileSync(promptPath, 'utf-8')
    } catch {
      // Fallback to inline prompt
      return `# Voice Agent Persona

You are a warm, professional, and conversational AI voice agent named "Aiden". Your goal is to have natural, human-like phone conversations.

## Core Principles
1. Sound Human: Speak naturally, use conversational language
2. Be Warm: Show genuine interest, use friendly tone
3. Listen Actively: Acknowledge what they say, ask follow-up questions
4. Keep It Natural: Use natural pauses, vary your responses
5. Low Pressure: Be helpful, not pushy

## Response Guidelines
- Keep responses short: 1-2 sentences maximum
- One thought at a time
- Be conversational: Use contractions (I'm, you're, that's)
- Show personality: Be friendly, professional, but human`
    }
  }
}

// Store conversation state (in production, use DynamoDB or Redis)
const conversationState = new Map<string, {
  inquiryType: 'ca' | 'salon'
  inquiryDetails: string
  callerName?: string
  callerPhone: string
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  startTime: number
  requirements?: string
}>()

/**
 * Handle Twilio voice webhook - main conversation handler
 */
export const twilioVoiceHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      CallSid,
      From,
      To,
      CallStatus,
      Digits, // For DTMF input
      SpeechResult, // For speech recognition
      CallerName,
    } = req.body

    console.log('Twilio webhook received:', {
      CallSid,
      From,
      To,
      CallStatus,
      Digits,
      SpeechResult,
    })

    // Handle call status updates (from status callback)
    if (CallStatus && CallStatus !== 'in-progress' && CallStatus !== 'ringing' && CallStatus !== 'queued') {
      // Call ended or failed - save lead if conversation happened
      if (conversationState.has(CallSid)) {
        await handleCallEnd(CallSid, CallStatus)
        conversationState.delete(CallSid)
      }
      return res.status(200).send('OK')
    }

    // Get or create conversation state
    let state = conversationState.get(CallSid)
    
    if (!state) {
      // First interaction - extract inquiry info from query params
      const inquiryType = (req.query.inquiryType || req.body.inquiryType) as 'ca' | 'salon' || 'ca'
      const inquiryDetails = (req.query.inquiryDetails || req.body.inquiryDetails) as string || 'General inquiry'
      
      state = {
        inquiryType,
        inquiryDetails,
        callerName: CallerName,
        callerPhone: From,
        conversationHistory: [],
        startTime: Date.now(),
      }
      conversationState.set(CallSid, state)
      
      // First call - greet the caller
      const greeting = inquiryType === 'ca'
        ? `Hi! This is Aiden calling about your inquiry regarding chartered accountancy services. Is now a good time to chat for a couple minutes?`
        : `Hi! This is Aiden calling from our salon about your appointment inquiry. Do you have a moment to chat?`
      
      const actionUrl = `${process.env.API_BASE_URL || 'https://your-api-url.com'}/api/twilio/voice?CallSid=${CallSid}&inquiryType=${inquiryType}&inquiryDetails=${encodeURIComponent(inquiryDetails)}`
      
      return res.type('text/xml').send(
        twilioClient.generateGatherTwiML(greeting, actionUrl, 10)
      )
    }

    // Get user input (speech or DTMF)
    const userInput = SpeechResult || (Digits ? `Pressed ${Digits}` : '')

    if (userInput) {
      // Add user message to history
      state.conversationHistory.push({
        role: 'user',
        content: userInput,
      })
    }

    // Generate AI response using Bedrock
    let aiResponse: string
    try {
      const prompt = buildVoicePrompt(state, userInput)
      aiResponse = await bedrockClient.invokeModel(prompt, {
        maxTokens: 150, // Shorter for voice
        temperature: 0.8, // More natural variation
      })

      // Clean up response for voice (remove markdown, shorten)
      aiResponse = cleanVoiceResponse(aiResponse)
    } catch (error: any) {
      console.error('Error generating AI response:', error)
      aiResponse = "I apologize, but I'm having some technical difficulties. Could you please call back in a few minutes?"
    }

    // Add AI response to history
    state.conversationHistory.push({
      role: 'assistant',
      content: aiResponse,
    })

    // Extract requirements if mentioned
    if (userInput && (userInput.toLowerCase().includes('need') || userInput.toLowerCase().includes('looking for'))) {
      state.requirements = (state.requirements || '') + ' ' + userInput
    }

    // Check if conversation should end (user says goodbye, thanks, etc.)
    const shouldEnd = checkIfShouldEnd(userInput, aiResponse)

    if (shouldEnd) {
      // Generate conversation summary and save lead
      await handleCallEnd(CallSid, 'completed')
      conversationState.delete(CallSid)
      
      return res.type('text/xml').send(
        twilioClient.generateVoiceTwiML(
          `${aiResponse} Thank you so much for your time. Have a wonderful day!`
        )
      )
    }

    // Generate TwiML for next interaction
    const baseUrl = process.env.API_BASE_URL || 'https://your-api-url.com'
    const actionUrl = `${baseUrl}/api/twilio/voice?CallSid=${CallSid}&inquiryType=${state.inquiryType}&inquiryDetails=${encodeURIComponent(state.inquiryDetails)}`
    
    const twiml = twilioClient.generateGatherTwiML(
      aiResponse,
      actionUrl,
      10 // 10 second timeout
    )

    res.type('text/xml').send(twiml)
  } catch (error: any) {
    console.error('Error in twilioVoice handler:', error)
    res.type('text/xml').send(
      twilioClient.generateVoiceTwiML(
        "I'm sorry, I'm experiencing some technical issues. Please try calling back later. Thank you!"
      )
    )
  }
}

/**
 * Build prompt for voice conversation
 */
function buildVoicePrompt(
  state: typeof conversationState extends Map<string, infer T> ? T : never,
  userInput: string
): string {
  const voicePrompt = loadVoicePrompt()

  const conversationContext = state.conversationHistory
    .slice(-6) // Last 6 exchanges for context
    .map(msg => `${msg.role === 'user' ? 'Caller' : 'You'}: ${msg.content}`)
    .join('\n')

  const inquiryContext = state.inquiryType === 'ca'
    ? 'The caller is inquiring about Chartered Accountancy services for their business.'
    : 'The caller is inquiring about booking a salon appointment.'

  return `${voicePrompt}

## Current Conversation Context

Inquiry Type: ${state.inquiryType === 'ca' ? 'Chartered Accountancy Services' : 'Salon Appointment'}
Original Inquiry: ${state.inquiryDetails}
${state.callerName ? `Caller Name: ${state.callerName}` : ''}
Caller Phone: ${state.callerPhone}

## Recent Conversation:
${conversationContext || 'This is the beginning of the conversation.'}

## Current User Input:
${userInput || 'User just answered the call'}

## Your Task:
Respond naturally and conversationally. Keep your response to 1-2 sentences maximum. Sound human and warm. Ask a follow-up question if appropriate.

Your response:`
}

/**
 * Clean response for voice (remove markdown, shorten)
 */
function cleanVoiceResponse(text: string): string {
  return text
    .replace(/\*\*/g, '') // Remove bold
    .replace(/\*/g, '') // Remove italics
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove markdown links
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Multiple spaces to single
    .trim()
    .slice(0, 300) // Max 300 chars for voice
}

/**
 * Check if conversation should end
 */
function checkIfShouldEnd(userInput: string, aiResponse: string): boolean {
  const endPhrases = [
    'goodbye', 'bye', 'thanks', 'thank you', 'that\'s all', 
    'nothing else', 'no more questions', 'all set', 'done'
  ]
  
  const input = (userInput || '').toLowerCase()
  return endPhrases.some(phrase => input.includes(phrase))
}

/**
 * Handle call end - generate summary and save lead
 */
async function handleCallEnd(callSid: string, status: string) {
  const state = conversationState.get(callSid)
  if (!state) return

  const callDuration = Math.floor((Date.now() - state.startTime) / 1000)
  
  // Generate conversation summary using Bedrock
  const summaryPrompt = `Summarize this phone conversation in 2-3 sentences. Focus on:
- What the caller needs
- Key requirements mentioned
- Their level of interest
- Next steps discussed

Conversation:
${state.conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

Summary:`

  let conversationSummary = 'Conversation completed successfully.'
  try {
    conversationSummary = await bedrockClient.invokeModel(summaryPrompt, {
      maxTokens: 200,
      temperature: 0.7,
    })
  } catch (error) {
    console.error('Error generating summary:', error)
    conversationSummary = state.conversationHistory
      .map(m => `${m.role}: ${m.content}`)
      .join(' | ')
  }

  // Calculate lead score (simple heuristic)
  const leadScore = calculateLeadScore(state, conversationSummary)

  // Create lead object
  const lead: Lead = {
    leadId: uuidv4(),
    inquiryType: state.inquiryType,
    callerName: state.callerName,
    callerPhone: state.callerPhone,
    inquiryDetails: state.inquiryDetails,
    conversationSummary,
    requirements: state.requirements,
    leadScore,
    timestamp: new Date().toISOString(),
    callDuration,
    callSid,
    status: 'new',
    emailSent: false,
  }

  // Save lead to DynamoDB
  try {
    await leadStore.saveLead(lead)
    
    // Send email
    try {
      await emailService.sendLeadEmail(lead)
      lead.emailSent = true
      // Update lead with email status
      await leadStore.saveLead(lead)
    } catch (emailError) {
      console.error('Error sending lead email:', emailError)
      // Continue even if email fails
    }
  } catch (error) {
    console.error('Error saving lead:', error)
  }
}

/**
 * Calculate lead score (1-10)
 */
function calculateLeadScore(
  state: typeof conversationState extends Map<string, infer T> ? T : never,
  summary: string
): number {
  let score = 5 // Base score

  // Positive indicators
  if (summary.toLowerCase().includes('interested') || summary.toLowerCase().includes('yes')) score += 2
  if (summary.toLowerCase().includes('urgent') || summary.toLowerCase().includes('soon')) score += 1
  if (summary.toLowerCase().includes('budget') || summary.toLowerCase().includes('price')) score += 1
  if (state.requirements && state.requirements.length > 20) score += 1
  if (state.conversationHistory.length > 4) score += 1 // Engaged conversation

  // Negative indicators
  if (summary.toLowerCase().includes('not interested') || summary.toLowerCase().includes('no thanks')) score -= 3
  if (summary.toLowerCase().includes('just looking') || summary.toLowerCase().includes('maybe later')) score -= 2

  return Math.max(1, Math.min(10, score))
}

