# Quick Start Guide - Preview Confirmly

## Prerequisites

Before previewing, ensure you have:
- Node.js 20+ installed
- PNPM 8+ installed
- MongoDB Atlas connection string (or local MongoDB)
- Redis instance (or local Redis)

## Quick Preview Setup

### 1. Install Dependencies

```bash
# Install all dependencies
pnpm install
```

### 2. Set Up Environment Variables

Create environment files with minimal configuration:

**apps/api/.env**
```env
MONGO_URI=mongodb+srv://your-connection-string
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key
PORT=4000
FRONTEND_URL=http://localhost:3000
```

**apps/web/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**apps/ml/.env**
```env
MONGO_URI=mongodb+srv://your-connection-string
REDIS_URL=redis://localhost:6379
PORT=5000
ML_API_KEY=your-ml-api-key
```

### 3. Start Development Servers

#### Option A: Start All Services (Recommended)

```bash
# Start all services in separate terminals
pnpm dev:api    # Terminal 1 - Backend API (port 4000)
pnpm dev:web    # Terminal 2 - Frontend (port 3000)
pnpm dev:worker # Terminal 3 - Worker (optional)
```

#### Option B: Start Individual Services

**Terminal 1 - Backend API:**
```bash
cd apps/api
pnpm dev
```

**Terminal 2 - Frontend:**
```bash
cd apps/web
pnpm dev
```

**Terminal 3 - ML Service (optional):**
```bash
cd apps/ml
python -m uvicorn app.main:app --reload --port 5000
```

### 4. Access the Preview

Once servers are running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Documentation**: http://localhost:4000/docs
- **ML Service**: http://localhost:5000/health

## Preview Features

### 1. Marketing Website
- Visit: http://localhost:3000
- See the landing page with hero, features, pricing

### 2. Authentication
- Visit: http://localhost:3000/login
- Register: http://localhost:3000/register
- Test login/register functionality

### 3. Dashboard
- After login: http://localhost:3000/dashboard
- View overview with KPI cards
- Navigate through sidebar menu

### 4. API Documentation
- Visit: http://localhost:4000/docs
- Interactive Swagger UI
- Test API endpoints directly

## Quick Test Without Database

If you want to preview the UI without setting up MongoDB:

1. **Frontend Only Preview:**
   ```bash
   cd apps/web
   pnpm dev
   ```
   - Visit http://localhost:3000
   - UI will work but API calls will fail (expected)

2. **Mock API Mode:**
   - The frontend will show errors for API calls
   - But you can see all UI components and layouts

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Kill process on port 4000
npx kill-port 4000
```

### MongoDB Connection Issues
- Use MongoDB Atlas free tier
- Or install MongoDB locally
- Update MONGO_URI in apps/api/.env

### Redis Connection Issues
- Install Redis locally: https://redis.io/download
- Or use Docker: `docker run -d -p 6379:6379 redis:7-alpine`
- Or use Upstash (cloud Redis)

## Next Steps

1. **Set up MongoDB Atlas** (free tier available)
2. **Set up Redis** (local or cloud)
3. **Configure API keys** (Stripe, Shopify, WhatsApp - optional for preview)
4. **Run the servers** and explore the application

## Development Tips

- Frontend hot-reloads automatically
- Backend requires restart for changes
- Check console for errors
- API docs at /docs for endpoint testing

