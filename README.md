# AISalesAgent MVP

A web prototype that provides a voice + text AI assistant UI for a chartered accountancy practice. The system uses AWS Bedrock for LLM capabilities, Amazon Transcribe for speech-to-text, Amazon Polly for text-to-speech, and AWS Rekognition (or an external Cognitive API) for emotion analysis.

## Project Description

AISalesAgent is a modular, production-oriented MVP that enables prospective clients to interact with "Aiden", an AI assistant representing a chartered accountancy practice. The system supports:

- **Voice & Text Input**: Web Speech API (primary) and AWS Transcribe (batch) for speech-to-text
- **AI Responses**: AWS Bedrock LLM with a customized persona
- **Text-to-Speech**: Amazon Polly for natural voice responses
- **Emotion Detection**: Webcam-based emotion analysis via AWS Rekognition or external Cognitive API
- **Conversation Management**: DynamoDB for conversation history and context

## Architecture Flow

```
User Browser
    │
    ├── Web Speech API (STT) ──┐
    ├── Video Capture ──────────┤
    │                           │
    └───────────────────────────┴─> Frontend (React + TypeScript)
                                          │
                                          ├─> POST /api/converse
                                          ├─> POST /api/analyze-emotion
                                          └─> POST /api/upload-audio
                                          │
                                          ▼
                                    API Gateway
                                          │
                                          ▼
                                    Lambda Functions
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ▼                     ▼                     ▼
            AWS Bedrock            Amazon Polly          AWS Rekognition
            (LLM)                  (TTS)                 (Emotion)
                    │                     │                     │
                    └─────────────────────┼─────────────────────┘
                                          │
                                          ▼
                                    DynamoDB (Conversations)
                                    S3 (Audio Assets)
```

## Quickstart

### Prerequisites

- Node.js 18+ and npm
- AWS CLI configured with appropriate credentials
- AWS Account with permissions for Bedrock, Polly, Transcribe, Rekognition, DynamoDB, S3, Lambda, API Gateway

### Local Development

#### 1. Clone and Install Dependencies

```bash
cd AISalesAgent

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 2. Configure Environment Variables

**Create and edit environment files:**

**`backend/.env` - Required:**
```bash
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=ap-south-1
FRONTEND_KEY=your_secure_random_string
BEDROCK_MODEL=anthropic.claude-v2
```

**`frontend/.env` - Required:**
```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_FRONTEND_KEY=your_secure_random_string  # Must match backend FRONTEND_KEY
```

**⚠️ Important:**
1. Get AWS credentials from AWS Console → IAM → Users → Security Credentials
2. Generate a random string for `FRONTEND_KEY` (e.g., `openssl rand -hex 32`)
3. Enable Bedrock model access: AWS Console → Bedrock → Model Access → Request access
4. Use the same `FRONTEND_KEY` in both backend and frontend `.env` files

#### 3. Run Backend (Local Express Server)

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:3000` (or PORT from .env).

#### 4. Run Frontend

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173` (Vite default).

## Deployment

**📚 Complete step-by-step guide: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

Quick summary:
1. **AWS Backend**: Deploy using Serverless Framework
2. **Vercel Frontend**: Connect GitHub repo and deploy
3. **GitHub Actions**: Add secrets for automatic deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## Testing

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

1. **Start Conversation**: Open the frontend, click "Start Voice" or type a message
2. **Test Emotion Detection**: Enable video and allow webcam access
3. **Test Transcribe**: Toggle "Use Transcribe" and speak
4. **Test Disclaimer**: Ask for legal/financial advice to see refusal pattern

See [demo/README.md](./demo/README.md) for demo instructions.

## Project Structure

```
AISalesAgent/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # React hooks
│   │   ├── services/      # API clients
│   │   └── styles/        # CSS/styles
│   └── package.json
├── backend/           # Node.js + TypeScript
│   ├── src/
│   │   ├── handlers/      # API handlers
│   │   ├── services/      # AWS service clients
│   │   └── utils/         # Utilities
│   └── package.json
├── infra/             # Infrastructure as Code
│   ├── serverless.yml     # Serverless Framework config
│   └── README.md
├── scripts/           # Deployment scripts
│   └── deploy.sh
├── docs/              # Documentation
├── .github/workflows/ # CI/CD
│   └── deploy.yml
└── README.md
```

## Deployment

### Option 1: AWS (Serverless)

**Prerequisites:**
- AWS CLI configured
- GitHub Secrets configured (for CI/CD)

**Deploy:**
```bash
cd infra
npm install
serverless deploy --stage prod
```

**GitHub Secrets (for CI/CD):**
Add these in GitHub → Settings → Secrets → Actions:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `FRONTEND_KEY`
- `CORS_ORIGIN` (optional, e.g., `https://yourdomain.com`)

### Option 2: Vercel (Frontend) + AWS (Backend)

**Frontend on Vercel:**
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel:
   - `VITE_API_BASE_URL` (your backend API URL)
   - `VITE_FRONTEND_KEY`
3. Deploy

**Backend on AWS:**
- Deploy backend separately using Serverless Framework
- Update frontend `VITE_API_BASE_URL` with AWS API Gateway URL

## Features

### Voice Input
- **Primary**: Web Speech API for real-time speech-to-text (browser-based)
- **Alternative**: AWS Transcribe batch jobs for recorded audio

### Emotion Detection
- **Primary**: External Cognitive API (if `COGNITIVE_API_URL` is set)
- **Fallback**: AWS Rekognition for face emotion detection

### Text-to-Speech
- Amazon Polly with configurable voice (default: Joanna)
- Audio streaming or base64 response for immediate playback

### Conversation Management
- DynamoDB for conversation history
- Session-based context management
- Emotion cues integrated into prompts

## Security & Compliance

- CORS configured for allowed origins only
- Payload size limits (max 3MB for images/audio)
- Signed S3 URLs for audio assets (short expiry)
- PII redaction utilities (placeholder)
- Manual video capture toggle
- Disclaimer displayed in UI and responses

## Troubleshooting

**Common Issues:**
1. **Web Speech API not working**: Use Chrome/Edge and HTTPS (or localhost)
2. **Bedrock access denied**: Enable model access in AWS Bedrock console
3. **CORS errors**: Check `CORS_ORIGIN` in backend `.env`
4. **npm ci fails**: Use `npm install` instead (lock files are now committed)

## Next Steps

1. **Local Development**: Follow [SETUP.md](./SETUP.md) to run locally
2. **AWS Deployment**: Deploy backend using Serverless Framework
3. **Vercel Deployment**: Deploy frontend to Vercel (connect GitHub repo)
4. **GitHub Secrets**: Add secrets for CI/CD (only if using GitHub Actions)

## License

MIT

