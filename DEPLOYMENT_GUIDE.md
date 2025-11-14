# Complete Deployment Guide

This guide walks you through deploying the backend to AWS and frontend to Vercel, then setting up GitHub Actions for automatic deployment.

---

## 📋 Step 1: Create AWS IAM User (Recommended)

### Why create a separate IAM user?
- Better security (not using root account)
- Can revoke access easily
- Can limit permissions to only what's needed

### Steps:

1. **Go to AWS Console** → IAM → Users → Create User
2. **User name**: `aisalesagent-deploy` (or any name you prefer)
3. **Access type**: Check "Access key - Programmatic access"
4. **Click Next: Permissions**

### Required Permissions:

**Option A: Attach existing policies (Easier)**
- `AWSLambda_FullAccess`
- `AmazonAPIGatewayAdministrator`
- `AmazonDynamoDBFullAccess`
- `AmazonS3FullAccess`
- `AmazonBedrockFullAccess`
- `AmazonPollyFullAccess`
- `AmazonTranscribeFullAccess`
- `AmazonRekognitionFullAccess`
- `CloudWatchFullAccess`
- `IAMFullAccess` (for creating Transcribe role)

**Option B: Create custom policy (More secure - Recommended)**

Click "Create policy" → JSON tab → Paste this:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:*",
        "apigateway:*",
        "dynamodb:*",
        "s3:*",
        "bedrock:*",
        "polly:*",
        "transcribe:*",
        "rekognition:*",
        "logs:*",
        "cloudformation:*",
        "iam:CreateRole",
        "iam:AttachRolePolicy",
        "iam:PassRole",
        "iam:GetRole",
        "iam:ListRoles"
      ],
      "Resource": "*"
    }
  ]
}
```

Name it: `AISalesAgentDeployPolicy`
Attach this policy to your user.

5. **Click Next** → Review → Create User
6. **IMPORTANT**: Download or copy:
   - **Access Key ID** (e.g., `AKIAIOSFODNN7EXAMPLE`)
   - **Secret Access Key** (e.g., `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)
   - ⚠️ **You won't see the secret key again!** Save it securely.

---

## 📋 Step 2: Enable Bedrock Model Access

1. **Go to AWS Console** → Bedrock → Model Access
2. **Click "Request model access"**
3. **Select**: `Anthropic Claude` → `Claude 2` (or `Claude 3`)
4. **Click "Request access"**
5. **Wait for approval** (usually instant, but can take a few minutes)

---

## 📋 Step 3: Configure AWS CLI (Local)

**On your local machine:**

```bash
aws configure
```

Enter:
- **AWS Access Key ID**: `[Your Access Key ID from Step 1]`
- **AWS Secret Access Key**: `[Your Secret Access Key from Step 1]`
- **Default region**: `ap-south-1` (or your preferred region)
- **Default output format**: `json`

**Verify it works:**
```bash
aws sts get-caller-identity
```
Should return your AWS account ID and user ARN.

---

## 📋 Step 4: Deploy Backend to AWS

### 4.1 Build Backend

```bash
cd backend
npm install
npm run build
```

### 4.2 Deploy Infrastructure

```bash
cd ../infra
npm install
serverless deploy --stage prod
```

**This will:**
- Create Lambda function
- Create API Gateway
- Create DynamoDB table
- Create S3 bucket
- Create IAM roles
- Take 2-5 minutes

### 4.3 Get API Gateway URL

After deployment completes, you'll see output like:
```
ServiceEndpoint: https://abc123xyz.execute-api.ap-south-1.amazonaws.com/prod
```

**Copy this URL** - you'll need it for Vercel!

**Or get it later:**
```bash
cd infra
serverless info --stage prod
```

Look for `ServiceEndpoint` in the output.

---

## 📋 Step 5: Deploy Frontend to Vercel

### 5.1 Connect GitHub to Vercel

