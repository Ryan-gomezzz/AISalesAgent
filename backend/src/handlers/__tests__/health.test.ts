import { Request, Response } from 'express'
import { healthHandler } from '../health'

describe('healthHandler', () => {
  it('should return health status', async () => {
    const req = {} as Request
    const res = {
      json: jest.fn(),
    } as unknown as Response

    await healthHandler(req, res)

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ok',
        service: 'aisalesagent-backend',
        version: '1.0.0',
      })
    )
  })
})

