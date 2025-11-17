# AISalesAgent Project Schema & Architecture

## 📐 Project Overview

AISalesAgent is a **serverless, full-stack AI assistant** for a chartered accountancy practice. It combines:
- **Frontend**: React + TypeScript (Vite) deployed on Vercel
- **Backend**: Node.js + Express deployed on AWS Lambda
- **AI Services**: AWS Bedrock (LLM), Amazon Polly (TTS), AWS Transcribe (STT)
- **Storage**: DynamoDB (conversations), S3 (audio assets)
- **Infrastructure**: Serverless Framework, API Gateway, Lambda

---

## 🏗️ Project Structure

```
AISalesAgent/
├── frontend/                    # React Frontend (Vercel)
│   ├── src/
│   │   ├── components/          # UI Components
│   │   │   ├── ChatArea.tsx     # Message display area
│   │   │   ├── ControlPanel.tsx # Input controls
│   │   │   ├── VideoPreview.tsx # Webcam preview
│   │   │   ├── EmotionIndicator.tsx # Emotion display
│   │   │   ├── MessageBubble.tsx # Individual messages
│   │   │   └── Disclaimer.tsx   # Legal disclaimer
│   │   ├── hooks/               # React Hooks
│   │   │   ├── useConversation.ts    # Chat state management
│   │   │   ├── useSpeechRecognition.ts # Voice input
│   │   │   └── useEmotionDetection.ts  # Emotion analysis
│   │   ├── services/
│   │   │   └── apiService.ts    # API client (axios)
│   │   ├── styles/              # CSS files
│   │   ├── App.tsx              # Main app component
│   │   └── main.tsx             # Entry point
│   ├── vercel.json              # Vercel configuration
│   └── package.json
│
├── backend/                     # Node.js Backend (Lambda)
│   ├── src/
│   │   ├── handlers/            # API Route Handlers
│   │   │   ├── converse.ts      # Main conversation endpoint
│   │   │   ├── analyzeEmotion.ts # Emotion detection
│   │   │   ├── uploadAudio.ts   # Audio transcription
│   │   │   └── health.ts        # Health check
│   │   ├── services/            # AWS Service Clients
│   │   │   ├── bedrockClient.ts # LLM (Claude)
│   │   │   ├── pollyClient.ts   # Text-to-Speech
│   │   │   ├── transcribeClient.ts # Speech-to-Text
│   │   │   └── cognitiveClient.ts  # External emotion API
│   │   ├── utils/              # Utilities
│   │   │   ├── conversationStore.ts # DynamoDB operations
│   │   │   ├── promptBuilder.ts     # LLM prompt construction
│   │   │   ├── redactPII.ts        # PII redaction
│   │   │   └── errorHandler.ts     # Error handling
│   │   ├── index.ts            # Express server (local dev)
│   │   └── index.serverless.ts # Lambda handler
│   └── package.json
│
├── infra/                       # Legacy infrastructure config
│   └── serverless.yml
│
├── scripts/                     # Deployment Scripts
│   ├── prepare-lambda.js       # Prepares files for Lambda
│   ├── deploy.sh               # Deployment script
│   └── update-cors.ps1         # CORS update script
│
├── serverless.yml              # Main Serverless config (root)
├── .github/workflows/          # CI/CD
│   └── deploy.yml              # GitHub Actions workflow
│
└── Documentation/
    ├── README.md
    ├── DEPLOYMENT_GUIDE.md
    ├── SETUP.md
    └── Various troubleshooting guides
```

---

## 🔄 Data Flow Architecture

### 1. User Input Flow

```
User Browser
    │
    ├─ Text Input ──────────────┐
    ├─ Voice (Web Speech API) ──┤
    ├─ Video (Webcam) ──────────┤
    └─ Audio Upload ────────────┤
                                │
                                ▼
                    Frontend (React)
                    ├─ State Management
                    ├─ API Calls (axios)
                    └─ UI Updates
                                │
                                ▼
                    API Gateway (AWS)
                    └─ /api/{proxy+}
                                │
                                ▼
                    Lambda Function
                    └─ Express App (serverless-http)
```

### 2. Conversation Flow

