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
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
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

// Start server (for local development)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  })
}

// Export for serverless (handler is exported from index.serverless.ts)
export default app

