/**
 * Integration test for /api/converse endpoint
 * TODO: Set up test environment with mocked AWS services
 * TODO: Add tests for error handling
 * TODO: Add tests for authentication
 */

import app from '../index'
import request from 'supertest'

describe('POST /api/converse', () => {
  it('should return a response with text and audioUrl', async () => {
    const response = await request(app)
      .post('/api/converse')
      .set('X-Frontend-Key', process.env.FRONTEND_KEY || 'dev-key')
      .send({
        text: 'Hello, how can you help me?',
        sessionId: 'test-session-123',
      })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('text')
    expect(response.body).toHaveProperty('metadata')
  })

  it('should return 400 if text is missing', async () => {
    const response = await request(app)
      .post('/api/converse')
      .set('X-Frontend-Key', process.env.FRONTEND_KEY || 'dev-key')
      .send({
        sessionId: 'test-session-123',
      })

    expect(response.status).toBe(400)
  })

  it('should return 401 if frontend key is missing', async () => {
    const response = await request(app)
      .post('/api/converse')
      .send({
        text: 'Hello',
        sessionId: 'test-session-123',
      })

    expect(response.status).toBe(401)
  })
})

