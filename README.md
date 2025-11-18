# AI Voice Agent - Twilio Integration

An AI-powered voice agent system that automatically calls leads, conducts natural conversations, and generates qualified leads via email.

## 🎯 Overview

This application provides a complete voice agent solution where:
1. Users submit inquiries (CA services or Salon appointments) via a web form
2. The AI agent automatically calls the user's phone number
3. A natural, human-like conversation takes place using AWS Bedrock (Claude)
4. Leads are automatically generated, stored, and emailed

## 🏗️ Architecture

```
Frontend (Vercel) → Backend (AWS Lambda) → Twilio → User's Phone
                                      ↓
                              AWS Bedrock (Claude)
                                      ↓
                              DynamoDB (Leads) → AWS SES (Email)
```

## 🚀 Features

- **Voice Agent**: Human-like AI conversations via phone calls
- **Inquiry Types**: Support for CA (Chartered Accountancy) and Salon appointments
- **Lead Generation**: Automatic extraction and scoring of leads
- **Email Notifications**: Leads automatically emailed to configured address
- **Low Latency**: Optimized for real-time voice conversations
- **Natural Speech**: Uses Twilio's neural voices for human-like speech

## 📋 Prerequisites

- Node.js 18.x or higher
- AWS Account with:
  - Bedrock access (Claude models)
  - DynamoDB
  - SES (Simple Email Service)
  - IAM permissions
- Twilio Account with:
  - Phone number
  - Account SID and Auth Token
- Serverless Framework CLI

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd AISalesAgent
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. AWS Configuration

#### AWS Bedrock Setup

1. Enable Bedrock in your AWS region (e.g., `ap-south-1`)
2. Request access to Claude models (Claude 3.5 Sonnet recommended)
3. Ensure your Lambda execution role has `bedrock:InvokeModel` permission

See [BEDROCK_SETUP.md](./BEDROCK_SETUP.md) for detailed setup instructions.

#### AWS SES Setup

1. Verify your sender email address in SES console
2. If in sandbox mode, verify recipient email addresses
3. Request production access if needed

#### DynamoDB

Tables are automatically created by Serverless Framework:
- `aisalesagent-leads-{stage}` - Stores generated leads

### 3. Twilio Configuration

