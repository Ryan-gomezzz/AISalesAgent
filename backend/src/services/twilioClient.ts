import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID || ''
const authToken = process.env.TWILIO_AUTH_TOKEN || ''
const phoneNumber = process.env.TWILIO_PHONE_NUMBER || ''

const client = twilio(accountSid, authToken)

export interface CallOptions {
  to: string
  inquiryType: 'ca' | 'salon'
  inquiryDetails: string
  callerName?: string
  callerPhone?: string
}

/**
 * Initiate a voice call using Twilio
 * Returns the call SID for tracking
 */
export const initiateCall = async (options: CallOptions): Promise<string> => {
  try {
    const baseUrl = process.env.API_BASE_URL || 'https://your-api-url.com'
    const webhookUrl = `${baseUrl}/api/twilio/voice?inquiryType=${options.inquiryType}&inquiryDetails=${encodeURIComponent(options.inquiryDetails)}`
    
    const call = await client.calls.create({
      to: options.to,
      from: phoneNumber,
      url: webhookUrl,
      method: 'POST',
      statusCallback: `${baseUrl}/api/twilio/voice/status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST',
      record: false, // Set to true if you want to record calls
    })

    return call.sid
  } catch (error: any) {
    console.error('Error initiating Twilio call:', error)
    throw new Error(`Failed to initiate call: ${error.message}`)
  }
}

/**
 * Generate TwiML for voice response
 * This is used in the Twilio webhook to control the call flow
 */
export const generateVoiceTwiML = (text: string): string => {
  // Use Twilio's neural voice for more human-like speech
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">
    ${text}
  </Say>
</Response>`
}

/**
 * Generate TwiML for gathering user input
 */
export const generateGatherTwiML = (prompt: string, action: string, timeout: number = 5): string => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" timeout="${timeout}" language="en-US" action="${action}" method="POST" speechTimeout="auto">
    <Say voice="alice" language="en-US">${prompt}</Say>
  </Gather>
  <Say voice="alice" language="en-US">I didn't catch that. Let me try again.</Say>
  <Redirect>${action}</Redirect>
</Response>`
}

export const twilioClient = {
  initiateCall,
  generateVoiceTwiML,
  generateGatherTwiML,
  client,
}

