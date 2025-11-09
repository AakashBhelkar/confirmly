Confirmly Repository Architecture, Access Control, Version Lifecycle & Organizational Governance

🧭 1. Purpose
The purpose of this document is to define:
The structure, ownership, and governance of Confirmly’s repositories 🧱


Access control and security best practices


Documentation organization and versioning strategy


End-of-life (EOL) and maintenance procedures for product releases


It ensures Confirmly remains maintainable, compliant, and scalable — even across team transitions or acquisitions.

🧩 2. Repository Overview
Confirmly is organized under a monorepo architecture managed through GitHub.
 Each functional domain has a dedicated folder with isolated build pipelines.
confirmly/
├── apps/
│   ├── web/             # Next.js frontend (merchant dashboard)
│   ├── api/             # Fastify backend (core services)
│   ├── ai-risk/         # FastAPI ML model
│   ├── admin/           # Super Admin panel
│   └── marketing-site/  # Next.js website (Vercel hosted)
│
├── libs/
│   ├── ui/              # Shared MUI components
│   ├── utils/           # Shared utilities
│   ├── hooks/           # Reusable React hooks
│   ├── types/           # TypeScript definitions
│   └── providers/       # Integrations (Stripe, Twilio, WhatsApp)
│
├── infra/
│   ├── docker/          # Docker Compose + ECS manifests
│   ├── terraform/       # AWS Infra as Code
│   ├── ci-cd/           # GitHub Actions
│   └── monitoring/      # Grafana dashboards + alert config
│
├── docs/
│   ├── product/         # PRD, feature specs, architecture diagrams
│   ├── dev/             # Dev guide, API docs
│   ├── ai/              # ML pipeline & model governance
│   ├── legal/           # Compliance and legal policies
│   └── operations/      # Incident & release management
│
└── scripts/             # Utility scripts (migrations, seeding, cleanup)


⚙️ 3. Access Control & Roles
A. Roles Definition
Role
Permissions
Notes
Founder / Super Admin (You)
Full access to all repos, billing, infra
Security key protected
Lead Developer
Write + deploy API/Frontend
2FA mandatory
AI Engineer
Write on /ai-risk + S3 model registry
Access limited to anonymized data
QA Engineer
Read + staging deploy
No production access
DevOps
Manage ECS, S3, monitoring
No access to merchant data
Support / CSM
Access web admin via dashboard
No code-level access


B. Access Methodology
GitHub Teams: “Admins”, “Developers”, “AI”, “Ops”, “Support”


AWS IAM Policies: Scoped to service (S3, ECS, Lambda)


MongoDB Atlas Roles: readWrite → app-level DB; readOnly → analysts


Stripe API Keys: Restricted by environment (live/test)


Vercel Access: Admin (you), Developer (frontend team only)



🧾 4. Secrets Management
Tool
Purpose
Access Control
AWS Secrets Manager
Store credentials (DB, API)
DevOps only
GitHub Secrets
CI/CD tokens
Admin only
Vercel Env Vars
Frontend runtime keys
Restricted
HashiCorp Vault (planned)
Centralized secrets
Phase 2

Rotation frequency: 90 days for all API keys and tokens.
 Audit logs: Monthly IAM review report.

🧱 5. Documentation Hierarchy
Each documentation folder follows a defined structure for consistency.
Folder
Type
Description
/docs/product/
PRDs, roadmaps
Product planning
/docs/dev/
API specs, data models, test plans
Developer enablement
/docs/ai/
ML notebooks, model specs, metrics
AI lifecycle
/docs/legal/
ToS, Privacy, DPA
Public compliance
/docs/operations/
Incident, release, QA, CI/CD
Internal ops

Each file uses:
# Title
**Owner:** @username
**Last Updated:** YYYY-MM-DD
**Version:** vX.Y.Z

All docs synced to Notion Knowledge Base via GitHub Actions nightly sync.