```
POST /api/converse
    │
    ├─ Validate Request (text, frontend key)
    ├─ Build Prompt (with context, emotion, history)
    │
    ├─ AWS Bedrock (Claude)
    │   └─ Generate AI Response
    │
    ├─ Amazon Polly
    │   └─ Synthesize Speech → S3
    │
    ├─ DynamoDB
    │   └─ Save Conversation
    │
    └─ Return Response
        ├─ Text
        ├─ Audio URL (S3)
        └─ Metadata
```

### 3. Emotion Detection Flow

```
Video Frame (Webcam)
    │
    ├─ Capture (every 5 seconds)
    ├─ Convert to Blob
    │
    └─ POST /api/analyze-emotion
        │
        ├─ Try: External Cognitive API
        │   └─ (if COGNITIVE_API_URL set)
        │
        └─ Fallback: AWS Rekognition
            └─ DetectFaces → Emotion
                │
                └─ Return: { label, valence, arousal }
```

---

## 🗄️ Database Schema

### DynamoDB Table: `aisalesagent-conversations-{stage}`

**Table Structure:**
```typescript
{
  sessionId: string,        // Partition Key (HASH)
  messageId: string,         // Sort Key (RANGE)
  userMessage: string,        // User's input text
  agentMessage: string,       // AI's response
  emotion?: {                // Detected emotion
    label: string,
    valence: number,
    arousal: number
  },
  timestamp: string,         // ISO 8601 timestamp
  ttl?: number               // Time-to-live (auto-delete)
}
```

**Indexes:**
- Primary: `sessionId` (HASH) + `messageId` (RANGE)
- GSI: `timestamp-index` (for querying by time)

**TTL:** Enabled (conversations auto-delete after expiration)

### S3 Bucket: `aisalesagent-assets-{stage}`

**Structure:**
```
s3://aisalesagent-assets-prod/
├── audio/
│   ├── {sessionId}/
│   │   ├── {messageId}.mp3
│   │   └── ...
│   └── ...
└── transcripts/
    └── {jobId}.json
```

**Lifecycle:** Auto-delete after 7 days

---

## 🔌 API Endpoints

### Base URL
- **Production**: `https://o7179pt59f.execute-api.ap-south-1.amazonaws.com/prod`
- **Local**: `http://localhost:3000`

### Endpoints

#### 1. `POST /api/converse`
**Purpose**: Main conversation endpoint

**Request:**
```typescript
{
  text: string,                    // Required: User message
  sessionId?: string,              // Optional: Session ID
  emotion?: {                      // Optional: Current emotion
    label: string,
    valence: number,
    arousal: number
  },
  recentMessages?: Array<{        // Optional: Context
    text: string,
    sender: 'user' | 'agent',
    timestamp: string
  }>,
  clientContext?: any              // Optional: Additional context
}
```

**Response:**
```typescript
{
  id: string,                      // Message ID
  text: string,                    // AI response text
  audioUrl?: string,               // S3 URL for audio (if generated)
  metadata: {
    sessionId: string,
    timestamp: string,
    emotion?: {...}
  }
}
```

**Flow:**
1. Validate request & frontend key
2. Build prompt with context
3. Invoke Bedrock (Claude)
4. Synthesize speech (Polly) → S3
5. Save to DynamoDB
6. Return response

---

#### 2. `POST /api/analyze-emotion`
**Purpose**: Analyze emotion from image

**Request:**
```typescript
{
  image: string,                   // Base64 encoded image
  imageType: string                // MIME type (e.g., "image/jpeg")
}
```

**Response:**
```typescript
{
  emotionLabel: string,            // e.g., "happy", "sad", "neutral"
  valence: number,                 // -1 to 1 (negative to positive)
  arousal: number                  // -1 to 1 (calm to excited)
}
```

**Flow:**
1. Try external Cognitive API (if configured)
2. Fallback to AWS Rekognition
3. Return emotion data

---

#### 3. `POST /api/upload-audio`
**Purpose**: Upload audio for transcription

**Request:**
- Form data with `audio` file (Blob/File)

**Response:**
```typescript
{
  transcript: string,              // Transcribed text
  jobId?: string                   // Transcribe job ID (if async)
}
```

**Flow:**
1. Upload audio to S3
2. Start Transcribe job
3. Return transcript (or job ID for async)

---

#### 4. `GET /api/health`
**Purpose**: Health check

**Response:**
```typescript
{
  status: "ok",
  timestamp: string,
  service: "aisalesagent-backend",
  version: "1.0.0"
}
```

---

