# Deployment Troubleshooting Guide

## Common Deployment Errors & Solutions

### 1. GitHub Actions Deployment Errors

#### Error: "Build job failed"
**Symptoms:**
- Build job shows red X
- Deploy job skipped or failed

**Solutions:**
- Check build logs for TypeScript errors
- Verify all dependencies are installed
- Ensure `backend/dist` and `frontend/dist` are created
- Check Node.js version (should be 18+)

#### Error: "Artifact not found"
**Symptoms:**
```
Error: Unable to download artifact(s): Artifact not found for name: build-artifacts
```

**Solutions:**
- Build job must succeed first
- Check that `Upload build artifacts` step completed
- Verify artifact name matches: `build-artifacts`

#### Error: "AWS credentials not configured"
**Symptoms:**
```
Error: Unable to locate credentials
```

**Solutions:**
- Go to GitHub → Settings → Secrets → Actions
- Add `AWS_ACCESS_KEY_ID`
- Add `AWS_SECRET_ACCESS_KEY`
- Verify credentials have correct permissions

#### Error: "Missing required secrets"
**Symptoms:**
- Deployment fails with missing environment variable

**Solutions:**
- Add all required secrets to GitHub:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `FRONTEND_KEY`
  - `BEDROCK_MODEL` (optional)
  - `POLLY_VOICE` (optional)
  - `CORS_ORIGIN` (optional)

---

### 2. AWS Lambda Deployment Errors

#### Error: "Handler not found"
**Symptoms:**
```
Runtime.HandlerNotFound: index.handler is undefined or not exported
```

**Solutions:**
1. **Run prepare-lambda script:**
   ```bash
   npm run prepare:lambda
   ```
   This copies files from `backend/dist` to root.

2. **Verify files exist:**
   - `index.js` in root
   - `handlers/` folder in root
   - `services/` folder in root
   - `utils/` folder in root

3. **Check serverless.yml:**
   ```yaml
   handler: index.handler  # Should be in root
   ```

#### Error: "Cannot find module"
**Symptoms:**
```
Runtime.ImportModuleError: Error: Cannot find module 'express'
```

**Solutions:**
1. **Check package patterns in serverless.yml:**
   ```yaml
   package:
     patterns:
       - 'index.js'
       - 'handlers/**'
       - 'services/**'
       - 'utils/**'
       - 'backend/node_modules/**'
   ```

2. **Verify node_modules are included:**
   - Dependencies should be in `backend/node_modules`
   - Or install at root level

#### Error: "IAM permission denied"
**Symptoms:**
```
User: ... is not authorized to perform: iam:TagRole
```

**Solutions:**
- Add `iam:TagRole` permission to your AWS IAM user
- Or use a role with broader IAM permissions

#### Error: "Environment variable reserved"
**Symptoms:**
```
Lambda was unable to configure your environment variables because the environment variables you have provided contains reserved keys
```

**Solutions:**
- Remove reserved variables like `AWS_REGION` from `serverless.yml`
- AWS sets these automatically

---

### 3. Vercel Deployment Errors

#### Error: "404 NOT_FOUND"
**Symptoms:**
- Deployment succeeds but shows 404

**Solutions:**
1. **Set Root Directory:**
   - Vercel Dashboard → Settings → General
   - Root Directory: `frontend`

2. **Check vercel.json:**
   - Should be in `frontend/vercel.json`
   - Should have rewrites for SPA routing

3. **Verify environment variables:**
   - `VITE_API_BASE_URL`
   - `VITE_FRONTEND_KEY`

#### Error: "tsc: command not found"
**Symptoms:**
- Build fails with TypeScript error

**Solutions:**
1. **Set Root Directory to `frontend`** (most important!)
2. **Check vercel.json:**
   ```json
   {
     "buildCommand": "npm install && npm run build",
     "outputDirectory": "dist"
   }
   ```

#### Error: "Cannot find namespace 'NodeJS'"
**Symptoms:**
- TypeScript compilation error

**Solutions:**
- Use `ReturnType<typeof setInterval>` instead of `NodeJS.Timeout`
- Remove `"types": ["node"]` from `tsconfig.json` if not needed

