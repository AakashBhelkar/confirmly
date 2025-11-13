# PowerShell script to check if the app is ready for preview
# Usage: .\scripts\check-preview-ready.ps1

Write-Host "Checking Preview Readiness..." -ForegroundColor Cyan
Write-Host ""

$allReady = $true

# Check MongoDB
Write-Host "1. Checking MongoDB..." -ForegroundColor Yellow
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($mongoService -and $mongoService.Status -eq 'Running') {
    Write-Host "   ✅ MongoDB service is running" -ForegroundColor Green
} else {
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
        if ($connection.TcpTestSucceeded) {
            Write-Host "   ✅ MongoDB is accessible on port 27017" -ForegroundColor Green
        } else {
            Write-Host "   ❌ MongoDB is not running" -ForegroundColor Red
            Write-Host "      Start it with: net start MongoDB" -ForegroundColor Gray
            $allReady = $false
        }
    } catch {
        Write-Host "   ❌ MongoDB is not accessible" -ForegroundColor Red
        $allReady = $false
    }
}

# Check .env file
Write-Host ""
Write-Host "2. Checking .env file..." -ForegroundColor Yellow
$envPath = Join-Path $PWD "apps\api\.env"
if (Test-Path $envPath) {
    Write-Host "   ✅ .env file exists" -ForegroundColor Green
    $envContent = Get-Content $envPath -Raw
    if ($envContent -match "MONGO_URI.*localhost") {
        Write-Host "   ✅ .env configured for local MongoDB" -ForegroundColor Green
    } elseif ($envContent -match "MONGO_URI") {
        Write-Host "   ⚠️  .env might be using MongoDB Atlas" -ForegroundColor Yellow
        Write-Host "      Update MONGO_URI to: mongodb://localhost:27017/confirmly" -ForegroundColor Gray
    } else {
        Write-Host "   ⚠️  MONGO_URI not found in .env" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ .env file missing" -ForegroundColor Red
    Write-Host "      Create from .env.example: cp apps\api\.env.example apps\api\.env" -ForegroundColor Gray
    $allReady = $false
}

# Check dependencies
Write-Host ""
Write-Host "3. Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "   ❌ Dependencies not installed" -ForegroundColor Red
    Write-Host "      Run: pnpm install" -ForegroundColor Gray
    $allReady = $false
}

# Check if database is seeded
Write-Host ""
Write-Host "4. Checking database..." -ForegroundColor Yellow
try {
    $envContent = Get-Content $envPath -Raw -ErrorAction SilentlyContinue
    if ($envContent -match "MONGO_URI.*localhost") {
        Write-Host "   ⚠️  Database might not be seeded yet" -ForegroundColor Yellow
        Write-Host "      Run: cd apps\api && pnpm seed:dummy" -ForegroundColor Gray
    } else {
        Write-Host "   ⚠️  Cannot check database (MongoDB Atlas or no .env)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Cannot check database" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "=" * 50 -ForegroundColor Cyan
if ($allReady) {
    Write-Host "✅ Almost ready! Next steps:" -ForegroundColor Green
    Write-Host ""
    Write-Host "1. Seed the database:" -ForegroundColor Yellow
    Write-Host "   cd apps\api" -ForegroundColor White
    Write-Host "   pnpm seed:dummy" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Start the API server:" -ForegroundColor Yellow
    Write-Host "   cd apps\api" -ForegroundColor White
    Write-Host "   pnpm dev" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Start the Web server (in another terminal):" -ForegroundColor Yellow
    Write-Host "   cd apps\web" -ForegroundColor White
    Write-Host "   pnpm dev" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Open in browser:" -ForegroundColor Yellow
    Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "   API: http://localhost:4000" -ForegroundColor White
    Write-Host "   API Docs: http://localhost:4000/docs" -ForegroundColor White
} else {
    Write-Host "❌ Not ready yet. Fix the issues above first." -ForegroundColor Red
}
Write-Host "=" * 50 -ForegroundColor Cyan


