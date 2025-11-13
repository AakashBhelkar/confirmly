# Deployment Guide

## Prerequisites

- MongoDB Atlas account
- Redis instance (ElastiCache or Upstash)
- AWS account (for EC2)
- Vercel account (for frontend)
- Stripe account
- Domain name (optional)

## Environment Setup

### MongoDB Atlas

1. Create a new cluster
2. Create a database user
3. Whitelist IP addresses
4. Get connection string
5. Set `MONGO_URI` in environment variables

### Redis

1. Create Redis instance (ElastiCache or Upstash)
2. Get connection URL
3. Set `REDIS_URL` in environment variables

### AWS EC2

1. Launch EC2 instance (Ubuntu 22.04)
2. Install Docker and Docker Compose
3. Configure security groups (ports 4000, 5000)
4. Set up SSH keys
5. Configure environment variables

### Vercel

1. Connect GitHub repository
2. Set build command: `cd apps/web && pnpm build`
3. Set output directory: `apps/web/.next`
4. Configure environment variables

## Deployment Steps

### 1. Backend API

```bash
# SSH into EC2 instance
ssh ubuntu@your-ec2-ip

# Clone repository
git clone <repository-url>
cd confirmly

# Build Docker image
cd apps/api
docker build -t confirmly-api .

# Run container
docker run -d \
  --name confirmly-api \
  -p 4000:4000 \
  --env-file .env \
  --restart always \
  confirmly-api
```

### 2. ML Service

```bash
# Build Docker image
cd apps/ml
docker build -t confirmly-ml .

# Run container
docker run -d \
  --name confirmly-ml \
  -p 5000:5000 \
  --env-file .env \
  --restart always \
  confirmly-ml
```

### 3. Worker

```bash
# Build Docker image
cd apps/worker
docker build -t confirmly-worker .

# Run container
docker run -d \
  --name confirmly-worker \
  --env-file .env \
  --restart always \
  confirmly-worker
```

### 4. Frontend (Vercel)

1. Connect repository to Vercel
2. Set root directory to `apps/web`
3. Configure environment variables
4. Deploy

## Environment Variables

### API (.env)
```
MONGO_URI=mongodb+srv://...
REDIS_URL=redis://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
SHOPIFY_API_KEY=...
SHOPIFY_API_SECRET=...
WHATSAPP_VERIFY_TOKEN=...
```

### ML Service (.env)
```
MONGO_URI=mongodb+srv://...
REDIS_URL=redis://...
ML_API_KEY=...
MLFLOW_TRACKING_URI=...
MODEL_PATH=./models/risk_model.pkl
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://api.confirmly.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

## Monitoring

### Health Checks

- API: `https://api.confirmly.com/health`
- ML Service: `https://ml.confirmly.com/health`

### Logs

```bash
# View API logs
docker logs -f confirmly-api

# View ML service logs
docker logs -f confirmly-ml

# View worker logs
docker logs -f confirmly-worker
```

### Metrics

- Set up CloudWatch or similar monitoring
- Configure alerts for errors and high latency
- Monitor queue sizes and processing times

## Rollback

```bash
# Stop current containers
docker stop confirmly-api confirmly-ml confirmly-worker

# Pull previous version
git checkout <previous-commit>

# Rebuild and restart
docker-compose up -d
```

## Scaling

### Horizontal Scaling

- Run multiple worker instances
- Use load balancer for API
- Configure Redis cluster for high availability

### Vertical Scaling

- Increase EC2 instance size
- Optimize database queries
- Add caching layers

## Backup & Recovery

### Database Backups

- MongoDB Atlas automated backups
- Daily snapshots
- Point-in-time recovery

### Application Backups

- Git repository
- Docker images in registry
- Environment variable backups (encrypted)

