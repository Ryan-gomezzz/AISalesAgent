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

Copy the example environment files and configure:

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your AWS credentials and settings

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your API base URL
```

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

### Deploy to AWS

See [infra/README.md](./infra/README.md) for detailed deployment instructions.

Quick deploy:

```bash
# Set up AWS credentials
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_REGION=ap-south-1

# Deploy infrastructure
cd infra
npm install
npm run deploy

# Deploy frontend and backend
cd ../scripts
chmod +x deploy.sh
./deploy.sh
```

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

## Environment Variables

### Backend

See [backend/.env.example](./backend/.env.example) for all backend environment variables.

Key variables:
- `BEDROCK_MODEL`: AWS Bedrock model ID (e.g., `anthropic.claude-v2`)
- `AWS_REGION`: AWS region (e.g., `ap-south-1`)
- `S3_BUCKET_NAME`: S3 bucket for audio assets
- `DYNAMODB_TABLE`: DynamoDB table name
- `COGNITIVE_API_URL`: Optional external Cognitive API endpoint
- `COGNITIVE_API_KEY`: Optional API key for Cognitive API

### Frontend

See [frontend/.env.example](./frontend/.env.example) for all frontend environment variables.

Key variables:
- `VITE_API_BASE_URL`: Backend API base URL

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

### Common Issues

1. **Web Speech API not working**: Ensure you're using a supported browser (Chrome, Edge) and HTTPS (or localhost)
2. **Bedrock access denied**: Verify IAM permissions and model access in AWS Bedrock console
3. **CORS errors**: Check API Gateway CORS configuration and frontend origin
4. **Transcribe job fails**: Verify S3 bucket permissions and Transcribe IAM role

### Debug Mode

Set `NODE_ENV=development` and `DEBUG=true` for detailed logs.

## Future Improvements

- [ ] Streaming Transcribe integration
- [ ] Cognito authentication
- [ ] CloudWatch alarms and monitoring
- [ ] Multi-language support
- [ ] Conversation export
- [ ] Admin dashboard
- [ ] Rate limiting
- [ ] WebSocket support for real-time streaming

## License

MIT

## Support

For issues and questions, please open an issue in the repository.

