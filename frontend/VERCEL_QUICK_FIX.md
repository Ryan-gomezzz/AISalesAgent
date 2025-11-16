# Quick Fix for Vercel 404 Error

## ⚠️ CRITICAL: You MUST Set Environment Variables

Vite requires environment variables at **build time**. If they're missing, the build will fail or produce a broken app.

### Step 1: Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add these **TWO** variables:

   **Variable 1:**
   - Name: `VITE_API_BASE_URL`
   - Value: `https://o7179pt59f.execute-api.ap-south-1.amazonaws.com/prod`
   - Environment: Select **Production**, **Preview**, and **Development**

   **Variable 2:**
   - Name: `VITE_FRONTEND_KEY`
   - Value: `48c22d6900134d92b64583f61348da83ba23f46ca113b1d7907fb1701d4ca239`
   - Environment: Select **Production**, **Preview**, and **Development**

### Step 2: Verify Project Settings

Go to **Settings** → **General** and verify:

- **Root Directory**: `frontend` ✅
- **Framework Preset**: `Vite` ✅
- **Build Command**: `npm run build` (or leave empty) ✅
- **Output Directory**: `dist` (or leave empty) ✅

### Step 3: Redeploy (IMPORTANT!)

After adding environment variables, you **MUST** redeploy:

1. Go to **Deployments** tab
2. Find your latest deployment
3. Click the **three dots** (⋯) menu
4. Click **Redeploy**
5. Wait for the build to complete

**Why?** Environment variables are only available during the build. Old deployments were built without them.

### Step 4: Verify Build Success

1. Check the **Build Logs** in the deployment
2. Look for any errors
3. The build should show:
   ```
   ✓ built in Xms
   ```

## If Still Getting 404

1. **Check Build Logs**: Look for errors about missing environment variables
2. **Verify vercel.json**: Should be in `frontend/vercel.json` (it is ✅)
3. **Check Browser Console**: Open DevTools → Console, look for errors
4. **Try Hard Refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

## Test Locally First

To verify everything works:

```bash
cd frontend
# Create .env.local file
echo "VITE_API_BASE_URL=https://o7179pt59f.execute-api.ap-south-1.amazonaws.com/prod" > .env.local
echo "VITE_FRONTEND_KEY=48c22d6900134d92b64583f61348da83ba23f46ca113b1d7907fb1701d4ca239" >> .env.local

npm install
npm run build
npm run preview
```

If this works locally, the issue is definitely the missing environment variables in Vercel.

