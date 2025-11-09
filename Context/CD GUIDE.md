Confirmly Infrastructure, Deployment & Release Engineering Manual

🧭 1. Overview
This document defines the deployment architecture, environments, CI/CD automation, infrastructure configuration, monitoring, and rollback strategy for Confirmly, ensuring consistent, reliable, and secure delivery of every code change.
The stack is fully containerized and follows GitOps-style continuous deployment.

🏗️ 2. Architecture Summary
🔹 Infrastructure Overview
Layer
Stack
Hosting
Frontend (Dashboard & Marketing Site)
Next.js (MUI + minimals.cc)
Vercel
Backend API
Node.js + Fastify
AWS EC2 (Docker)
Worker Queue
BullMQ + Redis
AWS EC2 (same instance)
ML Service
FastAPI + Python + XGBoost
AWS EC2 (separate container)
Database
MongoDB Atlas (Cloud)
Managed
Object Storage
AWS S3
Managed
Monitoring
PostHog + Sentry + Grafana
Cloud / Free tier
Billing
Stripe
Cloud SaaS
Auth
Clerk / Auth.js
SaaS


🌱 3. Environments
Environment
Purpose
URL Pattern
Data Source
Development
Local testing & feature builds
localhost
Dev DB
Staging
QA & pre-production
staging.confirmly.io
Staging DB
Production
Live app for users
app.confirmly.io
Prod DB

Each environment maintains isolated config, secrets, and DB credentials.

⚙️ 4. Deployment Workflow
Branching Model (GitHub)
main ───► production releases
│
├── staging ───► QA testing
│
└── feature/* ───► feature branches

Branch
Auto Deploys To
Purpose
main
Production
Stable, reviewed code
staging
Staging
Pre-prod environment
feature/*
Preview builds
Dev sandbox


🧰 5. CI/CD Pipeline (GitHub Actions)
Each service (web, api, ml) has its own pipeline YAML.
🧩 Example: apps/api/.github/workflows/deploy.yml
name: Deploy API

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  build-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install deps
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build Docker image
        run: docker build -t confirmly-api .

      - name: Push Docker image
        run: docker save confirmly-api | gzip > confirmly-api.tar.gz

      - name: Upload artifact to AWS EC2
        uses: appleboy/scp-action@v0.1.4
        with:
          host: ${{ secrets.AWS_HOST }}
          username: ubuntu
          key: ${{ secrets.AWS_SSH_KEY }}
          source: "confirmly-api.tar.gz"
          target: "~/"

      - name: SSH Deploy
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.AWS_HOST }}
          username: ubuntu
          key: ${{ secrets.AWS_SSH_KEY }}
          script: |
            docker load -i confirmly-api.tar.gz
            docker stop confirmly-api || true
            docker rm confirmly-api || true
            docker run -d --restart always --name confirmly-api \
              -p 4000:4000 \
              -e NODE_ENV=production \
              -e MONGO_URI=${{ secrets.MONGO_URI }} \
              confirmly-api

✅ Key benefits:
Fully automated builds → deployment with zero manual SSH.


Automatic restart on crash via Docker.


Separate staging & prod actions (different secrets).



☁️ 6. Docker Container Configuration
6.1 API Container
Dockerfile:
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 4000
CMD ["node", "dist/index.js"]

docker-compose.yml (local testing):
version: "3.9"
services:
  api:
    build: .
    ports:
      - "4000:4000"
    env_file: .env
    depends_on:
      - redis
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"


🧠 7. ML Service Deployment (AWS EC2 or Docker Host)
Dockerfile (ML service)
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]

Deployed as:
docker run -d --name confirmly-ml -p 5000:5000 confirmly-ml

Configured with:
AWS S3_BUCKET for model store


MONGO_URI for logs


ML_API_KEY (internal service token)



🔐 8. Secrets & Environment Variables
Environment Files
Service
File
Example Variables
Web
.env.local
NEXT_PUBLIC_API_URL, STRIPE_PUBLISHABLE_KEY
API
.env
MONGO_URI, STRIPE_SECRET_KEY, JWT_SECRET
ML
.env
S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY

Secrets stored securely in:
AWS SSM Parameter Store (production)


.env for local dev (gitignored)



📊 9. Monitoring, Logging & Alerts
Stack:
Application Errors: Sentry (Node + Python SDKs)


Usage Analytics: PostHog (for feature tracking)


Server Metrics: Grafana Cloud (free tier)


Health Check Endpoint: /healthz on each service


Uptime Alerts: UptimeRobot monitors every 5 minutes


Example alert thresholds:
Metric
Threshold
Action
API latency
> 800ms
Slack alert
ML uptime
< 99%
Auto restart container
Redis queue delay
> 30s
Trigger scale-up suggestion


🔁 10. Rollback & Disaster Recovery
Rollback:
 Each deployment keeps last 3 Docker images on EC2.
 Rollback via docker run of previous tag.


Data Backup:


MongoDB Atlas: daily snapshot (7-day retention).


S3: versioning enabled.


Redis (ephemeral) — no persistence required.


Disaster Recovery Plan:


Backup restore test every 2 weeks.


New EC2 launch script (init-ec2.sh) provisions full system.



🧩 11. Cost Optimization Strategy
EC2 instance: t3.medium (shared API + worker) ≈ ₹2,000/mo


ML instance: t3.micro ≈ ₹800/mo


MongoDB free tier until scale-up


Grafana Cloud free tier


PostHog self-host optional later


Approximate total infra cost (MVP phase): ₹3,000–3,500/month.

📘 12. Maintenance SOPs
Task
Frequency
Owner
Tool
Dependency updates
Weekly
DevOps
Dependabot
Model retrain job
Bi-weekly
ML Engineer
Notebook
Security patch audit
Monthly
DevOps
npm audit
Backup verification
Monthly
Admin
Mongo Atlas Console
CI/CD logs review
Weekly
Lead Dev
GitHub Actions

