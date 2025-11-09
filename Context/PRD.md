Confirmly — RTO-Only MVP (AI Order Confirmation) — Full PRD, Architecture, UI Plan & Context Docs
Status: Locked scope per founder decision (Nov 2025).
Brand: Confirmly
 Tagline: Confirm every order. Reduce RTO by 60%+.

0) Executive Summary
Confirmly is an AI-powered platform that reduces Return-to-Origin (RTO) losses for eCommerce brands by automating pre-delivery order confirmations via WhatsApp Cloud API, SMS, and Email, informed by an AI/ML risk engine. MVP purposefully excludes post-delivery return verification. The system is built on a MERN-style stack using Next.js (React) + Node.js + MongoDB, with MUI + minimals.cc for UI. Billing uses Stripe. Providers: WhatsApp Cloud API (Meta), MSG91 (India SMS) + Twilio (global SMS), and SendGrid or Amazon SES for email (abstracted behind a provider interface). The database is MongoDB Atlas, with an MCP (Model Context Protocol) server exposing tightly scoped, auditable DB capabilities for controlled, tool-driven access.
Primary Outcomes
Cut RTO by 60%+ on COD orders through automated confirmations.


Achieve 95%+ confirmation on contacted orders.


Deliver clear ROI analytics and per-channel attribution.


Ship a secure, scalable MVP with clean code and best practices.



1) Goals, Non-Goals, KPIs
Goals
Automate order confirmation via WhatsApp/SMS/Email with templated, branded flows.


Provide an AI-driven risk score (0–100) per order to prioritize confirmations and allow auto-cancel for high-risk cases.


Integrate natively with Shopify (v1) and WooCommerce (v1.1) for order ingestion and status updates.


Offer a self-serve onboarding with Stripe billing and plan limits.


Ship a clean, performant UI using MUI + minimals.cc.


Non-Goals (MVP)
No post-delivery return verification.


No IVR/voice channel.


No deep 3PL integrations beyond future roadmap.


KPIs
RTO rate reduction (%).


Confirmation rate by channel.


Time-to-confirm (TTF).


Auto-cancel saves (₹).


Merchant NPS/CSAT.



2) Personas & User Stories
Personas
Merchant Owner/Admin: Connects store, sets policies, monitors savings.


Ops/Support Agent (Team Member): Monitors queue, resolves unconfirmed orders, edits templates.


Super Admin (You): Manages pricing, features, usage, merchants, incidents.


User Stories (samples)
As a Merchant, I can connect Shopify in <5 minutes and start confirming orders.


As a Merchant, I can set COD-only confirmation and auto-cancel if not confirmed in 24h.


As a Merchant, I can author WhatsApp templates with dynamic variables and A/B test them.


As a Merchant, I can see a dashboard of RTO saves and per-channel performance.


As a Team Member, I can override auto-cancel and manually confirm after a customer calls back.


As Super Admin, I can edit plans, features, prices and have them reflected live in both app and website.



3) System Architecture (High-Level)
Frontend: Next.js (App Router) + TypeScript + MUI (minimals.cc) + TanStack Query + React Hook Form + Zod.
 Backend: Node.js (Fastify preferred for perf) + TypeScript; REST APIs; OpenAPI docs.
 DB: MongoDB Atlas + Mongoose.
 Queues: BullMQ + Redis (confirmation job scheduling, retries, rate limits).
 ML Service: Python (FastAPI) microservice for risk scoring (XGBoost/LightGBM baseline).
 MCP Server: Node-based MCP exposing whitelisted DB ops (find by id, create doc types, controlled projections, masked fields).
 Providers: WhatsApp Cloud API, MSG91/Twilio, SendGrid/SES (pluggable).
 Billing: Stripe (Checkout + Billing + Customer Portal), webhook → entitlement sync.
 Analytics: PostHog + internal event bus.
 Infra: Vercel (web) + Render/Fly/EC2 (APIs + workers) + AWS S3 for assets.
Key Flows
Order Ingest (Shopify webhooks) → DB → enqueue confirmation → send via chosen channels → receive reply → update order + analytics → (optionally) auto-cancel in Shopify.


Risk Engine computes risk at ingest and upon signal updates; drives policies (e.g., “High risk → require WhatsApp + SMS both” or “Auto-cancel if unconfirmed <24h”).


Billing via Stripe → webhook updates merchant plan + limits; middleware enforces quotas.



4) Tech Decisions (per your answers)
UI: Next.js + MUI (minimals.cc library) for best developer experience & SEO-friendly marketing site.


Database: MongoDB Atlas (primary), with MCP layer for safe, explicit, tool-mediated interactions.


WhatsApp: Meta WhatsApp Cloud API (direct connect).


Email: SendGrid (primary) with Amazon SES as optional provider.


SMS: MSG91 (India) + Twilio (global), provider abstraction for routing.


Billing: Stripe.


Risk Engine: ML pipeline (detailed below), with rule-based fallback and optional OpenAI classification as backstop.



5) Data Model (MongoDB + Mongoose)
Merchant {
  _id, name, slug, ownerUserId, domains: [string],
  shopify: { shopDomain, accessToken, installedAt },
  woocommerce?: { siteUrl, key, secret },
  channels: {
    whatsapp?: { businessId, phoneNumberId, token, templates:[{name, id, status}] },
    email?: { provider:"sendgrid|ses", apiKey, from, dkimVerified:boolean },
    sms?: { primary:"msg91|twilio", msg91?:{authKey,sender}, twilio?:{sid,token,from} }
  },
  plan: { planId, name, price, currency, limits: { ordersPerMonth, messagesPerMonth }, status:"trial|active|past_due|canceled", trialEndsAt },
  settings: { confirmCODOnly:boolean, confirmPrepaid:boolean, confirmWindowHours:number, autoCancelUnconfirmed:boolean, locale:"en-IN" },
  createdAt, updatedAt
}

User { _id, merchantId, email, name, role:"owner|admin|member|support|superadmin", passwordHash?, oauth?:{}, createdAt, updatedAt }

Order {
  _id, merchantId, platform:"shopify|woocommerce|api", platformOrderId, email, phone, customer:{name,address,pincode,country},
  amount, currency, paymentMode:"cod|prepaid", createdAt, riskScore: number,
  status:"pending|confirmed|unconfirmed|canceled|fulfilled",
  confirmations:[{channel:"whatsapp|sms|email", status:"sent|delivered|read|replied", reply:"yes|no|unknown", timestamps, messageId}],
  autoActions:[{type:"cancel|hold", at}],
  meta: { sourceTags?:string[] }
}

