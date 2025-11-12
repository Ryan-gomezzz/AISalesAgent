# API Keys Quick Reference Guide

## 🚀 Quick Setup Checklist

### ✅ Step 1: AWS Credentials (REQUIRED)
- **Get from:** AWS Console → IAM → Users → Your User → Security Credentials → Create Access Key
- **Add to:** `backend/.env`
  ```bash
  AWS_ACCESS_KEY_ID=your_access_key_id
  AWS_SECRET_ACCESS_KEY=your_secret_access_key
  AWS_REGION=ap-south-1
  ```

### ✅ Step 2: Frontend Key (REQUIRED)
- **Generate:** Random string (e.g., `openssl rand -hex 32`)
- **Add to:** `backend/.env` AND `frontend/.env`
  ```bash
  # backend/.env
  FRONTEND_KEY=your_secure_random_string
  
  # frontend/.env
  VITE_FRONTEND_KEY=your_secure_random_string
  ```
  **⚠️ IMPORTANT:** Use the same key in both files!

### ✅ Step 3: Enable Bedrock Model Access (REQUIRED)
- **Go to:** AWS Console → Bedrock → Model Access
- **Request access to:** `anthropic.claude-v2` (or your preferred model)
- **Wait for:** Approval (usually instant)

### ✅ Step 4: Configure Backend
- **File:** `backend/.env`
- **Copy from:** `backend/.env.example`
- **Update:** AWS credentials, frontend key, and other settings

### ✅ Step 5: Configure Frontend
- **File:** `frontend/.env`
- **Copy from:** `frontend/.env.example`
- **Update:** API base URL and frontend key

---

## 📋 All Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | ✅ Yes | AWS Access Key ID | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | ✅ Yes | AWS Secret Access Key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_REGION` | ✅ Yes | AWS Region | `ap-south-1` |
| `FRONTEND_KEY` | ✅ Yes | API Authentication Key | `your_secure_random_string` |
| `BEDROCK_MODEL` | ✅ Yes | Bedrock Model ID | `anthropic.claude-v2` |
| `MOCK_BEDROCK` | ❌ No | Use mock Bedrock (for testing) | `false` |
| `S3_BUCKET_NAME` | ✅ Yes | S3 Bucket Name | `aisales-assets-dev` |
| `DYNAMODB_TABLE` | ✅ Yes | DynamoDB Table Name | `aisales-conversations` |
| `POLLY_VOICE` | ❌ No | Polly Voice ID | `Joanna` |
| `TRANSCRIBE_ROLE_ARN` | ❌ No | Transcribe IAM Role ARN | (auto-generated) |
| `COGNITIVE_API_URL` | ❌ No | External Cognitive API URL | `https://api.example.com/emotion` |
| `COGNITIVE_API_KEY` | ❌ No | Cognitive API Key | `your_api_key` |
| `USE_REKOGNITION_FALLBACK` | ❌ No | Use Rekognition fallback | `true` |
| `CORS_ORIGIN` | ❌ No | CORS Origin | `*` or `https://yourdomain.com` |
| `PORT` | ❌ No | Server Port | `3000` |
| `NODE_ENV` | ❌ No | Node Environment | `development` |

### Frontend (`frontend/.env`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_BASE_URL` | ✅ Yes | Backend API URL | `http://localhost:3000` |
| `VITE_FRONTEND_KEY` | ✅ Yes | API Authentication Key | `your_secure_random_string` |

---

## 🔑 Where to Get API Keys

### 1. AWS Credentials
1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **IAM** → **Users** → **Your User**
3. Click **Security Credentials** tab
4. Click **Create Access Key**
5. Choose **Application running outside AWS** (for local development)
6. Copy **Access Key ID** and **Secret Access Key**
7. ⚠️ **Save them securely** - you won't see the secret key again!

### 2. Frontend Key
- **Generate locally:**
  ```bash
  # Linux/Mac
  openssl rand -hex 32
  
  # Windows PowerShell
  -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
  ```
- **Or use:** Any secure random string generator
- **Length:** At least 32 characters recommended

### 3. Bedrock Model Access
1. Go to [AWS Bedrock Console](https://console.aws.amazon.com/bedrock/)
2. Click **Model Access** in the left sidebar
3. Find your model (e.g., `anthropic.claude-v2`)
4. Click **Request model access**
5. Wait for approval (usually instant)

### 4. Cognitive API (Optional)
- **Get from:** Your external Cognitive API provider
- **Required:** API URL and API Key
- **Alternative:** Use AWS Rekognition (no API key needed)

---

## 📁 File Locations

### Backend Environment File
```
AISalesAgent/
└── backend/
    └── .env          ← Create this file (copy from .env.example)
```

### Frontend Environment File
```
AISalesAgent/
└── frontend/
    └── .env          ← Create this file (copy from .env.example)
```

---

## 🔧 Setup Commands

### 1. Create Backend .env File
```bash
cd backend
cp .env.example .env
# Edit .env with your values
```

### 2. Create Frontend .env File
```bash
cd frontend
cp .env.example .env
# Edit .env with your values
```

### 3. Configure AWS CLI (Optional but Recommended)
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your region (e.g., ap-south-1)
# Enter output format (json)
```

---

## ✅ Verification Steps

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

### 3. Test Backend
```bash
cd backend
npm run dev
# Should start without errors
```

### 4. Test Frontend
```bash
cd frontend
npm run dev
# Should start and connect to backend
```

---

## 🚨 Common Issues

### Issue: "Access Denied" errors
**Solution:** 
- Check IAM permissions
- Enable Bedrock model access
- Verify AWS credentials are correct

### Issue: "Invalid API Key" errors
**Solution:** 
- Verify `FRONTEND_KEY` matches in both backend and frontend `.env` files
- Ensure the key is the same in both files

### Issue: CORS errors
**Solution:** 
- Check `CORS_ORIGIN` in backend `.env`
- Ensure frontend URL is allowed
- For local development, use `*` or `http://localhost:5173`

### Issue: Bedrock model not available
**Solution:** 
- Request model access in AWS Bedrock console
- Wait for approval
- Verify model ID is correct

---

## 🔒 Security Notes

1. **Never commit .env files to Git**
   - Already in `.gitignore`
   - Use `.env.example` for documentation

2. **Use different keys for dev and production**
   - Development: Test keys
   - Production: Production keys with restricted permissions

3. **Rotate keys regularly**
   - Change API keys periodically
   - Revoke old keys when creating new ones

4. **Restrict CORS in production**
   - Use specific domains (not `*`)
   - Only allow trusted frontend domains

---

## 📞 Need Help?

1. Check the full guide: `API_KEYS_SETUP.md`
2. Review error logs
3. Verify all environment variables are set
4. Open an issue in the GitHub repository

---

## 🎯 Quick Start Template

### Backend `.env`
```bash
# Copy this to backend/.env and fill in your values

PORT=3000
NODE_ENV=development
FRONTEND_KEY=your_secure_random_string_here

AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here

BEDROCK_MODEL=anthropic.claude-v2
MOCK_BEDROCK=false

S3_BUCKET_NAME=aisales-assets-dev
DYNAMODB_TABLE=aisales-conversations
POLLY_VOICE=Joanna

USE_REKOGNITION_FALLBACK=true
CORS_ORIGIN=*
```

### Frontend `.env`
```bash
# Copy this to frontend/.env and fill in your values

VITE_API_BASE_URL=http://localhost:3000
VITE_FRONTEND_KEY=your_secure_random_string_here
```

**⚠️ Remember:** Use the same `FRONTEND_KEY` value in both files!

---

**Last Updated:** 2024-01-01

