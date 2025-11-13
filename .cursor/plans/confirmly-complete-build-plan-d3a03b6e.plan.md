<!-- d3a03b6e-41a9-482b-b612-5beab812184d 13854e8a-7d3b-4f05-ac00-414ef127242d -->
# Confirmly Complete Build Plan

## Overview

Build a complete AI-powered RTO reduction platform with Next.js frontend, Fastify backend, MongoDB database, Python ML service, and integrations for WhatsApp, SMS, Email, Shopify, and Stripe billing.

## Architecture

- **Frontend**: Next.js 14+ (App Router) + TypeScript + MUI + minimals.cc
- **Backend**: Node.js (Fastify) + TypeScript
- **Database**: MongoDB Atlas + Mongoose
- **Queue**: BullMQ + Redis
- **ML Service**: Python (FastAPI) + XGBoost/LightGBM
- **Hosting**: Vercel (Frontend), AWS EC2 (Backend/ML/Worker), MongoDB Atlas, Redis (ElastiCache/Upstash)

## Phase 1: Foundation & Setup (Week 1-2)

### 1.1 Monorepo Structure

Create monorepo with apps/web, apps/api, apps/worker, apps/ml, and packages/shared, packages/ui, packages/config.

**Files:**

- Root package.json with workspaces
- pnpm-workspace.yaml
- apps/web/package.json
- apps/api/package.json
- apps/worker/package.json
- apps/ml/requirements.txt
- packages/shared/package.json
- packages/ui/package.json
- packages/config/package.json

### 1.2 Development Environment

Set up Node.js 20+, PNPM, Python 3.11, Docker, MongoDB Atlas dev cluster, Redis (Docker or Upstash).

**Files:**

- .env.example files for each app
- docker-compose.yml (local Redis)
- .vscode/settings.json
- .gitignore

### 1.3 Database Schemas

Create Mongoose schemas for Merchant, User, Order, Template, Policy, Plan, Billing, EventLog.

**Files:**

- apps/api/src/models/Merchant.ts
- apps/api/src/models/User.ts
- apps/api/src/models/Order.ts
- apps/api/src/models/Template.ts
- apps/api/src/models/Policy.ts
- apps/api/src/models/Plan.ts
- apps/api/src/models/Billing.ts
- apps/api/src/models/EventLog.ts
- apps/api/src/db/connection.ts
- apps/api/src/db/indexes.ts

### 1.4 CI/CD Setup

Create GitHub Actions workflows for lint, test, build, and deploy.

**Files:**

- .github/workflows/web-ci.yml
- .github/workflows/api-ci.yml
- .github/workflows/ml-ci.yml
- .github/workflows/deploy-web-vercel.yml
- .github/workflows/deploy-api-ec2.yml
- .github/workflows/deploy-ml-ec2.yml

## Phase 2: Backend Core (Week 3-4)

### 2.1 Fastify API Setup

Initialize Fastify with CORS, logging, error handling, rate limiting, OpenAPI docs.

**Files:**

- apps/api/src/index.ts
- apps/api/src/config/fastify.config.ts
- apps/api/src/middlewares/error-handler.ts
- apps/api/src/middlewares/rate-limit.ts
- apps/api/src/middlewares/logger.ts
- apps/api/src/utils/validation.ts

### 2.2 Authentication

Implement JWT auth with login, register, refresh, password reset, RBAC middleware.

**Files:**

- apps/api/src/routes/auth/login.ts
- apps/api/src/routes/auth/register.ts
- apps/api/src/routes/auth/refresh.ts
- apps/api/src/routes/auth/reset-password.ts
- apps/api/src/middlewares/auth.ts
- apps/api/src/middlewares/rbac.ts
- apps/api/src/utils/jwt.ts
- apps/api/src/utils/password.ts

### 2.3 User & Merchant Management

Create CRUD endpoints for users and merchants, team member management, settings.

**Files:**

- apps/api/src/routes/users/index.ts
- apps/api/src/routes/merchants/index.ts
- apps/api/src/routes/merchants/settings.ts
- apps/api/src/routes/merchants/team.ts
- apps/api/src/controllers/user.controller.ts
- apps/api/src/controllers/merchant.controller.ts
- apps/api/src/services/user.service.ts
- apps/api/src/services/merchant.service.ts

### 2.4 MCP Server