Template { _id, merchantId, channel:"whatsapp|sms|email", name, variant:"A|B", content, variables:[string], status:"draft|active", createdAt }

Policy { _id, merchantId, rules:[{key, operator, value, effect:"confirm|skip|cancel"}], createdAt }

EventLog { _id, merchantId, type, payload, createdAt, actor?:{id, role} }

Plan { _id, name, price, currency, limits:{ordersPerMonth, messagesPerMonth}, features:string[], public:boolean, sort:number }

Billing { _id, merchantId, stripe:{customerId, subscriptionId, priceId}, status, currentPeriodEnd, createdAt }

Indexes
Merchant.shopify.shopDomain (unique), User.merchantId+email, Order.merchantId+createdAt, Order.platformOrderId, Plan.public.



6) APIs (REST v1, OpenAPI documented)
Auth & Merchant
POST /auth/login POST /auth/register POST /auth/impersonate (superadmin)


GET /me → user + merchant context


POST /merchants (create), PUT /merchants/:id (channels, settings)


Integrations
POST /integrations/shopify/install (OAuth start)


POST /integrations/shopify/webhooks (receive orders/create, orders/updated)


POST /integrations/woocommerce/connect


Orders & Confirmation
GET /orders?status=&from=&to=&q=


POST /orders/:id/confirm {channels:["whatsapp","sms","email"], templateId}


POST /webhooks/whatsapp (inbound messages)


POST /webhooks/msg91 / POST /webhooks/twilio / POST /webhooks/sendgrid (status + replies)


POST /orders/:id/cancel (auto-cancel in platform via Shopify Admin API)


Templates & Policies
GET/POST/PUT /templates


GET/POST/PUT /policies


Plans & Billing
GET /plans (public)


POST /billing/checkout (create Stripe Checkout Session)


POST /billing/webhook (Stripe events → subscription sync)


Admin (Super Admin only)
GET /admin/merchants, GET /admin/merchants/:id


PUT /admin/merchants/:id/plan, PUT /admin/merchants/:id/status


GET/POST/PUT /admin/plans (dynamic plans reflected site-wide)



7) Provider Abstraction Layer
Create interfaces and adapters:
interface WhatsAppProvider { sendTemplate(to, templateName, variables): Promise<MessageResult>; parseInbound(req): InboundMessage }
interface EmailProvider { send(to, subject, html, vars): Promise<SendResult>; parseWebhook(req): EmailEvent }
interface SMSProvider { send(to, text): Promise<SendResult>; parseWebhook(req): SMSEvent }

Routing by region & merchant settings. All outbound events logged to EventLog.

8) ML Risk Engine (Detailed) + Fallbacks
8.1 Features (per order)
Customer signals: phone reuse count, email domain risk, prior cancellations, historical confirmation behavior, time-since-last-order.


Order signals: COD vs prepaid, AOV bucket, SKU count, cart value spikes.


Geo signals: pincode risk percentile, state/city distribution, distance vs warehouse (optional).


Channel signals: referral source tags (if available), time-of-day.


8.2 Labels & Data
Label y=1 if order ended in RTO/cancel due to non-confirmation; else y=0.


Cold start: bootstrap with heuristic labels (policy outcomes) and merchant-imported past orders (optional CSV).


8.3 Model
Start with XGBoost or LightGBM (tabular, robust to mixed features).


Train in Python using scikit-learn/lightgbm; store with MLflow.


8.4 Pipeline
ETL job pulls last N days orders into feature store (Parquet on S3).


Train/val split by time; metrics: AUC, recall@topK risk.


Threshold selection for actions: e.g., score > 0.8 → dual-channel confirm; >0.9 and COD → pre-cancel unless confirmed in 12h.


8.5 Serving
Deploy FastAPI microservice: POST /score { order_features } → { score }.


Cache recent features in Redis to avoid recompute; fallback to rules if service down.


8.6 Monitoring & Retraining
Log predictions + outcomes; drift detection (PSI); scheduled retrain weekly.


Canary release: 10% traffic → new model; promote on win.


8.7 Rule-Based + LLM Fallback
Rules engine for immediate guardrails (e.g., COD + high-risk pincode → must-confirm).


Optional OpenAI classification (few-shot) when features are sparse; rate-limited and logged.


🧠 8.8 ML Risk Engine — Full Lifecycle & Architecture
The Risk Engine is the “intelligence layer” of Confirmly — evaluating every order’s likelihood of returning or getting canceled before shipment.
 It directly informs:
Which channel to use for confirmation (WhatsApp/SMS/Email)


When to trigger auto-cancel or re-confirmation


How merchants see risk trends and savings insights


This section explains how to design, train, deploy, monitor, and iterate on this ML model.

🧩 8.8.1 ML System Architecture Overview
               ┌───────────────────────────────┐
                │         Shopify / Woo         │
                └──────────────┬────────────────┘
                               │ Webhook (order)
                               ▼
                ┌───────────────────────────────┐
                │       Confirmly Backend       │
                │ (Fastify + Node + MongoDB)    │
                └──────────────┬────────────────┘
                               │
                     [Risk Feature Builder]
                               │
                               ▼
                ┌───────────────────────────────┐
                │    ML Risk Scoring Service    │
                │ (Python FastAPI + XGBoost)    │
                └──────────────┬────────────────┘
                               │
                               ▼
                ┌───────────────────────────────┐
                │  Risk Result → MongoDB Orders │
                │  + Policy Engine + Dashboard  │
                └───────────────────────────────┘


⚙️ 8.8.2 ML Microservice (Python + FastAPI)
Goal: Deploy an isolated microservice that receives order-level features and returns a risk score between 0 and 1.
API Example:
POST /score
{
  "merchant_id": "64abf...",
  "payment_mode": "COD",
  "pincode": "560034",
  "order_value": 1499,
  "customer_phone": "+919876543210",
  "order_frequency_30d": 2,
  "cancel_ratio": 0.25
}
→
{ "risk_score": 0.82, "confidence": 0.91 }

Service Stack:
Framework: FastAPI


Model: XGBoost or LightGBM (saved as .pkl using joblib)


