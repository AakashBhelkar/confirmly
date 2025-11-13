# Confirmly - AI-Powered RTO Reduction Platform

Reduce Return-to-Origin (RTO) losses by 60%+ with AI-powered order confirmation and risk scoring.

## Architecture

This is a monorepo containing:

- **apps/web** - Next.js 14+ frontend application
- **apps/api** - Fastify backend API
- **apps/worker** - BullMQ workers for background jobs
- **apps/ml** - Python FastAPI ML service for risk scoring
- **packages/shared** - Shared TypeScript types
- **packages/ui** - Shared UI components
- **packages/config** - Configuration schemas

## Tech Stack

- **Frontend**: Next.js 14+, React, TypeScript, MUI, minimals.cc
- **Backend**: Node.js, Fastify, TypeScript, MongoDB, Mongoose
- **ML**: Python, FastAPI, XGBoost/LightGBM
- **Queue**: BullMQ, Redis
- **Billing**: Stripe
- **Deployment**: Vercel (frontend), AWS EC2 (backend/ML/worker)

## Getting Started

### Prerequisites

- Node.js 20+
- PNPM 8+
- Python 3.11+
- MongoDB Atlas account
- Redis instance
- Docker (optional)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd confirmly
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
# Copy example env files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/ml/.env.example apps/ml/.env
```

4. Start development servers
```bash
# Start all services
pnpm dev

# Or start individually
pnpm dev:web
pnpm dev:api
pnpm dev:worker
```

### Docker

```bash
# Start Redis
docker-compose up -d redis

# Build and run services
docker build -t confirmly-api -f apps/api/Dockerfile .
docker build -t confirmly-ml -f apps/ml/Dockerfile .
```

## Project Structure

```
confirmly/
├── apps/
│   ├── web/          # Next.js frontend
│   ├── api/           # Fastify backend
│   ├── worker/        # BullMQ workers
│   └── ml/            # Python FastAPI ML service
├── packages/
│   ├── shared/        # Shared TypeScript types
│   ├── ui/            # Shared UI components
│   └── config/        # Configuration schemas
└── .github/
    └── workflows/     # CI/CD workflows
```

## API Documentation

Once the API is running, visit:
- Swagger UI: http://localhost:4000/docs
- Health Check: http://localhost:4000/health

## Development

### Running Tests

```bash
# Backend tests
cd apps/api
pnpm test

# Frontend tests
cd apps/web
pnpm test
```

### Building

```bash
# Build all apps
pnpm build

# Build individual app
pnpm build:web
pnpm build:api
```

## Deployment

See `.github/workflows/` for CI/CD configuration:
- Frontend deploys to Vercel
- Backend/ML/Worker deploy to AWS EC2
- Database: MongoDB Atlas
- Cache: Redis (ElastiCache or Upstash)

## License

Private - All rights reserved
