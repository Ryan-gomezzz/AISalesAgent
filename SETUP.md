# Quick Setup Guide

## 🚀 Local Development

### 1. Install Dependencies
```bash
npm run setup
# or manually:
cd backend && npm install
cd ../frontend && npm install
cd ../infra && npm install
```

### 2. Create Environment Files
```bash
# Windows
.\scripts\create-env-files.ps1

# Linux/Mac
./scripts/create-env-files.sh
```

### 3. Configure API Keys

**Backend (`backend/.env`):**
```bash
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=ap-south-1
FRONTEND_KEY=your_secure_random_string
BEDROCK_MODEL=anthropic.claude-v2
```

**Frontend (`frontend/.env`):**
```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_FRONTEND_KEY=your_secure_random_string  # Must match backend
```

### 4. Enable Bedrock Access
- Go to AWS Console → Bedrock → Model Access
- Request access to `anthropic.claude-v2`

### 5. Run
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

## 🌐 Deployment

### GitHub Secrets (for CI/CD)
Add in GitHub → Settings → Secrets → Actions:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `FRONTEND_KEY`
- `CORS_ORIGIN` (optional)

### AWS Deployment
```bash
cd infra
npm install
serverless deploy --stage prod
```

### Vercel Deployment (Frontend)
1. Connect GitHub repo to Vercel
2. Set environment variables:
   - `VITE_API_BASE_URL` (your backend URL)
   - `VITE_FRONTEND_KEY`
3. Deploy

## 📝 Notes

- **Local Development**: Use `.env` files (not committed to Git)
- **GitHub Actions**: Use GitHub Secrets (for automatic deployment)
- **AWS Deployment**: Use environment variables or AWS CLI config
- **Frontend Key**: Must match in both backend and frontend `.env` files

