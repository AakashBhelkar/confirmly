# Preview Issues Fixed

## Issues Found and Fixed

### 1. ✅ Next.js Config ES Module Issue
**Problem**: `next.config.js` was using CommonJS syntax (`module.exports`) but `package.json` has `"type": "module"`, causing a module error.

**Solution**: Changed `module.exports` to `export default` in `apps/web/next.config.js`.

### 2. ✅ Bcrypt Native Module Issue
**Problem**: `bcrypt` native module wasn't built for Windows, causing "Cannot find module" error.

**Solution**: 
- Added `rebuild` script to `apps/api/package.json`
- Run `pnpm rebuild bcrypt` in `apps/api` directory
- If rebuild fails, you may need to install Windows Build Tools:
  ```powershell
  npm install -g windows-build-tools
  ```
  Or use `bcryptjs` (pure JavaScript alternative) instead.

### 3. ✅ Missing Environment Files
**Problem**: The `.env` files for API and Web apps were missing, preventing servers from starting.

**Solution**: Create the following files manually:

#### `apps/api/.env`
```env
# API Environment Variables
# Preview mode - works without database

# Server Configuration
PORT=4000
HOST=0.0.0.0
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database (Optional for preview)
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/confirmly

# Redis (Optional for preview)
# REDIS_URL=redis://localhost:6379

# JWT Secrets (Required for auth endpoints)
JWT_SECRET=preview-secret-key-change-in-production
JWT_REFRESH_SECRET=preview-refresh-secret-key-change-in-production

# API Configuration
API_URL=http://localhost:4000
```

#### `apps/web/.env.local`
```env
# Web Environment Variables
# Preview mode configuration

# API URL
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 4. ✅ Missing Dependency: pino-pretty
**Problem**: The API uses `pino-pretty` for pretty logging in development mode, but it wasn't in package.json dependencies.

**Solution**: Added `pino-pretty` to `apps/api/package.json` devDependencies.

**Action Required**: Run `pnpm install` in the root directory to install the new dependency.

### 5. ✅ Preview Script Issues
**Problem**: The preview script tries to copy from `.env.example` files that don't exist.

**Solution**: The script will now create minimal `.env` files if they don't exist, but you should create them manually for better control.

## Quick Fix Steps

1. **Create Environment Files**:
   - Create `apps/api/.env` with the content above
   - Create `apps/web/.env.local` with the content above

2. **Install Missing Dependencies**:
   ```bash
   pnpm install
   ```

3. **Start Preview**:
   ```powershell
   .\scripts\start-preview.ps1
   ```

   Or manually:
   ```bash
   # Terminal 1 - API
   cd apps/api
   pnpm dev

   # Terminal 2 - Web
   cd apps/web
   pnpm dev
   ```

## What Works in Preview Mode

### ✅ Works Without Database:
- UI renders correctly
- Navigation works
- Layouts display properly
- API server starts
- Swagger docs available at http://localhost:4000/docs
- Health check endpoint at http://localhost:4000/health

### ❌ Requires Database:
- User registration/login
- API calls that need data
- Full functionality

## Access Points

Once servers are running:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000
- **API Docs**: http://localhost:4000/docs
- **Health Check**: http://localhost:4000/health

## Troubleshooting

### Port Already in Use
```powershell
# Windows
npx kill-port 3000
npx kill-port 4000
```

### Dependencies Not Installing
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### API Won't Start
- Check if `pino-pretty` is installed: `pnpm list pino-pretty`
- If missing, run `pnpm install` in `apps/api`
- **Bcrypt error**: Run `cd apps/api && pnpm rebuild bcrypt`
- If bcrypt rebuild fails, install Windows Build Tools or use `bcryptjs` instead
- Check for TypeScript errors: `cd apps/api && pnpm build`

### Web Won't Start
- **Module error**: Fixed by converting `next.config.js` to ES module syntax
- If still failing, check if `package.json` has `"type": "module"`
- Check if Next.js is installed: `pnpm list next`
- Check for build errors: `cd apps/web && pnpm build`
- Verify `.env.local` exists and has `NEXT_PUBLIC_API_URL`

## Next Steps

1. Create the environment files as shown above
2. Run `pnpm install` to install missing dependencies
3. Start the preview servers
4. Visit http://localhost:3000 to see the UI
5. Visit http://localhost:4000/docs to see API documentation

For full functionality, you'll need to:
- Set up MongoDB Atlas (free tier)
- Set up Redis (local or cloud)
- Update `.env` files with connection strings