Runtime: Python 3.10, served via Uvicorn/Gunicorn


Deployment: Docker container (AWS ECS / Render / Railway)


Caching: Redis (for repeated scoring within a 24h window)



🧮 8.8.3 Data Pipeline & Feature Engineering
Raw Inputs:
Shopify / WooCommerce orders (via webhook)


Historical orders from MongoDB


Merchant-level attributes (region, business type)


External data: Pincode reliability dataset (e.g., Shiprocket RTO risk index)


Feature Store Example:
Feature Name
Type
Description
payment_mode
categorical
COD / Prepaid
pincode_risk
float
External risk percentile (0–1)
previous_rto_count
int
# of past unconfirmed or returned orders
order_value
float
Amount in INR
cancel_rate
float
Merchant’s avg cancel rate (30d)
order_hour
int
Time order placed (local hour)
is_repeat_customer
bool
True if email/phone seen before
avg_order_value_customer
float
Mean order value of customer
order_frequency_30d
int
Orders placed by same customer in 30 days

Feature Builder Flow:
Ingest webhook → store raw order


Feature builder (Node worker) enriches record


Calls /score endpoint → stores risk_score


Risk score used by policy engine and displayed in dashboard



🧩 8.8.4 Model Training Pipeline (Step-by-Step)
Environment:
 Python + scikit-learn + pandas + XGBoost + MLflow
Data Extraction

 # from MongoDB
df = mongo_orders.find({"createdAt": {"$gte": cutoff_date}})


Preprocessing


Encode categorical vars (payment_mode, state)


Normalize numeric features (order_value)


Impute missing data (mean/mode)


Feature Selection


Drop low-variance features


Evaluate SHAP values for interpretability


Training

 model = xgb.XGBClassifier(
    n_estimators=200,
    max_depth=5,
    learning_rate=0.05,
    subsample=0.8
)
model.fit(X_train, y_train)


Evaluation


Metrics: AUC, Recall@Top20%, Precision, F1-score


Save model using joblib


Log run to MLflow with metadata


Deployment


Save model to S3 (models/risk_model_v1.pkl)


FastAPI loads it at runtime:

 model = joblib.load("risk_model_v1.pkl")


Versioning


Use MLflow for tracking model lineage


Only promote models passing defined thresholds (AUC > 0.8)



🧠 8.8.5 Inference & Integration Flow
Request Flow:
Node.js API → gathers features


Sends JSON to FastAPI /score endpoint


Receives { risk_score, confidence }


Updates Order.riskScore in MongoDB


Triggers policy rules accordingly


Example Integration (Node.js):
const riskResponse = await axios.post(`${ML_SERVICE_URL}/score`, features);
await Order.updateOne({_id: order._id}, {riskScore: riskResponse.data.risk_score});


🔄 8.8.6 Retraining Workflow (Continuous Learning)
Retrain Frequency: Weekly (or on >10k new labeled orders)
 Trigger Conditions:
Model drift (Population Stability Index > 0.2)


New merchant onboarded with >5k orders


Major business seasonality (Diwali, etc.)


Retraining Steps:
Extract labeled orders (confirmed vs canceled)


Train new model with version tag (v1.2, v1.3, etc.)


Compare new vs old AUC & recall


Canary release → 10% merchants


Monitor for 7 days


Auto-promote if better performance


Archive previous model (rollback option)



🔍 8.8.7 Monitoring & Observability
Metrics to Track:
Prediction volume per hour


Average risk score by merchant


Drift (distribution shift on features)


Latency (P95 < 200ms)


Failure rate (<1%)


Tools:
Prometheus + Grafana dashboards


Sentry for error tracking


MLflow for experiment tracking


PostHog events for merchant-facing analytics


Alerts:
Slack/email notifications if drift > threshold or API error rate > 2%


Fallback to rule-based system automatically on error



🧩 8.8.8 Rule-Based + LLM Fallback (Detailed)
When used:
ML service downtime


Merchant with <100 orders (insufficient training data)


Edge-case patterns (missing features or outliers)


Rule Engine Example:
if (paymentMode === "COD" && orderValue > 2000 && pincodeRisk > 0.8) {
  riskScore = 0.95;
} else if (paymentMode === "Prepaid") {
  riskScore = 0.1;
} else {
  riskScore = 0.5;
}

LLM (OpenAI) Classification Fallback:
 Used sparingly to infer risk when structured data is missing but contextual signals (like order notes, address text) are available.
Example prompt:
System: You are an AI risk analyst for eCommerce orders. 
Task: Rate the likelihood (0-1) that an order will not be delivered or returned-to-origin.

Order details:
- Address: Flat 5B, XYZ Street, Delhi-7
- Notes: "COD, please call before delivery"
- Customer: new user, same PIN had 2 cancellations last week.

Output JSON:
{"risk_score": 0.xx, "reason": "..."}


🧰 8.8.9 Deployment Setup
ML Microservice
Dockerfile → deploy via Render, Railway, or AWS ECS


Environment variables: MODEL_PATH, MONGO_URI, S3_BUCKET, MLFLOW_URI


CI/CD pipeline retrains & deploys automatically using GitHub Actions


API Rate Limiting
Limit scoring to 5 req/sec per merchant


Cache score per order_id to avoid duplicates



📚 8.8.10 ML Engine Context Documentation (for internal + customer use)
Docs Set:
Doc Name
Audience
Description
ml-overview.md
Developer
End-to-end design of ML microservice, API endpoints
feature-guide.md
Data/ML Engineer
Feature dictionary with source, type, transformation logic
training-pipeline.md
Data Engineer
ETL → training → evaluation pipeline
ml-deployment.md
DevOps
CI/CD steps, rollback procedures
risk-model-api.md
Developers
Integration examples (Node.js/HTTP)
ml-monitoring.md
Product Owner
KPI dashboard & drift detection guide

All stored in /docs/ml/.

🧩 8.8.11 Security, Compliance & Data Isolation
Separate ML database (read-only data copies)


No customer PII stored in model artifacts


Access via MCP only (no direct DB reads)


Encrypted S3 buckets for models & logs


Logs contain only merchant IDs and anonymized order hashes

Docs to deliver: full notebook template, feature dictionary, training script, deployment guide (see Context Docs section).

9) Security & Compliance (MVP)
Auth: JWT + refresh tokens; secure cookies (httpOnly).


