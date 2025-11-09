Confirmly Engineering Practices & Code Quality Guidelines

🧭 1. Overview
This document defines how Confirmly’s codebase is structured, maintained, and evolved across all repositories. It establishes coding standards, review protocols, branching workflows, and quality gates to ensure the platform remains clean, secure, and consistent as it scales.
Everything here applies to all components:
apps/web (Next.js + MUI)


apps/api (Fastify + Node)


apps/ml (FastAPI + Python)


packages/shared (TypeScript utilities)



🧱 2. Repository Architecture
confirmly/
├── apps/
│   ├── web/            # Frontend (Next.js)
│   ├── api/            # Backend (Fastify)
│   ├── ml/             # Python FastAPI service
│   └── worker/         # BullMQ background jobs
├── packages/
│   ├── shared/         # Shared TS types & utils
│   ├── ui/             # MUI wrapper components
│   └── config/         # Env schema & constants
└── docs/               # Documentation, ADRs, API specs

Principles
Keep each service independent, deployable, and versioned.


Cross-service communication uses REST APIs only (no direct DB calls).


Common constants & schemas live in /packages/shared.



⚙️ 3. Environment Setup
3.1 Required Tools
Node.js v20+


PNPM package manager


Docker Desktop (for Redis/ML service)


Python 3.11


MongoDB Atlas URI (dev cluster)


Vercel CLI (for frontend preview)


3.2 Initial Setup
git clone git@github.com:confirmly/confirmly.git
cd confirmly
pnpm install
cp apps/api/.env.example apps/api/.env
pnpm dev

Local services:
Service
Port
Command
API
4000
pnpm --filter api dev
Web
3000
pnpm --filter web dev
ML
5000
uvicorn app.main:app --reload
Redis
6379
via Docker


🧩 4. Branching Strategy
Branch
Purpose
Deploys to
main
Stable release branch
Production
staging
Integration testing
Staging
feature/*
Feature dev branches
Preview builds
fix/*
Bugfix branches
On-demand
hotfix/*
Urgent production patch
Immediate deploy

Commit format follows Conventional Commits:
feat(api): add whatsapp webhook handler
fix(worker): retry redis connection on failure
chore(ci): bump node version


💡 5. Code Quality & Linting Rules
TypeScript (Web & API)
Strict mode enabled ("strict": true)


No implicit any


No unused vars ("noUnusedLocals": true)


ESLint plugins:


@typescript-eslint


prettier


import/order


Formatting
Prettier enforced at commit via Husky hooks.


Line length = 100 chars.


2-space indentation.


Single quotes.


Python (ML)
PEP8 compliant


Black autoformatter


Flake8 linting


Type hints required for all endpoints



🧠 6. Folder Structure Conventions
Backend (API)
apps/api/src/
├── routes/           # REST endpoints
├── models/           # Mongoose schemas
├── controllers/      # Business logic
├── services/         # Third-party providers (Stripe, WhatsApp)
├── utils/            # Shared helpers
├── middlewares/      # Auth, rate-limit, logging
└── webhooks/         # Stripe, WhatsApp, Email

Frontend (Web)
apps/web/app/
├── dashboard/
│   ├── page.tsx
│   ├── components/
│   └── hooks/
├── integrations/
├── templates/
├── billing/
├── policies/
└── layout.tsx

ML Service
apps/ml/app/
├── main.py           # FastAPI entry
├── models/           # ML models
├── features/         # Feature engineering
├── pipeline/         # Retrain scripts
└── utils/


🧰 7. API Style Guide
URL Format
All endpoints prefixed by /v1/


Use plural nouns (/orders, /templates)


Nested resources only when logical (/orders/:id/confirmations)


HTTP Standards
Operation
Verb
Example
Create
POST
/v1/orders
Read
GET
/v1/orders/:id
Update
PUT
/v1/orders/:id
Delete
DELETE
/v1/orders/:id

Response Structure
{
  "success": true,
  "data": { "orderId": "123", "status": "confirmed" },
  "meta": { "requestId": "abc123", "timestamp": "2025-11-07T09:00Z" }
}

Error Handling
Centralized error handler middleware


Always return code, message, and optional details


{
  "success": false,
  "error": { "code": "ORDER_NOT_FOUND", "message": "Order does not exist" }
}


🔐 8. Authentication & Authorization
JWT-based authentication


Clerk.js or Auth.js integration on frontend


Roles: superadmin, merchant, member, support


Role-based middleware checks every protected route


Example:
if (req.user.role !== "merchant") {
  reply.code(403).send({ error: "Forbidden" });
}


🧪 9. Testing Standards
Backend
Framework: Jest


Coverage target: 80%


Mock DB via mongodb-memory-server


Integration tests for /orders, /billing, /webhooks


Frontend
Framework: Playwright (E2E)


Unit tests via React Testing Library


Snapshot testing for MUI components


ML Service
Pytest for /score endpoint


Regression test comparing model outputs before & after retrain



🧰 10. Code Review Guidelines
Pull Request Checklist
 ✅ Unit tests included
 ✅ No linting errors
 ✅ Follows commit convention
 ✅ Includes API docs update (if needed)
 ✅ No direct console logs in prod
 ✅ No hardcoded secrets or tokens
PRs require at least 1 reviewer approval before merge to main or staging.

🚀 11. Performance Best Practices
API
Cache risk engine results in Redis (5 mins TTL)


Use bulk queries for MongoDB operations


Use streaming for large exports


Web
Use React.lazy() for charts/tables


Preload fonts & icons


Minimize bundle size (analyze via next-bundle-analyzer)


Use SWR for auto-revalidation


ML
Preload model in memory


Batch scoring for similar orders


Use numpy vectorization



📘 12. Documentation Standards
Use JSDoc-style comments for functions


Each API endpoint documented via OpenAPI (auto-generated)


Each module has a README.md with purpose + setup


Architecture changes must include an ADR (Architecture Decision Record)


Example ADR:
docs/adr/ADR-001-database.md
→ Chose MongoDB over PostgreSQL due to schema flexibility.


🔄 13. Release Process
Merge PR to staging


Run regression tests


Manual QA on staging.confirmly.io


Merge to main


GitHub Action auto-deploys to production


Notify via Slack: “✅ v1.0.3 deployed to production.”


Versioning: Semantic Versioning (SemVer)
MAJOR.MINOR.PATCH
Example: v1.2.4


🧩 14. Developer Onboarding SOP
Fork repo


Create .env files using samples


Run pnpm bootstrap


Start web + api


Add test merchant account in local DB


Run sample order confirmation flow


Submit your first PR! 🎉



🔒 15. Security Practices
No secrets in code — always via env vars.


Rotate API keys every 90 days.


Dependabot auto PRs for vulnerabilities.


Never push .env or .pem files.


Enforce 2FA on all GitHub accounts.
