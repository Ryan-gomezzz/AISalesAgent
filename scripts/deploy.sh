#!/bin/bash

# Deployment script for AISalesAgent MVP
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting AISalesAgent deployment...${NC}"

# Check required environment variables
REQUIRED_VARS=("AWS_REGION" "FRONTEND_KEY")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
  echo -e "${RED}Error: Missing required environment variables:${NC}"
  printf '%s\n' "${MISSING_VARS[@]}"
  exit 1
fi

# Set defaults
STAGE=${STAGE:-dev}
REGION=${AWS_REGION:-ap-south-1}
FRONTEND_DIR="frontend"
BACKEND_DIR="backend"
INFRA_DIR="infra"

# Step 1: Build backend
echo -e "${YELLOW}Step 1: Building backend...${NC}"
cd "$BACKEND_DIR"
npm install
npm run build
cd ..

# Step 2: Build frontend
echo -e "${YELLOW}Step 2: Building frontend...${NC}"
cd "$FRONTEND_DIR"
npm install
npm run build
cd ..

# Step 3: Deploy infrastructure
echo -e "${YELLOW}Step 3: Deploying infrastructure...${NC}"
cd "$INFRA_DIR"
npm install
serverless deploy --stage "$STAGE" --region "$REGION"
cd ..

# Step 4: Get API endpoint from serverless output
echo -e "${YELLOW}Step 4: Getting API endpoint...${NC}"
cd "$INFRA_DIR"
API_ENDPOINT=$(serverless info --stage "$STAGE" --region "$REGION" | grep "ServiceEndpoint" | awk '{print $2}')
S3_BUCKET=$(serverless info --stage "$STAGE" --region "$REGION" | grep "S3BucketName" | awk '{print $2}')
cd ..

if [ -z "$API_ENDPOINT" ]; then
  echo -e "${RED}Error: Could not get API endpoint${NC}"
  exit 1
fi

echo -e "${GREEN}API Endpoint: $API_ENDPOINT${NC}"
echo -e "${GREEN}S3 Bucket: $S3_BUCKET${NC}"

# Step 5: Upload frontend to S3 (if bucket exists)
if [ ! -z "$S3_BUCKET" ]; then
  echo -e "${YELLOW}Step 5: Uploading frontend to S3...${NC}"
  aws s3 sync "$FRONTEND_DIR/dist" "s3://$S3_BUCKET/frontend" --delete --region "$REGION"
  
  # Invalidate CloudFront cache (if CloudFront distribution exists)
  CLOUDFRONT_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Origins.Items[?DomainName=='$S3_BUCKET.s3.$REGION.amazonaws.com']].Id" --output text --region "$REGION" 2>/dev/null || echo "")
  if [ ! -z "$CLOUDFRONT_ID" ]; then
    echo -e "${YELLOW}Invalidating CloudFront cache...${NC}"
    aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_ID" --paths "/*" --region "$REGION"
  fi
fi

# Step 6: Update frontend environment variables
echo -e "${YELLOW}Step 6: Updating frontend environment...${NC}"
cat > "$FRONTEND_DIR/.env.production" <<EOF
VITE_API_BASE_URL=$API_ENDPOINT
EOF

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}API Endpoint: $API_ENDPOINT${NC}"
echo -e "${GREEN}Frontend URL: https://$S3_BUCKET.s3-website.$REGION.amazonaws.com/frontend/index.html${NC}"