---

### 4. Serverless Framework Errors

#### Error: "Stack update failed"
**Symptoms:**
- CloudFormation stack update fails

**Solutions:**
1. **Check CloudFormation events:**
   ```bash
   aws cloudformation describe-stack-events --stack-name aisalesagent-prod
   ```

2. **Common causes:**
   - IAM permission issues
   - Resource conflicts
   - Invalid configuration

#### Error: "Package size too large"
**Symptoms:**
- Lambda package exceeds 50MB (unzipped) or 250MB (zipped)

**Solutions:**
1. **Exclude unnecessary files:**
   ```yaml
   package:
     patterns:
       - '!node_modules/**'
       - '!frontend/**'
       - '!infra/**'
   ```

2. **Use Lambda layers for large dependencies**

---

## Quick Diagnostic Checklist

### Before Deployment
- [ ] AWS CLI configured (`aws configure`)
- [ ] GitHub Secrets set (for CI/CD)
- [ ] Backend builds successfully (`npm run build` in backend)
- [ ] Frontend builds successfully (`npm run build` in frontend)
- [ ] `prepare-lambda.js` script works
- [ ] Root `index.js` exists (after running prepare-lambda)

### During Deployment
- [ ] Build job passes
- [ ] Artifacts uploaded successfully
- [ ] AWS credentials configured in GitHub Actions
- [ ] All required secrets are set
- [ ] Serverless Framework installs correctly

### After Deployment
- [ ] Lambda function exists in AWS Console
- [ ] API Gateway endpoint is accessible
- [ ] Health endpoint returns 200: `/api/health`
- [ ] CloudWatch logs show no errors
- [ ] DynamoDB table created
- [ ] S3 bucket created

---

## Debug Commands

### Check Lambda Function
```bash
aws lambda get-function --function-name aisalesagent-prod-api --region ap-south-1
```

### View Lambda Logs
```bash
aws logs tail /aws/lambda/aisalesagent-prod-api --follow --region ap-south-1
```

### Test API Endpoint
```bash
curl https://o7179pt59f.execute-api.ap-south-1.amazonaws.com/prod/api/health
```

### Check Serverless Info
```bash
npx serverless info --stage prod --region ap-south-1
```

### Verify Deployment Files
```bash
# After prepare-lambda
ls -la index.js handlers/ services/ utils/
```

---

## Step-by-Step Debugging

### 1. Local Build Test
```bash
cd backend
npm install
npm run build
cd ../frontend
npm install
npm run build
```

### 2. Local Serverless Test
```bash
npm run prepare:lambda
npx serverless offline
```

### 3. Check GitHub Actions Logs
- Go to: GitHub → Actions → Latest workflow run
- Click on failed job
- Check detailed logs

### 4. Check AWS Console
- Lambda: Functions → `aisalesagent-prod-api`
- API Gateway: APIs → Check endpoints
- CloudWatch: Logs → `/aws/lambda/aisalesagent-prod-api`

---

## Common Fixes

### Fix 1: Handler Not Found
```bash
cd "C:\AI Agent MVP\AISalesAgent"
npm run prepare:lambda
npx serverless deploy --stage prod
```

### Fix 2: Missing Dependencies
```bash
cd backend
npm install --production
cd ..
npm run prepare:lambda
```

### Fix 3: TypeScript Errors
- Check `tsconfig.json` configuration
- Remove Node.js-specific types if not needed
- Use browser-compatible types

### Fix 4: CORS Errors
```bash
$env:CORS_ORIGIN="https://your-vercel-url.vercel.app"
npx serverless deploy --stage prod
```

---

## Getting Help

If errors persist:
1. **Check CloudWatch Logs** for detailed error messages
2. **Review GitHub Actions logs** for build/deploy errors
3. **Verify AWS permissions** in IAM console
4. **Test locally** before deploying
5. **Check serverless.yml** for configuration issues

---

## Prevention

To avoid deployment errors:
1. ✅ Always test builds locally first
2. ✅ Run `prepare-lambda` before deploying
3. ✅ Verify all secrets are set
4. ✅ Check AWS permissions
5. ✅ Monitor CloudWatch logs after deployment

