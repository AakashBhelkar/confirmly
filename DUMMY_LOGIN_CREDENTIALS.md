# 🔑 Dummy Login Credentials

These credentials are created by the seed script (`apps/api/src/scripts/seed-dummy-data.ts`).

## 📋 Quick Reference

| Role | Email | Password | Merchant | Access Level |
|------|-------|----------|----------|--------------|
| **Super Admin** | `admin@confirmly.com` | `Admin123!` | None | Full system access |
| **Owner 1** | `owner1@example.com` | `Password123!` | Fashion Store | Full merchant access |
| **Owner 2** | `owner2@example.com` | `Password123!` | Electronics Hub | Full merchant access |
| **Admin** | `member1@fashionstore.com` | `Password123!` | Fashion Store | Admin access |
| **Member** | `member2@electronicshub.in` | `Password123!` | Electronics Hub | Member access |

---

## 👤 User Details

### 1. Super Admin
- **Email**: `admin@confirmly.com`
- **Password**: `Admin123!`
- **Name**: Super Admin
- **Role**: `superadmin`
- **Access**: 
  - Full system access
  - Admin panel access
  - Can manage all merchants
  - Can manage plans
  - Can view provider health

### 2. Owner 1 (Fashion Store)
- **Email**: `owner1@example.com`
- **Password**: `Password123!`
- **Name**: Rajesh Kumar
- **Role**: `owner`
- **Merchant**: Fashion Store
- **Plan**: Starter (Trial)
- **Access**:
  - Full access to Fashion Store merchant account
  - Can manage team members
  - Can view all orders
  - Can manage templates and policies
  - Can access billing

### 3. Owner 2 (Electronics Hub)
- **Email**: `owner2@example.com`
- **Password**: `Password123!`
- **Name**: Priya Sharma
- **Role**: `owner`
- **Merchant**: Electronics Hub
- **Plan**: Professional (Active)
- **Access**:
  - Full access to Electronics Hub merchant account
  - Can manage team members
  - Can view all orders
  - Can manage templates and policies
  - Can access billing

### 4. Admin Member (Fashion Store)
- **Email**: `member1@fashionstore.com`
- **Password**: `Password123!`
- **Name**: Amit Singh
- **Role**: `admin`
- **Merchant**: Fashion Store
- **Access**:
  - Admin access to Fashion Store
  - Can view and manage orders
  - Can manage templates
  - Limited billing access

### 5. Regular Member (Electronics Hub)
- **Email**: `member2@electronicshub.in`
- **Password**: `Password123!`
- **Name**: Sneha Patel
- **Role**: `member`
- **Merchant**: Electronics Hub
- **Access**:
  - Basic member access
  - Can view orders
  - Limited template access
  - No billing access

---

## 🏪 Merchant Details

### Fashion Store
- **Slug**: `fashion-store`
- **Domain**: `fashionstore.com`
- **Plan**: Starter (Trial - 14 days)
- **Settings**:
  - Confirm COD only: Yes
  - Confirm Prepaid: No
  - Confirmation window: 24 hours
  - Auto-cancel unconfirmed: No

### Electronics Hub
- **Slug**: `electronics-hub`
- **Domain**: `electronicshub.in`
- **Plan**: Professional (Active)
- **Settings**:
  - Confirm COD only: Yes
  - Confirm Prepaid: Yes
  - Confirmation window: 48 hours
  - Auto-cancel unconfirmed: Yes

---

## 🚀 How to Use These Credentials

### Step 1: Seed the Database
If you haven't already, run the seed script:
```powershell
cd apps/api
pnpm seed:dummy
```

### Step 2: Login
1. Open your browser: http://localhost:3000/login
2. Enter one of the credentials above
3. Click "Sign In"

### Step 3: Explore
- **As Super Admin**: Access admin panel at `/admin`
- **As Owner**: Access full merchant dashboard
- **As Member**: Access limited merchant features

---

## 📊 Test Data Included

The seed script also creates:
- ✅ **3 Plans**: Starter, Professional, Enterprise
- ✅ **2 Merchants**: Fashion Store, Electronics Hub
- ✅ **5 Users**: 1 Super Admin, 2 Owners, 2 Team Members
- ✅ **25 Orders**: 15 for Fashion Store, 10 for Electronics Hub
- ✅ **5 Templates**: WhatsApp and SMS templates for both merchants
- ✅ **2 Policies**: Auto-confirmation rules for both merchants

---

## 🔒 Security Note

⚠️ **Important**: These are dummy credentials for development/testing only!

- Change passwords in production
- Never commit real credentials to git
- Use environment variables for production secrets
- These passwords are intentionally simple for easy testing

---

## 🧪 Testing Different Roles

### Test Super Admin Features
1. Login as: `admin@confirmly.com` / `Admin123!`
2. Navigate to: `/admin/merchants`
3. Try: Managing merchants, plans, viewing provider health

### Test Owner Features
1. Login as: `owner1@example.com` / `Password123!`
2. Navigate to: `/dashboard`
3. Try: Viewing orders, managing templates, accessing billing

### Test Member Features
1. Login as: `member2@electronicshub.in` / `Password123!`
2. Navigate to: `/dashboard/orders`
3. Try: Viewing orders (limited access)

---

## 🆘 Troubleshooting

### "Invalid credentials" error
- Make sure you've run the seed script: `pnpm seed:dummy`
- Check that MongoDB is connected
- Verify the API server is running

### "User not found" error
- The seed script may not have completed
- Check the API server logs for errors
- Try running the seed script again

### Can't access admin panel
- Only `superadmin` role can access `/admin`
- Make sure you're logged in as `admin@confirmly.com`

---

## 📝 Quick Login Links

- **Login Page**: http://localhost:3000/login
- **Register Page**: http://localhost:3000/register
- **Dashboard**: http://localhost:3000/dashboard (after login)
- **Admin Panel**: http://localhost:3000/admin (superadmin only)

---

**Happy Testing!** 🎉

