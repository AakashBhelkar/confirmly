# Confirmly - Complete Build Roadmap & Implementation Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Current State Analysis](#current-state-analysis)
3. [UI Library Assessment (minimals.cc)](#ui-library-assessment-minimalscc)
4. [Phase-by-Phase Implementation Plan](#phase-by-phase-implementation-plan)
5. [Detailed Task Breakdown](#detailed-task-breakdown)
6. [Technical Architecture Setup](#technical-architecture-setup)
7. [Development Environment Setup](#development-environment-setup)
8. [Testing & QA Strategy](#testing--qa-strategy)
9. [Deployment & DevOps](#deployment--devops)
10. [Timeline & Milestones](#timeline--milestones)

---

## 🎯 Project Overview

**Confirmly** is an AI-powered platform that reduces Return-to-Origin (RTO) losses for eCommerce brands by automating pre-delivery order confirmations via WhatsApp Cloud API, SMS, and Email, informed by an AI/ML risk engine.

### Core Objectives
- **Reduce RTO by 60%+** on COD orders through automated confirmations
- **Achieve 95%+ confirmation rate** on contacted orders
- **Deliver clear ROI analytics** and per-channel attribution
- **Ship a secure, scalable MVP** with clean code and best practices

### Tech Stack (Target)
- **Frontend:** Next.js (App Router) + TypeScript + MUI + minimals.cc
- **Backend:** Node.js (Fastify) + TypeScript
- **Database:** MongoDB Atlas + Mongoose
- **Queue System:** BullMQ + Redis
- **ML Service:** Python (FastAPI) + XGBoost/LightGBM
- **Billing:** Stripe (Checkout + Billing Portal)
- **Providers:** WhatsApp Cloud API, MSG91/Twilio, SendGrid/SES
- **Analytics:** PostHog + internal event logging
- **Hosting:** Vercel (Frontend), AWS EC2 (Backend/ML), MongoDB Atlas

---

## 🔍 Current State Analysis

### What's Already Available
✅ **UI Library:** minimals.cc is already installed (`@minimal-kit/vite-js`)
- MUI components are set up
- Extensive component library available
- Theme system configured
- Layout components ready

✅ **Project Structure:**
- React app with Vite
- MUI components integrated
- Routing setup (React Router)
- Authentication context structure
- Mock data structure

### What Needs to Be Done
❌ **Migration:** Convert from Vite + React to Next.js (App Router)
❌ **Backend:** Build Fastify API from scratch
❌ **Database:** Set up MongoDB schemas and models
❌ **Integrations:** WhatsApp, SMS, Email providers
❌ **ML Service:** Python FastAPI risk engine
❌ **Billing:** Stripe integration
❌ **Queue System:** BullMQ + Redis setup
❌ **Admin Panel:** Super admin features
❌ **Marketing Site:** Public-facing website

---

## ✅ UI Library Assessment (minimals.cc)

### Can We Use minimals.cc? **YES! ✅**

**Current Status:**
- ✅ minimals.cc is already installed and configured
- ✅ MUI components are available and working
- ✅ Theme system is set up
- ✅ Layout components exist
- ✅ Component library is extensive

**Compatibility with Next.js:**
- ✅ **Fully Compatible:** minimals.cc components are React components that work seamlessly with Next.js
- ✅ **Migration Path:** Components can be directly used in Next.js pages
- ✅ **No Breaking Changes:** The component API remains the same

**Available Components (from minimals.cc):**
- ✅ Dashboard layouts
- ✅ Data tables (MUI DataGrid)
- ✅ Forms (React Hook Form integration)
- ✅ Charts (ApexCharts)
- ✅ Navigation components
- ✅ Authentication pages
- ✅ Settings components
- ✅ File uploads
- ✅ Rich text editor
- ✅ Calendar components
- ✅ And many more...

**Recommendation:**
- **Use minimals.cc extensively** - It provides 90% of the UI components needed
- **Customize theme** to match Confirmly brand colors (#3C73FF primary, #00C48C accent)
- **Extend components** where needed for Confirmly-specific features
- **Leverage existing layouts** for dashboard, auth, and admin pages

---

## 🏗️ Phase-by-Phase Implementation Plan

### **Phase 1: Foundation & Setup (Week 1-2)**
**Goal:** Set up project structure, development environment, and core infrastructure

### **Phase 2: Backend Core (Week 3-4)**
**Goal:** Build API foundation, database models, authentication, and basic CRUD

### **Phase 3: Frontend Migration & Core Pages (Week 5-6)**
**Goal:** Migrate to Next.js, build dashboard, auth pages, and core UI

### **Phase 4: Integrations - Part 1 (Week 7-8)**
**Goal:** Shopify integration, order ingestion, and webhook handling

### **Phase 5: Communication Channels (Week 9-10)**
**Goal:** WhatsApp, SMS, and Email provider integrations

### **Phase 6: ML Risk Engine (Week 11-12)**
**Goal:** Build Python FastAPI service, feature engineering, and model training

### **Phase 7: Policies & Automation (Week 13-14)**
**Goal:** Policy builder, automation rules, and queue system

### **Phase 8: Analytics & Billing (Week 15-16)**
**Goal:** Analytics dashboards, Stripe integration, and billing management

### **Phase 9: Admin Panel & Marketing Site (Week 17-18)**
**Goal:** Super admin features and public marketing website

### **Phase 10: Testing, QA & Launch Prep (Week 19-20)**
**Goal:** Comprehensive testing, security audit, and production deployment

---

## 📝 Detailed Task Breakdown

### **PHASE 1: Foundation & Setup (Week 1-2)**

#### **Task 1.1: Project Structure Setup**
- [ ] Create monorepo structure (or separate repos)
  ```
  confirmly/
  ├── apps/
  │   ├── web/          # Next.js frontend
  │   ├── api/          # Fastify backend
  │   ├── worker/       # BullMQ workers
  │   └── ml/           # Python FastAPI service
  ├── packages/
  │   ├── shared/       # Shared TypeScript types
  │   ├── ui/           # Shared UI components
  │   └── config/       # Environment config
  └── docs/             # Documentation
  ```
- [ ] Set up package.json with workspaces (if monorepo)
- [ ] Configure TypeScript for all apps
- [ ] Set up ESLint + Prettier
- [ ] Configure Git hooks (Husky)
- [ ] Create .gitignore files
- [ ] Set up environment variable templates (.env.example)

**Files to Create:**
- `apps/web/package.json`
- `apps/api/package.json`
- `apps/ml/requirements.txt`
- `package.json` (root, if monorepo)
- `tsconfig.json` (root + per app)
- `.eslintrc.js`
- `.prettierrc`
- `.husky/pre-commit`

#### **Task 1.2: Development Environment**
- [ ] Install Node.js 20+ and PNPM
- [ ] Set up Python 3.11 environment
- [ ] Install Docker Desktop (for Redis, local testing)
- [ ] Create MongoDB Atlas account (dev cluster)
- [ ] Set up Redis (Docker or cloud)
- [ ] Configure VS Code workspace settings
- [ ] Set up environment variables for all services

**Environment Variables Needed:**
```bash
# API (.env)
MONGO_URI=mongodb+srv://...
REDIS_URL=redis://localhost:6379
JWT_SECRET=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
WHATSAPP_APP_ID=...
WHATSAPP_APP_SECRET=...
WHATSAPP_PHONE_NUMBER_ID=...
MSG91_AUTH_KEY=...
TWILIO_SID=...
TWILIO_TOKEN=...
SENDGRID_API_KEY=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=...
POSTHOG_KEY=...
NODE_ENV=development

# Web (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_POSTHOG_KEY=...

# ML (.env)
MONGO_URI=...
S3_BUCKET=...
MLFLOW_URI=...
MODEL_PATH=...
```

#### **Task 1.3: Database Schema Design**
- [ ] Design MongoDB collections structure
- [ ] Create Mongoose schemas for:
  - [ ] Merchant
  - [ ] User
  - [ ] Order
  - [ ] Template
  - [ ] Policy
  - [ ] Plan
  - [ ] Billing
  - [ ] EventLog
- [ ] Set up database indexes
- [ ] Create migration scripts (if needed)
- [ ] Set up database connection utilities

**Files to Create:**
- `apps/api/src/models/Merchant.ts`
- `apps/api/src/models/User.ts`
- `apps/api/src/models/Order.ts`
- `apps/api/src/models/Template.ts`
- `apps/api/src/models/Policy.ts`
- `apps/api/src/models/Plan.ts`
- `apps/api/src/models/Billing.ts`
- `apps/api/src/models/EventLog.ts`
- `apps/api/src/db/connection.ts`
- `apps/api/src/db/indexes.ts`

#### **Task 1.4: CI/CD Pipeline Setup**
- [ ] Set up GitHub Actions workflows
- [ ] Create workflow for API (lint, test, build)
- [ ] Create workflow for Web (lint, test, build)
- [ ] Create workflow for ML (lint, test)
- [ ] Set up deployment workflows (staging/prod)
- [ ] Configure secrets in GitHub
- [ ] Set up Docker builds

**Files to Create:**
- `.github/workflows/api-ci.yml`
- `.github/workflows/web-ci.yml`
- `.github/workflows/ml-ci.yml`
- `.github/workflows/deploy-staging.yml`
- `.github/workflows/deploy-prod.yml`
- `apps/api/Dockerfile`
- `apps/ml/Dockerfile`
- `docker-compose.yml` (for local dev)

---

### **PHASE 2: Backend Core (Week 3-4)**

#### **Task 2.1: Fastify API Setup**
- [ ] Initialize Fastify app
- [ ] Configure CORS
- [ ] Set up request logging
- [ ] Configure error handling middleware
- [ ] Set up rate limiting
- [ ] Create health check endpoint
- [ ] Set up OpenAPI/Swagger documentation
- [ ] Configure request validation (Zod)

**Files to Create:**
- `apps/api/src/index.ts`
- `apps/api/src/config/fastify.config.ts`
- `apps/api/src/middlewares/error-handler.ts`
- `apps/api/src/middlewares/rate-limit.ts`
- `apps/api/src/middlewares/logger.ts`
- `apps/api/src/utils/validation.ts`

#### **Task 2.2: Authentication & Authorization**
- [ ] Implement JWT token generation
- [ ] Create login endpoint
- [ ] Create register endpoint
- [ ] Create refresh token endpoint
- [ ] Implement password hashing (bcrypt/Argon2)
- [ ] Create auth middleware
- [ ] Implement RBAC (Role-Based Access Control)
- [ ] Create password reset flow
- [ ] Set up secure cookie handling

**Files to Create:**
- `apps/api/src/routes/auth/login.ts`
- `apps/api/src/routes/auth/register.ts`
- `apps/api/src/routes/auth/refresh.ts`
- `apps/api/src/routes/auth/reset-password.ts`
- `apps/api/src/middlewares/auth.ts`
- `apps/api/src/middlewares/rbac.ts`
- `apps/api/src/utils/jwt.ts`
- `apps/api/src/utils/password.ts`

#### **Task 2.3: User & Merchant Management**
- [ ] Create user CRUD endpoints
- [ ] Create merchant CRUD endpoints
- [ ] Implement user invitation system
- [ ] Create team member management
- [ ] Implement merchant settings update
- [ ] Create user profile endpoints
- [ ] Set up file upload (avatars, logos)

**Files to Create:**
- `apps/api/src/routes/users/index.ts`
- `apps/api/src/routes/users/:id.ts`
- `apps/api/src/routes/merchants/index.ts`
- `apps/api/src/routes/merchants/:id.ts`
- `apps/api/src/routes/merchants/settings.ts`
- `apps/api/src/routes/merchants/team.ts`
- `apps/api/src/controllers/user.controller.ts`
- `apps/api/src/controllers/merchant.controller.ts`
- `apps/api/src/services/user.service.ts`
- `apps/api/src/services/merchant.service.ts`

#### **Task 2.4: Core API Endpoints**
- [ ] Create `/me` endpoint (current user + merchant context)
- [ ] Set up API versioning (`/v1/`)
- [ ] Create response formatting utilities
- [ ] Implement pagination utilities
- [ ] Create filtering and sorting utilities
- [ ] Set up API documentation

**Files to Create:**
- `apps/api/src/routes/v1/index.ts`
- `apps/api/src/routes/v1/me.ts`
- `apps/api/src/utils/response.ts`
- `apps/api/src/utils/pagination.ts`
- `apps/api/src/utils/filter.ts`

---

### **PHASE 3: Frontend Migration & Core Pages (Week 5-6)**

#### **Task 3.1: Next.js Migration**
- [ ] Initialize Next.js 14+ project (App Router)
- [ ] Migrate minimals.cc components to Next.js
- [ ] Set up Next.js configuration
- [ ] Configure TypeScript
- [ ] Set up Tailwind CSS (if needed) or keep MUI
- [ ] Migrate routing from React Router to Next.js App Router
- [ ] Set up layout structure
- [ ] Configure image optimization
- [ ] Set up font optimization

**Files to Create:**
- `apps/web/next.config.js`
- `apps/web/tsconfig.json`
- `apps/web/app/layout.tsx`
- `apps/web/app/page.tsx`
- `apps/web/app/dashboard/layout.tsx`
- `apps/web/middleware.ts` (for auth)

#### **Task 3.2: Theme & Design System**
- [ ] Customize MUI theme for Confirmly
  - Primary: #3C73FF
  - Accent: #00C48C
  - Typography: Inter/Manrope
- [ ] Set up dark mode support
- [ ] Create custom component variants
- [ ] Set up responsive breakpoints
- [ ] Create design tokens file
- [ ] Configure minimals.cc theme overrides

**Files to Create:**
- `apps/web/src/theme/index.ts`
- `apps/web/src/theme/palette.ts`
- `apps/web/src/theme/typography.ts`
- `apps/web/src/theme/components.ts`
- `apps/web/src/config/theme.ts`

#### **Task 3.3: Authentication Pages**
- [ ] Create login page
- [ ] Create register page
- [ ] Create forgot password page
- [ ] Create reset password page
- [ ] Create invite acceptance page
- [ ] Implement auth context/provider
- [ ] Set up protected route middleware
- [ ] Create auth guard component

**Files to Create:**
- `apps/web/app/(auth)/login/page.tsx`
- `apps/web/app/(auth)/register/page.tsx`
- `apps/web/app/(auth)/forgot-password/page.tsx`
- `apps/web/app/(auth)/reset-password/page.tsx`
- `apps/web/app/(auth)/invite/[token]/page.tsx`
- `apps/web/src/contexts/auth-context.tsx`
- `apps/web/src/components/auth/auth-guard.tsx`
- `apps/web/src/hooks/use-auth.ts`

#### **Task 3.4: Dashboard Layout**
- [ ] Create main dashboard layout
- [ ] Build sidebar navigation
- [ ] Create top bar (header)
- [ ] Implement user menu dropdown
- [ ] Create breadcrumbs component
- [ ] Set up navigation state management
- [ ] Implement responsive mobile menu
- [ ] Create footer component

**Files to Create:**
- `apps/web/app/dashboard/layout.tsx`
- `apps/web/src/components/layout/dashboard-sidebar.tsx`
- `apps/web/src/components/layout/dashboard-header.tsx`
- `apps/web/src/components/layout/user-menu.tsx`
- `apps/web/src/components/layout/breadcrumbs.tsx`
- `apps/web/src/components/layout/mobile-menu.tsx`
- `apps/web/src/config/nav.ts` (navigation config)

#### **Task 3.5: Overview Dashboard**
- [ ] Create dashboard overview page
- [ ] Build KPI cards component
  - RTO Reduction %
  - Confirmation Rate %
  - Monthly Savings ₹
  - Messages Sent Count
- [ ] Create confirmation trend chart
- [ ] Create channel performance chart (donut)
- [ ] Create risk band distribution chart
- [ ] Create recent activity table
- [ ] Implement data fetching (SWR/TanStack Query)
- [ ] Add loading states
- [ ] Add empty states

**Files to Create:**
- `apps/web/app/dashboard/page.tsx`
- `apps/web/src/components/dashboard/kpi-cards.tsx`
- `apps/web/src/components/dashboard/confirmation-trend-chart.tsx`
- `apps/web/src/components/dashboard/channel-performance-chart.tsx`
- `apps/web/src/components/dashboard/risk-distribution-chart.tsx`
- `apps/web/src/components/dashboard/recent-activity-table.tsx`
- `apps/web/src/hooks/use-dashboard-data.ts`
- `apps/web/src/lib/api/dashboard.ts`

---

### **PHASE 4: Integrations - Part 1 (Week 7-8)**

#### **Task 4.1: Shopify Integration Setup**
- [ ] Create Shopify OAuth flow
- [ ] Set up Shopify app registration
- [ ] Implement OAuth callback handler
- [ ] Store Shopify access tokens (encrypted)
- [ ] Create webhook registration endpoint
- [ ] Set up webhook signature verification
- [ ] Create webhook handler for `orders/create`
- [ ] Create webhook handler for `orders/updated`
- [ ] Implement order sync functionality

**Files to Create:**
- `apps/api/src/routes/integrations/shopify/install.ts`
- `apps/api/src/routes/integrations/shopify/callback.ts`
- `apps/api/src/routes/integrations/shopify/webhooks.ts`
- `apps/api/src/services/shopify.service.ts`
- `apps/api/src/services/shopify-oauth.service.ts`
- `apps/api/src/utils/shopify-webhook-verify.ts`
- `apps/api/src/controllers/shopify.controller.ts`

#### **Task 4.2: Order Ingestion**
- [ ] Create order ingestion service
- [ ] Transform Shopify order to Confirmly format
- [ ] Store orders in MongoDB
- [ ] Trigger risk scoring on order creation
- [ ] Create order status update logic
- [ ] Implement order deduplication
- [ ] Create order sync job (for missed webhooks)
- [ ] Add order validation

**Files to Create:**
- `apps/api/src/services/order-ingestion.service.ts`
- `apps/api/src/utils/order-transformer.ts`
- `apps/api/src/jobs/order-sync.job.ts`
- `apps/api/src/utils/order-validator.ts`

#### **Task 4.3: Orders Management API**
- [ ] Create GET `/orders` endpoint (list with filters)
- [ ] Create GET `/orders/:id` endpoint
- [ ] Create POST `/orders/:id/confirm` endpoint
- [ ] Create POST `/orders/:id/cancel` endpoint
- [ ] Implement order filtering (status, date, risk)
- [ ] Implement order search
- [ ] Add pagination
- [ ] Create order export (CSV)

**Files to Create:**
- `apps/api/src/routes/orders/index.ts`
- `apps/api/src/routes/orders/:id.ts`
- `apps/api/src/routes/orders/:id/confirm.ts`
- `apps/api/src/routes/orders/:id/cancel.ts`
- `apps/api/src/controllers/order.controller.ts`
- `apps/api/src/services/order.service.ts`

#### **Task 4.4: Orders UI**
- [ ] Create orders list page
- [ ] Build orders data table (MUI DataGrid)
- [ ] Implement filters (status, date range, risk)
- [ ] Create order detail drawer
- [ ] Build order timeline component
- [ ] Create order actions (confirm, cancel, hold)
- [ ] Implement bulk actions
- [ ] Add order search functionality

**Files to Create:**
- `apps/web/app/dashboard/orders/page.tsx`
- `apps/web/src/components/orders/orders-table.tsx`
- `apps/web/src/components/orders/order-filters.tsx`
- `apps/web/src/components/orders/order-detail-drawer.tsx`
- `apps/web/src/components/orders/order-timeline.tsx`
- `apps/web/src/components/orders/order-actions.tsx`
- `apps/web/src/hooks/use-orders.ts`
- `apps/web/src/lib/api/orders.ts`

---

### **PHASE 5: Communication Channels (Week 9-10)**

#### **Task 5.1: Provider Abstraction Layer**
- [ ] Create provider interfaces
  - WhatsAppProvider
  - SMSProvider
  - EmailProvider
- [ ] Implement provider factory pattern
- [ ] Create provider adapter base class
- [ ] Set up provider routing logic
- [ ] Implement fallback mechanism
- [ ] Create provider health check

**Files to Create:**
- `apps/api/src/providers/interfaces/whatsapp.interface.ts`
- `apps/api/src/providers/interfaces/sms.interface.ts`
- `apps/api/src/providers/interfaces/email.interface.ts`
- `apps/api/src/providers/factory/provider-factory.ts`
- `apps/api/src/providers/base/base-provider.ts`
- `apps/api/src/services/provider-routing.service.ts`

#### **Task 5.2: WhatsApp Cloud API Integration**
- [ ] Implement WhatsApp Cloud API adapter
- [ ] Create template management
- [ ] Implement send template message
- [ ] Set up webhook for inbound messages
- [ ] Parse WhatsApp replies (YES/NO)
- [ ] Handle message status updates
- [ ] Implement rate limiting
- [ ] Add retry logic
- [ ] Create WhatsApp connection UI

**Files to Create:**
- `apps/api/src/providers/whatsapp/whatsapp-cloud.provider.ts`
- `apps/api/src/providers/whatsapp/template-manager.ts`
- `apps/api/src/routes/webhooks/whatsapp.ts`
- `apps/api/src/utils/whatsapp-parser.ts`
- `apps/api/src/services/whatsapp.service.ts`
- `apps/web/app/dashboard/integrations/whatsapp/page.tsx`
- `apps/web/src/components/integrations/whatsapp-connect.tsx`

#### **Task 5.3: SMS Integration (MSG91 + Twilio)**
- [ ] Implement MSG91 adapter (India)
- [ ] Implement Twilio adapter (Global)
- [ ] Create SMS sending service
- [ ] Set up webhook for SMS delivery status
- [ ] Parse SMS replies
- [ ] Implement smart routing (India → MSG91, Global → Twilio)
- [ ] Create SMS connection UI

**Files to Create:**
- `apps/api/src/providers/sms/msg91.provider.ts`
- `apps/api/src/providers/sms/twilio.provider.ts`
- `apps/api/src/routes/webhooks/msg91.ts`
- `apps/api/src/routes/webhooks/twilio.ts`
- `apps/api/src/services/sms.service.ts`
- `apps/web/app/dashboard/integrations/sms/page.tsx`
- `apps/web/src/components/integrations/sms-connect.tsx`

#### **Task 5.4: Email Integration (SendGrid + SES)**
- [ ] Implement SendGrid adapter
- [ ] Implement Amazon SES adapter
- [ ] Create email sending service
- [ ] Set up webhook for email events (delivered, opened, clicked)
- [ ] Parse email replies
- [ ] Implement SPF/DKIM verification
- [ ] Create email connection UI

**Files to Create:**
- `apps/api/src/providers/email/sendgrid.provider.ts`
- `apps/api/src/providers/email/ses.provider.ts`
- `apps/api/src/routes/webhooks/sendgrid.ts`
- `apps/api/src/services/email.service.ts`
- `apps/web/app/dashboard/integrations/email/page.tsx`
- `apps/web/src/components/integrations/email-connect.tsx`

#### **Task 5.5: Confirmation Service**
- [ ] Create unified confirmation service
- [ ] Implement multi-channel sending
- [ ] Create confirmation queue jobs
- [ ] Implement retry logic
- [ ] Track confirmation status
- [ ] Update order status based on replies
- [ ] Create confirmation history

**Files to Create:**
- `apps/api/src/services/confirmation.service.ts`
- `apps/api/src/jobs/confirmation.job.ts`
- `apps/api/src/utils/confirmation-tracker.ts`

---

### **PHASE 6: ML Risk Engine (Week 11-12)**

#### **Task 6.1: Python FastAPI Service Setup**
- [ ] Initialize FastAPI project
- [ ] Set up project structure
- [ ] Configure environment variables
- [ ] Create Dockerfile
- [ ] Set up logging
- [ ] Create health check endpoint
- [ ] Implement API authentication (JWT)
- [ ] Set up CORS

**Files to Create:**
- `apps/ml/app/main.py`
- `apps/ml/app/config.py`
- `apps/ml/app/middleware/auth.py`
- `apps/ml/Dockerfile`
- `apps/ml/requirements.txt`
- `apps/ml/.env.example`

#### **Task 6.2: Feature Engineering**
- [ ] Create feature extraction module
- [ ] Implement customer-level features
- [ ] Implement order-level features
- [ ] Implement geo-level features
- [ ] Implement platform-level features
- [ ] Create feature store (S3/Parquet)
- [ ] Implement feature caching (Redis)
- [ ] Create feature validation

**Files to Create:**
- `apps/ml/app/features/extractor.py`
- `apps/ml/app/features/customer_features.py`
- `apps/ml/app/features/order_features.py`
- `apps/ml/app/features/geo_features.py`
- `apps/ml/app/features/platform_features.py`
- `apps/ml/app/features/store.py`
- `apps/ml/app/features/validator.py`

#### **Task 6.3: Model Training Pipeline**
- [ ] Create data extraction script (MongoDB → Parquet)
- [ ] Implement data preprocessing
- [ ] Create train/val/test split
- [ ] Implement XGBoost/LightGBM training
- [ ] Add hyperparameter tuning (Optuna)
- [ ] Implement model evaluation metrics
- [ ] Create model versioning (MLflow)
- [ ] Save model artifacts (S3)

**Files to Create:**
- `apps/ml/app/pipeline/extract.py`
- `apps/ml/app/pipeline/preprocess.py`
- `apps/ml/app/pipeline/train.py`
- `apps/ml/app/pipeline/evaluate.py`
- `apps/ml/app/models/risk_model.py`
- `apps/ml/notebooks/training.ipynb`
- `apps/ml/scripts/train.sh`

#### **Task 6.4: Model Inference API**
- [ ] Create `/score` endpoint
- [ ] Load model from S3
- [ ] Implement feature transformation
- [ ] Generate risk score (0-100)
- [ ] Add confidence score
- [ ] Implement caching (Redis)
- [ ] Add error handling
- [ ] Create batch scoring endpoint

**Files to Create:**
- `apps/ml/app/routes/score.py`
- `apps/ml/app/services/inference.py`
- `apps/ml/app/utils/model_loader.py`
- `apps/ml/app/utils/cache.py`

#### **Task 6.5: Model Monitoring**
- [ ] Set up drift detection (PSI)
- [ ] Create performance tracking
- [ ] Implement A/B testing framework
- [ ] Create monitoring dashboard (Grafana)
- [ ] Set up alerts (Slack)
- [ ] Implement model rollback

**Files to Create:**
- `apps/ml/app/monitoring/drift.py`
- `apps/ml/app/monitoring/performance.py`
- `apps/ml/app/monitoring/alerts.py`

#### **Task 6.6: Integration with Backend**
- [ ] Create ML service client (Node.js)
- [ ] Integrate risk scoring in order ingestion
- [ ] Store risk scores in Order model
- [ ] Create risk score display in UI
- [ ] Implement fallback to rule-based scoring

**Files to Create:**
- `apps/api/src/services/ml.service.ts`
- `apps/api/src/utils/risk-fallback.ts`
- `apps/web/src/components/orders/risk-score-badge.tsx`

---

### **PHASE 7: Policies & Automation (Week 13-14)**

#### **Task 7.1: Policy Engine**
- [ ] Design policy data structure
- [ ] Create policy evaluation engine
- [ ] Implement rule matching logic
- [ ] Create policy execution service
- [ ] Add policy priority system
- [ ] Implement policy testing/simulation

**Files to Create:**
- `apps/api/src/services/policy-engine.service.ts`
- `apps/api/src/utils/policy-evaluator.ts`
- `apps/api/src/utils/policy-executor.ts`
- `apps/api/src/utils/policy-simulator.ts`

#### **Task 7.2: Policy Builder UI**
- [ ] Create policy list page
- [ ] Build visual policy builder
- [ ] Implement condition builder (IF/THEN)
- [ ] Create action selector
- [ ] Add policy preview
- [ ] Implement policy testing UI
- [ ] Create policy import/export (JSON/YAML)

**Files to Create:**
- `apps/web/app/dashboard/policies/page.tsx`
- `apps/web/src/components/policies/policy-list.tsx`
- `apps/web/src/components/policies/policy-builder.tsx`
- `apps/web/src/components/policies/condition-builder.tsx`
- `apps/web/src/components/policies/action-selector.tsx`
- `apps/web/src/components/policies/policy-preview.tsx`
- `apps/web/src/components/policies/policy-simulator.tsx`

#### **Task 7.3: Templates Management**
- [ ] Create template CRUD API
- [ ] Implement template variables system
- [ ] Create template validation
- [ ] Add A/B variant support
- [ ] Create template preview
- [ ] Implement template approval workflow (for WhatsApp)

**Files to Create:**
- `apps/api/src/routes/templates/index.ts`
- `apps/api/src/routes/templates/:id.ts`
- `apps/api/src/services/template.service.ts`
- `apps/api/src/utils/template-validator.ts`
- `apps/web/app/dashboard/templates/page.tsx`
- `apps/web/src/components/templates/template-list.tsx`
- `apps/web/src/components/templates/template-editor.tsx`
- `apps/web/src/components/templates/template-preview.tsx`
- `apps/web/src/components/templates/variable-autocomplete.tsx`

#### **Task 7.4: Queue System (BullMQ)**
- [ ] Set up Redis connection
- [ ] Configure BullMQ queues
- [ ] Create confirmation job queue
- [ ] Create retry job queue
- [ ] Implement job processors
- [ ] Set up queue monitoring
- [ ] Create queue dashboard (optional)

**Files to Create:**
- `apps/worker/src/index.ts`
- `apps/worker/src/queues/confirmation.queue.ts`
- `apps/worker/src/queues/retry.queue.ts`
- `apps/worker/src/processors/confirmation.processor.ts`
- `apps/worker/src/utils/queue-monitor.ts`

#### **Task 7.5: Automation Rules**
- [ ] Implement auto-cancel logic
- [ ] Create confirmation window logic
- [ ] Implement re-confirmation triggers
- [ ] Create escalation rules
- [ ] Add time-based triggers

**Files to Create:**
- `apps/api/src/services/automation.service.ts`
- `apps/api/src/jobs/auto-cancel.job.ts`
- `apps/api/src/jobs/re-confirmation.job.ts`

---

### **PHASE 8: Analytics & Billing (Week 15-16)**

#### **Task 8.1: Analytics Backend**
- [ ] Create analytics event tracking
- [ ] Implement event aggregation
- [ ] Create analytics API endpoints
- [ ] Implement date range filtering
- [ ] Create export functionality (CSV/PDF)
- [ ] Set up PostHog integration

**Files to Create:**
- `apps/api/src/services/analytics.service.ts`
- `apps/api/src/routes/analytics/index.ts`
- `apps/api/src/routes/analytics/export.ts`
- `apps/api/src/utils/event-tracker.ts`
- `apps/api/src/utils/analytics-aggregator.ts`

#### **Task 8.2: Analytics Dashboard UI**
- [ ] Create analytics page
- [ ] Build confirmation funnel chart
- [ ] Create channel performance charts
- [ ] Build risk distribution charts
- [ ] Create ROI calculator
- [ ] Implement date range picker
- [ ] Add export buttons
- [ ] Create analytics filters

**Files to Create:**
- `apps/web/app/dashboard/analytics/page.tsx`
- `apps/web/src/components/analytics/funnel-chart.tsx`
- `apps/web/src/components/analytics/channel-chart.tsx`
- `apps/web/src/components/analytics/risk-chart.tsx`
- `apps/web/src/components/analytics/roi-calculator.tsx`
- `apps/web/src/hooks/use-analytics.ts`

#### **Task 8.3: Stripe Integration**
- [ ] Set up Stripe account
- [ ] Create Stripe products and prices
- [ ] Implement checkout session creation
- [ ] Set up Stripe webhook handler
- [ ] Implement subscription management
- [ ] Create customer portal integration
- [ ] Handle payment failures
- [ ] Implement usage-based billing

**Files to Create:**
- `apps/api/src/services/stripe.service.ts`
- `apps/api/src/routes/billing/checkout.ts`
- `apps/api/src/routes/billing/portal.ts`
- `apps/api/src/routes/webhooks/stripe.ts`
- `apps/api/src/services/billing.service.ts`
- `apps/api/src/utils/stripe-webhook-verify.ts`

#### **Task 8.4: Billing UI**
- [ ] Create billing page
- [ ] Build plan selection UI
- [ ] Create usage meters
- [ ] Implement upgrade/downgrade flow
- [ ] Create invoice history
- [ ] Add payment method management
- [ ] Create billing settings

**Files to Create:**
- `apps/web/app/dashboard/billing/page.tsx`
- `apps/web/src/components/billing/plan-selector.tsx`
- `apps/web/src/components/billing/usage-meter.tsx`
- `apps/web/src/components/billing/invoice-history.tsx`
- `apps/web/src/components/billing/payment-method.tsx`
- `apps/web/src/hooks/use-billing.ts`

#### **Task 8.5: Plans Management (Admin)**
- [ ] Create plans CRUD API
- [ ] Implement dynamic plan updates
- [ ] Create plan sync to marketing site
- [ ] Add plan visibility toggle
- [ ] Create plan usage tracking

**Files to Create:**
- `apps/api/src/routes/admin/plans/index.ts`
- `apps/api/src/services/plan.service.ts`
- `apps/web/app/admin/plans/page.tsx`

---

### **PHASE 9: Admin Panel & Marketing Site (Week 17-18)**

#### **Task 9.1: Super Admin Panel**
- [ ] Create admin layout
- [ ] Build merchants management page
- [ ] Create merchant impersonation
- [ ] Build plans management UI
- [ ] Create provider health dashboard
- [ ] Implement system settings
- [ ] Create admin analytics

**Files to Create:**
- `apps/web/app/admin/layout.tsx`
- `apps/web/app/admin/merchants/page.tsx`
- `apps/web/app/admin/plans/page.tsx`
- `apps/web/app/admin/health/page.tsx`
- `apps/web/src/components/admin/merchant-table.tsx`
- `apps/web/src/components/admin/impersonate-button.tsx`
- `apps/web/src/components/admin/provider-health.tsx`

#### **Task 9.2: Marketing Website**
- [ ] Create marketing site structure
- [ ] Build hero section
- [ ] Create features section
- [ ] Build pricing table (dynamic from API)
- [ ] Create testimonials section
- [ ] Build FAQ section
- [ ] Create ROI calculator
- [ ] Add CTA sections
- [ ] Implement SEO optimization
- [ ] Add structured data (JSON-LD)

**Files to Create:**
- `apps/web/app/(marketing)/page.tsx`
- `apps/web/app/(marketing)/pricing/page.tsx`
- `apps/web/src/components/marketing/hero.tsx`
- `apps/web/src/components/marketing/features.tsx`
- `apps/web/src/components/marketing/pricing-table.tsx`
- `apps/web/src/components/marketing/testimonials.tsx`
- `apps/web/src/components/marketing/faq.tsx`
- `apps/web/src/components/marketing/roi-calculator.tsx`

#### **Task 9.3: Onboarding Wizard**
- [ ] Create onboarding flow
- [ ] Build step 1: Welcome
- [ ] Build step 2: Connect Store (Shopify)
- [ ] Build step 3: Connect WhatsApp
- [ ] Build step 4: Connect Email/SMS (optional)
- [ ] Build step 5: Set Policy
- [ ] Build step 6: Choose Plan
- [ ] Build step 7: Success
- [ ] Implement progress tracking

**Files to Create:**
- `apps/web/app/onboarding/page.tsx`
- `apps/web/src/components/onboarding/wizard.tsx`
- `apps/web/src/components/onboarding/steps/welcome.tsx`
- `apps/web/src/components/onboarding/steps/connect-store.tsx`
- `apps/web/src/components/onboarding/steps/connect-whatsapp.tsx`
- `apps/web/src/components/onboarding/steps/connect-channels.tsx`
- `apps/web/src/components/onboarding/steps/set-policy.tsx`
- `apps/web/src/components/onboarding/steps/choose-plan.tsx`
- `apps/web/src/components/onboarding/steps/success.tsx`

---

### **PHASE 10: Testing, QA & Launch Prep (Week 19-20)**

#### **Task 10.1: Unit Testing**
- [ ] Set up Jest for backend
- [ ] Set up Vitest for frontend
- [ ] Write unit tests for services
- [ ] Write unit tests for utilities
- [ ] Write unit tests for components
- [ ] Achieve 80% code coverage

**Files to Create:**
- `apps/api/src/__tests__/`
- `apps/web/src/__tests__/`
- `jest.config.js`
- `vitest.config.ts`

#### **Task 10.2: Integration Testing**
- [ ] Set up test database
- [ ] Write API integration tests
- [ ] Write webhook integration tests
- [ ] Test provider integrations (mocked)
- [ ] Test ML service integration

**Files to Create:**
- `apps/api/src/__tests__/integration/`
- `apps/api/src/__tests__/webhooks/`

#### **Task 10.3: E2E Testing**
- [ ] Set up Playwright
- [ ] Write E2E tests for onboarding
- [ ] Write E2E tests for order confirmation flow
- [ ] Write E2E tests for billing
- [ ] Write E2E tests for admin panel

**Files to Create:**
- `apps/web/e2e/onboarding.spec.ts`
- `apps/web/e2e/orders.spec.ts`
- `apps/web/e2e/billing.spec.ts`
- `playwright.config.ts`

#### **Task 10.4: Security Audit**
- [ ] Run security scans (npm audit, Snyk)
- [ ] Perform penetration testing
- [ ] Review authentication/authorization
- [ ] Check for SQL injection vulnerabilities
- [ ] Check for XSS vulnerabilities
- [ ] Verify webhook signatures
- [ ] Review encryption implementation
- [ ] Check rate limiting

#### **Task 10.5: Performance Optimization**
- [ ] Optimize API response times
- [ ] Optimize frontend bundle size
- [ ] Implement caching strategies
- [ ] Optimize database queries
- [ ] Set up CDN (if needed)
- [ ] Optimize images
- [ ] Run Lighthouse audits

#### **Task 10.6: Documentation**
- [ ] Write API documentation (OpenAPI)
- [ ] Create user guides
- [ ] Write developer documentation
- [ ] Create deployment guides
- [ ] Write troubleshooting guides
- [ ] Create video tutorials (optional)

#### **Task 10.7: Production Deployment**
- [ ] Set up production MongoDB cluster
- [ ] Set up production Redis
- [ ] Configure production environment variables
- [ ] Set up production API server (AWS EC2)
- [ ] Deploy ML service (AWS EC2)
- [ ] Deploy frontend (Vercel)
- [ ] Set up monitoring (Sentry, PostHog, Grafana)
- [ ] Configure alerts
- [ ] Set up backups
- [ ] Create runbook

#### **Task 10.8: Launch Checklist**
- [ ] All tests passing
- [ ] Security audit complete
- [ ] Performance optimized
- [ ] Documentation complete
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Support channels ready
- [ ] Marketing materials ready
- [ ] Beta users onboarded
- [ ] Go-live! 🚀

---

## 🛠️ Technical Architecture Setup

### **Monorepo Structure (Recommended)**
```
confirmly/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/                # Next.js App Router
│   │   ├── src/
│   │   │   ├── components/    # React components
│   │   │   ├── lib/           # Utilities, API clients
│   │   │   ├── hooks/         # Custom hooks
│   │   │   ├── contexts/      # React contexts
│   │   │   └── theme/         # MUI theme
│   │   ├── public/            # Static assets
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   ├── api/                    # Fastify backend
│   │   ├── src/
│   │   │   ├── routes/         # API routes
│   │   │   ├── controllers/   # Route handlers
│   │   │   ├── services/       # Business logic
│   │   │   ├── models/         # Mongoose models
│   │   │   ├── middlewares/    # Express middlewares
│   │   │   ├── providers/      # External service adapters
│   │   │   ├── jobs/           # Background jobs
│   │   │   ├── utils/          # Utilities
│   │   │   └── db/             # Database config
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   ├── worker/                 # BullMQ workers
│   │   ├── src/
│   │   │   ├── queues/         # Queue definitions
│   │   │   ├── processors/    # Job processors
│   │   │   └── utils/
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   └── ml/                     # Python FastAPI service
│       ├── app/
│       │   ├── main.py         # FastAPI app
│       │   ├── routes/         # API routes
│       │   ├── services/       # Business logic
│       │   ├── models/          # ML models
│       │   ├── features/        # Feature engineering
│       │   ├── pipeline/        # Training pipeline
│       │   └── monitoring/      # Monitoring
│       ├── notebooks/           # Jupyter notebooks
│       ├── requirements.txt
│       └── Dockerfile
│
├── packages/
│   ├── shared/                 # Shared TypeScript
│   │   ├── src/
│   │   │   ├── types/          # TypeScript types
│   │   │   ├── constants/      # Constants
│   │   │   └── utils/          # Shared utilities
│   │   └── package.json
│   │
│   ├── ui/                     # Shared UI components
│   │   ├── src/
│   │   │   └── components/
│   │   └── package.json
│   │
│   └── config/                 # Config schemas
│       ├── src/
│       │   └── env.ts          # Environment validation
│       └── package.json
│
├── docs/                       # Documentation
├── .github/
│   └── workflows/              # CI/CD
├── docker-compose.yml          # Local development
├── package.json                # Root package.json
└── pnpm-workspace.yaml         # PNPM workspace config
```

### **Technology Choices Justification**

| Component | Technology | Reason |
|-----------|-----------|--------|
| Frontend Framework | Next.js 14+ | SEO-friendly, App Router, Server Components, Vercel deployment |
| UI Library | MUI + minimals.cc | Already available, comprehensive components, professional design |
| Backend Framework | Fastify | High performance, TypeScript support, plugin ecosystem |
| Database | MongoDB Atlas | Flexible schema, cloud-managed, good for eCommerce data |
| Queue System | BullMQ + Redis | Reliable job processing, retry logic, monitoring |
| ML Framework | FastAPI + XGBoost | Fast inference, Python ecosystem, easy deployment |
| Billing | Stripe | Industry standard, comprehensive API, webhooks |
| Hosting (Frontend) | Vercel | Optimized for Next.js, CDN, edge functions |
| Hosting (Backend) | AWS EC2 | Full control, Docker support, cost-effective |
| Monitoring | Sentry + PostHog + Grafana | Error tracking, analytics, metrics |

---

## 🚀 Development Environment Setup

### **Prerequisites**
```bash
# Required Software
- Node.js 20.x
- PNPM 8.x
- Python 3.11
- Docker Desktop
- Git
- VS Code (recommended)
```

### **Initial Setup Commands**
```bash
# Clone repository (if applicable)
git clone <repo-url>
cd confirmly

# Install dependencies
pnpm install

# Set up environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp apps/ml/.env.example apps/ml/.env

# Start local services (Redis, etc.)
docker-compose up -d

# Start development servers
pnpm dev  # Runs all services concurrently
# OR
pnpm --filter web dev      # Frontend only
pnpm --filter api dev      # Backend only
cd apps/ml && uvicorn app.main:app --reload  # ML service
```

### **Local Development URLs**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- ML Service: http://localhost:5000
- Redis: localhost:6379
- MongoDB: (Atlas connection string)

---

## 🧪 Testing & QA Strategy

### **Testing Pyramid**
1. **Unit Tests (80%)**
   - Services, utilities, components
   - Fast execution
   - High coverage target

2. **Integration Tests (15%)**
   - API endpoints
   - Database operations
   - External service mocks

3. **E2E Tests (5%)**
   - Critical user flows
   - Onboarding, billing, order confirmation

### **Testing Tools**
- **Backend:** Jest
- **Frontend:** Vitest + React Testing Library
- **E2E:** Playwright
- **API Testing:** Supertest
- **Coverage:** Istanbul/NYC

### **QA Checklist**
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Code coverage > 80%
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Accessibility (WCAG 2.1 AA)
- [ ] Cross-browser testing
- [ ] Mobile responsiveness

---

## 📦 Deployment & DevOps

### **Environments**
1. **Development** - Local development
2. **Staging** - Pre-production testing (staging.confirmly.io)
3. **Production** - Live application (app.confirmly.io)

### **Deployment Strategy**
- **Frontend:** Vercel (automatic on push to main)
- **Backend:** AWS EC2 with Docker
- **ML Service:** AWS EC2 with Docker
- **Database:** MongoDB Atlas (managed)
- **Queue:** Redis (managed or EC2)

### **CI/CD Pipeline**
1. **On Push to PR:**
   - Lint code
   - Run tests
   - Build application
   - Deploy preview (if applicable)

2. **On Merge to Staging:**
   - Full test suite
   - Build and deploy to staging
   - Run smoke tests

3. **On Merge to Main:**
   - Full test suite
   - Security scan
   - Build and deploy to production
   - Run health checks

### **Monitoring & Alerts**
- **Error Tracking:** Sentry
- **Analytics:** PostHog
- **Metrics:** Grafana
- **Uptime:** UptimeRobot
- **Alerts:** Slack webhooks

---

## 📅 Timeline & Milestones

### **20-Week Development Timeline**

| Phase | Duration | Key Deliverables |
|-------|----------|-----------------|
| **Phase 1** | Week 1-2 | Project structure, dev environment, database schemas |
| **Phase 2** | Week 3-4 | Backend API, authentication, core endpoints |
| **Phase 3** | Week 5-6 | Next.js migration, dashboard, auth pages |
| **Phase 4** | Week 7-8 | Shopify integration, order management |
| **Phase 5** | Week 9-10 | WhatsApp, SMS, Email integrations |
| **Phase 6** | Week 11-12 | ML risk engine, model training |
| **Phase 7** | Week 13-14 | Policies, automation, queue system |
| **Phase 8** | Week 15-16 | Analytics, Stripe billing |
| **Phase 9** | Week 17-18 | Admin panel, marketing site |
| **Phase 10** | Week 19-20 | Testing, QA, production deployment |

### **Key Milestones**
- ✅ **M1 (Week 2):** Development environment ready
- ✅ **M2 (Week 4):** Backend API functional
- ✅ **M3 (Week 6):** Frontend dashboard live
- ✅ **M4 (Week 8):** Shopify integration working
- ✅ **M5 (Week 10):** Multi-channel confirmations working
- ✅ **M6 (Week 12):** ML risk engine deployed
- ✅ **M7 (Week 14):** Automation rules functional
- ✅ **M8 (Week 16):** Billing system live
- ✅ **M9 (Week 18):** Admin panel complete
- ✅ **M10 (Week 20):** Production launch 🚀

---

## 🎯 Success Criteria

### **Technical Metrics**
- ✅ API response time < 200ms (p95)
- ✅ Frontend Lighthouse score > 90
- ✅ Test coverage > 80%
- ✅ Zero critical security vulnerabilities
- ✅ 99.9% uptime

### **Product Metrics**
- ✅ 60%+ RTO reduction
- ✅ 95%+ confirmation rate
- ✅ < 24h time-to-confirm
- ✅ Positive merchant ROI

### **Business Metrics**
- ✅ 100 merchants in first 3 months
- ✅ < 4% monthly churn
- ✅ ₹5,000+ ARPU
- ✅ NPS > 60

---

## 📚 Additional Resources

### **Documentation References**
- [PRD.md](./Context/PRD.md) - Complete product requirements
- [UI & User Flow.md](./Context/UI%20&%20User%20Flow.md) - UI specifications
- [Developer Guide.md](./Context/Developer%20Guide%20&%20Coding%20Standards.md) - Coding standards
- [CD GUIDE.md](./Context/CD%20GUIDE.md) - Deployment guide
- [ML Documentation.md](./Context/AI%20Risk%20Engine%20Model%20Documentation%20&%20Training%20Pipeline.md) - ML guide

### **External Resources**
- [Next.js Documentation](https://nextjs.org/docs)
- [Fastify Documentation](https://www.fastify.io/)
- [MUI Documentation](https://mui.com/)
- [minimals.cc Documentation](https://docs.minimals.cc/)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

## ✅ Next Steps

1. **Review this roadmap** with the team
2. **Set up development environment** (Phase 1)
3. **Create project structure** (Phase 1)
4. **Start with backend API** (Phase 2)
5. **Begin frontend migration** (Phase 3)
6. **Iterate and build** following the phases

---

**Good luck building Confirmly! 🚀**

For questions or clarifications, refer to the context documents in the `/Context` folder.

