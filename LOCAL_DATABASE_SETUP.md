# Local Dummy Database Setup Guide

This guide will help you set up a local MongoDB database with dummy data for UI preview.

## Prerequisites

1. **MongoDB installed locally** or use Docker
2. **Node.js 20+** and **PNPM** installed

## Option 1: Using Local MongoDB

### Step 1: Install MongoDB

**Windows:**
- Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
- Or use Chocolatey: `choco install mongodb`

**Mac:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### Step 2: Start MongoDB

Make sure MongoDB is running:
```bash
# Check if MongoDB is running
mongosh --eval "db.version()"
```

If not running, start it:
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongodb
# or
mongod --dbpath /path/to/data
```

## Option 2: Using Docker (Recommended)

### Step 1: Run MongoDB in Docker

```bash
docker run -d \
  --name mongodb-local \
  -p 27017:27017 \
  -v mongodb-data:/data/db \
  mongo:latest
```

### Step 2: Verify MongoDB is Running

```bash
docker ps | grep mongodb
```

## Step 3: Configure Environment

1. **Copy the example environment file:**
   ```bash
   cd apps/api
   cp .env.example .env
   ```

2. **Update `.env` file:**
   ```env
   MONGO_URI=mongodb://localhost:27017/confirmly
   JWT_SECRET=local-dev-secret-key-change-in-production-min-32-chars
   JWT_EXPIRES_IN=7d
   PORT=4000
   NODE_ENV=development
   ```

## Step 4: Seed the Database

Run the seed script to create dummy data:

```bash
cd apps/api
pnpm seed:dummy
```

Or from the root:
```bash
pnpm --filter api seed:dummy
```

## What Gets Created

The seed script creates:

1. **Plans** (3 plans):
   - Starter (Free)
   - Professional (₹2,999/month)
   - Enterprise (₹9,999/month)

2. **Admin User**:
   - Email: `admin@confirmly.com`
   - Password: `Admin123!`
   - Role: `superadmin`

3. **Merchants** (2 merchants):
   - Fashion Store (Starter plan, trial)
   - Electronics Hub (Professional plan, active)

4. **Users** (4 users):
   - Admin: `admin@confirmly.com` / `Admin123!`
   - Owner 1: `owner1@example.com` / `Password123!`
   - Owner 2: `owner2@example.com` / `Password123!`
   - Member 1: `member1@fashionstore.com` / `Password123!`
   - Member 2: `member2@electronicshub.in` / `Password123!`

5. **Orders** (25 orders):
   - 15 orders for Fashion Store
   - 10 orders for Electronics Hub
   - Various statuses: pending, confirmed, unconfirmed, canceled, fulfilled
   - Mix of COD and prepaid orders
   - Risk scores assigned

6. **Templates** (5 templates):
   - WhatsApp templates for both merchants
   - SMS templates
   - Email templates

7. **Policies** (2 policies):
   - Automation rules for both merchants

## Step 5: Start the API Server

```bash
cd apps/api
pnpm dev
```

The API will be available at `http://localhost:4000`

## Step 6: Test Login

You can now test login with any of these credentials:

- **Admin**: `admin@confirmly.com` / `Admin123!`
- **Owner 1**: `owner1@example.com` / `Password123!`
- **Owner 2**: `owner2@example.com` / `Password123!`
- **Member 1**: `member1@fashionstore.com` / `Password123!`
- **Member 2**: `member2@electronicshub.in` / `Password123!`

## Viewing Data

### Using MongoDB Compass

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to: `mongodb://localhost:27017`
3. Select database: `confirmly`
4. Browse collections

### Using MongoDB Shell

```bash
mongosh confirmly

# List collections
show collections

# View users
db.users.find().pretty()

# View orders
db.orders.find().pretty()

# View merchants
db.merchants.find().pretty()
```

## Resetting the Database

To reset and reseed the database:

```bash
# Drop the database
mongosh --eval "use confirmly; db.dropDatabase()"

# Or using MongoDB Compass: Right-click database > Drop Database

# Then reseed
cd apps/api
pnpm seed:dummy
```

## Troubleshooting

### "Cannot connect to MongoDB"

1. **Check if MongoDB is running:**
   ```bash
   mongosh --eval "db.version()"
   ```

2. **Check connection string:**
   - Local: `mongodb://localhost:27017/confirmly`
   - Docker: `mongodb://localhost:27017/confirmly` (if port is mapped)

3. **Check firewall/port:**
   - MongoDB default port: `27017`
   - Make sure port is not blocked

### "Database already exists"

The seed script will skip existing data. To start fresh:

```bash
mongosh --eval "use confirmly; db.dropDatabase()"
pnpm seed:dummy
```

### "Port 27017 already in use"

Another MongoDB instance might be running. Check:

```bash
# Windows
netstat -ano | findstr :27017

# Mac/Linux
lsof -i :27017
```

## Next Steps

1. **Start the frontend:**
   ```bash
   cd apps/web
   pnpm dev
   ```

2. **Login and explore the UI** with the dummy data

3. **When ready for production**, switch to MongoDB Atlas:
   - Update `MONGO_URI` in `.env`
   - Run `pnpm setup:db` (creates plans and admin only)
   - Or run `pnpm seed:dummy` for full dummy data

## Notes

- All passwords are: `Password123!` (except admin: `Admin123!`)
- Data is reset when you drop the database
- This is for **development/preview only**
- Use MongoDB Atlas for production



