# Admin Account Setup

## Default Admin Credentials

After running the seed script, you can use these default credentials:

**Email:** `admin@confirmly.com`  
**Password:** `Admin123!`

⚠️ **Important:** Change the password after first login!

## Creating Admin Account

### Option 1: Complete Database Setup (Recommended)

This script sets up everything: database indexes, default plans, and admin account.

1. **Set up environment variables** in `apps/api/.env`:
   ```env
   MONGO_URI=mongodb+srv://your-connection-string
   SUPERADMIN_EMAIL=admin@confirmly.com
   SUPERADMIN_PASSWORD=Admin123!
   SUPERADMIN_NAME=Super Admin
   ```

2. **Run the setup script**:
   ```bash
   cd apps/api
   pnpm setup:db
   ```

   Or from root:
   ```bash
   pnpm --filter api setup:db
   ```

   This will:
   - ✅ Connect to MongoDB
   - ✅ Create all database indexes
   - ✅ Create default plans (Starter, Professional, Enterprise)
   - ✅ Create superadmin account

### Option 2: Admin Account Only

If you only need to create the admin account (plans already exist):

1. **Set up environment variables** (optional - defaults will be used if not set):
   ```env
   # In apps/api/.env
   SUPERADMIN_EMAIL=admin@confirmly.com
   SUPERADMIN_PASSWORD=Admin123!
   SUPERADMIN_NAME=Super Admin
   ```

2. **Run the seed script**:
   ```bash
   cd apps/api
   pnpm seed:admin
   ```

   Or from root:
   ```bash
   pnpm --filter api seed:admin
   ```

### Option 3: Manual Creation via API

You can also create a superadmin manually by:

1. **Connect to MongoDB** (using MongoDB Compass or mongo shell)

2. **Insert a superadmin user**:
   ```javascript
   // In MongoDB shell or Compass
   db.users.insertOne({
     email: "admin@confirmly.com",
     name: "Super Admin",
     role: "superadmin",
     passwordHash: "<hashed_password>", // Use bcrypt hash
     createdAt: new Date(),
     updatedAt: new Date()
   })
   ```

   To generate password hash, you can use:
   ```bash
   node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Admin123!', 10).then(h => console.log(h))"
   ```

### Option 3: Create via Registration + Update Role

1. Register a normal account through the UI
2. Update the user role to `superadmin` in the database:
   ```javascript
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "superadmin", merchantId: null } }
   )
   ```

## Admin Features

Superadmin accounts have access to:

- **Admin Panel** (`/v1/admin/*`):
  - View all merchants
  - Manage plans and pricing
  - View system analytics
  - Impersonate users (for support)

- **All Merchant Data**:
  - Access any merchant's data
  - View all orders across all merchants
  - Manage merchant settings

## Security Notes

1. **Change Default Password**: Always change the default password after first login
2. **Use Strong Passwords**: Admin accounts should use strong, unique passwords
3. **Limit Admin Accounts**: Only create superadmin accounts for trusted users
4. **Monitor Access**: Regularly review admin account activity
5. **Environment Variables**: Use environment variables for production credentials

## Troubleshooting

### "Superadmin already exists"
- Delete the existing superadmin from the database, or
- Use a different email address

### "MONGO_URI not found"
- Make sure `apps/api/.env` has `MONGO_URI` set
- Check that the database connection string is correct

### "Cannot connect to database"
- Verify MongoDB is running
- Check connection string format
- Ensure network access is allowed (for MongoDB Atlas)

