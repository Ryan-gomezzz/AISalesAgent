# Testing GitHub Actions Workflow

## What We Just Did

1. ✅ Created a test branch: `test/ci`
2. ✅ Made a small change to `README.md`
3. ✅ Committed and pushed to trigger the workflow

## What to Watch For

Go to: **https://github.com/Ryan-gomezzz/AISalesAgent/actions**

### Expected Workflow Steps

1. **Test Job** ✅
   - Should pass (or show warnings but continue)
   - Runs backend tests and frontend linting
   - Uses `continue-on-error: true` so it won't block

2. **Build Job** ✅
   - Should pass
   - Builds backend TypeScript
   - Builds frontend Vite app
   - Uploads artifacts

3. **Deploy to AWS** ✅
   - Should pass (only runs on `main` branch)
   - Deploys to AWS Lambda
   - Prints ServiceEndpoint

### ⚠️ Important Note

The **Deploy to AWS** job only runs on the `main` branch:
```yaml
if: always() && github.ref == 'refs/heads/main'
```

Since we pushed to `test/ci`, the deploy job will be **skipped**. This is expected!

To test the full deployment:
1. Merge the test branch to `main`, OR
2. Push directly to `main`

## What to Check

### ✅ Success Indicators

- **Test Job**: Green checkmark
- **Build Job**: Green checkmark  
- **Deploy Job**: Skipped (expected for non-main branches) OR Green checkmark (if on main)

### ❌ Failure Indicators

If you see red X marks, check:

1. **Missing Secrets**
   - Go to: Settings → Secrets and variables → Actions
   - Ensure these are set:
     - `AWS_ACCESS_KEY_ID`
     - `AWS_SECRET_ACCESS_KEY`
     - `FRONTEND_KEY`
     - Other optional secrets

2. **Build Errors**
   - Check build logs for:
     - TypeScript compilation errors
     - Missing dependencies
     - Build command failures

3. **Deployment Errors**
   - Check deploy logs for:
     - AWS credentials issues
     - Serverless Framework errors
     - Lambda deployment failures

## Testing Full Deployment

To test the complete workflow including deployment:

### Option 1: Merge to Main
```powershell
git checkout main
git merge test/ci
git push origin main
```

### Option 2: Push Directly to Main
```powershell
git checkout main
# Make a small change
git add .
git commit -m "Test full deployment"
git push origin main
```

## Monitoring the Workflow

1. **Go to Actions Tab**: https://github.com/Ryan-gomezzz/AISalesAgent/actions
2. **Click on the latest workflow run**
3. **Watch each job**:
   - Click on a job to see detailed logs
   - Look for errors in red
   - Check for success messages in green

## Expected Output

### Test Job Logs
```
✓ Install backend dependencies
✓ Run backend tests (may show warnings)
✓ Install frontend dependencies
✓ Lint frontend (may show warnings)
```

### Build Job Logs
```
✓ Build backend
  dist/index.js created
✓ Build frontend
  dist/index.html created
✓ Upload build artifacts
```

### Deploy Job Logs (on main branch)
```
✓ Configure AWS credentials
✓ Download build artifacts
✓ Install Serverless Framework
✓ Prepare Lambda deployment files
✓ Deploy infrastructure
  ServiceEndpoint: https://o7179pt59f.execute-api.ap-south-1.amazonaws.com/prod
✓ Deployment summary
```

## Troubleshooting

### Workflow Not Triggering?

- Check if workflow file is in `.github/workflows/`
- Verify the file is named `deploy.yml`
- Check if the branch name matches the trigger

### Tests Failing?

- Check if `backend/package.json` has test script
- Verify Jest is configured correctly
- Tests may fail but continue due to `continue-on-error: true`

### Build Failing?

- Check Node.js version (should be 18)
- Verify all dependencies are in `package.json`
- Check for TypeScript errors

### Deployment Failing?

- Verify AWS secrets are set correctly
- Check AWS credentials have proper permissions
- Verify Serverless Framework is installed
- Check if `serverless.yml` is in the root directory

## Next Steps

After verifying the workflow works:

1. **Merge test branch** (if you want to keep the change)
2. **Monitor production deployments** on main branch
3. **Set up branch protection** (optional)
4. **Configure status checks** (optional)

## Clean Up

After testing, you can delete the test branch:

```powershell
git checkout main
git branch -d test/ci
git push origin --delete test/ci
```

