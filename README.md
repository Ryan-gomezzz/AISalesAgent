# AISalesAgent MVP

A sophisticated, production-ready AI sales assistant platform that enables interactive voice and text conversations with an AI agent. The system uses AWS Bedrock for LLM capabilities, Amazon Polly for text-to-speech, Amazon Transcribe for speech-to-text, and AWS Rekognition for emotion analysis.

## 🎯 Project Overview

AISalesAgent is a full-stack, serverless application that provides an AI-powered sales assistant named "Aiden" to help potential clients learn about and engage with your products and services. The system supports:

- **Interactive Voice Conversations**: Real-time speech-to-text and text-to-speech
- **Product Selection**: Choose from Chartered Accountancy Services, SOIL Business Platform, or AI Receptionist
- **Emotion Detection**: Webcam-based emotion analysis to adapt responses
- **Multi-modal Input**: Text, voice, and video support
- **Conversation Management**: Persistent conversation history with DynamoDB

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser (Frontend)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Text Input   │  │ Voice Input  │  │ Video Input  │      │
│  │              │  │ (Web Speech)│  │ (Webcam)     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                 │              │
│         └──────────────────┴─────────────────┘              │
│                            │                                 │
│                    React + TypeScript                        │
│                    (Vite Build System)                        │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (AWS)                         │
│                    /api/converse                             │
│                    /api/analyze-emotion                      │
│                    /api/upload-audio                         │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              Lambda Function (Node.js + Express)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Bedrock      │  │ Polly        │  │ Rekognition │      │
│  │ (LLM)        │  │ (TTS)        │  │ (Emotion)   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                 │              │
│         └──────────────────┴─────────────────┘              │
└────────────────────────────┼─────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
    ┌───────────────────┐    ┌───────────────────┐
    │   DynamoDB        │    │   S3 Bucket       │
    │ (Conversations)   │    │  (Audio Assets)   │
    └───────────────────┘    └───────────────────┘
