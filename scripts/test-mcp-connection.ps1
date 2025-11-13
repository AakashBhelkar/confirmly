# PowerShell script to test MCP MongoDB connection
# Usage: .\scripts\test-mcp-connection.ps1

Write-Host "Testing MCP MongoDB Connection..." -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB connection string is set
$mongoUri = $env:MONGODB_URI
if (-not $mongoUri) {
    Write-Host "WARNING: MONGODB_URI environment variable not set" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To connect via MCP, you need to:" -ForegroundColor Cyan
    Write-Host "1. Configure MCP in Cursor settings" -ForegroundColor White
    Write-Host "2. Set MONGODB_URI in the MCP configuration" -ForegroundColor White
    Write-Host "3. Restart Cursor" -ForegroundColor White
    Write-Host ""
    Write-Host "See MCP_MONGODB_SETUP.md for detailed instructions" -ForegroundColor Yellow
    exit 1
}

Write-Host "MONGODB_URI is set: $($mongoUri.Substring(0, [Math]::Min(30, $mongoUri.Length)))..." -ForegroundColor Green
Write-Host ""
Write-Host "Once MCP is connected, you can ask Cursor:" -ForegroundColor Cyan
Write-Host "  - Show me all collections in MongoDB" -ForegroundColor White
Write-Host "  - Query users from the database" -ForegroundColor White
Write-Host "  - Check if admin account exists" -ForegroundColor White
Write-Host "  - Run the database setup script" -ForegroundColor White
Write-Host ""
Write-Host "Or use the database setup script directly:" -ForegroundColor Cyan
Write-Host "  cd apps/api" -ForegroundColor White
Write-Host "  pnpm setup:db" -ForegroundColor White