RBAC: SuperAdmin, MerchantOwner/Admin, Member, Support.


Secret Management: .env → Vault (or Doppler) in prod.


Input Validation: Zod on edge + server; centralized error handling.


Transport Security: HTTPS everywhere; HSTS; TLS 1.2+.


Data Security: S3 SSE; MongoDB at-rest encryption; field-level encryption for tokens (WhatsApp/SES keys).


Webhook Security: Verify signatures (Meta/Stripe/Twilio/MSG91/SendGrid).


Rate Limiting: per-IP & per-merchant; slow-loris protection.


CSP: strict CSP headers; no inline scripts; sanitize HTML.


Audit: EventLog for all critical actions.


Privacy: Data retention policies; deletion APIs (DSR/GDPR-lite).


MCP Server: read-only queries for analytics, whitelisted writes; redact PII by default; allow-only over deny-all.
Security & Compliance (System-Wide)
9.1 Security Objectives
Objective
Description
Confidentiality
Protect sensitive data (customer PII, merchant tokens) from unauthorized access.
Integrity
Ensure data cannot be tampered with — every order, message, and billing record must be verifiable.
Availability
Ensure Confirmly’s core services (API, ML scoring, webhooks) remain accessible 24/7.
Accountability
Every admin, merchant, and system action must be logged, traceable, and auditable.


9.2 Authentication & Authorization
1️⃣ Authentication
Auth Provider: Clerk.js (for user management) or Auth.js (for custom JWT flow).


Tokenization: JWT tokens signed using HS512, stored as httpOnly cookies.


Password Security:


Hash using Argon2id or bcrypt (12+ rounds).


Password reset via secure token with TTL (24 hours).


OAuth: Shopify and WhatsApp Cloud API use OAuth 2.0 (scoped tokens stored encrypted).


2️⃣ Authorization (RBAC)
Role
Description
Access
Super Admin
Platform owner (you).
All data, admin console, impersonation.
Merchant (Admin)
Merchant owner, manages store, billing, templates, policies.
Own merchant data only.
Team Member
Added by merchant.
Limited to dashboard, orders, analytics.
Support Agent
Internal Confirmly staff (future).
Support tools, read-only access.


RBAC enforced via middleware + policy checks at route level.


Fine-grained document-level access control (Mongoose query scoping by merchantId).


Each API route validates user’s merchant context via JWT claims.



9.3 Data Security & Storage
🔐 Encryption
At Rest:


MongoDB Atlas with Encryption-at-Rest (AES-256).


S3 with Server-Side Encryption (SSE-S3) for stored media.


In Transit:


All HTTP traffic enforced over TLS 1.2+ (HTTPS).


Strict HSTS headers + preloading.


🔑 Token Security
All 3rd-party tokens (Stripe, Shopify, WhatsApp, SendGrid, MSG91, Twilio) encrypted using AES-256-GCM with random IV and stored in Merchant.channels field.


Key rotation policy: every 90 days.


Tokens decrypted only in memory (not logged, never persisted plaintext).


🧱 Secrets Management
Environment secrets stored in Vault/Doppler (not .env in production).


CI/CD pipelines use GitHub Actions secrets + restricted IAM policies.



9.4 MCP (Model Context Protocol) Access & Data Isolation
Confirmly uses an MCP server to isolate data access between the app backend and any AI/automation agents or analytics tools.
Design Principles:
Only read-only, parameterized queries for analytics allowed.


PII fields (names, phones, emails) masked or hashed by default.


Write operations allowed only for order status updates, policy configs, and safe audit logs.


Every query logged in MCP_AuditLog with user role + purpose.


Benefits:
Prevents data exfiltration through AI tools or internal misuse.


Enables secure, fine-grained integrations with OpenAI, analytics, or future partner dashboards.



9.5 Webhook Security
Each inbound webhook (Shopify, WhatsApp, Stripe, SendGrid, MSG91, Twilio) requires signature validation.
Provider
Signature Header
Validation Method
Shopify
X-Shopify-Hmac-Sha256
HMAC with shared secret
Stripe
Stripe-Signature
Verify with Stripe SDK
WhatsApp Cloud
hub.verify_token + message signature
Meta Graph API validation
Twilio / MSG91 / SendGrid
Unique key verification
Hash check

All webhook routes:
Use idempotent processing (de-duplication by event ID).


Have per-IP rate limiting (5 req/sec).


Respond within 200ms with queued processing for heavy tasks.



9.6 Rate Limiting & Abuse Prevention
Layer
Technique
Config
API Gateway (Fastify plugin)
IP-based rate limiter
100 req/min per IP
Merchant Scoped
Usage-based limiter
plan.limits.ordersPerMonth & messagesPerMonth
Webhook Layer
Deduplication + lock key
Prevent double delivery
ML Scoring Service
Cache per order_id
Avoid redundant scoring

Abuse Cases Prevented:
Bot-triggered fake order confirmations


DDoS attacks on webhook endpoints


Infinite retry loops from providers



9.7 Logging, Monitoring & Audit
🔎 Logging
Structured JSON logs with level, merchantId, userId, and traceId.


Separate channels: app.log, audit.log, provider.log.


Sensitive data (PII, tokens) redacted with [REDACTED].


🧾 Audit Trails
Every significant action is recorded in the AuditLog collection:
{
  entity: "Order",
  entityId: "64abf...",
  action: "AutoCancel",
  actor: { id: "64b...", role: "system" },
  before: { status: "pending" },
  after: { status: "canceled" },
  at: ISODate()
}

📊 Monitoring
Performance: PostHog, Grafana (via Prometheus metrics)


Error Tracking: Sentry (frontend + backend)


Uptime Monitoring: UptimeRobot or BetterStack (1-min interval)


ML Drift Alerts: MLflow comparison + Slack webhook



9.8 Penetration Testing & Hardening
Quarterly penetration test using Burp Suite / OWASP ZAP.


OWASP Top 10 compliance: injection, XSS, CSRF, IDOR, etc.


Pre-deployment checklists (automated CI/CD script validates headers, SSL, and security.txt).


Content Security Policy:

 Content-Security-Policy:
default-src 'self';
img-src 'self' data: https:;
script-src 'self' 'nonce-{dynamic}';
style-src 'self' 'unsafe-inline';
connect-src 'self' https:;


CSP, CORS, X-XSS-Protection, X-Frame-Options headers set by default.



