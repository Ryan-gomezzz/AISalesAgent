# Vercel 404 Troubleshooting Guide

## Common Causes of 404 Errors

### 1. Missing Environment Variables ⚠️ **MOST COMMON**

**You MUST set these in Vercel Dashboard:**

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add these two variables:

   ```
   VITE_API_BASE_URL = https://o7179pt59f.execute-api.ap-south-1.amazonaws.com/prod
   VITE_FRONTEND_KEY = 48c22d6900134d92b64583f61348da83ba23f46ca113b1d7907fb1701d4ca239
   ```

3. **Important**: After adding environment variables, you MUST **redeploy**:
   - Go to **Deployments** tab
   - Click the **three dots** (⋯) on the latest deployment
   - Click **Redeploy**

### 2. Incorrect Project Configuration

Verify these settings in Vercel:

- **Root Directory**: `frontend` (not the root of the repo)
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build` (or leave empty, Vite auto-detects)
- **Output Directory**: `dist` (or leave empty, Vite defaults to `dist`)

### 3. Build Failures

Check the build logs:
1. Go to **Deployments** tab
2. Click on the failed deployment
3. Check the **Build Logs** for errors

Common build errors:
- Missing dependencies (run `npm install` locally first)
- TypeScript errors
- Missing environment variables during build

### 4. vercel.json Location

The `vercel.json` should be in the `frontend` directory (which it is).

If you're still getting 404s, try moving it to the project root and updating the paths.

## Step-by-Step Fix

1. **Set Environment Variables**:
   ```
   VITE_API_BASE_URL=https://o7179pt59f.execute-api.ap-south-1.amazonaws.com/prod
   VITE_FRONTEND_KEY=48c22d6900134d92b64583f61348da83ba23f46ca113b1d7907fb1701d4ca239
   ```

2. **Verify Project Settings**:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Redeploy** after setting environment variables

4. **Check Build Logs** if still failing

## Testing Locally

To test if the build works locally:

```bash
cd frontend
npm install
npm run build
npm run preview
```

If this works locally, the issue is likely:
- Missing environment variables in Vercel
- Incorrect Vercel project settings
- Need to redeploy after adding env vars

## Quick Checklist

- [ ] Environment variables set in Vercel
- [ ] Redeployed after adding env vars
- [ ] Root Directory = `frontend`
- [ ] Build Command = `npm run build`
- [ ] Output Directory = `dist`
- [ ] Build succeeds (check logs)
- [ ] vercel.json is in `frontend` directory