🧩 6. Branching & Release Strategy
Branch
Purpose
main
Stable production releases
develop
Active dev branch
feature/*
Per-feature branches
hotfix/*
Production patches
release/*
Candidate staging releases

Release Flow
PR from feature/* → develop (QA tests run)


Merge to release/* (staging deployment)


QA sign-off → merge to main (production deploy)


Tag release (v1.2.0)


Generate release notes automatically.



🧮 7. Governance Framework
Governance Type
Description
Frequency
Code Reviews
Mandatory peer review before merge
Every PR
Security Audits
Review dependencies + infra
Quarterly
Architecture Review
Validate schema, infra scalability
Quarterly
Release Council
Cross-team sync for roadmap
Monthly
Incident Review Board
RCA presentation and learnings
Post-incident


🧩 8. Documentation Maintenance SOP
Task
Frequency
Owner
PRD updates
On every feature release
Product Owner
API spec sync
Weekly
Backend Dev
AI model doc refresh
After retrain
ML Engineer
Legal review
Quarterly
Legal Advisor
Knowledge Base audit
Monthly
Ops Lead


📊 9. Version Lifecycle Policy
Each product version follows a 3-stage lifecycle:
Stage
Duration
Description
Active Support
12 months
Full support, patches, updates
Maintenance Mode
6 months
Security fixes only
End-of-Life (EOL)
After 18 months
Deprecated, archived

EOL versions tagged and stored in /archive/releases/ with:
Release notes


Changelogs


Deprecation date



🧠 10. Onboarding & Handover Playbook
A. New Developer Onboarding
Clone monorepo → run setup script (npm run setup).


Read /docs/dev/getting-started.md.


Access assigned dev environment (via Vercel or Docker).


Review /docs/qa/test-plan.md.


Complete first pull request with reviewer feedback.


B. Handover Checklist (for new owners)
✅ Admin credentials transferred (GitHub, AWS, Stripe)
 ✅ Secrets rotated
 ✅ All documents updated (README, PRDs, AI)
 ✅ Monitoring alerts verified
 ✅ Access audit performed
 ✅ Backup verification completed

☁️ 11. Repository Infrastructure Standards
Tool
Role
GitHub Actions
CI/CD automation
Terraform
AWS provisioning
Docker Compose
Local orchestration
Prettier + ESLint
Code formatting
Commitlint
Enforce conventional commits
Semantic Release
Auto version + changelog
Dependabot
Dependency updates


🔒 12. Compliance & Audit Records
Compliance Area
Tool
Evidence Location
Security Review
Notion + GitHub
/docs/operations/audit/security
Data Handling
MongoDB Atlas Logs
/logs/data-access
Access Logs
AWS CloudTrail
/audit/access/YYYY-MM
Release Verification
GitHub Releases
/changelogs
Policy Review
DPO report
/legal/reports/

Auditors can independently reproduce compliance state from repository logs.

🧾 13. Backup & Archival Governance
Asset
Backup Tool
Retention
Codebase
GitHub + S3 snapshot
Infinite
Docs
S3 + Notion export
1 year
Database
MongoDB Atlas backup
7 days
Models
S3 Registry
All versions
Logs
CloudWatch + Glacier
90 days
Stripe data
Stripe native retention
N/A

Disaster recovery tested quarterly via restore simulation.

🧮 14. Audit & Handover Logs
Each handover recorded with metadata:
{
  "handover_id": "HND-2025-11-01",
  "from": "Aakash Bhelkar",
  "to": "New Admin",
  "repos_transferred": ["api", "web", "ml"],
  "completed": true,
  "date": "2025-11-07"
}

Stored at /docs/operations/handover-log.json.

✅ 15. Summary
The Confirmly Governance & Handover Framework ensures that:
Every system is traceable, versioned, and secure


Every document, credential, and pipeline has a clear owner


The product can transition between teams seamlessly


Compliance, uptime, and performance remain verifiable


Confirmly is built not only to scale — but to endure. 🏛️💼
