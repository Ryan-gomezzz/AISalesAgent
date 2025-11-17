# Quick Deployment Guide

## Fix CORS Issues - Deploy Backend

The CORS fixes are in the code but need to be deployed to AWS. Follow these steps:

### Option 1: Quick Deploy (Recommended)

```powershell
cd "C:\AI Agent MVP\AISalesAgent"

# Build backend
cd backend
npm run build
cd ..

# Prepare Lambda package
npm run prepare:lambda

# Deploy to production
npx serverless deploy --stage prod --region ap-south-1
```

### Option 2: Using the Update Script

```powershell
cd "C:\AI Agent MVP\AISalesAgent"
.\scripts\update-cors.ps1 -VercelUrl "https://ai-sales-agent-theta.vercel.app"
```

### Option 3: Manual Step-by-Step

1. **Build the backend:**
   ```powershell
   cd backend
   npm run build
   cd ..
   ```

2. **Prepare Lambda files:**
   ```powershell
   npm run prepare:lambda
   ```

3. **Deploy:**
   ```powershell
   npx serverless deploy --stage prod --region ap-south-1
   ```

### Verify Deployment

After deployment, test the API:
```powershell
# Test health endpoint
Invoke-WebRequest -Uri "https://o7179pt59f.execute-api.ap-south-1.amazonaws.com/prod/api/health" -Method GET

# Test CORS preflight
Invoke-WebRequest -Uri "https://o7179pt59f.execute-api.ap-south-1.amazonaws.com/prod/api/health" -Method OPTIONS -Headers @{"Origin"="https://ai-sales-agent-theta.vercel.app"}
```

### Troubleshooting

If you get permission errors:
- Ensure AWS CLI is configured: `aws configure`
- Check your AWS credentials have Lambda and API Gateway permissions

If deployment fails:
- Check the error message
- Ensure you're in the correct directory
- Verify Node.js 18+ is installed

