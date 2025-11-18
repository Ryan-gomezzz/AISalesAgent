# AWS Bedrock Setup Guide

## About AWS Bedrock

**AWS Bedrock does NOT use API keys** - it uses **IAM roles and permissions**. This is actually simpler and more secure than API keys because:

1. **No API key management** - AWS handles authentication automatically
2. **More secure** - IAM roles are more secure than API keys
3. **Easier to manage** - Permissions are managed through IAM policies
4. **No key rotation needed** - IAM handles this automatically

## Current Setup

Your Lambda function already has the correct IAM permissions configured in `serverless.yml`:

```yaml
iam:
  role:
    statements:
      - Effect: Allow
        Action:
          - bedrock:InvokeModel
          - bedrock:InvokeModelWithResponseStream
        Resource: '*'
```

## What You Need to Do

### 1. Enable Bedrock Model Access

1. Go to [AWS Bedrock Console](https://console.aws.amazon.com/bedrock/)
2. Navigate to **Model access** in the left sidebar
3. Find **Anthropic Claude v2** (or your chosen model)
4. Click **Request model access**
5. Wait for approval (usually instant for most models)

### 2. Verify Region Support

Make sure the model is available in `ap-south-1` (Mumbai):
- Claude v2 is available in: us-east-1, us-west-2, ap-southeast-1, ap-southeast-2, eu-central-1, eu-west-1
- If not available, you may need to:
  - Use a different region (update `AWS_REGION` in serverless.yml)
  - Or use Claude v3 which has better region support

### 3. Test the Setup

After enabling model access, test with:

```bash
# Test the health endpoint
curl https://o7179pt59f.execute-api.ap-south-1.amazonaws.com/prod/api/health

# Test with a message (replace YOUR_FRONTEND_KEY)
curl -X POST https://o7179pt59f.execute-api.ap-south-1.amazonaws.com/prod/api/converse \
  -H "Content-Type: application/json" \
  -H "x-frontend-key: YOUR_FRONTEND_KEY" \
  -d '{"text": "Hello"}'
```

## Troubleshooting 502 Errors

If you're getting 502 errors, check:

1. **Model Access**: Is Claude v2 enabled in your AWS account?
2. **Region**: Is the model available in ap-south-1?
3. **IAM Permissions**: Does the Lambda role have bedrock:InvokeModel permission?
4. **Lambda Logs**: Check CloudWatch logs for specific errors

## Alternative: Use Mock Mode for Testing

If Bedrock isn't set up yet, you can use mock mode:

```bash
# Set environment variable
export MOCK_BEDROCK=true

# Deploy
npx serverless deploy --stage prod
```

This will return mock responses without calling Bedrock.

## Claude v2 vs Claude v3

- **Claude v2**: Uses `prompt` format (what we just fixed)
- **Claude v3**: Uses `messages` format (newer, better)

The code now supports both automatically based on the model ID.

