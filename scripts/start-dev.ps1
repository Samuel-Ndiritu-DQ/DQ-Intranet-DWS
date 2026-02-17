# Script to start both Vite dev server and Vercel dev server
# Run this script to start the full development environment

Write-Host "🚀 Starting Development Servers..." -ForegroundColor Cyan
Write-Host ""

# Check if ports are already in use
$port3004 = Get-NetTCPConnection -LocalPort 3004 -ErrorAction SilentlyContinue
$port4000 = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue

if ($port3004) {
    Write-Host "⚠️  Port 3004 is already in use. Please stop the process using it first." -ForegroundColor Yellow
    exit 1
}

if ($port4000) {
    Write-Host "⚠️  Port 4000 is already in use. Please stop the process using it first." -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Starting Vercel Dev Server (API) on port 4000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run vercel:dev" -WindowStyle Normal

Write-Host "⏳ Waiting 5 seconds for API server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "🌐 Starting Vite Dev Server (Frontend) on port 3004..." -ForegroundColor Green
Write-Host ""
Write-Host "✅ Both servers are starting!" -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost:3004" -ForegroundColor White
Write-Host "   - API Server: http://localhost:4000" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the frontend server" -ForegroundColor Yellow
Write-Host ""

# Start Vite dev server in the current window
npm run dev

