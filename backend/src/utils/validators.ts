import { z } from 'zod';

export const leadFormSchema = z.object({
  name: z.string().trim().max(80).optional(),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{7,14}$/, 'phoneNumber must be in E.164 format'),
  inquiryType: z.enum(['ca', 'salon']),
  inquiryDetails: z.string().min(10).max(1000),
  consent: z.literal(true)
});

export type LeadFormInput = z.infer<typeof leadFormSchema>;

export const twilioStatusSchema = z.object({
  CallSid: z.string(),
  CallStatus: z.string(),
  Timestamp: z.string().optional(),
  LeadId: z.string().optional(),
  To: z.string().optional(),
  From: z.string().optional()
});

export type TwilioStatusPayload = z.infer<typeof twilioStatusSchema>;

export const postCallPayloadSchema = z.object({
  leadId: z.string(),
  transcriptBucket: z.string(),
  transcriptKey: z.string(),
  recordingBucket: z.string(),
  recordingKey: z.string(),
  initialMessage: z.string().optional()
});

export type PostCallPayloadInput = z.infer<typeof postCallPayloadSchema>;
