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

## Claude v2 vs Claude v3+ (Latest 2025 Methodology)

- **Claude v2**: Uses `prompt` format with `\n\nHuman:` and `\n\nAssistant:` markers
- **Claude v3+** (including 3.5, 4.5, Sonnet, Haiku, Opus): Uses `messages` format with dedicated `system` parameter

### Latest Best Practices (2025):

1. **System Parameter**: Claude 3+ models use a dedicated `system` parameter instead of including system prompts in messages - this is more efficient and recommended
2. **Model Support**: The code automatically detects and supports:
   - Claude v2 (anthropic.claude-v2)
   - Claude 3 Sonnet (anthropic.claude-3-sonnet-20240229-v1:0)
   - Claude 3.5 Sonnet (anthropic.claude-3-5-sonnet-20240620-v1:0)
   - Claude 3 Haiku (anthropic.claude-3-haiku-20240307-v1:0)
   - Claude 3 Opus (anthropic.claude-3-opus-20240229-v1:0)
   - Claude Sonnet 4.5 (latest 2025)
   - Claude Haiku 4.5 (latest 2025)

3. **Response Format**: Claude 3+ supports multiple content blocks - the code handles this automatically

4. **AWS Bedrock 2025 Features** (Compatible):
   - **Prompt Optimization**: Automatically refine prompts for better performance (available via Bedrock Playground or API)
   - **Guardrails**: Implement responsible AI safeguards (can be integrated)
   - **AgentCore**: Deploy and operate AI agents at scale (future integration)
   - **Model Evaluation**: Compare and evaluate models (available via Bedrock console)
   - **Default Model Access**: All foundation models enabled by default with correct IAM permissions (as of Oct 2025)

5. **AWS SDK Version**: Using latest AWS SDK v3 (3.933.0+) for full 2025 compatibility

The code now supports all these models automatically based on the model ID and is fully compatible with AWS Bedrock 2025 features.

