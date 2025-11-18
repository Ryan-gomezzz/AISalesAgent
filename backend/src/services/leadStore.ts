import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-south-1',
}))

const TABLE_NAME = process.env.LEADS_TABLE || 'aisalesagent-leads-prod'

export interface Lead {
  leadId: string
  inquiryType: 'ca' | 'salon'
  callerName?: string
  callerPhone: string
  inquiryDetails: string
  conversationSummary: string
  requirements?: string
  leadScore?: number
  timestamp: string
  callDuration?: number
  callSid?: string
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
  emailSent: boolean
}

/**
 * Save lead to DynamoDB
 */
export const saveLead = async (lead: Lead): Promise<void> => {
  try {
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        ...lead,
        ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60), // 90 days TTL
      },
    })

    await dynamoClient.send(command)
    console.log('Lead saved successfully:', lead.leadId)
  } catch (error: any) {
    console.error('Error saving lead:', error)
    throw new Error(`Failed to save lead: ${error.message}`)
  }
}

/**
 * Get leads by phone number
 */
export const getLeadsByPhone = async (phone: string): Promise<Lead[]> => {
  try {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'phone-timestamp-index',
      KeyConditionExpression: 'callerPhone = :phone',
      ExpressionAttributeValues: {
        ':phone': phone,
      },
      ScanIndexForward: false, // Most recent first
    })

    const result = await dynamoClient.send(command)
    return (result.Items || []) as Lead[]
  } catch (error: any) {
    console.error('Error getting leads:', error)
    return []
  }
}

export const leadStore = {
  saveLead,
  getLeadsByPhone,
}

