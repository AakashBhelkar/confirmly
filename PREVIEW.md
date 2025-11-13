# Preview Guide - See Confirmly in Action

## 🎯 Quick Preview (5 minutes)

### Step 1: Install Dependencies

```bash
pnpm install
```

### Step 2: Start Servers

**Windows (PowerShell):**
```powershell
.\scripts\start-preview.ps1
```

**Mac/Linux:**
```bash
chmod +x scripts/start-preview.sh
./scripts/start-preview.sh
```

**Manual Start:**
```bash
# Terminal 1 - API
cd apps/api && pnpm dev

# Terminal 2 - Web
cd apps/web && pnpm dev
```

### Step 3: Open in Browser

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:4000/docs
- **API Health**: http://localhost:4000/health

## 📱 What You Can Preview

### 1. Marketing Website
- **URL**: http://localhost:3000
- **Features**: Hero section, features, pricing, FAQ
- **No login required**

### 2. Authentication Pages
- **Login**: http://localhost:3000/login
- **Register**: http://localhost:3000/register
- **Forgot Password**: http://localhost:3000/forgot-password
- **Reset Password**: http://localhost:3000/reset-password

### 3. Dashboard (After Login)
- **URL**: http://localhost:3000/dashboard
- **Features**: 
  - Overview with KPI cards
  - Sidebar navigation
  - Header with user menu
  - Responsive layout

### 4. API Documentation
- **URL**: http://localhost:4000/docs
- **Features**:
  - Interactive Swagger UI
  - Test endpoints directly
  - View request/response schemas

## 🎨 UI Preview Highlights

### Design System
- **Primary Color**: #3C73FF (Blue)
- **Accent Color**: #00C48C (Green)
- **Dark Mode**: Supported
- **Components**: MUI + minimals.cc

### Pages Available
1. ✅ Marketing Landing Page
2. ✅ Login/Register Pages
3. ✅ Dashboard Layout
4. ✅ Onboarding Wizard (7 steps)
5. ✅ Auth Pages (forgot/reset password)

## ⚠️ Preview Limitations

### Without Database Setup:
- ❌ API calls will fail
- ❌ Can't create accounts
- ❌ Can't see real data
- ✅ UI components work
- ✅ Navigation works
- ✅ Layouts render correctly

### With Database Setup:
- ✅ Full functionality
- ✅ Create accounts
- ✅ Test all features
- ✅ See real data

## 🔧 Minimal Setup for Full Preview

### 1. MongoDB Atlas (Free)
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Add to `apps/api/.env`:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/confirmly
   ```

### 2. Redis (Local or Cloud)
**Option A - Local:**
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

**Option B - Upstash (Free):**
1. Sign up at https://upstash.com
2. Create Redis database
3. Get connection URL
4. Add to `apps/api/.env`:
   ```
   REDIS_URL=redis://your-upstash-url
   ```

### 3. Start Servers
```bash
pnpm dev:api
pnpm dev:web
```

## 🎬 Preview Walkthrough

### 1. Landing Page
- Visit http://localhost:3000
- See hero section with CTA
- Scroll to see features
- View pricing section

### 2. Register Account
- Click "Get Started" or visit /register
- Fill in registration form
- Create merchant account
- Auto-login after registration

### 3. Dashboard
- View overview page
- See KPI cards (mock data)
- Navigate sidebar menu
- Check responsive design

### 4. API Testing
- Visit http://localhost:4000/docs
- Try `/health` endpoint
- Test `/v1/auth/register`
- Explore all endpoints

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows
npx kill-port 3000
npx kill-port 4000

# Mac/Linux
lsof -ti:3000 | xargs kill
lsof -ti:4000 | xargs kill
```

### Dependencies Not Installing
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Build Errors
```bash
# Check Node version (need 20+)
node --version

# Check PNPM version (need 8+)
pnpm --version
```

## 📸 Screenshots You Can Take

1. **Landing Page** - Marketing website
2. **Login Page** - Authentication UI
3. **Dashboard** - Main application view
4. **API Docs** - Swagger interface
5. **Responsive Design** - Mobile/tablet views

## 🚀 Next Steps After Preview

1. Set up MongoDB Atlas
2. Configure Redis
3. Add API keys (optional)
4. Test full functionality
5. Customize branding
6. Deploy to production

Enjoy previewing Confirmly! 🎉

