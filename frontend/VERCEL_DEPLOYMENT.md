# Vercel Deployment Guide

## Environment Variables

Before deploying to Vercel, you need to set the following environment variables in Vercel:

### Required Variables

1. **VITE_API_BASE_URL**
   ```
   https://o7179pt59f.execute-api.ap-south-1.amazonaws.com/prod
   ```

2. **VITE_FRONTEND_KEY**
   ```
   48c22d6900134d92b64583f61348da83ba23f46ca113b1d7907fb1701d4ca239
   ```
   ⚠️ **Important**: This key must match the `FRONTEND_KEY` in your AWS Lambda environment variables.

## Deployment Steps

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Import Project"
4. Select `Ryan-gomezzz/AISalesAgent`
5. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Go to **Settings → Environment Variables** and add:
   - `VITE_API_BASE_URL` = `https://o7179pt59f.execute-api.ap-south-1.amazonaws.com/prod`
   - `VITE_FRONTEND_KEY` = `48c22d6900134d92b64583f61348da83ba23f46ca113b1d7907fb1701d4ca239`
7. Click **Deploy**

## Updating Backend FRONTEND_KEY

After generating the frontend key, update the backend Lambda environment variable:

```bash
aws lambda update-function-configuration \
  --function-name aisalesagent-prod-api \
  --environment "Variables={FRONTEND_KEY=48c22d6900134d92b64583f61348da83ba23f46ca113b1d7907fb1701d4ca239,...}"
```

Or redeploy with the environment variable:

```bash
FRONTEND_KEY=48c22d6900134d92b64583f61348da83ba23f46ca113b1d7907fb1701d4ca239 npx serverless deploy --stage prod
```

## Local Development

For local development, create a `.env.local` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_FRONTEND_KEY=dev-key
```

