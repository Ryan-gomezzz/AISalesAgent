# Update CORS for Vercel Deployment

## 📚 What is CORS and Why Do We Need It?

### The Problem
When your frontend (hosted on Vercel) tries to call your backend API (hosted on AWS), the browser enforces the **Same-Origin Policy**:

- **Frontend**: `https://aisalesagent.vercel.app` (Vercel)
- **Backend**: `https://o7179pt59f.execute-api.ap-south-1.amazonaws.com` (AWS)
- **Different domains** = Browser blocks the request by default ❌

### The Solution: CORS
**CORS (Cross-Origin Resource Sharing)** tells the browser: "Yes, allow requests from this specific domain."

The backend sends a header:
```
Access-Control-Allow-Origin: https://aisalesagent.vercel.app
```

This tells the browser: "Requests from `aisalesagent.vercel.app` are allowed."

### Current Status
Your backend currently uses `CORS_ORIGIN: '*'` which means:
- ✅ Works for all domains
- ❌ **Not secure** - any website can call your API
- ❌ Can't use credentials securely

## 🚀 How to Update CORS

### Step 1: Get Your Vercel URL

After deploying to Vercel, you'll have a URL like:
- `https://aisalesagent-abc123.vercel.app` (automatic)
- Or your custom domain

### Step 2: Update CORS (Choose One Method)

#### Method A: Using Environment Variable (Recommended)

```powershell
cd "C:\AI Agent MVP\AISalesAgent"
$env:CORS_ORIGIN = "https://your-vercel-url.vercel.app"
npx serverless deploy --stage prod
```

**Replace `https://your-vercel-url.vercel.app` with your actual Vercel URL!**

#### Method B: Using PowerShell Script

```powershell
cd "C:\AI Agent MVP\AISalesAgent"
.\scripts\update-cors.ps1 -VercelUrl "https://your-vercel-url.vercel.app"
```

#### Method C: One-Line Command

```powershell
cd "C:\AI Agent MVP\AISalesAgent"
$env:CORS_ORIGIN="https://aisalesagent.vercel.app"; npx serverless deploy --stage prod
```

### Step 3: Verify CORS Headers

Test that CORS is working:

```powershell
# Test with PowerShell
$response = Invoke-WebRequest -Uri "https://o7179pt59f.execute-api.ap-south-1.amazonaws.com/prod/api/health" -Method OPTIONS
$response.Headers.'Access-Control-Allow-Origin'
```

Or use curl (if available):
```bash
curl -I -X OPTIONS https://o7179pt59f.execute-api.ap-south-1.amazonaws.com/prod/api/health
```

Look for:
```
Access-Control-Allow-Origin: https://your-vercel-url.vercel.app
Access-Control-Allow-Credentials: true
```

### Step 4: Test from Browser

1. Open your Vercel app in a browser
2. Open Developer Tools (F12) → **Console** tab
3. Try using the app (make an API call)
4. Check for CORS errors

If you see:
```
✅ No CORS errors = Success!
❌ "Access to fetch... blocked by CORS policy" = CORS not configured correctly
```

## 🔍 Troubleshooting

### CORS Still Not Working?

1. **Check the exact Vercel URL**
   - Must match exactly (including `https://`)
   - No trailing slash
   - Case-sensitive

2. **Verify deployment succeeded**
   ```powershell
   npx serverless info --stage prod
   ```

3. **Check Lambda environment variables**
   - Go to AWS Console → Lambda → Your function
   - Check Environment Variables
   - `CORS_ORIGIN` should be your Vercel URL

4. **Test preflight (OPTIONS) request**
   - Some browsers send OPTIONS first
   - API Gateway should handle this automatically
   - Check browser Network tab for OPTIONS requests

5. **Check browser console**
   - Look for specific CORS error messages
   - They'll tell you exactly what's missing

### Common Issues

| Issue | Solution |
|-------|----------|
| "No 'Access-Control-Allow-Origin' header" | CORS_ORIGIN not set or deployment failed |
| "Origin not allowed" | Vercel URL doesn't match CORS_ORIGIN exactly |
| "Credentials not allowed" | Can't use `'*'` with `credentials: true` |
| Preflight fails | API Gateway should handle OPTIONS automatically |

## 🔒 Security Best Practices

1. ✅ **Use specific domain** (not `'*'`)
2. ✅ **Use HTTPS** for both frontend and backend
3. ✅ **Update for each environment** (production, preview, etc.)
4. ✅ **Use environment variables** (don't hardcode)

## 📝 Example: Multiple Environments

If you have multiple Vercel deployments:

```powershell
# Production
$env:CORS_ORIGIN="https://aisalesagent.vercel.app"
npx serverless deploy --stage prod

# Preview (if needed)
$env:CORS_ORIGIN="https://aisalesagent-git-main.vercel.app"
npx serverless deploy --stage dev
```

Or allow multiple origins (requires code change):
```javascript
// In backend/src/index.serverless.ts
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['*'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

## ✅ Quick Checklist

- [ ] Got your Vercel URL
- [ ] Deployed with `CORS_ORIGIN` environment variable
- [ ] Verified CORS headers with `curl` or PowerShell
- [ ] Tested from browser (no CORS errors)
- [ ] Checked browser console for errors

