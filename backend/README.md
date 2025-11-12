# Backend API

Backend API for AISalesAgent MVP built with Node.js, TypeScript, and Express.

## Features

- RESTful API endpoints
- AWS Bedrock integration for LLM
- Amazon Polly for text-to-speech
- AWS Transcribe for speech-to-text (batch)
- AWS Rekognition for emotion detection
- DynamoDB for conversation storage
- S3 for audio asset storage
- Serverless-ready (Lambda + API Gateway)

## API Endpoints

### POST /api/converse

Main conversation endpoint. Sends a message to the AI assistant and receives a response.

**Request:**
```json
{
  "text": "Hello, how can you help me?",
  "sessionId": "session-123",
  "emotion": {
    "label": "neutral",
    "valence": 0.5,
    "arousal": 0.5
  },
  "recentMessages": []
}
```

**Response:**
```json
{
  "id": "msg-123",
  "text": "Hello! I'm Aiden, your AI assistant...",
  "audioUrl": "https://s3.amazonaws.com/...",
  "metadata": {
    "sessionId": "session-123",
    "timestamp": "2024-01-01T00:00:00Z",
    "emotion": {...}
  }
}
```

### POST /api/analyze-emotion

Analyze emotion from an image.

**Request:**
```json
{
  "image": "base64-encoded-image-data",
  "imageType": "image/jpeg"
}
```

**Response:**
```json
{
  "emotionLabel": "happy",
  "valence": 0.8,
  "arousal": 0.7
}
```

### POST /api/upload-audio

Upload audio file for transcription.

**Request:**
- Form data with `audio` file

**Response:**
```json
{
  "transcript": "Hello, how can you help me?",
  "jobId": "transcribe-job-123"
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z",
  "service": "aisalesagent-backend",
  "version": "1.0.0"
}
```

## Local Development

### Prerequisites

- Node.js 18+
- AWS CLI configured
- AWS credentials with required permissions

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your AWS credentials
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Run the server:
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:3000`.

## Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

## Deployment

### Serverless Framework

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to AWS:
   ```bash
   cd ../infra
   serverless deploy
   ```

### Environment Variables

See `.env.example` for required environment variables.

## Architecture

- **Express**: Web framework
- **AWS Bedrock**: LLM inference
- **Amazon Polly**: Text-to-speech
- **AWS Transcribe**: Speech-to-text
- **AWS Rekognition**: Emotion detection
- **DynamoDB**: Conversation storage
- **S3**: Audio asset storage

## Security

- Frontend key authentication
- CORS configuration
- Payload size limits
- PII redaction utilities
- Signed S3 URLs

## Monitoring

- CloudWatch logs
- Request/response logging
- Error tracking
- Performance metrics

## Troubleshooting

### Common Issues

1. **Bedrock access denied**: Verify IAM permissions and model access
2. **DynamoDB errors**: Check table name and permissions
3. **S3 errors**: Verify bucket permissions
4. **CORS errors**: Check CORS configuration

### Debug Mode

Set `NODE_ENV=development` and `DEBUG=true` for detailed logs.

## License

MIT