9.9 Compliance & Privacy
Area
Standard
Implementation
Data Protection
GDPR / DPDPA (India)
Data access/export/deletion API
Payment
PCI DSS (via Stripe)
Tokenized payments only
Email/SMS
DND/NDNC compliant
Opt-out management
Logs
ISO 27001-like retention
90-day retention, rotate daily
Data Residency
AWS Mumbai region
Default storage for India clients
PII Deletion
Merchant self-service
GDPR-style API /delete-data


9.10 Backup, Disaster Recovery & Incident Response
Backups:
MongoDB Atlas daily snapshots (7-day retention)


S3 versioning for stored assets


Config dumps (plans, templates) weekly


Disaster Recovery Plan:
RTO (Recovery Time Objective): 30 minutes


RPO (Recovery Point Objective): <1 hour


Incident Response Procedure:
Auto-detect anomaly (CPU spike, data drift, API error surge).


Trigger Slack + email alert to on-call engineer.


System moves into “Safe Mode” (halts auto-cancellations temporarily).


Issue triage, fix, postmortem logged in IncidentLog.


Public status page updated (status.confirmly.io).



9.11 Secure Coding Practices
TypeScript everywhere — runtime + compile-time safety.


Zod validation for every incoming request.


Input sanitization (no unsanitized HTML or dynamic eval).


ESLint + Prettier enforce clean, consistent code.


No inline secrets in repo; everything via env variables.


Immutable audit logs (write-once).


Feature flags to prevent accidental exposure of beta features.



9.12 Internal Access & Team Security
Super Admin (you) uses hardware-based MFA.


SSH access restricted to key-based authentication.


Role-based dashboard for support agents (read-only).


Employee offboarding → automatic access revocation (CI/CD, DB).


Quarterly credential rotation enforced.




10) Frontend Spec (Next.js + MUI + minimals.cc)
App Shell
Left nav: Overview, Orders, Templates, Policies, Analytics, Integrations, Team & Billing.


Top bar: search, date filters, quick actions, profile.


Pages & Component Hierarchy
Auth: Sign in, Sign up, Invite Accept, Reset Password.


Onboarding Wizard: Connect Shopify → Connect channels (WhatsApp/Email/SMS) → Choose plan → Go live.


Overview: KPI cards (RTO reduction, confirmation rate, savings), channel split chart, recent events table.


Orders: DataGrid (MUI) with columns: date, order #, customer, amount, payment, risk, status, last contact; row actions: confirm, cancel, mark confirmed. Detail drawer with timeline + messages.


Templates: List + editor (vars autocomplete), A/B variants, preview, “send test”.


Policies: Rule builder (if/then UI), sliders (confirm window hours), toggles (COD only), YAML/JSON export.


Analytics: Charts (confirmation funnel, risk vs channel), downloadable CSV; date range picker.


Integrations: Shopify connect status, WhatsApp Cloud API connect (Meta App ID/Secret & phone number ID), email (SendGrid/SES) setup, SMS (MSG91/Twilio) setup; test buttons.


Team & Billing: Invite members, roles; Stripe portal link; usage meters; plan upgrade.


Super Admin (internal route): Merchants table, impersonate, plan editor, pricing sync to site, provider health.


Customer-Facing Mini-Portal (hosted):
Order lookup (optional), “We just sent you a confirmation on WhatsApp/SMS/Email”.
10. Frontend (Next.js + MUI + minimals.cc)
App Layout
Sidebar nav: Overview, Orders, Templates, Policies, Analytics, Integrations, Team & Billing


Responsive (mobile-first grid layout)


Dark/light themes


Command palette (⌘K shortcuts)


Key Pages
Overview Dashboard (KPIs, charts)


Orders table + order drawer (timeline, messages, risk)


Templates editor (A/B, preview)


Policy builder (if/then visual logic)


Analytics charts (Recharts)


Integrations setup cards


Billing (Stripe portal, usage)


Admin (merchants, plans, system health)



⚡ Performance Optimization
Lighthouse budget: TTFB < 200ms, LCP < 2.5s, CLS < 0.05


RSC + partial hydration (Next.js App Router)


Dynamic imports for charts, maps, editors


next/image optimization, next/font for subsetting


HTTP caching, ISR for marketing pages


SWR caching for dashboard data


Tree-shaking + lazy loading components


CDN caching via Vercel Edge



🔍 SEO Optimization
Dynamic metadata API per page


Structured data (JSON-LD for SaaSProduct, FAQ)


Sitemap.xml + robots.txt


Open Graph + Twitter cards


Preconnect & preload critical assets


Blog/Docs with MDX for SEO content


ROI calculator as SEO magnet


Case studies and testimonials



🧠 AI Platform Optimization (ChatGPT, Gemini, Claude, Perplexity)
Multi-provider LLM routing (OpenAI → Claude → Gemini fallback)


Strict JSON schema enforcement


Prompt repair + retry logic


Token cost limiter (<2 calls per order)


Caching identical address classifications


Provider evaluation (accuracy vs cost)


Data masking before LLM requests


Fast failover (<3s latency target)



11) Admin Panel (Super Admin)
Merchants: list, status, impersonate, usage, errors.


Plans: CRUD plans/features/limits/prices; toggle public visibility; order for website display.


Billing: View Stripe subs, payments, trial states; manual credits.


Providers: API health, rate limits, error rates.


Flags/Toggles: Feature flags, maintenance mode.


Support (optional MVP): read-only merchant event stream; reply macros for outreach.



12) Stripe Billing Flow
Products/Prices: Starter, Growth, Scale (monthly).


Checkout Session from backend → return URL into app.


Webhooks: customer.subscription.created|updated|deleted, invoice.payment_* → update Merchant.plan.


Middleware enforcePlanLimits(ordersPerMonth|messagesPerMonth) blocks or warns.


Customer Portal link in “Billing”.



13) WhatsApp Cloud API Integration
Merchant provides: Meta Business Account, App ID/Secret, Phone Number ID, permanent token.


Register webhook endpoint (messages, message_status).


Templates: pre-approve via Meta; store IDs; variables map ({{order_id}}, {{amount}}, {{name}}).


Send API: /messages with template object; handle rate limits & retries.


Inbound: parse replies YES/NO; update Order.confirmations[].reply + set status=confirmed|unconfirmed.



