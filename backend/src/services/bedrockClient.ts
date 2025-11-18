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
 * TODO: Add support for streaming responses
 * TODO: Add retry logic and error handling
 * TODO: Add model-specific parameter handling
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
    
    if (MODEL_ID.includes('claude-3') || MODEL_ID.includes('claude-v3')) {
      // Claude 3+ uses messages format
      requestBody = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: options.maxTokens || 1024,
        temperature: options.temperature || 0.7,
        messages: [
          ...(systemPrompt
            ? [
                {
                  role: 'user',
                  content: systemPrompt,
                },
              ]
            : []),
          {
            role: 'user',
            content: userPrompt,
          },
        ],
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
    if (MODEL_ID.includes('claude-3') || MODEL_ID.includes('claude-v3')) {
      // Claude 3+ format
      if (responseBody.content && responseBody.content[0]) {
        return responseBody.content[0].text
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
    throw new Error(`Failed to invoke Bedrock model: ${error.message}`)
  }
}

export const bedrockClient = {
  invokeModel,
}

