import serverless from 'serverless-http'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { converseHandler } from './handlers/converse'
import { analyzeEmotionHandler } from './handlers/analyzeEmotion'
import { uploadAudioHandler } from './handlers/uploadAudio'
import { healthHandler } from './handlers/health'
import { errorHandler } from './utils/errorHandler'

dotenv.config()

const app = express()

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  allowedHeaders: ['Content-Type', 'x-frontend-key', 'X-Frontend-Key', 'Authorization'],
  exposedHeaders: ['Content-Type'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    body: req.method === 'POST' ? { ...req.body, image: req.body.image ? '[base64]' : undefined } : undefined,
  })
  next()
})

// Routes
app.post('/api/converse', converseHandler)
app.post('/api/analyze-emotion', analyzeEmotionHandler)
app.post('/api/upload-audio', uploadAudioHandler)
app.get('/api/health', healthHandler)
app.get('/api/session/:id', healthHandler) // TODO: Implement session retrieval

// Error handling
app.use(errorHandler)

// Export handler for serverless
export const handler = serverless(app)
