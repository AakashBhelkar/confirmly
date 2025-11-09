Confirmly Security Architecture, DevSecOps, and Compliance Framework

🧭 1. Overview
Confirmly handles sensitive merchant and customer data (orders, emails, phone numbers, payment modes). Protecting this data is a core business value, not just a technical requirement.
This document outlines Confirmly’s security controls, audit checklists, and mitigation strategies across application, network, and data layers.
The goal:
“No unauthorized access, no unencrypted data, no unresolved vulnerabilities.”

🧱 2. Security Architecture Overview
Layer
Security Mechanisms
Tools/Standards
Infrastructure
Network firewall, SSL/TLS, Docker isolation
AWS Security Groups, Let’s Encrypt
Application
Authentication, rate limiting, API validation
JWT + Zod + Fastify plugins
Data Layer
Encryption, role-based access, least privilege
MongoDB Atlas (AES-256), IAM
Communication
HTTPS + OAuth scopes
TLS 1.3
Monitoring
Intrusion alerts, audit logs, exception monitoring
Grafana, Sentry, AWS CloudWatch
Governance
Access reviews, key rotation, patch cycles
DevSecOps SOPs


🔐 3. Authentication & Authorization
Authentication
JWT-based session tokens (signed with HS256, expiry 24h)


Optional Clerk.js or Auth.js for OAuth-based login


Secure cookie mode enabled on web (httpOnly, SameSite=Lax)


Authorization
Role-based access control (RBAC):


superadmin, merchant, member, support


Route-level middleware in API:


fastify.addHook('preHandler', async (req, reply) => {
  if (!req.user || req.user.role !== 'merchant') reply.code(403).send({ error: 'Forbidden' });
});

Token Storage
Never stored in localStorage (only cookies or headers)


Refresh tokens stored securely in DB with rotation every 7 days



🧩 4. Password & Credential Policy
Element
Requirement
Password Length
Minimum 10 characters
Complexity
Must include upper, lower, number, symbol
Hashing
bcrypt with salt (12 rounds)
Reset Policy
Token expires after 30 mins
Rotation
Admin passwords rotated every 90 days

API keys (e.g., WhatsApp, SendGrid) are stored encrypted in MongoDB using AES-256-GCM, not plaintext.
Example encryption helper:
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);


☁️ 5. Cloud & Network Security
AWS Configuration
EC2: inbound limited to ports 22, 80, 443


VPC isolation between API and ML service


Redis open only within private subnet


SSH access restricted to whitelisted IPs


Certificates
Managed by Let’s Encrypt via Certbot (auto-renewal)


TLS 1.3 for all traffic


Force HTTPS redirect globally


S3 Buckets
Private by default (no public ACLs)


Signed URLs for temporary access


Object encryption (AES-256)


Firewall & DDoS
Cloudflare in front of Vercel + API


Rate limiting on API:


fastify.register(rateLimit, { max: 100, timeWindow: '1m' });


🧮 6. Application Security Controls
Threat
Mitigation
SQL/NoSQL Injection
Use Mongoose prepared queries only
XSS
Escape all user input, use helmet
CSRF
Use CSRF tokens on all form endpoints
Rate abuse
Global + per-user throttling
Insecure Deserialization
No JSON parsing without schema validation (Zod)
Open Redirects
Whitelisted redirect URLs only
Insecure File Uploads
Restrict MIME types, virus scan (ClamAV)
Sensitive Logging
Mask PII in logs, disable verbose logging in prod


🧰 7. Data Encryption Strategy
Data in Transit
Enforced HTTPS using TLS 1.3


HSTS headers enabled (Strict-Transport-Security)


Data at Rest
Component
Encryption
Tool
MongoDB Atlas
AES-256
Managed
S3
AES-256
Managed
Redis (if used)
Ephemeral, no persistence
Internal only
Config Secrets
AWS SSM / Vault
Encrypted

Sensitive Fields Masking
Before writing to DB:
Mask all but last 4 digits of phone


Hash customer email → domain only


