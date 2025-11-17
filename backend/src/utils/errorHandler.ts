import { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  statusCode?: number
  status?: string
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500
  const status = err.status || 'error'

  console.error('Error:', err)

  // Set CORS headers for error responses
  const origin = req.headers.origin
  const allowedOrigins = [
    'https://ai-sales-agent-theta.vercel.app',
    process.env.CORS_ORIGIN,
  ].filter(Boolean)
  
  if (origin && (origin.includes('.vercel.app') || allowedOrigins.includes(origin) || allowedOrigins.includes('*'))) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Credentials', 'true')
  } else if (allowedOrigins.length > 0 && !allowedOrigins.includes('*')) {
    res.header('Access-Control-Allow-Origin', allowedOrigins[0])
    res.header('Access-Control-Allow-Credentials', 'true')
  } else {
    res.header('Access-Control-Allow-Origin', '*')
  }
  
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-frontend-key, X-Frontend-Key, Authorization')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')

  res.status(statusCode).json({
    status,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

export const createError = (message: string, statusCode: number = 500): AppError => {
  const error: AppError = new Error(message)
  error.statusCode = statusCode
  error.status = statusCode >= 500 ? 'error' : 'fail'
  return error
}