14) Email (SendGrid/SES) & SMS (MSG91/Twilio)
Provider adapters; sender verification (SPF/DKIM); webhooks for delivery/opens/clicks/replies.


Smart routing: India → MSG91; Intl → Twilio; fallback if provider down.



15) Policies & Automation
Visual rule builder → JSON policy.


Sample rules:


If paymentMode==cod AND riskScore>0.7 → send WhatsApp+SMS.


If no reply in 24h AND riskScore>0.9 → auto-cancel.


Dry-run mode; simulations against historical orders.



16) Analytics & Events
Track events: order_ingested, risk_scored, message_sent, message_reply, order_confirmed, order_canceled, billing_limit_reached.


Dashboards: confirmation funnel, channel effectiveness, savings calculator, heatmaps by pincode.



17) Testing & QA
Unit tests: services, providers, rules.


Integration tests: webhook → state change.


E2E (Playwright): onboarding, confirm flow, billing.


Load tests for webhook endpoints.


Security scans (npm audit, Snyk), OWASP checks.



18) DevOps & Environments
Envs: dev, staging, prod.


CI/CD: GitHub Actions → lint, test, typecheck, build, deploy.


Observability: logs (structured JSON), metrics, alerts (uptime, queue backlog).


Backups: MongoDB daily; config export for plans/templates.



19) Implementation Plan (8 Weeks)
W1: Repos, auth, Stripe skeleton, Mongo models, admin panel shell.
 W2: Shopify ingest + Orders UI.
 W3: WhatsApp Cloud API + inbound replies; Templates module.
 W4: SMS/Email adapters; Policies; Queues + retries.
 W5: ML microservice (baseline features, training on synthetic data), scoring integration.
 W6: Analytics dashboards; billing enforcement; onboarding wizard.
 W7: QA, hardening, docs, pricing sync to website, SEO.
 W8: Beta launch; feedback loop; support playbooks.

20) Figma-Level UI Layout Plan (Blueprint)
Design System: MUI + minimals.cc; 8pt spacing;
 Typography: Inter/Roboto; sizes: h1 32, h2 24, body 14/16.
Screens & Key Components
Auth: Card forms, SSO (optional), reCAPTCHA.


Onboarding: Stepper with connectors; provider connect cards; success state confetti.


Overview: KPI cards, Line chart (confirmation over time), Donut (channel share), Table (recent events).


Orders: DataGrid, Row drawer → Tabs: Timeline, Messages, Risk, Actions.


Templates: List, Editor (rich text + tokens), Preview pane, A/B switcher, Test send modal.


Policies: Rule chips, Condition rows, Action rows, Simulation dialog.


Analytics: Charts (Recharts), Filters, Export button.


Integrations: Provider status badges, Connect modals, Test buttons.


Team & Billing: Users table, Invites, Roles select, Usage bars, Stripe portal button.


Super Admin: Merchants table, Impersonate button, Plans editor with live preview, Provider health page.


Marketing Site: Hero (animated), Social proof, Feature sections (parallax), ROI calc, Pricing table (reads from public Plans API), FAQ, CTA footer.



21) Context Docs (for You & Customers)
A. Implementation Guide (Merchant)
Connecting Shopify (OAuth), enabling webhooks.


Connecting WhatsApp Cloud API (Meta setup steps).


Connecting MSG91/Twilio and SendGrid/SES.


Writing templates & variables; A/B basics.


Setting policies (examples) & safe defaults.


Understanding analytics & savings.


B. Admin/Operator Runbook (You)
Creating/editing Plans; syncing to site.


Impersonating merchants for support.


Reading provider health; rotating tokens.


Investigating queue backlogs and webhook failures.


Handling Stripe disputes & past-due states.


C. ML Risk Engine Docs
Feature dictionary with definitions.


Data extraction script (orders → features).


Training notebook (LightGBM) with metrics & thresholding.


Serving stack (FastAPI), Dockerfile, env vars, scaling.


Monitoring (drift, A/B, rollback).


D. Security & Compliance
Data retention & deletion requests.


PII handling, token encryption, key rotation policy.


Webhook signature verification guides.


MCP access policy (allow-list, roles, masking).


E. API Reference (Public)
Auth & rate limits.


Orders read endpoints (for custom dashboards).


Webhook formats for inbound replies.


F. Environment Variables
MONGO_URI, REDIS_URL, JWT_SECRET, STRIPE_KEYS, WHATSAPP_APP_ID/SECRET/PHONE_ID, MSG91_KEY, TWILIO_SID/TOKEN, SENDGRID_KEY/SES_KEYS, POSTHOG_KEY, S3_BUCKET, CORS_ORIGINS.


G. Incident Response
Severity levels, on-call, comms templates; status page protocol.



22) Clean Code & Best Practices
Monorepo (turborepo): apps/web, apps/api, apps/worker, services/ml.


Strict TypeScript; ESLint/Prettier; commit hooks.


DTO + schema validation at boundaries; service-repo pattern.


Provider interfaces + adapters; feature flags; config via typed env.


Comprehensive unit/integration tests; Playwright e2e.


Documentation in docs/ with mkdocs or Docusaurus.



23) Roadmap After MVP
WooCommerce integration (v1.1).


Regional language templates; templating marketplace.


3PL analytics connectors (read-only).


Advanced ML (sequence models, customer embeddings).


Support Agent role UI + internal ticketing.



This PRD + blueprint is implementation-ready.
 Next, I can provide:
Repo scaffolds (Next.js app shell, Fastify API, ML FastAPI service),


Stripe product/price JSON and webhook handler boilerplate,


WhatsApp Cloud API connect flow code stubs,


Sample ML notebook with synthetic data for immediate testing.


Context Docs & Deliverables
A. Merchant Setup Guide
Connect Shopify, WhatsApp Cloud API, SMS, and Email providers


Configure confirmation policies


Review analytics & savings reports


B. Admin Runbook
Manage plans, features, and pricing


Monitor merchants and billing


View API provider health


C. ML Engine Docs
Feature dictionary


Training pipeline notebook (XGBoost)


ML deployment and drift detection


D. Security Docs
Token encryption flow


Webhook signature validation guide


MCP access policies


E. API Docs
REST + OpenAPI reference


Webhook payload formats


SDK examples


