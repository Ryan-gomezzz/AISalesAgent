import { redactPII } from '../redactPII'

describe('redactPII', () => {
  it('should redact email addresses', () => {
    const text = 'Contact me at john@example.com'
    const redacted = redactPII(text)
    expect(redacted).toContain('[EMAIL_REDACTED]')
    expect(redacted).not.toContain('john@example.com')
  })

  it('should redact phone numbers', () => {
    const text = 'Call me at 555-123-4567'
    const redacted = redactPII(text)
    expect(redacted).toContain('[PHONE_REDACTED]')
    expect(redacted).not.toContain('555-123-4567')
  })

  it('should redact SSN patterns', () => {
    const text = 'My SSN is 123-45-6789'
    const redacted = redactPII(text)
    expect(redacted).toContain('[SSN_REDACTED]')
    expect(redacted).not.toContain('123-45-6789')
  })

  it('should not modify text without PII', () => {
    const text = 'This is a normal message without any sensitive information'
    const redacted = redactPII(text)
    expect(redacted).toBe(text)
  })
})

