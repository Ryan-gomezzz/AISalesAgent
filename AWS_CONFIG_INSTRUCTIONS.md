# AWS CLI Configuration Instructions

## Current Status
AWS CLI is partially configured, but there's a signature mismatch error when testing credentials.

## Fix: Reconfigure AWS CLI

### Option 1: Interactive Configuration (Recommended)
```bash
aws configure
```

When prompted, enter:
- **AWS Access Key ID**: `AKIAVRUVTCDRONL6PX42`
- **AWS Secret Access Key**: `[Copy from AWS Console - make sure no spaces]`
- **Default region name**: `ap-south-1`
- **Default output format**: `json`

### Option 2: Manual Configuration
```bash
aws configure set aws_access_key_id AKIAVRUVTCDRONL6PX42
aws configure set aws_secret_access_key "[YOUR_SECRET_KEY_HERE]"
aws configure set region ap-south-1
aws configure set output json
```

**⚠️ Important:** Make sure the secret key has:
- No leading/trailing spaces
- Exactly 40 characters
- All special characters copied correctly (including `/` and `+`)

### Verify Configuration
```bash
aws sts get-caller-identity
```

Should return your AWS account ID and user ARN.

### If Still Getting Signature Mismatch:
1. Go to AWS Console → IAM → Users → Your User
2. Click "Security Credentials" tab
3. Verify the access key is active
4. If needed, create a new access key and copy both keys again
5. Make sure you're copying the Secret Access Key (not Session Token)

## After Configuration Works

Once `aws sts get-caller-identity` works, you can proceed with deployment:

```bash
cd backend
npm run build

cd ../infra
npm install
serverless deploy --stage prod
```

