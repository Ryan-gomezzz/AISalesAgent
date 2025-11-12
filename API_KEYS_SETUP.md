# API Keys and Environment Variables Setup Guide

This document provides a comprehensive guide on all API keys and environment variables you need to configure for the AISalesAgent MVP.

## 📋 Quick Overview

### Required for Local Development:
1. **AWS Credentials** (Access Key ID & Secret Access Key)
2. **Frontend Key** (for API authentication)
3. **AWS Region** (e.g., `ap-south-1`)

### Optional but Recommended:
4. **Cognitive API** (if using external emotion detection)
5. **CORS Origin** (for production)

### Auto-configured (via AWS IAM):
- Bedrock, Polly, Transcribe, Rekognition, DynamoDB, S3 (use AWS IAM roles, no API keys needed)

---

## 🔐 1. AWS Credentials (REQUIRED)

### What they're for:
- Access to AWS services (Bedrock, Polly, Transcribe, Rekognition, DynamoDB, S3)
- Required for both local development and AWS deployment

### Where to get them:
1. Go to AWS Console → IAM → Users → Your User → Security Credentials
2. Click "Create Access Key"
3. Download or copy:
   - **Access Key ID**
   - **Secret Access Key**

### Where to add them:

#### **Option A: Local Development (Backend)**
**File:** `backend/.env`

```bash
# AWS Credentials
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_REGION=ap-south-1
```

#### **Option B: AWS Deployment (Serverless)**
**Method 1: Environment Variables (Recommended)**
```bash
export AWS_ACCESS_KEY_ID=your_access_key_id_here
export AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
export AWS_REGION=ap-south-1
```

**Method 2: AWS CLI Configuration**
```bash
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key
# Enter your region (e.g., ap-south-1)
# Enter output format (json)
```

**Method 3: GitHub Secrets (for CI/CD)**
Go to GitHub Repository → Settings → Secrets → Actions → New Secret
- Add `AWS_ACCESS_KEY_ID`
- Add `AWS_SECRET_ACCESS_KEY`

---

## 🔑 2. Frontend Key (REQUIRED)

### What it's for:
- Authentication key for API requests from frontend to backend
- Prevents unauthorized access to your API

### Where to get it:
- Generate a random string (e.g., use `openssl rand -hex 32`)
- Or use any secure random string

### Where to add it:

#### **Backend (.env file)**
**File:** `backend/.env`

```bash
FRONTEND_KEY=your_secure_random_string_here
```

#### **Frontend (.env file)**
**File:** `frontend/.env`

```bash
VITE_FRONTEND_KEY=your_secure_random_string_here
```

**Note:** The frontend key should match in both backend and frontend `.env` files.

#### **AWS Deployment (Serverless)**
**File:** Set as environment variable or in `infra/serverless.yml`

```bash
export FRONTEND_KEY=your_secure_random_string_here
```

Or update `infra/serverless.yml`:
```yaml
environment:
  FRONTEND_KEY: ${env:FRONTEND_KEY, 'dev-key'}
```

---

## 🤖 3. AWS Bedrock Configuration (REQUIRED)

### What it's for:
- LLM (Large Language Model) for AI responses
- Uses AWS Bedrock service (no separate API key needed if using AWS IAM)

### Required Setup:
1. **Enable Bedrock Model Access:**
   - Go to AWS Console → Bedrock → Model Access
   - Request access to the model you want to use (e.g., `anthropic.claude-v2`)
   - Wait for approval (usually instant)

2. **Configure IAM Permissions:**
   - Ensure your AWS user/role has `bedrock:InvokeModel` permission
   - The serverless.yml already includes this, but verify in IAM

### Where to add it:

#### **Backend (.env file)**
**File:** `backend/.env`

```bash
BEDROCK_MODEL=anthropic.claude-v2
AWS_REGION=ap-south-1
MOCK_BEDROCK=false  # Set to 'true' for local testing without AWS
```

#### **AWS Deployment (Serverless)**
**File:** `infra/serverless.yml` (already configured) or environment variable:

```bash
export BEDROCK_MODEL=anthropic.claude-v2
```

**Available Models:**
- `anthropic.claude-v2` (Claude 2)
- `anthropic.claude-v1` (Claude 1)
- `anthropic.claude-instant-v1` (Claude Instant)
- `amazon.titan-text-lite-v1` (Titan Lite)
- `amazon.titan-text-express-v1` (Titan Express)

---

## 🎤 4. Amazon Polly Configuration (REQUIRED)

### What it's for:
- Text-to-Speech (TTS) for AI responses
- Converts text responses to audio

### Required Setup:
- No separate API key needed (uses AWS IAM)
- Ensure your AWS user/role has `polly:SynthesizeSpeech` permission

### Where to add it:

