import { z } from 'zod';

export const extractedLeadSchema = z.object({
  name: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  serviceType: z.string().optional().default('unknown'),
  requirements: z.string().optional().default(''),
  budget: z.string().nullable().optional().default(null),
  timeframe: z.string().nullable().optional().default(null),
  decisionMaker: z.enum(['yes', 'no', 'unknown']).default('unknown'),
  score: z.number().min(1).max(10),
  summary: z.string(),
  followUpRecommended: z.boolean(),
  tags: z.array(z.string()).default([])
});

export type ExtractedLead = z.infer<typeof extractedLeadSchema>;

export function parseExtractedLead(payload: unknown): ExtractedLead {
  return extractedLeadSchema.parse(payload);
}