Confirmly Repository Structure
confirmly/
├── apps/
│   ├── web/                  # Next.js (MUI + minimals.cc)
│   ├── api/                  # Node Fastify API
│   ├── worker/               # BullMQ background jobs
│   └── ml/                   # Python FastAPI Risk Engine
├── packages/
│   ├── shared/               # Shared utils, typings
│   ├── ui/                   # MUI design system wrappers
│   └── config/               # Env, constants
├── docs/
│   ├── ml_notebook.ipynb     # Synthetic ML training sample
│   ├── stripe_products.json
│   └── webhook_handlers.md
└── docker-compose.yml


🧩 1️⃣ Next.js App Shell (apps/web)
File: apps/web/app/layout.tsx
"use client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "@/theme";
import Sidebar from "@/components/Sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 bg-gray-50 p-6">{children}</main>
            </div>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}

File: apps/web/components/Sidebar.tsx
import { Drawer, List, ListItem, ListItemText } from "@mui/material";
import Link from "next/link";

const items = [
  { name: "Overview", href: "/dashboard" },
  { name: "Orders", href: "/dashboard/orders" },
  { name: "Templates", href: "/dashboard/templates" },
  { name: "Policies", href: "/dashboard/policies" },
  { name: "Analytics", href: "/dashboard/analytics" },
  { name: "Integrations", href: "/dashboard/integrations" },
];

