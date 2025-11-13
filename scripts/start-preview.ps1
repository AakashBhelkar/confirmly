# PowerShell script to start preview servers
# Usage: .\scripts\start-preview.ps1

Write-Host "Starting Confirmly Preview..." -ForegroundColor Green

# Check if pnpm is installed
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: PNPM is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    pnpm install
}

# Check for environment files
if (-not (Test-Path "apps/api/.env")) {
    Write-Host "Warning: apps/api/.env not found. Creating example file..." -ForegroundColor Yellow
    Copy-Item "apps/api/.env.example" "apps/api/.env" -ErrorAction SilentlyContinue
}

if (-not (Test-Path "apps/web/.env.local")) {
    Write-Host "Warning: apps/web/.env.local not found. Creating example file..." -ForegroundColor Yellow
    Copy-Item "apps/web/.env.example" "apps/web/.env.local" -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Starting servers in separate windows..." -ForegroundColor Cyan
Write-Host ""

# Start API server
Write-Host "Starting API server on http://localhost:4000" -ForegroundColor Blue
$apiPath = Join-Path $PWD "apps\api"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$apiPath'; pnpm dev"

# Wait a bit
Start-Sleep -Seconds 3

# Start Web server
Write-Host "Starting Web server on http://localhost:3000" -ForegroundColor Blue
$webPath = Join-Path $PWD "apps\web"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$webPath'; pnpm dev"

Write-Host ""
Write-Host "Servers starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Access points:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   API:      http://localhost:4000" -ForegroundColor White
Write-Host "   API Docs: http://localhost:4000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop servers" -ForegroundColor Yellow
