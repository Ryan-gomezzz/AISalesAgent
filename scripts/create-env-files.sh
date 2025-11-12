#!/bin/bash

# Script to create .env files from templates

echo "Creating .env files..."

# Create backend .env file
cat > backend/.env << 'EOF'
# Backend Environment Variables

# Server Configuration
PORT=3000
NODE_ENV=development

# Authentication
FRONTEND_KEY=replace_me_with_secure_random_string

# AWS Configuration
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here

# Bedrock (LLM)
BEDROCK_MODEL=anthropic.claude-v2
BEDROCK_ENDPOINT=
MOCK_BEDROCK=false

# S3 (Audio Storage)
S3_BUCKET_NAME=aisales-assets-dev

# DynamoDB (Conversation Storage)
DYNAMODB_TABLE=aisales-conversations

# Polly (Text-to-Speech)
POLLY_VOICE=Joanna

# Transcribe (Speech-to-Text - Optional)
TRANSCRIBE_ROLE_ARN=

# Cognitive API (Emotion Detection - Optional)
COGNITIVE_API_URL=
COGNITIVE_API_KEY=
USE_REKOGNITION_FALLBACK=true

# CORS
CORS_ORIGIN=*
EOF

# Create frontend .env file
cat > frontend/.env << 'EOF'
# Frontend Environment Variables

# API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_FRONTEND_KEY=replace_me_with_secure_random_string
EOF

echo "✅ Created backend/.env"
echo "✅ Created frontend/.env"
echo ""
echo "⚠️  IMPORTANT: Update these files with your actual API keys!"
echo "   See API_KEYS_QUICK_REFERENCE.md for details"