## 🔐 Security Schema

### Authentication
- **Frontend Key**: `X-Frontend-Key` header
  - Must match `FRONTEND_KEY` environment variable
  - Validated on all API endpoints

### CORS
- **Origin**: Configurable via `CORS_ORIGIN` env var
- **Credentials**: Enabled
- **Methods**: All (ANY)

### Data Protection
- **PII Redaction**: Utility functions (placeholder)
- **Payload Limits**: 10MB max
- **S3 URLs**: Pre-signed with expiration
- **TTL**: Auto-delete old conversations

---

## 🎨 Frontend Architecture

### Component Hierarchy

```
App
├── Disclaimer
└── app-container
    ├── app-left
    │   ├── ChatArea
    │   │   └── MessageBubble[] (messages)
    │   └── ControlPanel
    │       ├── Control Buttons (Voice/Video)
    │       └── Text Input
    └── app-right
        ├── VideoPreview
        └── EmotionIndicator
```

### State Management

**Hooks:**
- `useConversation`: Manages messages, loading, sendMessage
- `useSpeechRecognition`: Handles Web Speech API
- `useEmotionDetection`: Manages emotion analysis

**State Flow:**
```
User Action
    ↓
Hook Updates State
    ↓
Component Re-renders
    ↓
API Call (if needed)
    ↓
Update State with Response
    ↓
UI Updates
```

---

## ☁️ AWS Infrastructure Schema

### Lambda Function
- **Name**: `aisalesagent-{stage}-api`
- **Runtime**: Node.js 18.x
- **Memory**: 512 MB
- **Timeout**: 30 seconds
- **Handler**: `index.handler` (from root `index.js`)

### API Gateway
- **Type**: REST API
- **Path**: `/api/{proxy+}`
- **Method**: ANY
- **CORS**: Enabled
- **Integration**: Lambda Proxy

### IAM Permissions
```yaml
- bedrock:InvokeModel
- bedrock:InvokeModelWithResponseStream
- polly:SynthesizeSpeech
- transcribe:StartTranscriptionJob
- transcribe:GetTranscriptionJob
- rekognition:DetectFaces
- rekognition:DetectLabels
- s3:PutObject, GetObject, DeleteObject
- dynamodb:PutItem, GetItem, Query, UpdateItem, DeleteItem
```

### Resources Created
1. **S3 Bucket**: `aisalesagent-assets-{stage}`
2. **DynamoDB Table**: `aisalesagent-conversations-{stage}`
3. **IAM Role**: `aisalesagent-transcribe-role-{stage}`

---

## 🔄 Deployment Schema

### Local Development
```
Frontend (Vite) → http://localhost:5173
    ↓
Backend (Express) → http://localhost:3000
    ↓
AWS Services (via AWS SDK)
```

### Production Deployment
```
Frontend (Vercel) → https://ai-sales-agent.vercel.app
    ↓
API Gateway → https://o7179pt59f.execute-api.ap-south-1.amazonaws.com/prod
    ↓
Lambda Function
    ↓
AWS Services
```

### CI/CD Pipeline
```
GitHub Push
    ↓
GitHub Actions
    ├─ Test (Jest)
    ├─ Build (TypeScript + Vite)
    └─ Deploy (Serverless Framework)
```

---

## 📦 Environment Variables

### Backend (Lambda)
```bash
NODE_ENV=production
FRONTEND_KEY=<secure-random-string>
BEDROCK_MODEL=anthropic.claude-v2
MOCK_BEDROCK=false
S3_BUCKET_NAME=aisalesagent-assets-prod
DYNAMODB_TABLE=aisalesagent-conversations-prod
POLLY_VOICE=Joanna
TRANSCRIBE_ROLE_ARN=arn:aws:iam::...
COGNITIVE_API_URL=<optional>
COGNITIVE_API_KEY=<optional>
USE_REKOGNITION_FALLBACK=true
CORS_ORIGIN=https://ai-sales-agent.vercel.app
```

### Frontend (Vercel)
```bash
VITE_API_BASE_URL=https://o7179pt59f.execute-api.ap-south-1.amazonaws.com/prod
VITE_FRONTEND_KEY=<same-as-backend-FRONTEND_KEY>
```

---

## 🔀 Request/Response Flow Example

### Example: User sends "Hello, how can you help?"

