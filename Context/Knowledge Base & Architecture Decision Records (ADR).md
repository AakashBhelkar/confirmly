Confirmly Internal Documentation Framework, Decision Log & Changelog System

🧭 1. Overview
This document establishes Confirmly’s internal knowledge management system — combining:
A structured documentation hierarchy,


Architecture Decision Records (ADRs),


A changelog and versioning system, and


Internal communication best practices.


The goal: every decision, process, and standard should be discoverable in under 3 clicks.
Confirmly’s knowledge base is maintained in Notion + GitHub Docs, with the latter serving as the “source of truth” for all engineering content.

📚 2. Documentation Structure
The /docs folder mirrors Notion’s structure and serves as the internal wiki.
confirmly/
├── docs/
│   ├── adr/                     # Architecture decision records
│   ├── backend/                 # API & integration documentation
│   ├── frontend/                # Next.js UI docs
│   ├── ml/                      # Machine Learning documentation
│   ├── devops/                  # CI/CD, infra, and deployments
│   ├── security/                # Security guidelines & reports
│   ├── marketing/               # Campaign playbooks
│   ├── support/                 # SOPs for support team
│   ├── legal/                   # Legal docs & DPA references
│   └── changelog.md             # Product version history

Each folder includes a README.md summarizing its contents and linking to detailed sub-docs.

🧩 3. Knowledge Base Hosting
Platform
Purpose
Example Content
GitHub Docs (/docs)
Source-controlled internal documentation
ADRs, technical design
Notion Wiki
Human-friendly collaboration layer
SOPs, onboarding, guides
Help Center (help.confirmly.io)
Public knowledge base
FAQs, user-facing help
PostHog Notes
Product analytics documentation
Funnel definitions, event tagging


🧱 4. Documentation Principles
Single Source of Truth: GitHub always supersedes Notion for technical data.


Version-Controlled Docs: Every doc updated via pull request.


Traceability: Every decision links to a PR, issue, or meeting note.


Clarity > Completeness: Each doc must be actionable.


Living Documents: Reviewed quarterly by doc owners.



🧩 5. Architecture Decision Records (ADR)
Each ADR captures a key technical or strategic decision, along with the rationale and implications.
ADR Template
# ADR-XXX: <Decision Title>

## Status
Accepted | Proposed | Deprecated

## Context
Describe the background or problem that led to this decision.

## Decision
State the final decision clearly and succinctly.

## Alternatives Considered
List other approaches and why they were not chosen.

## Consequences
Impact of this decision on the architecture, team, or users.

## Related Documents
Links to PRs, RFCs, or discussions.


🧠 6. Confirmly ADR Index
ADR ID
Title
Status
Date
ADR-001
Chose MongoDB over PostgreSQL
✅ Accepted
Mar 2025
ADR-002
Selected Next.js + MUI (minimals.cc) for frontend
✅ Accepted
Mar 2025
ADR-003
Chose Fastify over Express for backend
✅ Accepted
Apr 2025
ADR-004
Selected XGBoost for ML risk model
✅ Accepted
May 2025
ADR-005
Decided on Stripe for billing
✅ Accepted
Jun 2025
ADR-006
Integrated MCP for secure DB interactions
✅ Accepted
Jul 2025
ADR-007
Deferred Return Verification feature to Phase 2
✅ Accepted
Nov 2025
ADR-008
Chose AWS + Docker instead of Heroku
✅ Accepted
Nov 2025
ADR-009
Implemented PostHog for analytics
✅ Accepted
Nov 2025


Example ADR Document
# ADR-001: Chose MongoDB over PostgreSQL

## Status
Accepted

## Context
Confirmly requires a flexible schema to handle varying order and merchant data across multiple eCommerce platforms (Shopify, WooCommerce, custom APIs). We also need high-speed ingestion for webhook-based order events.

## Decision
Adopt MongoDB Atlas as the primary data store.

## Alternatives Considered
- **PostgreSQL:** Strong schema validation but slower for flexible integrations.
- **DynamoDB:** Highly scalable but complex query structure and cost overhead.

## Consequences
✅ Flexible JSON-based schemas.  
✅ Native integration with Mongoose ORM.  
⚠️ Requires aggregation pipelines for analytics.  
⚠️ Needs strong schema validation (Zod + Mongoose).

## Related Documents
- `/docs/backend/data-models.md`
- `/docs/ml/feature-engineering.md`


🔄 7. Changelog & Version Management
A centralized changelog (/docs/changelog.md) tracks product evolution.
Changelog Template
# Changelog

## [v1.0.0] – 2025-11-01
### Added
- WhatsApp Cloud API integration
- AI Risk Scoring pipeline (XGBoost)
- Stripe billing automation

### Changed
- Updated merchant onboarding flow (auto plan activation)
- Redesigned dashboard analytics page

### Fixed
- SMS webhook timeout bug
- Order status sync issue (WooCommerce)

Guidelines:
Each release tagged in GitHub (v1.0.1, v1.1.0, etc.)


Changelog auto-updated via commit hooks.


Display latest version number in admin footer (“vX.Y.Z”).



🧩 8. Internal Communication SOPs
Documentation Review Process
New doc or update proposed via PR.


Peer review by doc owner or lead.


Merge to main branch → auto-deploy to internal wiki.


Decision Recording
Major decisions → ADR


Minor operational notes → Notion “Decisions Log”


Communication Tools
Tool
Purpose
Slack
Daily communication, escalations
Notion
Non-technical documentation
GitHub
Version control + technical docs
Loom
Quick demo explanations
PostHog Notes
Product analysis


🧩 9. Onboarding Documentation (Internal)
Internal Wiki Structure (for team members)
Section
Description
Company Overview
Mission, team structure, brand tone
Engineering Onboarding
Local setup, repo conventions
Product Overview
Confirmly workflow diagrams
Marketing Handbook
Campaign setup and content strategy
Support Handbook
Ticketing and communication SOPs
Security Guidelines
DevSecOps policies
Release Process
Versioning, QA, deployment checklist


📘 10. Version Control for Documentation
Each document uses semantic versioning (v1.0, v1.1, etc.)


Every edit committed via PR with message format:

 docs: update security policy v1.1


Quarterly doc audits ensure all outdated sections are revised.


Deprecated documents moved to /docs/archived/.



🧾 11. Knowledge Retention & Handoff
When a team member leaves:
All ongoing ADRs reassigned.


Personal documentation moved to team folders.


Access revoked via GitHub + Notion within 24h.


Knowledge handoff recorded in /docs/team-transitions.md.



🧠 12. AI-Integrated Documentation (Future Enhancement)
Confirmly will use OpenAI or Gemini AI assistants internally to:
Auto-summarize ADRs → Slack updates.


Suggest documentation updates when PRs modify architecture.


Generate FAQ entries from recurring support tickets.


Surface “related docs” contextually via search (like internal ChatGPT).


Example command:
“/confirmly-docs why did we pick Fastify?”
 → Fetches ADR-003 summary instantly.

✅ 13. Summary
The Confirmly Knowledge Base & ADR System ensures:
Every architectural, strategic, and process decision is preserved.


Documentation remains accurate and auditable.


Future developers understand why things exist, not just how.


The organization scales without losing context or clarity.
