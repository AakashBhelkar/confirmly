# Preview Ready Checklist ✅

## Current Status

- ✅ MongoDB is running
- ✅ Dependencies installed
- ⚠️ Need to update .env for local MongoDB
- ⚠️ Need to seed database

## Quick Setup (2 Steps)

### Step 1: Update .env for Local MongoDB

Edit `apps/api/.env` and make sure it has:

```env
MONGO_URI=mongodb://localhost:27017/confirmly
```

**Or run this command:**
```powershell
# Backup current .env
Copy-Item apps\api\.env apps\api\.env.backup

# Update MONGO_URI to local
(Get-Content apps\api\.env) -replace 'MONGO_URI=.*', 'MONGO_URI=mongodb://localhost:27017/confirmly' | Set-Content apps\api\.env
```

### Step 2: Seed the Database

```powershell
cd apps\api
pnpm seed:dummy
```

This will create:
- ✅ Admin user: `admin@confirmly.com` / `Admin123!`
- ✅ 2 Merchants with owners and team members
- ✅ 25 Orders (various statuses)
- ✅ Templates and policies
- ✅ 3 Plans

## Start Preview

### Terminal 1: Start API
```powershell
cd apps\api
pnpm dev
```

### Terminal 2: Start Web
```powershell
cd apps\web
pnpm dev
```

## Access Points

- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000
- **API Docs**: http://localhost:4000/docs

## Login Credentials

- **Admin**: `admin@confirmly.com` / `Admin123!`
- **Owner 1**: `owner1@example.com` / `Password123!`
- **Owner 2**: `owner2@example.com` / `Password123!`
- **Member 1**: `member1@fashionstore.com` / `Password123!`
- **Member 2**: `member2@electronicshub.in` / `Password123!`

## Quick Check Script

Run this to check if everything is ready:

```powershell
.\scripts\check-preview-ready.ps1
```

## Troubleshooting

### "Cannot connect to MongoDB"
- Make sure MongoDB is running: `Get-Service MongoDB`
- Start it: `net start MongoDB`

### "Database already has data"
- The seed script will skip existing data
- To reset: Drop database and reseed

### "Port 3000/4000 already in use"
- Stop other services using those ports
- Or change ports in `.env` and `next.config.js`

## That's It! 🎉

Once you've updated `.env` and seeded the database, you're ready to preview!