```

### Technology Stack

**Frontend:**
- React 18+ with TypeScript
- Vite for build tooling
- Web Speech API for voice input
- Browser Speech Synthesis for text-to-speech
- Axios for API communication

**Backend:**
- Node.js 18+ with TypeScript
- Express.js (wrapped with serverless-http for Lambda)
- AWS SDK v3 for AWS services

**AWS Services:**
- **Lambda**: Serverless function hosting
- **API Gateway**: REST API endpoints
- **Bedrock**: LLM inference (Claude v2)
- **Polly**: Text-to-speech synthesis
- **Transcribe**: Batch audio transcription
- **Rekognition**: Emotion detection from images
- **DynamoDB**: Conversation storage
- **S3**: Audio asset storage

**Infrastructure:**
- Serverless Framework for deployment
- GitHub Actions for CI/CD
- Vercel for frontend hosting

## 📁 Project Structure

```
AISalesAgent/
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── components/          # UI Components
│   │   │   ├── ChatArea.tsx     # Message display
│   │   │   ├── ControlPanel.tsx # Input controls
│   │   │   ├── ProductSelector.tsx # Product selection
│   │   │   ├── VideoPreview.tsx # Webcam preview
│   │   │   ├── EmotionIndicator.tsx # Emotion display
│   │   │   ├── MessageBubble.tsx # Individual messages
│   │   │   └── Disclaimer.tsx   # Legal disclaimer
│   │   ├── hooks/               # React Hooks
│   │   │   ├── useConversation.ts    # Chat state
│   │   │   ├── useSpeechRecognition.ts # Voice input
│   │   │   ├── useEmotionDetection.ts  # Emotion analysis
│   │   │   └── useTextToSpeech.ts      # TTS
│   │   ├── services/
│   │   │   └── apiService.ts    # API client
│   │   ├── styles/              # CSS files
│   │   ├── App.tsx              # Main component
│   │   └── main.tsx             # Entry point
│   ├── vercel.json              # Vercel config
│   └── package.json
│
├── backend/                     # Node.js Backend
│   ├── src/
│   │   ├── handlers/            # API Handlers
│   │   │   ├── converse.ts      # Main conversation
│   │   │   ├── analyzeEmotion.ts # Emotion detection
│   │   │   ├── uploadAudio.ts   # Audio transcription
│   │   │   └── health.ts        # Health check
│   │   ├── services/            # AWS Clients
│   │   │   ├── bedrockClient.ts # LLM
│   │   │   ├── pollyClient.ts   # TTS
│   │   │   ├── transcribeClient.ts # STT
│   │   │   └── cognitiveClient.ts  # External emotion API
│   │   ├── utils/               # Utilities
│   │   │   ├── conversationStore.ts # DynamoDB
│   │   │   ├── promptBuilder.ts     # Prompt construction
│   │   │   ├── redactPII.ts        # PII redaction
│   │   │   └── errorHandler.ts     # Error handling
│   │   ├── index.ts            # Express (local dev)
│   │   └── index.serverless.ts # Lambda handler
│   └── package.json
│
├── prompts/                     # AI Prompts
│   └── persona.md              # Sales agent persona
│
├── scripts/                     # Deployment Scripts
│   ├── prepare-lambda.js       # Prepares Lambda files
│   ├── deploy.sh               # Deployment script
│   └── setup.sh                # Setup script
│
├── serverless.yml              # Serverless config
├── .github/workflows/          # CI/CD
│   └── deploy.yml              # GitHub Actions
│
├── README.md                   # This file
└── SETUP.md                    # Setup instructions
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **AWS CLI** configured with credentials
- **AWS Account** with permissions for:
  - Lambda, API Gateway, DynamoDB, S3
  - Bedrock, Polly, Transcribe, Rekognition
  - IAM (for role creation)

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ryan-gomezzz/AISalesAgent.git
   cd AISalesAgent
   ```

2. **Install dependencies:**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Configure environment variables:**

   **`backend/.env`:**
   ```bash
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=ap-south-1
   FRONTEND_KEY=your_secure_random_string
   BEDROCK_MODEL=anthropic.claude-v2
   POLLY_VOICE=Joanna
   CORS_ORIGIN=http://localhost:5173
   ```

   **`frontend/.env`:**
   ```bash
   VITE_API_BASE_URL=http://localhost:3000
   VITE_FRONTEND_KEY=your_secure_random_string  # Must match backend
   ```

   **Generate a secure FRONTEND_KEY:**
   ```bash
   # Linux/Mac
   openssl rand -hex 32
   
   # Windows PowerShell
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
   ```

4. **Run the backend:**
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs on `http://localhost:3000`

5. **Run the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

## 🎨 Features

### Product Selection
Users can select from three products/services:
- **Chartered Accountancy Services**: Startup registration and financial guidance
- **SOIL - Business Scaling Platform**: AI-powered business intelligence and scaling
- **AI Receptionist**: 24/7 automated customer service

### Voice Interaction
- **Speech-to-Text**: Web Speech API for real-time voice input
- **Text-to-Speech**: Browser Speech Synthesis for AI responses
- **AWS Transcribe**: Optional batch audio transcription

### Emotion Detection
- Webcam-based emotion analysis using AWS Rekognition
- Emotion cues integrated into AI responses for personalized interactions

### Conversation Management
- Persistent conversation history in DynamoDB
- Session-based context management
- Emotion-aware responses

## 🔒 Security Features

- **CORS Protection**: Configured for specific origins
- **Frontend Key Authentication**: API requests require valid frontend key
- **Payload Size Limits**: Max 10MB for requests
- **Signed S3 URLs**: Short expiry for audio assets
- **PII Redaction**: Utilities for sensitive data handling
- **Input Validation**: Server-side validation for all inputs

## 📦 Deployment

### Backend Deployment (AWS)

1. **Build the backend:**
   ```bash
   cd backend
   npm run build
   ```

2. **Prepare Lambda files:**
   ```bash
   cd ..
   npm run prepare:lambda
   ```

3. **Deploy with Serverless:**
   ```bash
   npx serverless deploy --stage prod --region ap-south-1
   ```

