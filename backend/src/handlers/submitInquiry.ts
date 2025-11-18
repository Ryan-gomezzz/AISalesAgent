import { Request, Response, NextFunction } from 'express'
import { twilioClient } from '../services/twilioClient'
import { v4 as uuidv4 } from 'uuid'

interface SubmitInquiryRequest {
  inquiryType: 'ca' | 'salon'
  phoneNumber: string
  name?: string
  inquiryDetails: string
}

/**
 * Submit an inquiry and initiate a phone call
 */
export const submitInquiryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      inquiryType,
      phoneNumber,
      name,
      inquiryDetails,
    }: SubmitInquiryRequest = req.body

    // Validate input
    if (!inquiryType || !['ca', 'salon'].includes(inquiryType)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid inquiry type. Must be "ca" or "salon"',
      })
    }

    if (!phoneNumber || !phoneNumber.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Phone number is required',
      })
    }

    if (!inquiryDetails || !inquiryDetails.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Inquiry details are required',
      })
    }

    // Validate frontend key
    const frontendKey = req.headers['x-frontend-key'] as string
    const expectedKey = process.env.FRONTEND_KEY || 'dev-key'
    if (frontendKey !== expectedKey) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
      })
    }

    // Format phone number (ensure it starts with +)
    const formattedPhone = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : `+${phoneNumber.replace(/\D/g, '')}`

    // Initiate Twilio call
    let callSid: string
    try {
      callSid = await twilioClient.initiateCall({
        to: formattedPhone,
        inquiryType,
        inquiryDetails,
        callerName: name,
        callerPhone: formattedPhone,
      })
    } catch (callError: any) {
      console.error('Error initiating call:', callError)
      return res.status(500).json({
        status: 'error',
        message: 'Failed to initiate call. Please check the phone number and try again.',
      })
    }

    // Return success response
    res.json({
      status: 'success',
      message: 'Call initiated successfully',
      callSid,
      inquiryId: uuidv4(),
    })
  } catch (error: any) {
    console.error('Error in submitInquiry handler:', error)
    next(error)
  }
}