export default function Sidebar() {
  return (
    <Drawer variant="permanent" sx={{ width: 240 }}>
      <List>
        {items.map((item) => (
          <ListItem key={item.name}>
            <Link href={item.href}>
              <ListItemText primary={item.name} />
            </Link>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}


⚙️ 2️⃣ Fastify API (apps/api)
File: apps/api/src/index.ts
import Fastify from "fastify";
import cors from "@fastify/cors";
import Stripe from "stripe";
import { handleStripeWebhook } from "./webhooks/stripe.js";
import { connectWhatsApp } from "./routes/whatsapp.js";

const app = Fastify({ logger: true });
await app.register(cors);

const stripe = new Stripe(process.env.STRIPE_SECRET!, { apiVersion: "2023-10-16" });

// Health route
app.get("/health", async () => ({ status: "ok" }));

// WhatsApp connect stub
app.register(connectWhatsApp, { prefix: "/whatsapp" });

// Stripe webhook
app.post("/stripe/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const body = req.rawBody || req.body;
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    await handleStripeWebhook(event);
    res.send({ received: true });
  } catch (err) {
    res.code(400).send({ error: `Webhook Error: ${err.message}` });
  }
});

app.listen({ port: 4000 });
console.log("🚀 API running at http://localhost:4000");


💳 3️⃣ Stripe Product / Price JSON
File: docs/stripe_products.json
{
  "products": [
    {
      "name": "Confirmly Starter",
      "description": "500 orders / month, WhatsApp + Email confirmation",
      "prices": [{ "unit_amount": 299900, "currency": "inr", "recurring": { "interval": "month" } }]
    },
    {
      "name": "Confirmly Growth",
      "description": "2,000 orders / month, adds SMS + AI risk scoring",
      "prices": [{ "unit_amount": 799900, "currency": "inr", "recurring": { "interval": "month" } }]
    },
    {
      "name": "Confirmly Scale",
      "description": "5,000 orders / month, advanced analytics + API access",
      "prices": [{ "unit_amount": 1499900, "currency": "inr", "recurring": { "interval": "month" } }]
    }
  ]
}


Webhook Handler Boilerplate
File: apps/api/src/webhooks/stripe.ts
export async function handleStripeWebhook(event: any) {
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      console.log("✅ Checkout completed:", session.customer_email);
      break;
    case "invoice.payment_failed":
      console.warn("⚠️ Payment failed:", event.data.object.customer);
      break;
    default:
      console.log("Unhandled Stripe event:", event.type);
  }
}


💬 4️⃣ WhatsApp Cloud API Connect Flow
File: apps/api/src/routes/whatsapp.ts
import { FastifyPluginAsync } from "fastify";
import axios from "axios";

export const connectWhatsApp: FastifyPluginAsync = async (app) => {
  app.post("/connect", async (req, res) => {
    const { accessToken, businessId, phoneNumberId } = req.body;
    // Validate connection
    try {
      const resp = await axios.get(
        `https://graph.facebook.com/v17.0/${phoneNumberId}?fields=verified_name`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      res.send({ success: true, verified_name: resp.data.verified_name });
    } catch (err) {
      res.code(400).send({ error: "WhatsApp connection failed", details: err.message });
    }
  });

  app.post("/send", async (req, res) => {
    const { token, phoneNumberId, to, template, variables } = req.body;
    const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
    try {
      await axios.post(
        url,
        {
          messaging_product: "whatsapp",
          to,
          type: "template",
          template: { name: template, language: { code: "en" }, components: [{ type: "body", parameters: variables }] }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      res.send({ success: true });
    } catch (err) {
      res.code(400).send({ error: "Message send failed", details: err.message });
    }
  });
};


🧠 5️⃣ ML FastAPI Service (apps/ml)
File: apps/ml/app/main.py
from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import xgboost as xgb
import joblib

app = FastAPI(title="Confirmly Risk Engine")

class OrderFeatures(BaseModel):
    amount: float
    payment_mode: str
    pincode_risk: float
    past_cancels: int
    is_repeat_customer: bool

model = joblib.load("model.pkl")

@app.post("/score")
def score(features: OrderFeatures):
    X = np.array([[features.amount, features.pincode_risk, features.past_cancels, 1 if features.is_repeat_customer else 0]])
    score = float(model.predict_proba(X)[0][1])
    return {"risk_score": round(score, 3)}

Run:
uvicorn app.main:app --reload --port 5000


📓 6️⃣ Sample ML Notebook (Synthetic Data)
File: docs/ml_notebook.ipynb
import pandas as pd, numpy as np, xgboost as xgb, joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score

# Generate synthetic data
N = 1000
df = pd.DataFrame({
    "amount": np.random.uniform(300, 3000, N),
    "pincode_risk": np.random.rand(N),
    "past_cancels": np.random.randint(0, 5, N),
    "is_repeat_customer": np.random.choice([0, 1], N),
})
df["y"] = (0.3*df.pincode_risk + 0.4*(df.past_cancels>2) + 0.2*(df.amount<800) + np.random.rand(N)*0.3 > 0.7).astype(int)

X, y = df.drop("y", axis=1), df["y"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

model = xgb.XGBClassifier(max_depth=4, learning_rate=0.1, n_estimators=100)
model.fit(X_train, y_train)
y_pred = model.predict_proba(X_test)[:,1]
print("AUC:", roc_auc_score(y_test, y_pred))

joblib.dump(model, "model.pkl")

✅ Run it, export model.pkl, and your /score API will start serving live predictions.

🧩 7️⃣ Docker Compose Example
File: docker-compose.yml
version: "3.9"
services:
  api:
    build: ./apps/api
    ports: ["4000:4000"]
    env_file: .env
  web:
    build: ./apps/web
    ports: ["3000:3000"]
  ml:
    build: ./apps/ml
    ports: ["5000:5000"]


⚡ Developer Quickstart
# 1. Install dependencies
pnpm install && cd apps/ml && pip install -r requirements.txt

# 2. Run ML API
uvicorn app.main:app --port 5000

# 3. Start Fastify backend
pnpm --filter api dev

# 4. Start Next.js app
pnpm --filter web dev

🎯 Core Outcomes
🚫 Reduce RTO losses by 60%+


🤖 Automate order confirmations via WhatsApp, SMS & Email


📊 Provide AI-driven risk scoring per order


⚙️ Auto-cancel or re-verify risky COD orders


💰 Show clear ROI analytics to merchants



🌍 Target Users
D2C & SMB eCommerce Brands (Shopify, WooCommerce)


Fulfillment agencies or 3PL partners


Online stores with high COD ratios



🧩 1. Goals, Non-Goals & KPIs
Goals
Automate confirmation workflows for COD and high-risk orders


Provide multi-channel confirmations (WhatsApp, SMS, Email)


Use ML to score order risk in real time


Integrate natively with Shopify and WooCommerce


Offer merchants a single dashboard to track performance, RTO reduction, and savings


Non-Goals (MVP)
No post-delivery return verification


No IVR or voice confirmations


No deep 3PL API integrations (future roadmap)


KPIs
60% average RTO reduction


95% confirmation success rate


<24h time-to-confirmation


Positive ROI in under 30 days of use



🧱 2. System Architecture Overview
Tech Stack Summary
Layer
Technology
Frontend
Next.js + TypeScript + MUI (minimals.cc)
Backend
Node.js (Fastify) + TypeScript
Database
MongoDB Atlas (with MCP access server)
Queue/Workers
BullMQ + Redis
ML Risk Engine
Python (FastAPI + XGBoost/LightGBM)
Billing
Stripe (Checkout + Billing Portal)
Notifications
WhatsApp Cloud API, MSG91, Twilio, SendGrid/SES
File Storage
AWS S3 / Cloudflare R2
Analytics
PostHog + internal event logging
Auth
Clerk.js / Auth.js with JWT
Hosting
Vercel (Frontend), Render/Fly.io (Backend)


🧩 Architecture Flow
Shopify/WooCommerce sends new order webhook → Confirmly backend.


Order processed → Risk Engine scores order.


Confirmation message sent via WhatsApp Cloud API, SMS, or Email.


Customer replies YES/NO.


Confirmly updates order → either confirmed or auto-canceled.


Analytics and RTO savings displayed in dashboard.



👥 3. User Roles
Role
Description
Access
Super Admin
Platform owner (you).
Full access: merchants, billing, features, analytics
Merchant (Admin)
D2C brand using Confirmly.
Manages integrations, policies, team, and templates
Team Member
Merchant’s staff.
Limited access to dashboard, orders, and analytics
Support Agent
Confirmly support staff (future).
Read-only support tools access


⚙️ 4. Modules Overview
Pre-Delivery Order Verification


WhatsApp, Email, and SMS confirmations


Risk scoring for COD orders


Auto-cancel rules for high-risk/unconfirmed orders


A/B testing for confirmation templates


Merchant Dashboard


KPIs (RTO reduction, confirmation rate, savings)


Policy builder (if/then automation rules)


Analytics and trend charts


Integrations setup (Shopify, WhatsApp, Email, SMS)


AI Risk Engine


ML model predicts RTO risk per order


Features: payment mode, pincode risk, customer behavior


Rule-based fallback with LLM classification


Admin Panel (Super Admin)


Merchant management


Plan & pricing control (auto-reflects on site)


Billing monitoring & error tracking


Provider API health


Marketing Website


Hero: “Reduce RTO by 60%+”


ROI calculator


Pricing table (connected to Plans API)


Free trial signup flow


SEO, structured data, and analytics



🧮 5. Database Schema (Simplified)
Collections
Merchants — store config, channels, plans


Users — user accounts with roles and merchant association


Orders — all incoming orders with confirmation & risk data


Templates — message templates (WhatsApp/SMS/Email)


Policies — automation rules


Plans — subscription tiers (editable in admin)


Billing — Stripe details


EventLog — every action or webhook event


AuditLog — secure audit trail



🤖 6. ML Risk Engine (Detailed)
6.1 Objective
Predict if an order is likely to become an RTO, based on signals such as:
Payment type (COD vs prepaid)


Order value & time


Customer history


Pincode reliability


Merchant cancellation trends


6.2 Architecture
Model: XGBoost classifier trained on historical order outcomes.


Service: Python (FastAPI) microservice deployed separately.


Features: ~20 derived features (order, customer, geo).


Output: JSON { "risk_score": 0.82, "confidence": 0.91 }.


Retraining: Weekly, via scheduled pipeline.


6.3 Fallbacks
Rule-based scoring when data insufficient.


OpenAI classification fallback for contextual orders.



📊 7. Analytics & Reporting
Funnel: Contacted → Replied → Confirmed → Shipped


Risk band distribution chart


ROI calculator (Saved cost = RTO prevented × avg shipping cost)


Channel performance report (WhatsApp vs SMS vs Email)


Exportable CSV reports



💰 8. Billing & Plans
Plan
Price
Orders/mo
Key Features
Starter
₹2,999
500
WhatsApp + Email confirmations, basic analytics
Growth
₹7,999
2,000
Adds SMS, policies, risk engine, A/B testing
Scale
₹14,999
5,000
API access, advanced analytics, white-label
Enterprise
Custom
Unlimited
SLA, dedicated account manager

Stripe handles checkout, billing, and trial logic.
 Admin changes auto-sync with marketing website pricing.
