import { Request, Response } from 'express'

export const healthHandler = async (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'aisalesagent-backend',
    version: '1.0.0',
  })
}

