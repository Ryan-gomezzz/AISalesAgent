# PowerShell script to update CORS configuration for Vercel deployment
# Usage: .\scripts\update-cors.ps1 -VercelUrl "https://your-app.vercel.app"

param(
    [Parameter(Mandatory=$true)]
    [string]$VercelUrl
)

Write-Host "=== Updating CORS Configuration ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Vercel URL: $VercelUrl" -ForegroundColor Yellow
Write-Host ""

# Validate URL format
if ($VercelUrl -notmatch '^https://.*\.vercel\.app$') {
    Write-Host "Warning: URL doesn't match expected Vercel format (https://*.vercel.app)" -ForegroundColor Yellow
    Write-Host "Continuing anyway..." -ForegroundColor Yellow
}

Write-Host "Deploying with updated CORS_ORIGIN..." -ForegroundColor Green
Write-Host ""

# Deploy with the new CORS origin
$env:CORS_ORIGIN = $VercelUrl
npx serverless deploy --stage prod --region ap-south-1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verifying CORS headers..." -ForegroundColor Cyan
    
    # Test CORS headers
    $response = Invoke-WebRequest -Uri "https://o7179pt59f.execute-api.ap-south-1.amazonaws.com/prod/api/health" -Method OPTIONS -ErrorAction SilentlyContinue
    
    if ($response.Headers.'Access-Control-Allow-Origin') {
        Write-Host "✓ CORS header found: $($response.Headers.'Access-Control-Allow-Origin')" -ForegroundColor Green
    } else {
        Write-Host "⚠ CORS header not found in response" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Test CORS from browser:" -ForegroundColor Cyan
    Write-Host "1. Open your Vercel app: $VercelUrl" -ForegroundColor White
    Write-Host "2. Open Developer Tools (F12) → Console" -ForegroundColor White
    Write-Host "3. Try making an API call" -ForegroundColor White
    Write-Host "4. Check for CORS errors" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "✗ Deployment failed. Check the error messages above." -ForegroundColor Red
    exit 1
}

