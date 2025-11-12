import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-south-1',
})

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'aisales-conversations'

interface ConversationItem {
  sessionId: string
  messageId: string
  timestamp: string
  userMessage: string
  agentMessage: string
  emotion?: {
    label: string
    valence: number
    arousal: number
  }
  ttl?: number // TTL for auto-deletion (7 days)
}

/**
 * Save conversation to DynamoDB
 * TODO: Add error handling and retry logic
 * TODO: Add batch writes for multiple messages
 */
export const saveConversation = async (item: ConversationItem): Promise<void> => {
  try {
    // Calculate TTL (7 days from now)
    const ttl = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60

    const command = new PutItemCommand({
      TableName: TABLE_NAME,
      Item: marshall({
        ...item,
        ttl,
      }),
    })

    await dynamoClient.send(command)
  } catch (error: any) {
    console.error('Error saving conversation:', error)
    // Don't throw - logging failures shouldn't break the API
  }
}

/**
 * Get conversation history for a session
 * TODO: Add pagination support
 * TODO: Add error handling
 */
export const getConversationHistory = async (
  sessionId: string,
  limit: number = 10
): Promise<ConversationItem[]> => {
  try {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'sessionId = :sessionId',
      ExpressionAttributeValues: marshall({
        ':sessionId': sessionId,
      }),
      Limit: limit,
      ScanIndexForward: false, // Most recent first
    })

    const response = await dynamoClient.send(command)

    if (!response.Items) {
      return []
    }

    return response.Items.map((item) => unmarshall(item) as ConversationItem)
  } catch (error: any) {
    console.error('Error getting conversation history:', error)
    return []
  }
}

/**
 * Get a specific message by ID
 * TODO: Add error handling
 */
export const getMessage = async (
  sessionId: string,
  messageId: string
): Promise<ConversationItem | null> => {
  try {
    const command = new GetItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        sessionId,
        messageId,
      }),
    })

    const response = await dynamoClient.send(command)

    if (!response.Item) {
      return null
    }

    return unmarshall(response.Item) as ConversationItem
  } catch (error: any) {
    console.error('Error getting message:', error)
    return null
  }
}

