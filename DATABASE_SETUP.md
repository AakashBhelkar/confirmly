# Database Setup Guide

## Quick Setup

Run the complete database setup script to initialize everything:

```bash
cd apps/api
pnpm setup:db
```

This will:
- ✅ Connect to MongoDB
- ✅ Create all database indexes
- ✅ Create default plans (Starter, Professional, Enterprise)
- ✅ Create superadmin account

## Prerequisites

1. **MongoDB Connection**: Set `MONGO_URI` in `apps/api/.env`
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/confirmly
   ```

2. **Optional Admin Credentials**: Customize in `apps/api/.env`
   ```env
   SUPERADMIN_EMAIL=admin@confirmly.com
   SUPERADMIN_PASSWORD=Admin123!
   SUPERADMIN_NAME=Super Admin
   ```

## What Gets Created

### Default Plans

1. **Starter** (Free)
   - ₹0/month
   - 1,000 orders/month
   - 2,000 messages/month
   - Basic features

2. **Professional** (₹2,999/month)
   - 10,000 orders/month
   - 20,000 messages/month
   - Advanced features

3. **Enterprise** (₹9,999/month)
   - 100,000 orders/month
   - 200,000 messages/month
   - All features

### Superadmin Account

- **Email**: `admin@confirmly.com` (or custom from env)
- **Password**: `Admin123!` (or custom from env)
- **Role**: `superadmin`
- **Access**: Full system access

## Database Collections

The setup creates indexes for these collections:

- `users` - User accounts
- `merchants` - Merchant/tenant data
- `orders` - Order data
- `templates` - Message templates
- `policies` - Automation policies
- `plans` - Subscription plans
- `billing` - Billing information
- `eventlogs` - Audit logs

## Troubleshooting

### "MONGO_URI not found"
- Make sure `apps/api/.env` exists
- Set `MONGO_URI` with your MongoDB connection string

### "Cannot connect to database"
- Verify MongoDB is running
- Check connection string format
- For MongoDB Atlas: whitelist your IP address
- Check network connectivity

### "Plans already exist"
- This is normal if you run the script multiple times
- Plans won't be recreated if they already exist

### "Superadmin already exists"
- Delete existing superadmin from database, or
- Use a different email address

## Manual Setup

If you prefer to set up manually:

1. **Connect to MongoDB** (MongoDB Compass or mongo shell)

2. **Create Plans**:
   ```javascript
   db.plans.insertMany([
     {
       name: "Starter",
       price: 0,
       currency: "INR",
       limits: { ordersPerMonth: 1000, messagesPerMonth: 2000 },
       features: ["Basic RTO reduction", "WhatsApp confirmations"],
       public: true,
       sort: 1,
       createdAt: new Date(),
       updatedAt: new Date()
     },
     // ... more plans
   ])
   ```

3. **Create Superadmin**:
   ```javascript
   // First generate password hash
   // Then insert user
   db.users.insertOne({
     email: "admin@confirmly.com",
     name: "Super Admin",
     role: "superadmin",
     passwordHash: "<hashed_password>",
     createdAt: new Date(),
     updatedAt: new Date()
   })
   ```

## Next Steps

After setup:

1. **Start API server**:
   ```bash
   cd apps/api
   pnpm dev
   ```

2. **Login with admin credentials**:
   - Email: `admin@confirmly.com`
   - Password: `Admin123!`

3. **Change password** after first login!

4. **Test registration** - New users can now register and will get the Starter plan