4. **Set environment variables:**
   ```bash
   export FRONTEND_KEY=your_key
   export CORS_ORIGIN=https://your-vercel-url.vercel.app
   npx serverless deploy --stage prod
   ```

### Frontend Deployment (Vercel)

1. **Connect GitHub repository** to Vercel
2. **Set Root Directory** to `frontend` in Vercel project settings
3. **Add environment variables:**
   - `VITE_API_BASE_URL`: Your AWS API Gateway URL
   - `VITE_FRONTEND_KEY`: Your frontend key (must match backend)
4. **Deploy**: Vercel will automatically deploy on push to main

### CI/CD (GitHub Actions)

The project includes a GitHub Actions workflow that:
- Runs tests on pull requests
- Builds frontend and backend
- Deploys to AWS on push to main
- Uploads frontend to S3

**Required GitHub Secrets:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `FRONTEND_KEY`
- `CORS_ORIGIN` (optional)

## 🧪 Testing

### Unit Tests
```bash
cd backend
npm test
```

### Integration Tests
```bash
cd backend
npm run test:integration
```

### Manual Testing
1. Start a conversation by selecting a product
2. Test voice input with "Start Voice" button
3. Enable video for emotion detection
4. Test text input in the message box

## 📊 Database Schema

### DynamoDB Table: `aisalesagent-conversations-{stage}`

**Primary Key:**
- `sessionId` (HASH) - Partition key
- `messageId` (RANGE) - Sort key

**Attributes:**
- `userMessage`: string
- `agentMessage`: string
- `emotion`: { label, valence, arousal }
- `timestamp`: ISO string
- `ttl`: number (auto-delete after 7 days)

**Global Secondary Index:**
- `timestamp-index`: For querying by timestamp

## 🔧 Configuration

### Backend Configuration

**Environment Variables:**
- `FRONTEND_KEY`: Authentication key (required)
- `BEDROCK_MODEL`: Bedrock model ID (default: `anthropic.claude-v2`)
- `POLLY_VOICE`: Polly voice name (default: `Joanna`)
- `CORS_ORIGIN`: Allowed CORS origin (default: `*`)
- `S3_BUCKET_NAME`: S3 bucket for audio assets
- `DYNAMODB_TABLE`: DynamoDB table name

### Frontend Configuration

**Environment Variables:**
- `VITE_API_BASE_URL`: Backend API URL
- `VITE_FRONTEND_KEY`: Frontend authentication key

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Ensure `CORS_ORIGIN` matches your frontend URL
   - Check that `x-frontend-key` header is allowed

2. **Bedrock Access Denied:**
   - Enable model access in AWS Bedrock console
   - Verify IAM permissions include `bedrock:InvokeModel`

3. **Voice Not Working:**
   - Use Chrome/Edge browser
   - Ensure HTTPS or localhost
   - Check browser permissions for microphone

4. **Build Failures:**
   - Ensure Node.js 18+ is installed
   - Clear `node_modules` and reinstall
   - Check TypeScript errors

## 📝 API Endpoints

### POST `/api/converse`
Main conversation endpoint.

**Request:**
```json
{
  "text": "Hello, I'm interested in your services",
  "sessionId": "session-123",
  "selectedProduct": "accountancy",
  "emotion": {
    "label": "happy",
    "valence": 0.8,
    "arousal": 0.6
  },
  "recentMessages": []
}
```

**Response:**
```json
{
  "id": "msg-123",
  "text": "Hello! I'm Aiden, your AI sales assistant...",
  "audioUrl": "https://s3.../audio.mp3",
  "metadata": {
    "sessionId": "session-123",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### POST `/api/analyze-emotion`
Analyze emotion from image.

**Request:**
```json
{
  "image": "base64_encoded_image",
  "imageType": "image/jpeg"
}
```

### POST `/api/upload-audio`
Upload audio for transcription.

**Request:** `multipart/form-data` with `audio` file

### GET `/api/health`
Health check endpoint.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

MIT

## 🆘 Support

For detailed setup instructions, see [SETUP.md](./SETUP.md).

For issues or questions, please open an issue on GitHub.