1. **Go to [vercel.com](https://vercel.com)** → Sign in with GitHub
2. **Click "Add New"** → "Project"
3. **Import** your `AISalesAgent` repository
4. **Configure Project:**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 5.2 Add Environment Variables in Vercel

**Before deploying, click "Environment Variables" and add:**

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_API_BASE_URL` | `https://your-api-id.execute-api.ap-south-1.amazonaws.com/prod` | Production, Preview, Development |
| `VITE_FRONTEND_KEY` | `your_secure_random_string` | Production, Preview, Development |

**Where to get values:**
- `VITE_API_BASE_URL`: From Step 4.3 (API Gateway URL)
- `VITE_FRONTEND_KEY`: Generate a random string (e.g., `openssl rand -hex 32`)

**⚠️ Important:** Use the same `VITE_FRONTEND_KEY` value that you'll use in backend!

### 5.3 Deploy

Click **"Deploy"** → Wait for deployment to complete (2-3 minutes)

**You'll get a URL like:** `https://aisalesagent.vercel.app`

---

## 📋 Step 6: Update Backend CORS

After getting your Vercel URL, update backend CORS:

### Option A: Update via Environment Variable (Recommended)

```bash
cd infra
serverless deploy --stage prod --env CORS_ORIGIN=https://your-vercel-url.vercel.app
```

### Option B: Update serverless.yml

Edit `infra/serverless.yml`:
```yaml
environment:
  CORS_ORIGIN: ${env:CORS_ORIGIN, 'https://your-vercel-url.vercel.app'}
```

Then redeploy:
```bash
serverless deploy --stage prod
```

---

## 📋 Step 7: Configure GitHub Secrets (for CI/CD)

### 7.1 Go to GitHub Repository

1. **Go to**: `https://github.com/Ryan-gomezzz/AISalesAgent`
2. **Click**: Settings → Secrets and variables → Actions
3. **Click**: "New repository secret"

### 7.2 Add These Secrets:

**Secret 1: AWS_ACCESS_KEY_ID**
- **Name**: `AWS_ACCESS_KEY_ID`
- **Value**: `[Your AWS Access Key ID from Step 1]`
- **Click**: "Add secret"

**Secret 2: AWS_SECRET_ACCESS_KEY**
- **Name**: `AWS_SECRET_ACCESS_KEY`
- **Value**: `[Your AWS Secret Access Key from Step 1]`
- **Click**: "Add secret"

**Secret 3: FRONTEND_KEY**
- **Name**: `FRONTEND_KEY`
- **Value**: `[Same random string you used in Vercel]`
- **Click**: "Add secret"

**Secret 4: CORS_ORIGIN** (Optional but recommended)
- **Name**: `CORS_ORIGIN`
- **Value**: `https://your-vercel-url.vercel.app`
- **Click**: "Add secret"

**Secret 5: BEDROCK_MODEL** (Optional - has default)
- **Name**: `BEDROCK_MODEL`
- **Value**: `anthropic.claude-v2` (or your preferred model)
- **Click**: "Add secret"

**Secret 6: POLLY_VOICE** (Optional - has default)
- **Name**: `POLLY_VOICE`
- **Value**: `Joanna`
- **Click**: "Add secret"

---

## 📋 Step 8: Test GitHub Actions

### 8.1 Make a Small Change

Make any small change to trigger deployment:
```bash
# Edit README.md or any file
git add .
git commit -m "Test GitHub Actions deployment"
git push origin main
```

### 8.2 Check GitHub Actions

1. **Go to**: GitHub repository → Actions tab
2. **Watch the workflow run**:
   - ✅ Test job should pass
   - ✅ Build job should pass
   - ✅ Deploy job should deploy to AWS

### 8.3 Verify Deployment

After deployment completes:
```bash
cd infra
serverless info --stage prod
```

Check that the API endpoint is updated.

---

## 📋 Complete Checklist

### ✅ AWS Setup
- [ ] Created IAM user with required permissions
- [ ] Saved Access Key ID and Secret Access Key
- [ ] Configured AWS CLI locally
- [ ] Enabled Bedrock model access
- [ ] Verified AWS credentials work (`aws sts get-caller-identity`)

### ✅ Backend Deployment
- [ ] Built backend (`npm run build` in backend/)
- [ ] Deployed to AWS (`serverless deploy` in infra/)
- [ ] Copied API Gateway URL
- [ ] Updated CORS with Vercel URL

### ✅ Frontend Deployment
- [ ] Connected GitHub repo to Vercel
- [ ] Added environment variables in Vercel:
  - [ ] `VITE_API_BASE_URL` (API Gateway URL)
  - [ ] `VITE_FRONTEND_KEY` (random string)
- [ ] Deployed frontend to Vercel
- [ ] Got Vercel URL

### ✅ GitHub Actions
- [ ] Added GitHub Secrets:
  - [ ] `AWS_ACCESS_KEY_ID`
  - [ ] `AWS_SECRET_ACCESS_KEY`
  - [ ] `FRONTEND_KEY`
  - [ ] `CORS_ORIGIN` (optional)
- [ ] Tested workflow by pushing to main
- [ ] Verified automatic deployment works

---

## 🔑 Where to Add API Keys - Summary

### 1. **Local Development** (`.env` files)
- **File**: `backend/.env`
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION`
  - `FRONTEND_KEY`
  - `BEDROCK_MODEL`

- **File**: `frontend/.env`
  - `VITE_API_BASE_URL`
  - `VITE_FRONTEND_KEY`

### 2. **Vercel** (Environment Variables)
- **Location**: Vercel Dashboard → Project → Settings → Environment Variables
- **Add**:
  - `VITE_API_BASE_URL` = Your API Gateway URL
  - `VITE_FRONTEND_KEY` = Random string (must match backend)

### 3. **GitHub Secrets** (for CI/CD)
- **Location**: GitHub → Repository → Settings → Secrets → Actions
- **Add**:
  - `AWS_ACCESS_KEY_ID` = Your AWS Access Key
  - `AWS_SECRET_ACCESS_KEY` = Your AWS Secret Key
  - `FRONTEND_KEY` = Same random string as Vercel
  - `CORS_ORIGIN` = Your Vercel URL

### 4. **AWS** (via IAM)
- **Location**: AWS Console → IAM → Users
- **Create**: IAM user with required permissions
- **Get**: Access Key ID and Secret Access Key

---

## 🚨 Important Notes

### API Keys Needed:
- ✅ **AWS Credentials** (Access Key + Secret Key) - Required
- ✅ **Bedrock Model Access** - Enable in AWS Console (no separate API key)
- ❌ **No OpenAI API key needed** - We use AWS Bedrock (Claude)
- ❌ **No Anthropic API key needed** - We use AWS Bedrock (Claude)
- ❌ **No Gemini API key needed** - We use AWS Bedrock (Claude)
- ❌ **No external API keys needed** - Everything uses AWS services

### Security:
- **Never commit** `.env` files (already in `.gitignore`)
- **Never share** AWS credentials publicly
- **Use different** `FRONTEND_KEY` for dev and production
- **Rotate keys** periodically

### Troubleshooting:
- **"Access Denied"**: Check IAM permissions
- **"Bedrock model not available"**: Enable model access in Bedrock console
- **CORS errors**: Update `CORS_ORIGIN` in backend
- **Deployment fails**: Check GitHub Actions logs

---

## 📞 Next Steps After Deployment

1. **Test the application**: Visit your Vercel URL
2. **Monitor costs**: Check AWS Billing Dashboard
3. **Set up monitoring**: CloudWatch logs are auto-enabled
4. **Update documentation**: Add your production URLs

---

**Ready to deploy?** Follow the steps above in order. If you get stuck, check the troubleshooting section or the error logs.

