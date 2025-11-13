# Quick Start: Local Database Setup

## Prerequisites

- MongoDB installed locally OR Docker
- Node.js 20+ and PNPM

## Quick Setup (3 Steps)

### 1. Start MongoDB

**Option A: Local MongoDB**
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongodb
```

**Option B: Docker (Recommended)**
```bash
docker run -d --name mongodb-local -p 27017:27017 mongo:latest
```

### 2. Configure Environment

```bash
cd apps/api
cp .env.example .env
```

The `.env` file should have:
```env
MONGO_URI=mongodb://localhost:27017/confirmly
JWT_SECRET=local-dev-secret-key-change-in-production-min-32-chars
```

### 3. Seed Database

```bash
# From apps/api directory
pnpm seed:dummy

# Or from root
pnpm --filter api seed:dummy
```

## That's It! 🎉

Your database is now ready with:
- ✅ Admin user: `admin@confirmly.com` / `Admin123!`
- ✅ 2 Merchants with users
- ✅ 25 Orders (various statuses)
- ✅ Templates and policies
- ✅ 3 Plans (Starter, Professional, Enterprise)

## Start the API

```bash
cd apps/api
pnpm dev
```

API will be available at: `http://localhost:4000`

## Login Credentials

- **Admin**: `admin@confirmly.com` / `Admin123!`
- **Owner 1**: `owner1@example.com` / `Password123!`
- **Owner 2**: `owner2@example.com` / `Password123!`
- **Member 1**: `member1@fashionstore.com` / `Password123!`
- **Member 2**: `member2@electronicshub.in` / `Password123!`

## Using the Setup Script

For Windows, you can use the automated script:

```powershell
.\scripts\setup-local-db.ps1
```

This script will:
1. Check if MongoDB is installed
2. Check if MongoDB is running
3. Create `.env` file if missing
4. Install dependencies if needed
5. Seed the database

## Troubleshooting

**MongoDB not running?**
```bash
# Check if MongoDB is running
mongosh --eval "db.version()"
```

**Port 27017 in use?**
- Check if another MongoDB instance is running
- Or use Docker: `docker run -d --name mongodb-local -p 27018:27017 mongo:latest`
- Update `.env`: `MONGO_URI=mongodb://localhost:27018/confirmly`

**Need to reset database?**
```bash
mongosh --eval "use confirmly; db.dropDatabase()"
pnpm seed:dummy
```

For detailed instructions, see [LOCAL_DATABASE_SETUP.md](./LOCAL_DATABASE_SETUP.md)



