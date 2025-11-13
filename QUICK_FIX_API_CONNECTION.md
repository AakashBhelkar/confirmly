# Quick Fix: API Connection Refused

## Problem
The frontend is showing `ERR_CONNECTION_REFUSED` when trying to connect to `http://localhost:4000/v1/auth/register`.

This means the **API server is not running**.

## Solution

### Option 1: Start API Server Only
Open a new terminal and run:
```powershell
cd apps/api
pnpm dev
```

Wait for the message: `Server listening on http://0.0.0.0:4000`

### Option 2: Start Both Servers
Use the preview script:
```powershell
.\scripts\start-preview.ps1
```

This will start both API and Web servers in separate windows.

### Option 3: Manual Start (Two Terminals)

**Terminal 1 - API Server:**
```powershell
cd apps/api
pnpm dev
```

**Terminal 2 - Web Server:**
```powershell
cd apps/web
pnpm dev
```

## Verify API Server is Running

1. Check if port 4000 is in use:
   ```powershell
   Get-NetTCPConnection -LocalPort 4000
   ```

2. Test the API health endpoint:
   - Open browser: http://localhost:4000/health
   - Should return: `{"status":"ok"}`

3. Check API documentation:
   - Open browser: http://localhost:4000/docs
   - Should show Swagger UI

## Expected Behavior

Once the API server is running:
- ✅ Frontend can make API calls
- ✅ Registration/login will work
- ✅ Dashboard will load data
- ✅ No more `ERR_CONNECTION_REFUSED` errors

## Other Warnings (Harmless)

These warnings in the console are **normal** and can be ignored:
- `Extra attributes from the server: toscacontainsshadowdom,openrequests` - Browser extension
- `Download the React DevTools` - Just a suggestion
- `[Fast Refresh] rebuilding` - Normal hot reload behavior

## Troubleshooting

### Port 4000 Already in Use
If you get an error that port 4000 is already in use:
```powershell
# Find and kill the process
Get-NetTCPConnection -LocalPort 4000 | Select-Object OwningProcess
# Then kill the process ID
Stop-Process -Id <PID>
```

### API Server Won't Start
1. Check if dependencies are installed:
   ```powershell
   cd apps/api
   pnpm install
   ```

2. Check for errors in the terminal output

3. Verify `.env` file exists in `apps/api/`

## Quick Start Command

Run this to start everything:
```powershell
# Start API server in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\AI Apps\Confirmly Apps\confirmly\apps\api'; pnpm dev"

# Wait 3 seconds
Start-Sleep -Seconds 3

# Start Web server
cd apps/web
pnpm dev
```

