# Infrastructure Deployment Guide

This directory contains the infrastructure as code for the AISalesAgent MVP using Serverless Framework.

## Prerequisites

- Node.js 18+
- AWS CLI configured with appropriate credentials
- Serverless Framework installed: `npm install -g serverless`
- AWS Account with permissions for:
  - Lambda
  - API Gateway
  - DynamoDB
  - S3
  - Bedrock
  - Polly
  - Transcribe
  - Rekognition
  - IAM

## Configuration

### 1. Set Environment Variables

Create a `.env` file in the root directory or set environment variables:

```bash
export FRONTEND_KEY=your-frontend-key
export BEDROCK_MODEL=anthropic.claude-v2
export AWS_REGION=ap-south-1
export POLLY_VOICE=Joanna
export COGNITIVE_API_URL=  # Optional
export COGNITIVE_API_KEY=  # Optional
export USE_REKOGNITION_FALLBACK=true
export CORS_ORIGIN=https://your-frontend-domain.com
```

### 2. Install Dependencies

```bash
cd infra
npm install
```

### 3. Build Backend

```bash
cd ../backend
npm install
npm run build
```

### 4. Deploy Infrastructure

```bash
cd infra
serverless deploy --stage dev
```

Or for production:

```bash
serverless deploy --stage prod
```

## Deployment Steps

1. **Bootstrap AWS Account** (if not already done):
   ```bash
   serverless deploy
   ```

2. **Deploy Infrastructure**:
   ```bash
   serverless deploy --stage dev
   ```

3. **Get Deployment Outputs**:
   ```bash
   serverless info --stage dev
   ```

   This will show:
   - API Gateway endpoint URL
   - S3 bucket name
   - DynamoDB table name

4. **Update Frontend Environment Variables**:
   Update `frontend/.env` with the API Gateway endpoint URL:
   ```
   VITE_API_BASE_URL=https://your-api-id.execute-api.ap-south-1.amazonaws.com/dev
   ```

## Resources Created

- **Lambda Function**: API handler for all endpoints
- **API Gateway**: REST API with CORS enabled
- **DynamoDB Table**: Conversations table with TTL
- **S3 Bucket**: Audio assets storage with lifecycle rules
- **IAM Role**: Transcribe role for S3 access
- **IAM Permissions**: Lambda execution role with required permissions

## Configuration Options

### Stages

- `dev`: Development environment
- `prod`: Production environment

### Regions

Default region is `ap-south-1`. Override with:

```bash
serverless deploy --region us-east-1 --stage prod
```

### Memory and Timeout

Configure in `serverless.yml`:

```yaml
provider:
  memorySize: 512
  timeout: 30
```

## Troubleshooting

### Common Issues

1. **Bedrock Access Denied**:
   - Ensure Bedrock model access is granted in AWS Bedrock console
   - Verify IAM permissions include `bedrock:InvokeModel`

2. **Transcribe Job Fails**:
   - Verify Transcribe IAM role has S3 access
   - Check S3 bucket permissions

3. **CORS Errors**:
   - Update `CORS_ORIGIN` environment variable
   - Verify API Gateway CORS configuration

4. **DynamoDB Permission Errors**:
   - Verify IAM role has DynamoDB permissions
   - Check table name matches environment variable

### Debugging

Enable verbose logging:

```bash
serverless deploy --verbose
```

View logs:

```bash
serverless logs -f api --tail
```

## Cleanup

To remove all resources:

```bash
serverless remove --stage dev
```

**Warning**: This will delete all resources including S3 buckets and DynamoDB tables.

## Cost Optimization

- Use DynamoDB On-Demand billing for pay-per-request
- Enable S3 lifecycle rules to delete old assets
- Use TTL on DynamoDB items for auto-cleanup
- Configure Lambda memory and timeout appropriately

## Security

- Use environment variables for secrets
- Enable S3 bucket encryption
- Use IAM roles with least privilege
- Enable CloudWatch logging
- Configure CORS appropriately

## Monitoring

- CloudWatch Logs: View Lambda logs
- CloudWatch Metrics: Monitor function invocations
- X-Ray: Enable for distributed tracing (optional)

## Next Steps

- Add CloudFront distribution for frontend
- Configure custom domain for API Gateway
- Set up CloudWatch alarms
- Enable X-Ray tracing
- Configure WAF for API Gateway

