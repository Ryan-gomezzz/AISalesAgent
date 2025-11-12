import { buildPrompt } from '../promptBuilder'

describe('promptBuilder', () => {
  it('should build a prompt with user message', () => {
    const prompt = buildPrompt({
      userMessage: 'Hello, how can you help me?',
    })

    expect(prompt).toContain('Hello, how can you help me?')
    expect(prompt).toContain('Aiden')
    expect(prompt).toContain('chartered accountancy')
  })

  it('should include recent messages in prompt', () => {
    const prompt = buildPrompt({
      userMessage: 'What services do you offer?',
      recentMessages: [
        {
          text: 'Hello',
          sender: 'user',
          timestamp: new Date().toISOString(),
        },
        {
          text: 'Hi! How can I help you today?',
          sender: 'agent',
          timestamp: new Date().toISOString(),
        },
      ],
    })

    expect(prompt).toContain('Hello')
    expect(prompt).toContain('Hi! How can I help you today?')
  })

  it('should include emotion snapshot in prompt', () => {
    const prompt = buildPrompt({
      userMessage: 'I need help with taxes',
      emotion: {
        label: 'confused',
        valence: 0.3,
        arousal: 0.6,
      },
    })

    expect(prompt).toContain('EMOTION_SNAPSHOT')
    expect(prompt).toContain('label=confused')
    expect(prompt).toContain('valence=0.30')
    expect(prompt).toContain('arousal=0.60')
  })

  it('should include client context in prompt', () => {
    const prompt = buildPrompt({
      userMessage: 'I am a small business owner',
      clientContext: {
        clientType: 'small-business',
        industry: 'retail',
      },
    })

    expect(prompt).toContain('CLIENT_CONTEXT')
    expect(prompt).toContain('small-business')
  })

  it('should limit recent messages to last 4', () => {
    const prompt = buildPrompt({
      userMessage: 'Test',
      recentMessages: Array.from({ length: 10 }, (_, i) => ({
        text: `Message ${i}`,
        sender: 'user' as const,
        timestamp: new Date().toISOString(),
      })),
    })

    // Should only include last 4 messages
    expect(prompt.match(/Message \d/g)?.length).toBeLessThanOrEqual(4)
  })

  it('should include disclaimer in system prompt', () => {
    const prompt = buildPrompt({
      userMessage: 'Test',
    })

    expect(prompt).toContain('disclaimer')
    expect(prompt).toContain('legal or financial advice')
  })
})