```
1. User types message in frontend
   ↓
2. Frontend calls: POST /api/converse
   Headers: { X-Frontend-Key: "..." }
   Body: { text: "Hello...", sessionId: "session-123" }
   ↓
3. Lambda receives request
   ├─ Validates frontend key ✓
   ├─ Extracts text, sessionId
   ├─ Queries DynamoDB for recent messages
   └─ Builds prompt with context
   ↓
4. Bedrock Client
   ├─ Invokes Claude model
   └─ Returns: "Hello! I'm Aiden, your AI assistant..."
   ↓
5. Polly Client
   ├─ Synthesizes speech
   ├─ Uploads to S3
   └─ Returns: S3 URL
   ↓
6. Conversation Store
   ├─ Saves user message to DynamoDB
   ├─ Saves agent response to DynamoDB
   └─ Sets TTL for auto-cleanup
   ↓
7. Lambda returns response
   {
     id: "msg-456",
     text: "Hello! I'm Aiden...",
     audioUrl: "https://s3.../audio.mp3",
     metadata: {...}
   }
   ↓
8. Frontend receives response
   ├─ Displays message in chat
   ├─ Plays audio from S3 URL
   └─ Updates UI state
```

---

## 🎯 Key Design Patterns

### 1. Serverless Architecture
- **Stateless**: No server to maintain
- **Scalable**: Auto-scales with traffic
- **Cost-effective**: Pay per request

### 2. Microservices Pattern
- **Handlers**: Separate files for each endpoint
- **Services**: Isolated AWS service clients
- **Utils**: Reusable utility functions

### 3. Separation of Concerns
- **Frontend**: UI/UX only
- **Backend**: Business logic + AWS integration
- **Infrastructure**: IaC (Infrastructure as Code)

### 4. Error Handling
- **Centralized**: `errorHandler.ts` middleware
- **Graceful**: Fallbacks (Rekognition if Cognitive API fails)
- **Logging**: CloudWatch logs

---

## 📊 Data Models

### Message Model
```typescript
interface Message {
  id: string
  text: string
  sender: 'user' | 'agent'
  timestamp: Date
  audioUrl?: string
}
```

### Emotion Model
```typescript
interface Emotion {
  label: string        // "happy", "sad", "neutral", etc.
  valence: number     // -1 (negative) to 1 (positive)
  arousal: number     // -1 (calm) to 1 (excited)
}
```

### Conversation Model (DynamoDB)
```typescript
interface Conversation {
  sessionId: string
  messageId: string
  userMessage: string
  agentMessage: string
  emotion?: Emotion
  timestamp: string
  ttl?: number
}
```

---

## 🚀 Deployment Architecture

### Current Setup
- **Frontend**: Vercel (automatic from GitHub)
- **Backend**: AWS Lambda (via Serverless Framework)
- **CI/CD**: GitHub Actions

### Deployment Flow
```
Developer
    ↓
Git Push → GitHub
    ↓
    ├─→ Vercel (auto-deploy frontend)
    └─→ GitHub Actions
            ├─ Test
            ├─ Build
            └─ Deploy to AWS
```

---

## 🔍 Key Files & Their Roles

| File | Purpose |
|------|---------|
| `serverless.yml` | Infrastructure definition (Lambda, API Gateway, DynamoDB, S3) |
| `backend/src/index.serverless.ts` | Lambda entry point (wraps Express) |
| `backend/src/handlers/converse.ts` | Main conversation logic |
| `backend/src/services/bedrockClient.ts` | AWS Bedrock integration |
| `frontend/src/App.tsx` | Main React component |
| `frontend/src/services/apiService.ts` | API client for backend |
| `scripts/prepare-lambda.js` | Copies files to root for Lambda packaging |

---

## 🎓 Summary

**AISalesAgent** is a **modern, serverless AI assistant** with:
- ✅ **Frontend**: React SPA on Vercel
- ✅ **Backend**: Express on AWS Lambda
- ✅ **AI**: AWS Bedrock (Claude) for conversations
- ✅ **Voice**: Polly (TTS) + Transcribe (STT)
- ✅ **Emotion**: Rekognition or external API
- ✅ **Storage**: DynamoDB (conversations) + S3 (audio)
- ✅ **CI/CD**: GitHub Actions
- ✅ **Infrastructure**: Serverless Framework

The architecture is **scalable**, **cost-effective**, and **production-ready**.