#### **Backend (.env file)**
**File:** `backend/.env`

```bash
POLLY_VOICE=Joanna
AWS_REGION=ap-south-1
```

#### **AWS Deployment (Serverless)**
**File:** `infra/serverless.yml` (already configured) or environment variable:

```bash
export POLLY_VOICE=Joanna
```

**Available Voices:**
- `Joanna` (US English, Female, Neural)
- `Matthew` (US English, Male, Neural)
- `Amy` (British English, Female, Neural)
- `Brian` (British English, Male, Neural)
- See [AWS Polly Voices](https://docs.aws.amazon.com/polly/latest/dg/voicelist.html) for full list

---

## 📝 5. AWS Transcribe Configuration (OPTIONAL)

### What it's for:
- Speech-to-Text (STT) for audio transcription
- Alternative to Web Speech API

### Required Setup:
- No separate API key needed (uses AWS IAM)
- Ensure your AWS user/role has `transcribe:StartTranscriptionJob` permission
- IAM role for Transcribe is auto-created by serverless.yml

### Where to add it:

#### **Backend (.env file)**
**File:** `backend/.env`

```bash
TRANSCRIBE_ROLE_ARN=arn:aws:iam::YOUR_ACCOUNT_ID:role/aisalesagent-transcribe-role-dev
AWS_REGION=ap-south-1
```

**Note:** The role ARN is auto-generated during deployment. For local development, you can leave it empty if not using Transcribe.

#### **AWS Deployment (Serverless)**
**File:** `infra/serverless.yml` (auto-configured, no action needed)

---

## 👁️ 6. AWS Rekognition Configuration (REQUIRED for Emotion Detection)

### What it's for:
- Emotion detection from webcam images
- Fallback if external Cognitive API is not configured

### Required Setup:
- No separate API key needed (uses AWS IAM)
- Ensure your AWS user/role has `rekognition:DetectFaces` permission

### Where to add it:

#### **Backend (.env file)**
**File:** `backend/.env`

```bash
USE_REKOGNITION_FALLBACK=true
AWS_REGION=ap-south-1
```

#### **AWS Deployment (Serverless)**
**File:** `infra/serverless.yml` (already configured)

---

## 🧠 7. External Cognitive API (OPTIONAL)

### What it's for:
- Alternative emotion detection service
- Used instead of AWS Rekognition if configured

### Where to get it:
- From your external Cognitive API provider
- Get API URL and API Key

### Where to add it:

#### **Backend (.env file)**
**File:** `backend/.env`

```bash
COGNITIVE_API_URL=https://your-cognitive-api-url.com/emotion
COGNITIVE_API_KEY=your_cognitive_api_key_here
USE_REKOGNITION_FALLBACK=true  # Set to 'false' if you only want to use Cognitive API
```

#### **AWS Deployment (Serverless)**
**File:** Set as environment variables:

```bash
export COGNITIVE_API_URL=https://your-cognitive-api-url.com/emotion
export COGNITIVE_API_KEY=your_cognitive_api_key_here
```

---

## 🌐 8. CORS Origin (REQUIRED for Production)

### What it's for:
- Controls which domains can access your API
- Security measure to prevent unauthorized access

### Where to add it:

#### **Backend (.env file)**
**File:** `backend/.env`

```bash
# Local Development
CORS_ORIGIN=*

# Production (replace with your frontend URL)
CORS_ORIGIN=https://your-frontend-domain.com
```

#### **AWS Deployment (Serverless)**
**File:** Set as environment variable:

```bash
export CORS_ORIGIN=https://your-frontend-domain.com
```

---

## 📦 9. S3 Bucket Configuration (AUTO-CONFIGURED)

### What it's for:
- Storage for audio assets and transcriptions
- Auto-created during deployment

### Where to add it:

#### **Backend (.env file)**
**File:** `backend/.env`

```bash
S3_BUCKET_NAME=aisales-assets-dev
```

**Note:** For local development, use a test bucket name. For AWS deployment, the bucket is auto-created with the name `aisalesagent-assets-{stage}`.

#### **AWS Deployment (Serverless)**
**File:** `infra/serverless.yml` (auto-configured, no action needed)

---

## 🗄️ 10. DynamoDB Table Configuration (AUTO-CONFIGURED)

### What it's for:
- Storage for conversation history
- Auto-created during deployment

### Where to add it:

#### **Backend (.env file)**
**File:** `backend/.env`

```bash
DYNAMODB_TABLE=aisales-conversations
```

**Note:** For local development, use a test table name. For AWS deployment, the table is auto-created with the name `aisalesagent-conversations-{stage}`.

#### **AWS Deployment (Serverless)**
**File:** `infra/serverless.yml` (auto-configured, no action needed)

---

## 🖥️ 11. Frontend API Base URL (REQUIRED)

### What it's for:
- Backend API endpoint URL for frontend requests

### Where to add it:

#### **Frontend (.env file)**
**File:** `frontend/.env`

```bash
# Local Development
VITE_API_BASE_URL=http://localhost:3000

# Production (replace with your API Gateway URL)
VITE_API_BASE_URL=https://your-api-id.execute-api.ap-south-1.amazonaws.com/dev
```

---

## 📝 Complete .env File Examples

### Backend `.env` File
**Location:** `backend/.env`

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Authentication
FRONTEND_KEY=your_secure_random_string_here

# AWS Configuration
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here

# Bedrock
BEDROCK_MODEL=anthropic.claude-v2
MOCK_BEDROCK=false

# S3
S3_BUCKET_NAME=aisales-assets-dev

# DynamoDB
DYNAMODB_TABLE=aisales-conversations

# Polly
POLLY_VOICE=Joanna

# Transcribe (optional, auto-generated in production)
TRANSCRIBE_ROLE_ARN=

# Cognitive API (optional)
COGNITIVE_API_URL=
COGNITIVE_API_KEY=
USE_REKOGNITION_FALLBACK=true

# CORS
CORS_ORIGIN=*
```

### Frontend `.env` File
**Location:** `frontend/.env`

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_FRONTEND_KEY=your_secure_random_string_here
```

---

## 🚀 Setup Steps

### 1. Create Backend .env File
```bash
cd backend
cp .env.example .env  # If .env.example exists, or create new .env file
# Edit .env with your values
```

### 2. Create Frontend .env File
```bash
cd frontend
cp .env.example .env  # If .env.example exists, or create new .env file
# Edit .env with your values
```

### 3. Configure AWS Credentials
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your region (e.g., ap-south-1)
# Enter output format (json)
```

### 4. Enable Bedrock Model Access
1. Go to AWS Console → Bedrock → Model Access
2. Request access to `anthropic.claude-v2` (or your preferred model)
3. Wait for approval

### 5. Verify IAM Permissions
Ensure your AWS user has the following permissions:
- `bedrock:InvokeModel`
- `polly:SynthesizeSpeech`
- `transcribe:StartTranscriptionJob`
- `rekognition:DetectFaces`
- `s3:PutObject`, `s3:GetObject`
- `dynamodb:PutItem`, `dynamodb:Query`

---

## 🔒 Security Best Practices

1. **Never commit .env files to Git**
   - Already included in `.gitignore`
   - Use `.env.example` for documentation

2. **Use different keys for development and production**
   - Development: Use test/development keys
   - Production: Use production keys with restricted permissions

3. **Rotate keys regularly**
   - Change API keys and access keys periodically
   - Revoke old keys when creating new ones

4. **Use IAM Roles for AWS Deployment**
   - Prefer IAM roles over access keys for Lambda functions
   - Access keys are only needed for local development

5. **Restrict CORS Origins**
   - Use specific domains in production (not `*`)
   - Only allow trusted frontend domains

---

## 🧪 Testing Your Configuration

### 1. Test AWS Credentials
```bash
aws sts get-caller-identity
# Should return your AWS account ID and user ARN
```

### 2. Test Bedrock Access
```bash
aws bedrock list-foundation-models --region ap-south-1
# Should list available models
```

### 3. Test Backend API
```bash
cd backend
npm run dev
# Should start server without errors
```

### 4. Test Frontend
```bash
cd frontend
npm run dev
# Should start dev server and connect to backend
```

---

## ❓ Troubleshooting

### Issue: "Access Denied" errors
**Solution:** Check IAM permissions and ensure Bedrock model access is enabled

### Issue: "Invalid API Key" errors
**Solution:** Verify `FRONTEND_KEY` matches in both backend and frontend `.env` files

### Issue: CORS errors
**Solution:** Check `CORS_ORIGIN` in backend `.env` and ensure frontend URL is allowed

### Issue: Bedrock model not available
**Solution:** Request model access in AWS Bedrock console and wait for approval

### Issue: S3 bucket not found
**Solution:** For local development, create a test bucket or use mock mode. For AWS, let serverless create it automatically.

---

## 📚 Additional Resources

- [AWS IAM User Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/)
- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [AWS Polly Voices](https://docs.aws.amazon.com/polly/latest/dg/voicelist.html)
- [AWS Transcribe Documentation](https://docs.aws.amazon.com/transcribe/)
- [AWS Rekognition Documentation](https://docs.aws.amazon.com/rekognition/)

---

## 📞 Support

If you encounter any issues, please:
1. Check the troubleshooting section above
2. Review the error logs
3. Verify all environment variables are set correctly
4. Open an issue in the GitHub repository

---

**Last Updated:** 2024-01-01

