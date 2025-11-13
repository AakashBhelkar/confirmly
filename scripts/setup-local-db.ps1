# PowerShell script to set up local MongoDB database with dummy data
# Usage: .\scripts\setup-local-db.ps1

Write-Host "Setting up Local MongoDB Database..." -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB is running by trying to connect
Write-Host "Checking if MongoDB is running..." -ForegroundColor Yellow

$mongoRunning = $false
$mongoCommand = $null

# Try to find MongoDB command (mongosh, mongo, or mongod)
$commands = @('mongosh', 'mongo', 'mongod')
foreach ($cmd in $commands) {
    if (Get-Command $cmd -ErrorAction SilentlyContinue) {
        $mongoCommand = $cmd
        Write-Host "Found MongoDB command: $cmd" -ForegroundColor Green
        break
    }
}

# Check if MongoDB service is running (Windows)
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($mongoService -and $mongoService.Status -eq 'Running') {
    Write-Host "MongoDB service is running" -ForegroundColor Green
    $mongoRunning = $true
} else {
    # Try to connect directly to MongoDB on port 27017
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
        if ($connection.TcpTestSucceeded) {
            Write-Host "MongoDB is accessible on port 27017" -ForegroundColor Green
            $mongoRunning = $true
        }
    } catch {
        # Port check failed, continue
    }
}

# If we have a command, try to use it to verify
if ($mongoCommand -and -not $mongoRunning) {
    try {
        if ($mongoCommand -eq 'mongosh') {
            $result = mongosh --eval "db.version()" --quiet 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "MongoDB is running (verified via mongosh)" -ForegroundColor Green
                $mongoRunning = $true
            }
        } elseif ($mongoCommand -eq 'mongo') {
            $result = mongo --eval "db.version()" --quiet 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "MongoDB is running (verified via mongo)" -ForegroundColor Green
                $mongoRunning = $true
            }
        }
    } catch {
        # Command check failed, continue
    }
}

if (-not $mongoRunning) {
    Write-Host ""
    Write-Host "MongoDB is not running or not accessible." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start MongoDB:" -ForegroundColor Yellow
    Write-Host "  1. Check if MongoDB service is running:" -ForegroundColor White
    Write-Host "     Get-Service MongoDB" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Start MongoDB service:" -ForegroundColor White
    Write-Host "     net start MongoDB" -ForegroundColor Gray
    Write-Host "     OR" -ForegroundColor Gray
    Write-Host "     Start-Service MongoDB" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  3. Or use Docker:" -ForegroundColor White
    Write-Host "     docker run -d --name mongodb-local -p 27017:27017 mongo:latest" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  4. If MongoDB is installed but not in PATH, add it to PATH or start it manually" -ForegroundColor White
    Write-Host ""
    Write-Host "Note: MongoDB Compass is installed, but you need the MongoDB server running." -ForegroundColor Yellow
    Write-Host ""
    
    # Ask if user wants to continue anyway (maybe they'll start it manually)
    $continue = Read-Host "Do you want to continue anyway? (y/n)"
    if ($continue -ne 'y' -and $continue -ne 'Y') {
        exit 1
    }
    Write-Host "Continuing... Make sure MongoDB is running before seeding!" -ForegroundColor Yellow
} else {
    Write-Host "MongoDB is ready!" -ForegroundColor Green
}

# Check if pnpm is installed
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "PNPM is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if .env exists
$envPath = Join-Path $PWD "apps\api\.env"
if (-not (Test-Path $envPath)) {
    Write-Host ""
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    $envExample = Join-Path $PWD "apps\api\.env.example"
    if (Test-Path $envExample) {
        Copy-Item $envExample $envPath
        Write-Host "Created .env from .env.example" -ForegroundColor Green
    } else {
        Write-Host "Warning: .env.example not found. Please create .env manually." -ForegroundColor Yellow
    }
}

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    pnpm install
}

# Run seed script
Write-Host ""
Write-Host "Seeding database with dummy data..." -ForegroundColor Cyan
Write-Host ""

$apiPath = Join-Path $PWD "apps\api"
Push-Location $apiPath

try {
    pnpm seed:dummy
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Database setup completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Login Credentials:" -ForegroundColor Cyan
        Write-Host "  Admin: admin@confirmly.com / Admin123!" -ForegroundColor White
        Write-Host "  Owner 1: owner1@example.com / Password123!" -ForegroundColor White
        Write-Host "  Owner 2: owner2@example.com / Password123!" -ForegroundColor White
        Write-Host ""
        Write-Host "Start the API server:" -ForegroundColor Cyan
        Write-Host "  cd apps/api" -ForegroundColor White
        Write-Host "  pnpm dev" -ForegroundColor White
    } else {
        Write-Host "Error seeding database. Check the error messages above." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}


