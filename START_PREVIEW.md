# 🚀 Start Preview - Quick Guide

## Ready to Preview!

Everything is set up and ready for preview. Follow these simple steps:

### Option 1: Use Preview Script (Easiest)

**Windows PowerShell:**
```powershell
.\scripts\start-preview.ps1
```

This will:
- ✅ Check dependencies
- ✅ Create environment files
- ✅ Start API and Web servers
- ✅ Open in browser

### Option 2: Manual Start

**Terminal 1 - Backend API:**
```bash
cd apps/api
pnpm dev
```
→ Runs on http://localhost:4000

**Terminal 2 - Frontend:**
```bash
cd apps/web
pnpm dev
```
→ Runs on http://localhost:3000

### Option 3: Quick UI Preview (No Backend)

If you just want to see the UI without database setup:

```bash
cd apps/web
pnpm dev
```

Then visit: **http://localhost:3000**

## 📍 Access Points

Once servers are running:

- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000
- **API Docs**: http://localhost:4000/docs
- **Health Check**: http://localhost:4000/health

## 🎨 What You Can Preview

### 1. Marketing Website
- **URL**: http://localhost:3000
- Hero section with CTA
- Features showcase
- Pricing section
- **No login required**

### 2. Authentication Pages
- **Login**: http://localhost:3000/login
- **Register**: http://localhost:3000/register
- **Forgot Password**: http://localhost:3000/forgot-password
- **Reset Password**: http://localhost:3000/reset-password

### 3. Dashboard (After Login)
- **URL**: http://localhost:3000/dashboard
- Overview with KPI cards
- Sidebar navigation
- Responsive layout

### 4. API Documentation
- **URL**: http://localhost:4000/docs
- Interactive Swagger UI
- Test endpoints directly

## ⚠️ Preview Notes

### Without Database:
- ✅ UI components work
- ✅ Navigation works
- ✅ Layouts render correctly
- ❌ API calls will fail (expected)
- ❌ Can't create accounts

### With Database:
- ✅ Full functionality
- ✅ Create accounts
- ✅ Test all features
- ✅ See real data

## 🔧 Quick Setup (Optional)

### Minimal Database Setup:

1. **MongoDB Atlas** (Free):
   - Sign up: https://www.mongodb.com/cloud/atlas
   - Create free cluster
   - Get connection string
   - Add to `apps/api/.env`:
     ```
     MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/confirmly
     ```

2. **Redis** (Local):
   ```bash
   docker run -d -p 6379:6379 redis:7-alpine
   ```

## 🎯 Next Steps

1. **Start Preview**: Run the preview script or start servers manually
2. **Explore UI**: Visit http://localhost:3000
3. **Test API**: Visit http://localhost:4000/docs
4. **Set up Database**: For full functionality (optional)

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows
npx kill-port 3000
npx kill-port 4000
```

### Dependencies Not Installed
```bash
pnpm install
```

### Build Errors
- Check Node version: `node --version` (need 20+)
- Check PNPM version: `pnpm --version` (need 8+)

---

**Ready? Let's start previewing! 🎉**

Run: `.\scripts\start-preview.ps1` or start servers manually.

