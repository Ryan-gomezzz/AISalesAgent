# CORS Configuration Guide

## What is CORS?

**CORS (Cross-Origin Resource Sharing)** is a browser security mechanism that controls which websites can make requests to your API.

### Why Do We Need It?

When your frontend (hosted on Vercel) tries to make API calls to your backend (hosted on AWS), the browser checks:
- **Origin**: Where the request is coming from (Vercel URL)
- **Destination**: Where the request is going (AWS API Gateway)
- **CORS Policy**: Whether the backend allows requests from that origin

If CORS isn't configured correctly, you'll see errors like:
```
Access to fetch at 'https://api.example.com' from origin 'https://frontend.vercel.app' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

## Current Configuration

Your backend currently uses:
```yaml
CORS_ORIGIN: ${env:CORS_ORIGIN, '*'}
```

The `'*'` means **all origins are allowed**. This works but is **not secure for production** because:
- Any website can make requests to your API
- No protection against malicious sites
- Can't use credentials securely

## Recommended: Restrict to Your Vercel Domain

### Step 1: Get Your Vercel URL

After deploying to Vercel, you'll get a URL like:
- `https://aisalesagent-abc123.vercel.app` (automatic)
- Or your custom domain if configured

### Step 2: Update CORS with Environment Variable

**Option A (Recommended)**: Deploy with specific CORS origin:

```bash
cd "C:\AI Agent MVP\AISalesAgent"
npx serverless deploy --stage prod --env CORS_ORIGIN=https://your-vercel-url.vercel.app
```

Replace `https://your-vercel-url.vercel.app` with your actual Vercel URL.

### Step 3: Verify CORS Headers

Test that CORS headers are present:

```bash
curl -I https://o7179pt59f.execute-api.ap-south-1.amazonaws.com/prod/api/health
```

Look for:
```
Access-Control-Allow-Origin: https://your-vercel-url.vercel.app
Access-Control-Allow-Credentials: true
```

### Step 4: Test from Browser

1. Open your Vercel frontend in a browser
2. Open Developer Tools (F12) → Console
3. Try making an API call
4. Check for CORS errors

## Multiple Origins (Production + Preview)

If you want to allow both production and preview deployments:

Update `serverless.yml`:
```yaml
CORS_ORIGIN: ${env:CORS_ORIGIN, 'https://aisalesagent.vercel.app,https://*.vercel.app'}
```

Or deploy with multiple origins:
```bash
npx serverless deploy --stage prod --env CORS_ORIGIN="https://aisalesagent.vercel.app,https://*.vercel.app"
```

**Note**: The `cors` package supports comma-separated origins or a function for dynamic origin checking.

## Troubleshooting

### CORS Still Failing?

1. **Check Browser Console**: Look for specific CORS error messages
2. **Verify Headers**: Use `curl -I` to check response headers
3. **Check Preflight**: Some requests send OPTIONS first (preflight)
4. **Verify Origin**: Make sure the Vercel URL matches exactly (no trailing slash)

### Common Issues

- **Missing Header**: Backend not sending `Access-Control-Allow-Origin`
- **Wrong Origin**: Vercel URL doesn't match CORS_ORIGIN
- **Preflight Failure**: OPTIONS request not handled (API Gateway should handle this automatically)
- **Credentials**: If using `credentials: true`, origin can't be `'*'`

## Security Best Practices

1. ✅ **Restrict to specific domains** (not `'*'`)
2. ✅ **Use HTTPS** for both frontend and backend
3. ✅ **Validate origin** on the backend if needed
4. ✅ **Use environment variables** for different environments
5. ❌ **Don't use `'*'` in production** with credentials

