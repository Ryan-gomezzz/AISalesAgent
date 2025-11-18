import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { converseHandler } from './handlers/converse'
import { analyzeEmotionHandler } from './handlers/analyzeEmotion'
import { uploadAudioHandler } from './handlers/uploadAudio'
import { healthHandler } from './handlers/health'
import { submitInquiryHandler } from './handlers/submitInquiry'
import { twilioVoiceHandler } from './handlers/twilioVoice'
import { errorHandler } from './utils/errorHandler'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// CORS configuration - allow Vercel domains and configured origin
const allowedOrigins = [
  'https://ai-sales-agent-theta.vercel.app',
  'https://ai-sales-agent-*.vercel.app',
  process.env.CORS_ORIGIN,
].filter(Boolean)

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    // Check if origin matches allowed patterns
    if (allowedOrigins.includes('*')) {
      return callback(null, true)
    }
    
    // Check exact matches
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    
    // Check wildcard patterns (for Vercel preview deployments)
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed?.includes('*')) {
        const pattern = allowed.replace(/\*/g, '.*')
        return new RegExp(`^${pattern}$`).test(origin)
      }
      return false
    })
    
    if (isAllowed || origin.includes('.vercel.app')) {
      return callback(null, true)
    }
    
    callback(new Error('Not allowed by CORS'))
  },
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

// Handle OPTIONS requests for CORS preflight
app.options('*', (req, res) => {
  const origin = req.headers.origin
  const allowedOrigin = origin && (origin.includes('.vercel.app') || allowedOrigins.includes(origin) || allowedOrigins.includes('*'))
    ? origin
    : allowedOrigins[0] || '*'
  
  res.header('Access-Control-Allow-Origin', allowedOrigin)
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-frontend-key, X-Frontend-Key, Authorization')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.sendStatus(200)
})

// Routes
app.post('/api/converse', converseHandler)
app.post('/api/analyze-emotion', analyzeEmotionHandler)
app.post('/api/upload-audio', uploadAudioHandler)
app.post('/api/submit-inquiry', submitInquiryHandler)
app.post('/api/twilio/voice', twilioVoiceHandler)
app.get('/api/twilio/voice', twilioVoiceHandler) // GET for Twilio status callbacks
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

