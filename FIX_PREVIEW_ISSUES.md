# Fix Preview Issues

## Issues Found

### 1. ✅ Port 4000 Already in Use
**Error**: `EADDRINUSE: address already in use 0.0.0.0:4000`

**Solution**: Kill the existing process on port 4000
```powershell
# Find and kill process
Get-NetTCPConnection -LocalPort 4000 | Select-Object OwningProcess
Stop-Process -Id <PID> -Force
```

### 2. ⚠️ MongoDB Atlas Connection Failing
**Error**: `Could not connect to any servers in your MongoDB Atlas cluster`

**Causes**:
- IP address not whitelisted in Atlas
- SSL/TLS connection issues
- Network connectivity problems

**Solutions**:

#### Option A: Use Local MongoDB (Recommended for Preview)
1. Install MongoDB locally or use Docker
2. Update `apps/api/.env`:
   ```
   MONGO_URI=mongodb://localhost:27017/confirmly
   ```
3. Start MongoDB:
   ```powershell
   # If installed as Windows service
   net start MongoDB
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7
   ```

#### Option B: Fix Atlas Connection
1. **Whitelist Your IP**:
   - Go to MongoDB Atlas → Network Access
   - Click "Add IP Address"
   - Add your current IP or `0.0.0.0/0` (for development only)

2. **Check Connection String**:
   - Verify `MONGO_URI` in `apps/api/.env`
   - Make sure username/password are correct
   - Ensure the connection string includes `?retryWrites=true&w=majority`

3. **Test Connection**:
   ```powershell
   # Test with mongosh
   mongosh "your-connection-string"
   ```

### 3. ⚠️ Mongoose Duplicate Index Warnings
**Warning**: `Duplicate schema index on {...}`

**Status**: These are **warnings, not errors**. The server will still work.

**Fix** (Optional): Remove duplicate index definitions in model schemas. This is a code cleanup task and doesn't affect functionality.

### 4. ⚠️ Next.js Static Files 404
**Error**: `GET http://localhost:3000/_next/static/... 404`

**Causes**:
- Next.js dev server needs to rebuild
- Cache issues

**Solutions**:
1. **Restart Next.js dev server**:
   ```powershell
   # Stop the server (Ctrl+C)
   # Then restart
   cd apps/web
   pnpm dev
   ```

2. **Clear Next.js cache**:
   ```powershell
   cd apps/web
   Remove-Item -Recurse -Force .next
   pnpm dev
   ```

## Quick Fix Commands

### Kill Port 4000 and Restart API
```powershell
# Kill process on port 4000
$pid = (Get-NetTCPConnection -LocalPort 4000).OwningProcess
Stop-Process -Id $pid -Force

# Restart API server
cd apps/api
pnpm dev
```

### Use Local MongoDB
```powershell
# Update .env file
cd apps/api
# Edit .env and set:
# MONGO_URI=mongodb://localhost:27017/confirmly

# Start MongoDB (if using Docker)
docker run -d -p 27017:27017 --name mongodb mongo:7

# Or start Windows service
net start MongoDB
```

### Restart Both Servers
```powershell
# Terminal 1 - API
cd apps/api
pnpm dev

# Terminal 2 - Web
cd apps/web
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
pnpm dev
```

## Current Status

✅ **API Server**: Running in preview mode (without database)
- Health endpoint works: http://localhost:4000/health
- API docs work: http://localhost:4000/docs
- Database operations will fail (expected in preview mode)

✅ **Web Server**: Should work for UI preview
- Login page: http://localhost:3000/login
- Marketing page: http://localhost:3000
- UI components work without database

## Recommended Setup for Full Preview

1. **Use Local MongoDB**:
   ```powershell
   # Start MongoDB
   docker run -d -p 27017:27017 --name mongodb mongo:7
   
   # Update apps/api/.env
   MONGO_URI=mongodb://localhost:27017/confirmly
   ```

2. **Seed Database**:
   ```powershell
   cd apps/api
   pnpm seed:dummy
   ```

3. **Restart API Server**:
   ```powershell
   cd apps/api
   pnpm dev
   ```

4. **Test Login**:
   - Go to: http://localhost:3000/login
   - Use: `owner1@example.com` / `Password123!`

## Preview Mode vs Full Mode

### Preview Mode (Current)
- ✅ UI works
- ✅ Navigation works
- ✅ Forms render
- ❌ API calls fail (no database)
- ❌ Can't login
- ❌ Can't see data

### Full Mode (With Database)
- ✅ Everything works
- ✅ Can login
- ✅ Can see data
- ✅ All features functional

## Next Steps

1. **For UI Preview Only**: Current setup is fine
2. **For Full Testing**: Set up local MongoDB and seed database
3. **For Production**: Fix Atlas connection or use managed database