Remove shipping address (not required)



🧾 8. Security Headers (API & Web)
Applied via Helmet middleware:
Header
Purpose
Content-Security-Policy
Prevent XSS & code injection
X-Frame-Options: DENY
Prevent clickjacking
X-Content-Type-Options: nosniff
Prevent MIME-type confusion
Referrer-Policy: no-referrer
Hide sensitive referer data
Strict-Transport-Security
Enforce HTTPS
Permissions-Policy
Limit browser features


🧩 9. Dependency & Package Security
npm audit + pip-audit run weekly


Dependabot auto-updates critical dependencies


Lockfile integrity check before build (npm ci)


Remove unused packages monthly


Example CI step:
- name: Security Audit
  run: npm audit --production --audit-level=moderate


🧠 10. Penetration Testing Checklist
Test Area
Description
Tool
Authentication
JWT replay, brute force, 2FA
OWASP ZAP
API
Rate limit, injection, header validation
Burp Suite
Web
XSS, clickjacking, CORS bypass
OWASP ZAP
File Uploads
Malware, content-type mismatch
ClamAV
Data Leakage
Sensitive info in logs
Manual
S3 Buckets
ACL misconfigurations
AWS CLI
ML Service
Input fuzzing, poisoning
Custom script
CSP Policy
Validate headers
Mozilla Observatory

Pentest reports logged in /security/audit-reports/ and reviewed monthly.

📈 11. Audit Logging
Every critical action (create, update, delete) is logged in the AuditLog collection.
AuditLog {
  userId,
  merchantId,
  action: "UPDATE_POLICY" | "DELETE_ORDER",
  resourceId,
  timestamp,
  ipAddress,
  userAgent
}

Logs stored for 180 days and exported to S3 daily.

🧮 12. Access Control & Principle of Least Privilege (POLP)
All IAM roles scoped to minimum necessary privileges:


API → read/write Mongo only for its own DB


ML → read-only orders, write risk scores


Worker → send messages only


Admin dashboard actions gated by superadmin role only


Merchant cannot see other merchants’ data (strict tenant isolation)



🔄 13. Backup & Recovery
Asset
Backup Frequency
Retention
Encryption
MongoDB Atlas
Daily
7 days
AES-256
S3 Buckets
Weekly
30 days
AES-256
ML Models
Versioned
Permanent
S3 Managed
Configurations
Manual
On update
SSM

Recovery time objective (RTO): ≤ 2 hours
 Recovery point objective (RPO): ≤ 15 minutes

🧾 14. Compliance Mapping
Standard
Status
Notes
GDPR (EU)
✅ Partial compliance
DPA included
DPDPA (India)
✅ Full compliance
Local storage & deletion supported
CCPA (US)
⚙️ Partial
Ready for expansion
PCI-DSS
✅ Compliant (Stripe handles card data)


ISO 27001
⚙️ Aligning internally
Planned audit Q2 2026


📋 15. Security Incident Response SOP
Incident Lifecycle
Detect → Triage → Contain → Mitigate → Recover → Review

Detection: Alerts from Grafana, Sentry, or CloudWatch


Triage: Confirm false positive or real threat


Contain: Temporarily revoke keys or block IPs


Mitigate: Patch vulnerability, redeploy service


Recover: Verify systems operational


Review: Write post-incident RCA within 24h



🔎 16. Security Auditing & Maintenance
Task
Frequency
Responsible
Dependency audits
Weekly
DevOps
Access review
Monthly
Admin
Key rotation
Quarterly
CTO/Admin
Penetration test
Quarterly
External
Security patch updates
Monthly
All Devs
Privacy compliance review
Bi-annual
Legal Advisor


✅ 17. Summary
The Confirmly Security Framework ensures:
End-to-end encryption and compliance


Strict RBAC and access boundaries


Continuous auditing and proactive alerts


Readiness for enterprise merchants and future certifications


Security isn’t a feature — it’s a commitment embedded into every part of Confirmly’s architecture. 🧠🔒