Create MCP server for controlled database access with read-only queries, PII masking, audit logging.

**Files:**

- apps/api/src/mcp/server.ts
- apps/api/src/mcp/handlers/read.ts
- apps/api/src/mcp/handlers/write.ts
- apps/api/src/mcp/utils/mask-pii.ts
- apps/api/src/mcp/middleware/auth.ts

## Phase 3: Frontend Migration & Core Pages (Week 5-6)

### 3.1 Next.js Migration

Initialize Next.js 14+ with App Router, migrate minimals.cc components, set up routing.

**Files:**

- apps/web/next.config.js
- apps/web/tsconfig.json
- apps/web/app/layout.tsx
- apps/web/app/page.tsx
- apps/web/app/dashboard/layout.tsx
- apps/web/middleware.ts

### 3.2 Theme & Design System

Customize MUI theme with Confirmly colors (#3C73FF primary, #00C48C accent), dark mode.

**Files:**

- apps/web/src/theme/index.ts
- apps/web/src/theme/palette.ts
- apps/web/src/theme/typography.ts
- apps/web/src/config/theme.ts

### 3.3 Authentication Pages

Create login, register, forgot password, reset password, invite acceptance pages.

**Files:**

- apps/web/app/(auth)/login/page.tsx
- apps/web/app/(auth)/register/page.tsx
- apps/web/app/(auth)/forgot-password/page.tsx
- apps/web/app/(auth)/reset-password/page.tsx
- apps/web/app/(auth)/invite/[token]/page.tsx
- apps/web/src/contexts/auth-context.tsx
- apps/web/src/components/auth/auth-guard.tsx
- apps/web/src/hooks/use-auth.ts

### 3.4 Dashboard Layout

Create main dashboard layout with sidebar, header, navigation, user menu.

**Files:**

- apps/web/app/dashboard/layout.tsx
- apps/web/src/components/layout/dashboard-sidebar.tsx
- apps/web/src/components/layout/dashboard-header.tsx
- apps/web/src/components/layout/user-menu.tsx
- apps/web/src/config/nav.ts

### 3.5 Overview Dashboard

Build dashboard with KPI cards, confirmation trend chart, channel performance chart, recent activity table.

**Files:**

- apps/web/app/dashboard/page.tsx
- apps/web/src/components/dashboard/kpi-cards.tsx
- apps/web/src/components/dashboard/confirmation-trend-chart.tsx
- apps/web/src/components/dashboard/channel-performance-chart.tsx
- apps/web/src/components/dashboard/recent-activity-table.tsx
- apps/web/src/hooks/use-dashboard-data.ts

## Phase 4: Integrations - Part 1 (Week 7-8)

### 4.1 Shopify Integration

Implement OAuth flow, webhook handlers for orders/create and orders/updated, order sync.

**Files:**

- apps/api/src/routes/integrations/shopify/install.ts
- apps/api/src/routes/integrations/shopify/callback.ts
- apps/api/src/routes/integrations/shopify/webhooks.ts
- apps/api/src/services/shopify.service.ts
- apps/api/src/services/shopify-oauth.service.ts
- apps/api/src/utils/shopify-webhook-verify.ts

### 4.2 Order Ingestion

Create order ingestion service, transformation, risk scoring trigger, deduplication.

**Files:**

- apps/api/src/services/order-ingestion.service.ts
- apps/api/src/utils/order-transformer.ts
- apps/api/src/jobs/order-sync.job.ts

### 4.3 Orders Management API

Create GET /orders, GET /orders/:id, POST /orders/:id/confirm, POST /orders/:id/cancel endpoints.

**Files:**

- apps/api/src/routes/orders/index.ts
- apps/api/src/routes/orders/:id.ts
- apps/api/src/routes/orders/:id/confirm.ts
- apps/api/src/routes/orders/:id/cancel.ts
- apps/api/src/controllers/order.controller.ts
- apps/api/src/services/order.service.ts

### 4.4 Orders UI

Build orders list page with DataGrid, filters, order detail drawer, timeline, actions.

**Files:**

- apps/web/app/dashboard/orders/page.tsx
- apps/web/src/components/orders/orders-table.tsx
- apps/web/src/components/orders/order-filters.tsx
- apps/web/src/components/orders/order-detail-drawer.tsx
- apps/web/src/components/orders/order-timeline.tsx
- apps/web/src/components/orders/order-actions.tsx

## Phase 5: Communication Channels (Week 9-10)

### 5.1 Provider Abstraction Layer

Create interfaces for WhatsAppProvider, SMSProvider, EmailProvider with factory pattern.

**Files:**

- apps/api/src/providers/interfaces/whatsapp.interface.ts
- apps/api/src/providers/interfaces/sms.interface.ts
- apps/api/src/providers/interfaces/email.interface.ts
- apps/api/src/providers/factory/provider-factory.ts
- apps/api/src/providers/base/base-provider.ts

### 5.2 WhatsApp Cloud API

Implement WhatsApp adapter, template management, send messages, webhook for replies.

**Files:**

- apps/api/src/providers/whatsapp/whatsapp-cloud.provider.ts
- apps/api/src/providers/whatsapp/template-manager.ts
- apps/api/src/routes/webhooks/whatsapp.ts
- apps/api/src/utils/whatsapp-parser.ts
- apps/api/src/services/whatsapp.service.ts

### 5.3 SMS Integration

Implement MSG91 and Twilio adapters, smart routing, webhook handlers.

**Files:**

- apps/api/src/providers/sms/msg91.provider.ts
- apps/api/src/providers/sms/twilio.provider.ts
- apps/api/src/routes/webhooks/msg91.ts
- apps/api/src/routes/webhooks/twilio.ts
- apps/api/src/services/sms.service.ts

### 5.4 Email Integration

Implement SendGrid and SES adapters, webhook handlers for delivery status.

**Files:**

- apps/api/src/providers/email/sendgrid.provider.ts
- apps/api/src/providers/email/ses.provider.ts
- apps/api/src/routes/webhooks/sendgrid.ts
- apps/api/src/services/email.service.ts

### 5.5 Confirmation Service

Create unified confirmation service with multi-channel sending, retry logic.

**Files:**

- apps/api/src/services/confirmation.service.ts
- apps/api/src/jobs/confirmation.job.ts

## Phase 6: ML Risk Engine (Week 11-12)

### 6.1 Python FastAPI Service

Initialize FastAPI project with health check, authentication, CORS.

**Files:**

- apps/ml/app/main.py
- apps/ml/app/config.py
- apps/ml/app/middleware/auth.py
- apps/ml/Dockerfile
- apps/ml/requirements.txt

### 6.2 Feature Engineering

Create feature extraction for customer, order, geo, and platform-level features.

**Files:**

- apps/ml/app/features/extractor.py
- apps/ml/app/features/customer_features.py
- apps/ml/app/features/order_features.py
- apps/ml/app/features/geo_features.py
- apps/ml/app/features/platform_features.py
- apps/ml/app/features/store.py

### 6.3 Model Training Pipeline

Create data extraction, preprocessing, training with XGBoost/LightGBM, evaluation, MLflow integration.

**Files:**

- apps/ml/app/pipeline/extract.py
- apps/ml/app/pipeline/preprocess.py
- apps/ml/app/pipeline/train.py
- apps/ml/app/pipeline/evaluate.py
- apps/ml/app/models/risk_model.py
- apps/ml/notebooks/training.ipynb

### 6.4 Model Inference API

Create /score endpoint with model loading, feature transformation, caching.

**Files:**

- apps/ml/app/routes/score.py
- apps/ml/app/services/inference.py
- apps/ml/app/utils/model_loader.py
- apps/ml/app/utils/cache.py

### 6.5 Backend Integration

Create ML service client in Node.js, integrate risk scoring in order ingestion.

**Files:**

- apps/api/src/services/ml.service.ts
- apps/api/src/utils/risk-fallback.ts

## Phase 7: Policies & Automation (Week 13-14)

### 7.1 Policy Engine

Create policy evaluation engine, rule matching, execution service.

**Files:**

- apps/api/src/services/policy-engine.service.ts
- apps/api/src/utils/policy-evaluator.ts
- apps/api/src/utils/policy-executor.ts

### 7.2 Policy Builder UI

Build visual policy builder with condition builder, action selector, preview, testing.

**Files:**

- apps/web/app/dashboard/policies/page.tsx
- apps/web/src/components/policies/policy-builder.tsx
- apps/web/src/components/policies/condition-builder.tsx
- apps/web/src/components/policies/action-selector.tsx
- apps/web/src/components/policies/policy-preview.tsx

### 7.3 Templates Management

Create template CRUD API, variable system, A/B variants, preview.

**Files:**

- apps/api/src/routes/templates/index.ts
- apps/api/src/services/template.service.ts
- apps/web/app/dashboard/templates/page.tsx
- apps/web/src/components/templates/template-editor.tsx

### 7.4 Queue System

Set up BullMQ with Redis, create confirmation and retry queues, processors.

**Files:**

- apps/worker/src/index.ts
- apps/worker/src/queues/confirmation.queue.ts
- apps/worker/src/queues/retry.queue.ts
- apps/worker/src/processors/confirmation.processor.ts

### 7.5 Automation Rules

Implement auto-cancel logic, confirmation window, re-confirmation triggers.

**Files:**

- apps/api/src/services/automation.service.ts
- apps/api/src/jobs/auto-cancel.job.ts
- apps/api/src/jobs/re-confirmation.job.ts

## Phase 8: Analytics & Billing (Week 15-16)

### 8.1 Analytics Backend

Create event tracking, aggregation, API endpoints, export functionality.

**Files:**

- apps/api/src/services/analytics.service.ts
- apps/api/src/routes/analytics/index.ts
- apps/api/src/utils/event-tracker.ts
- apps/api/src/utils/analytics-aggregator.ts

### 8.2 Analytics Dashboard UI

Build analytics page with funnel chart, channel charts, risk distribution, ROI calculator.

**Files:**

- apps/web/app/dashboard/analytics/page.tsx
- apps/web/src/components/analytics/funnel-chart.tsx
- apps/web/src/components/analytics/channel-chart.tsx
- apps/web/src/components/analytics/roi-calculator.tsx

### 8.3 Stripe Integration

Implement checkout session, webhook handler, subscription management, customer portal.

**Files:**

- apps/api/src/services/stripe.service.ts
- apps/api/src/routes/billing/checkout.ts
- apps/api/src/routes/billing/portal.ts
- apps/api/src/routes/webhooks/stripe.ts
- apps/api/src/services/billing.service.ts

### 8.4 Billing UI

Create billing page with plan selector, usage meters, invoice history.

**Files:**

- apps/web/app/dashboard/billing/page.tsx
- apps/web/src/components/billing/plan-selector.tsx
- apps/web/src/components/billing/usage-meter.tsx
- apps/web/src/components/billing/invoice-history.tsx

## Phase 9: Admin Panel & Marketing Site (Week 17-18)

### 9.1 Super Admin Panel

Create admin layout, merchants management, impersonation, plans management, provider health dashboard.

**Files:**

- apps/web/app/admin/layout.tsx
- apps/web/app/admin/merchants/page.tsx
- apps/web/app/admin/plans/page.tsx
- apps/web/app/admin/health/page.tsx
- apps/web/src/components/admin/merchant-table.tsx

### 9.2 Marketing Website

Build marketing site with hero, features, pricing table (dynamic from API), testimonials, FAQ, ROI calculator.

**Files:**

- apps/web/app/(marketing)/page.tsx
- apps/web/app/(marketing)/pricing/page.tsx
- apps/web/src/components/marketing/hero.tsx
- apps/web/src/components/marketing/features.tsx
- apps/web/src/components/marketing/pricing-table.tsx

### 9.3 Onboarding Wizard

Create 7-step onboarding flow: welcome, connect store, connect WhatsApp, connect channels, set policy, choose plan, success.

**Files:**

- apps/web/app/onboarding/page.tsx
- apps/web/src/components/onboarding/wizard.tsx
- apps/web/src/components/onboarding/steps/*.tsx (7 steps)

## Phase 10: Testing, QA & Launch Prep (Week 19-20)

### 10.1 Testing Setup

Set up Jest (backend), Vitest (frontend), Playwright (E2E), achieve 80% coverage.

**Files:**

- apps/api/jest.config.js
- apps/web/vitest.config.ts
- apps/web/playwright.config.ts
- Test files in **tests** directories

### 10.2 Security Audit

Run security scans, penetration testing, review auth, check vulnerabilities.

### 10.3 Performance Optimization

Optimize API response times, frontend bundle size, implement caching, optimize database queries.

### 10.4 Production Deployment

Set up production MongoDB cluster, Redis (ElastiCache), deploy to Vercel (frontend), AWS EC2 (backend/ML/worker), configure monitoring (Sentry, PostHog, Grafana).

### 10.5 Documentation

Write API documentation (OpenAPI), user guides, developer documentation, deployment guides.

## Deployment Strategy

### Monorepo Deployment

- Frontend (apps/web): Deploy to Vercel via GitHub Actions on path changes
- Backend (apps/api): Deploy to AWS EC2 via Docker on path changes
- ML Service (apps/ml): Deploy to AWS EC2 via Docker on path changes
- Worker (apps/worker): Deploy to AWS EC2 via Docker on path changes

### Environment Variables

- Vercel: Set via Vercel dashboard
- AWS EC2: Use AWS Systems Manager Parameter Store
- MongoDB Atlas: Connection strings in Parameter Store

### CI/CD Workflows

Each app has separate workflow that triggers only on relevant path changes, builds Docker images, deploys to respective platforms.

### To-dos

- [x] Set up monorepo structure with apps/web, apps/api, apps/worker, apps/ml and packages/shared, packages/ui, packages/config
- [x] Configure development environment with Node.js 20+, PNPM, Python 3.11, Docker, MongoDB Atlas, Redis
- [x] Create Mongoose schemas for Merchant, User, Order, Template, Policy, Plan, Billing, EventLog with indexes
- [x] Set up GitHub Actions workflows for CI/CD with path-based triggers for each app
- [x] Initialize Fastify API with CORS, logging, error handling, rate limiting, OpenAPI documentation
- [x] Implement JWT authentication with login, register, refresh, password reset, RBAC middleware
- [x] Create user and merchant management endpoints with CRUD operations, team member management
- [ ] Build MCP server for controlled database access with read-only queries, PII masking, audit logging
- [ ] Migrate from Vite+React to Next.js 14+ App Router, migrate minimals.cc components
- [ ] Customize MUI theme with Confirmly brand colors (#3C73FF primary, #00C48C accent), dark mode support
- [ ] Create authentication pages: login, register, forgot password, reset password, invite acceptance
- [ ] Build dashboard layout with sidebar, header, navigation, and overview page with KPI cards and charts
- [ ] Implement Shopify OAuth flow, webhook handlers for orders/create and orders/updated, order sync
- [ ] Create order ingestion service, order management API endpoints, and orders UI with DataGrid
- [ ] Build provider abstraction layer with interfaces for WhatsApp, SMS, Email providers
- [ ] Implement WhatsApp Cloud API integration with template management, send messages, webhook for replies
- [ ] Implement MSG91/Twilio SMS and SendGrid/SES Email integrations with smart routing
- [ ] Create unified confirmation service with multi-channel sending, retry logic, status tracking
- [ ] Initialize Python FastAPI service with health check, authentication, Docker setup
- [ ] Create feature engineering module for customer, order, geo, and platform-level features
- [ ] Build model training pipeline with data extraction, preprocessing, XGBoost/LightGBM training, MLflow integration
- [ ] Create /score endpoint for model inference with caching, integrate with backend order ingestion
- [ ] Build policy engine with evaluation, rule matching, execution service, and visual policy builder UI
- [ ] Create template management with CRUD API, variable system, A/B variants, template editor UI
- [ ] Set up BullMQ with Redis, create confirmation and retry queues with processors
- [ ] Implement automation rules: auto-cancel logic, confirmation window, re-confirmation triggers
- [ ] Build analytics backend with event tracking, aggregation, API endpoints, and analytics dashboard UI
- [ ] Implement Stripe integration with checkout session, webhook handler, subscription management, customer portal
- [ ] Create billing UI with plan selector, usage meters, invoice history, upgrade/downgrade flow
- [ ] Build super admin panel with merchants management, impersonation, plans management, provider health dashboard
- [ ] Create marketing website with hero, features, dynamic pricing table, testimonials, FAQ, ROI calculator
- [ ] Build 7-step onboarding wizard: welcome, connect store, connect WhatsApp, connect channels, set policy, choose plan, success
- [ ] Set up Jest (backend), Vitest (frontend), Playwright (E2E), achieve 80% code coverage
- [ ] Run security audit, penetration testing, review authentication, check vulnerabilities
- [ ] Deploy to production: MongoDB Atlas, Redis (ElastiCache), Vercel (frontend), AWS EC2 (backend/ML/worker), configure monitoring