1. Sign up at [Twilio](https://www.twilio.com/)
2. Get a phone number
3. Note your Account SID and Auth Token

### 4. Environment Variables

#### Backend (.env or serverless.yml)

```bash
# AWS
AWS_REGION=ap-south-1
BEDROCK_MODEL=anthropic.claude-3-5-sonnet-20241022-v2:0
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Email
FROM_EMAIL=noreply@yourdomain.com
TO_EMAIL=your-email@example.com

# API
FRONTEND_KEY=your-secure-frontend-key
API_BASE_URL=https://your-api-gateway-url.execute-api.region.amazonaws.com/stage

# CORS
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

#### Frontend (.env)

```bash
VITE_API_BASE_URL=https://your-api-gateway-url.execute-api.region.amazonaws.com/stage
VITE_FRONTEND_KEY=your-secure-frontend-key
```

### 5. Deploy Backend

```bash
cd backend
npm run build
npm run prepare:lambda
cd ..
npx serverless deploy --stage prod --region ap-south-1
```

After deployment, update `API_BASE_URL` in your environment variables with the actual API Gateway URL.

### 6. Configure Twilio Webhook

1. Go to Twilio Console → Phone Numbers → Manage → Active Numbers
2. Click your phone number
3. Under "Voice & Fax", set webhook URL to:
   ```
   https://your-api-gateway-url/api/twilio/voice
   ```
4. Set HTTP method to `POST`
5. Save

### 7. Deploy Frontend

```bash
cd frontend
npm run build
# Deploy to Vercel or your hosting platform
```

## 📁 Project Structure

```
AISalesAgent/
├── backend/
│   ├── src/
│   │   ├── handlers/
│   │   │   ├── submitInquiry.ts    # Handle inquiry submission
│   │   │   ├── twilioVoice.ts      # Twilio webhook handler
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── twilioClient.ts     # Twilio integration
│   │   │   ├── emailService.ts     # AWS SES email service
│   │   │   ├── leadStore.ts        # DynamoDB lead storage
│   │   │   └── bedrockClient.ts    # AWS Bedrock client
│   │   └── ...
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── InquiryForm.tsx      # Inquiry submission form
│   │   └── ...
│   └── package.json
├── prompts/
│   └── voice-agent.md              # Voice agent persona and prompts
├── serverless.yml                  # Serverless Framework config
└── README.md
```

## 🔑 API Keys & Credentials

### Required API Keys

1. **AWS Bedrock**
   - No API key needed - uses IAM roles
   - Ensure Lambda execution role has Bedrock permissions

2. **Twilio**
   - Account SID: Found in Twilio Console Dashboard
   - Auth Token: Found in Twilio Console Dashboard
   - Phone Number: Purchase from Twilio

3. **AWS SES**
   - No API key needed - uses IAM roles
   - Verify sender and recipient emails in SES console

### Setting Up Credentials

#### Option 1: Environment Variables (Recommended for Production)
Set in your deployment platform (Vercel, AWS Lambda environment variables, etc.)

#### Option 2: .env File (Local Development)
Create `.env` files in `backend/` and `frontend/` directories

#### Option 3: Serverless Framework
Add to `serverless.yml` under `provider.environment`

## 🎙️ How It Works

### 1. User Submits Inquiry

User fills out the inquiry form:
- Selects inquiry type (CA or Salon)
- Enters phone number
- Provides inquiry details

### 2. Call Initiation

Backend receives inquiry and:
- Validates phone number
- Initiates Twilio call to user
- Passes inquiry context to Twilio webhook

### 3. Voice Conversation

Twilio webhook handler:
- Receives speech input from user
- Sends to AWS Bedrock for AI response
- Returns TwiML to Twilio for voice output
- Maintains conversation context

### 4. Lead Generation

After conversation:
- Generates conversation summary
- Calculates lead score (1-10)
- Extracts requirements and key information
- Saves to DynamoDB
- Sends email notification

## 🧪 Testing

### Local Testing

1. Start backend:
```bash
cd backend
npm run dev
```

2. Start frontend:
```bash
cd frontend
npm run dev
```

3. Use ngrok or similar to expose local backend for Twilio webhooks:
```bash
ngrok http 3000
# Use ngrok URL in Twilio webhook configuration
```

### Testing Voice Agent

1. Submit inquiry via frontend
2. Answer the call when it comes
3. Have a conversation
4. Check email for lead notification

## 📊 Lead Scoring

Leads are scored 1-10 based on:
- Interest level (engagement in conversation)
- Urgency (timeline mentioned)
- Budget (price discussions)
- Authority (decision-making ability)
- Fit (matches ideal customer profile)

## 🔒 Security

- Frontend key authentication for API access
- CORS configured for specific origins
- IAM roles for AWS service access
- Environment variables for sensitive data
- Phone number validation

## 🐛 Troubleshooting

### Call Not Initiating
- Check Twilio credentials
- Verify phone number format (include country code)
- Check Lambda logs for errors

### No AI Response
- Verify Bedrock model access
- Check IAM permissions
- Review Lambda logs

### Email Not Sending
- Verify SES email addresses
- Check SES sandbox status
- Review IAM permissions

### CORS Errors
- Update `CORS_ORIGIN` environment variable
- Check API Gateway CORS configuration

## 📝 API Endpoints

### POST `/api/submit-inquiry`
Submit an inquiry and initiate a call.

**Request:**
```json
{
  "inquiryType": "ca" | "salon",
  "phoneNumber": "+1234567890",
  "name": "John Doe",
  "inquiryDetails": "I need help with business registration"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Call initiated successfully",
  "callSid": "CAxxxxx",
  "inquiryId": "uuid"
}
```

### POST `/api/twilio/voice`
Twilio webhook endpoint (handled automatically).

### GET `/api/health`
Health check endpoint.

## 🚀 Deployment

See [DEPLOY.md](./DEPLOY.md) for detailed deployment instructions.

## 📚 Additional Documentation

- [BEDROCK_SETUP.md](./BEDROCK_SETUP.md) - AWS Bedrock setup guide
- [DEPLOY.md](./DEPLOY.md) - Deployment guide

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

[Your License Here]

## 🆘 Support

For issues or questions:
- Check troubleshooting section
- Review AWS CloudWatch logs
- Check Twilio call logs
- Review application logs

---

**Note**: This system uses AWS Bedrock with Claude models. Ensure you have proper access and are following AWS usage guidelines. For production use, consider implementing rate limiting, conversation state persistence (Redis/DynamoDB), and enhanced error handling.
