# Demo Instructions

This directory contains instructions for creating a demo of the AISalesAgent MVP.

## Prerequisites

- Local development environment set up
- Backend running on `http://localhost:3000`
- Frontend running on `http://localhost:5173`
- Webcam and microphone access (for full demo)

## Demo Flow

### 1. Start the Application

1. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open the frontend in a browser: `http://localhost:5173`

### 2. Basic Text Conversation

1. Type a message in the text input: "Hello, how can you help me?"
2. Click "Send" or press Enter
3. Observe the AI response with text and audio playback
4. Verify the disclaimer is displayed

### 3. Voice Input (Web Speech API)

1. Click "Start Voice" button
2. Speak into the microphone: "What services do you offer?"
3. Observe the transcript appearing in real-time
4. Wait for the message to be sent automatically
5. Verify the AI response

### 4. Emotion Detection

1. Click "Start Video" button
2. Allow webcam access when prompted
3. Position your face in the video preview
4. Wait 5 seconds for emotion detection
5. Observe the emotion indicator showing detected emotion
6. Verify the emotion is included in the next conversation request

### 5. Transcribe Integration

1. Toggle "Use Transcribe" checkbox
2. Click "Start Voice" button
3. Speak a message and stop
4. Observe the audio being uploaded and transcribed
5. Verify the transcript appears in the chat

### 6. Disclaimer and Advice Refusal

1. Type a message requesting legal advice: "Can you help me with tax planning?"
2. Observe the AI response with disclaimer
3. Type: "What should I do about my tax return?"
4. Verify the AI politely declines and offers to connect with a human

## Recording a Demo

### Option 1: Screen Recording Software

1. Use screen recording software (e.g., OBS Studio, Loom, or built-in screen recorder)
2. Record the browser window showing the frontend
3. Include audio from microphone and system
4. Record for 30-60 seconds showing:
   - Text conversation
   - Voice input
   - Emotion detection
   - Disclaimer display

### Option 2: Browser Extension

1. Install a screen recording browser extension (e.g., Loom, Screencastify)
2. Record the browser tab
3. Include microphone audio
4. Record the demo flow

### Option 3: Command Line (Linux/Mac)

```bash
# Install dependencies
sudo apt-get install ffmpeg

# Record screen with audio
ffmpeg -f x11grab -s 1920x1080 -r 30 -i :0.0 -f alsa -i default -t 60 demo.mp4
```

### Option 4: Windows

1. Use Windows Game Bar (Win + G)
2. Start screen recording
3. Record the demo flow
4. Stop recording (Win + G)

## Demo Script

1. **Introduction** (5 seconds):
   - "This is AISalesAgent, an AI assistant for a chartered accountancy practice"

2. **Text Conversation** (10 seconds):
   - Type: "Hello, how can you help me?"
   - Show AI response with audio playback

3. **Voice Input** (10 seconds):
   - Click "Start Voice"
   - Speak: "What services do you offer?"
   - Show transcript and AI response

4. **Emotion Detection** (10 seconds):
   - Click "Start Video"
   - Show emotion detection indicator
   - Show emotion being included in conversation

5. **Disclaimer** (5 seconds):
   - Show disclaimer text
   - Demonstrate advice refusal

## Tips for Recording

- Use a quiet environment
- Speak clearly for voice input
- Ensure good lighting for video
- Show the browser console for debugging (optional)
- Include error handling demonstration (optional)
- Keep the demo under 60 seconds
- Add captions or annotations if needed

## Post-Production

1. Edit the recording to remove pauses
2. Add captions or annotations
3. Add background music (optional)
4. Compress the video for sharing
5. Export as GIF or MP4

## Sharing the Demo

- Upload to YouTube (unlisted or public)
- Share via Google Drive or Dropbox
- Embed in README.md
- Include in presentation slides
- Add to project documentation

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

### Emotion detection not working
- Verify AWS Rekognition permissions
- Check image size (max 3MB)
- Verify API endpoint is accessible

## Next Steps

- Create a longer demo video (5-10 minutes)
- Add voiceover narration
- Include architecture diagram
- Show deployment process
- Demonstrate error handling
- Show monitoring and logging

