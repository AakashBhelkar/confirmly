# How to Start MongoDB on Windows

You have MongoDB Compass installed, but you need to start the MongoDB server.

## Option 1: Start MongoDB as a Windows Service (Recommended)

### Check if MongoDB service exists:
```powershell
Get-Service -Name "MongoDB"
```

### If the service exists, start it:
```powershell
# As Administrator
net start MongoDB

# Or using PowerShell
Start-Service MongoDB
```

### If the service doesn't exist, install it:
1. Open Command Prompt as Administrator
2. Navigate to MongoDB bin directory (usually `C:\Program Files\MongoDB\Server\7.0\bin`)
3. Run:
```cmd
mongod --install --serviceName "MongoDB" --serviceDisplayName "MongoDB" --logpath "C:\data\db\mongod.log" --dbpath "C:\data\db"
```

**Note:** Make sure the directories exist:
```powershell
New-Item -ItemType Directory -Force -Path "C:\data\db"
```

## Option 2: Start MongoDB Manually

1. Open Command Prompt or PowerShell
2. Navigate to MongoDB bin directory:
```powershell
cd "C:\Program Files\MongoDB\Server\7.0\bin"
```

3. Start MongoDB:
```powershell
.\mongod.exe --dbpath "C:\data\db"
```

**Note:** Keep this window open while using MongoDB.

## Option 3: Use Docker (Easiest)

If you have Docker installed:

```powershell
# Start MongoDB in Docker
docker run -d --name mongodb-local -p 27017:27017 mongo:latest

# Check if it's running
docker ps | Select-String mongodb
```

## Verify MongoDB is Running

After starting MongoDB, verify it's running:

```powershell
# Check service status
Get-Service -Name "MongoDB"

# Or test connection
Test-NetConnection -ComputerName localhost -Port 27017
```

## Common MongoDB Installation Paths

- **MongoDB Server**: `C:\Program Files\MongoDB\Server\7.0\bin\`
- **MongoDB Compass**: `C:\Program Files\MongoDB\Compass\`
- **Data Directory**: `C:\data\db\` (default)

## Quick Check

Run this command to see if MongoDB is accessible:

```powershell
.\scripts\setup-local-db.ps1
```

The updated script will now:
- Check for MongoDB service
- Test port 27017
- Provide helpful instructions if MongoDB is not running

## Troubleshooting

### "MongoDB service not found"
- MongoDB might not be installed as a service
- Use Option 2 (manual start) or Option 3 (Docker)

### "Port 27017 already in use"
- Another MongoDB instance might be running
- Check: `netstat -ano | findstr :27017`
- Or use a different port: `mongod --port 27018`

### "Access denied"
- Run Command Prompt/PowerShell as Administrator
- Or use Docker (doesn't require admin)


