import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime'

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'ap-south-1',
})

const MODEL_ID = process.env.BEDROCK_MODEL || 'anthropic.claude-v2'
const MOCK_BEDROCK = process.env.MOCK_BEDROCK === 'true'

interface InvokeModelOptions {
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
}

/**
 * Invoke AWS Bedrock model with a prompt
 * 
 * Latest methodology (2024):
 * - Claude v2: Uses prompt format with Human/Assistant markers
 * - Claude v3+: Uses messages format with dedicated system parameter (recommended)
 * - Supports Claude 3.5, 4.5, Sonnet, Haiku, Opus models
 * - Uses latest anthropic_version for compatibility
 * 
 * TODO: Add support for streaming responses (InvokeModelWithResponseStream)
 * TODO: Add retry logic with exponential backoff
 * TODO: Add support for tool use (function calling)
 */
export const invokeModel = async (
  prompt: string,
  options: InvokeModelOptions = {}
): Promise<string> => {
  if (MOCK_BEDROCK) {
    console.log('Using mock Bedrock response')
    return `Mock response to: ${prompt.substring(0, 50)}...\n\nThis is a mock response. Set MOCK_BEDROCK=false to use real Bedrock.`
  }

  try {
    const systemPrompt = options.systemPrompt || ''
    const userPrompt = prompt

    // Build the request body based on model version
    // Claude v2 uses prompt format, Claude v3+ uses messages format
    let requestBody: any
    
    if (MODEL_ID.includes('claude-3') || MODEL_ID.includes('claude-v3') || MODEL_ID.includes('claude-4') || MODEL_ID.includes('claude-sonnet') || MODEL_ID.includes('claude-haiku') || MODEL_ID.includes('claude-opus')) {
      // Claude 3+ uses messages format with dedicated system parameter (latest best practice 2024)
      requestBody = {
        anthropic_version: 'bedrock-2023-05-31', // Latest stable version
        max_tokens: options.maxTokens || 1024,
        temperature: options.temperature || 0.7,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      }
      
      // Use dedicated system parameter for Claude 3+ (recommended approach as of 2024)
      if (systemPrompt) {
        requestBody.system = systemPrompt
      }
    } else {
      // Claude v2 uses prompt format
      const fullPrompt = systemPrompt 
        ? `\n\nHuman: ${systemPrompt}\n\n${userPrompt}\n\nAssistant:`
        : `\n\nHuman: ${userPrompt}\n\nAssistant:`
      
      requestBody = {
        prompt: fullPrompt,
        max_tokens_to_sample: options.maxTokens || 1024,
        temperature: options.temperature || 0.7,
      }
    }

    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      body: JSON.stringify(requestBody),
      contentType: 'application/json',
      accept: 'application/json',
    })

    const response = await client.send(command)
    const responseBody = JSON.parse(new TextDecoder().decode(response.body))

    // Extract the response text based on model type
    if (MODEL_ID.includes('claude-3') || MODEL_ID.includes('claude-v3') || MODEL_ID.includes('claude-4') || MODEL_ID.includes('claude-sonnet') || MODEL_ID.includes('claude-haiku') || MODEL_ID.includes('claude-opus')) {
      // Claude 3+ format - supports multiple content blocks
      if (responseBody.content && Array.isArray(responseBody.content)) {
        // Combine all text content blocks
        const textParts = responseBody.content
          .filter((block: any) => block.type === 'text')
          .map((block: any) => block.text)
        return textParts.join('') || ''
      }
    } else {
      // Claude v2 format
      if (responseBody.completion) {
        return responseBody.completion.trim()
      }
    }

    throw new Error('Unexpected response format from Bedrock')
  } catch (error: any) {
    console.error('Error invoking Bedrock model:', error)
    
    // Provide more detailed error information
    if (error.name === 'ValidationException') {
      throw new Error(`Bedrock validation error: ${error.message}. Check model ID and request format.`)
    } else if (error.name === 'AccessDeniedException') {
      throw new Error(`Bedrock access denied: ${error.message}. Ensure model access is enabled in Bedrock console.`)
    } else if (error.name === 'ThrottlingException') {
      throw new Error(`Bedrock rate limit exceeded: ${error.message}. Please retry after a moment.`)
    } else if (error.name === 'ModelNotReadyException') {
      throw new Error(`Bedrock model not ready: ${error.message}. The model may be initializing.`)
    }
    
    throw new Error(`Failed to invoke Bedrock model: ${error.message || error}`)
  }
}

export const bedrockClient = {
  invokeModel,
}

