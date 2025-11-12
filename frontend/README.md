# Frontend

React + TypeScript + Vite frontend for AISalesAgent MVP.

## Features

- Voice input (Web Speech API)
- Text input
- Video preview with emotion detection
- Chat interface with message bubbles
- Audio playback for AI responses
- Emotion indicator
- Disclaimer display

## Local Development

### Prerequisites

- Node.js 18+
- Backend API running on `http://localhost:3000`

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API base URL
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173`.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Environment Variables

- `VITE_API_BASE_URL`: Backend API base URL (default: `http://localhost:3000`)

## Features

### Voice Input

- Uses Web Speech API for real-time speech-to-text
- Supports Chrome, Edge, and other Chromium-based browsers
- Requires HTTPS or localhost

### Video Preview

- Webcam access for emotion detection
- Captures frames every 5 seconds
- Displays detected emotion

### Chat Interface

- Message bubbles for user and agent
- Timestamp display
- Audio playback for AI responses
- Loading indicator

### Emotion Detection

- Integrates with backend emotion analysis API
- Displays emotion label, valence, and arousal
- Includes emotion in conversation context

## Browser Support

- Chrome/Edge: Full support (Web Speech API, Webcam)
- Firefox: Partial support (no Web Speech API)
- Safari: Partial support (no Web Speech API)

## Troubleshooting

### Web Speech API not working

- Ensure you're using Chrome or Edge
- Check microphone permissions
- Verify HTTPS or localhost

### Video not working

- Check webcam permissions
- Verify browser supports getUserMedia
- Check for conflicting applications

### Audio not playing

- Check browser audio permissions
- Verify API endpoint is accessible
- Check browser console for errors

## License

MIT

