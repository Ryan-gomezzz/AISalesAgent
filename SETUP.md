# Quick Setup Guide

## Step-by-Step Setup

### 1. Prerequisites Check

- [ ] Node.js 18+ installed
- [ ] AWS Account with Bedrock access
- [ ] Twilio Account with phone number
- [ ] Serverless Framework CLI installed (`npm install -g serverless`)

### 2. Install Dependencies

```bash
# Root
npm install

# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..
```

### 3. AWS Setup

#### A. AWS Bedrock
1. Go to AWS Console → Bedrock
2. Enable model access for Claude 3.5 Sonnet
3. Note your region (e.g., `ap-south-1`)

#### B. AWS SES
1. Go to AWS Console → SES
2. Verify sender email: `noreply@yourdomain.com`
3. Verify recipient email: `your-email@example.com`
4. Request production access if needed

#### C. IAM Permissions
Ensure your Lambda execution role has:
- `bedrock:InvokeModel`
- `ses:SendEmail`
- `dynamodb:PutItem`, `dynamodb:Query`

### 4. Twilio Setup

1. Sign up at https://www.twilio.com/
2. Get a phone number
3. Copy Account SID and Auth Token from dashboard

### 5. Configure Environment Variables

#### Backend Environment Variables

Create `backend/.env` or set in `serverless.yml`:

```bash
# AWS
AWS_REGION=ap-south-1
BEDROCK_MODEL=anthropic.claude-3-5-sonnet-20241022-v2:0

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Email
FROM_EMAIL=noreply@yourdomain.com
TO_EMAIL=your-email@example.com

# Security
FRONTEND_KEY=your-secure-random-key-here

# CORS
CORS_ORIGIN=https://your-frontend.vercel.app
```

#### Frontend Environment Variables

Create `frontend/.env`:

```bash
VITE_API_BASE_URL=https://your-api-gateway-url.execute-api.region.amazonaws.com/stage
VITE_FRONTEND_KEY=your-secure-random-key-here
```

### 6. Deploy Backend

```bash
# Build
cd backend
npm run build
npm run prepare:lambda

# Deploy
cd ..
npx serverless deploy --stage prod --region ap-south-1
```

**Important**: After deployment, copy the API Gateway URL and:
1. Update `API_BASE_URL` in backend environment
2. Update `VITE_API_BASE_URL` in frontend `.env`
3. Redeploy if needed

### 7. Configure Twilio Webhook

1. Go to Twilio Console → Phone Numbers
2. Click your phone number
3. Under "Voice & Fax":
   - Webhook URL: `https://YOUR_API_GATEWAY_URL/api/twilio/voice`
   - HTTP Method: `POST`
4. Save

### 8. Deploy Frontend

#### Option A: Vercel (Recommended)

```bash
cd frontend
npm run build
# Deploy to Vercel via CLI or dashboard
```

#### Option B: Other Platform

```bash
cd frontend
npm run build
# Upload dist/ folder to your hosting platform
```

### 9. Test the System

1. Open your frontend URL
2. Fill out inquiry form:
   - Select inquiry type (CA or Salon)
   - Enter your phone number (with country code)
   - Add inquiry details
3. Submit
4. Answer the call when it comes
5. Have a conversation
6. Check your email for lead notification

## Verification Checklist

- [ ] Backend deployed successfully
- [ ] API Gateway URL accessible
- [ ] Twilio webhook configured
- [ ] Frontend deployed
- [ ] Test call received
- [ ] Conversation works
- [ ] Lead email received

## Common Issues

### "Call not initiating"
- Check Twilio credentials
- Verify phone number format (+country code)
- Check Lambda logs

### "No AI response"
- Verify Bedrock model access
- Check IAM permissions
- Review CloudWatch logs

### "Email not sending"
- Verify SES email addresses
- Check SES sandbox status
- Review IAM permissions

## Next Steps

- Customize voice prompts in `prompts/voice-agent.md`
- Adjust lead scoring logic in `backend/src/handlers/twilioVoice.ts`
- Configure email templates in `backend/src/services/emailService.ts`
- Set up monitoring and alerts
- Implement conversation state persistence (Redis/DynamoDB)

## Support

For detailed documentation:
- [README.md](./README.md) - Full documentation
- [BEDROCK_SETUP.md](./BEDROCK_SETUP.md) - Bedrock setup
- [DEPLOY.md](./DEPLOY.md) - Deployment guide
