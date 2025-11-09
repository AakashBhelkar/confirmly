Confirmly Legal Policy, Privacy Management & Data Governance System

🧭 1. Purpose
This document defines Confirmly’s legal and compliance framework, covering all policies required for lawful operation, data protection, and regulatory adherence across jurisdictions (India, EU, US).
It aims to:
Protect user data and privacy 🛡️


Build trust through transparency


Enable compliance with GDPR, DPDPA (India), and CCPA


Establish data-handling SOPs and security controls



⚙️ 2. Legal Documents Overview
Policy
Description
Location
Terms of Service (ToS)
Governs use of Confirmly SaaS
/legal/terms
Privacy Policy
Details data collection, usage, and user rights
/legal/privacy
Data Processing Addendum (DPA)
Defines processor responsibilities (you → merchants)
/legal/dpa
Cookie Policy
Explains cookies, tracking, and analytics
/legal/cookies
Refund & Cancellation Policy
Defines payment and refund rules
/legal/refund

Each page hosted on the public website, auto-versioned with date stamps and version identifiers.

🧾 3. Data Governance Model
Confirmly classifies and processes data under three tiers:
Data Type
Example
Processing Policy
Personal Data
Merchant name, email, phone
Stored encrypted (AES-256), minimal retention
Transactional Data
Orders, confirmations
Stored for analytics, anonymized after 90 days
System Data
Logs, metrics
Retained for 180 days, no PII stored

All data processing governed by purpose limitation, data minimization, and storage limitation principles.

🧱 4. Data Flow Overview
Merchant → Confirmly App → Database → Providers → Analytics

Merchant integrates store (Shopify/WooCommerce).


Orders fetched → anonymized (no full address).


Confirmations sent via providers (WhatsApp, SMS, Email).


Replies logged → analytics dashboard updated.


Logs archived → deleted after retention period.


No PII shared with 3rd parties beyond required service providers (e.g., Meta for WhatsApp API).

🔒 5. Lawful Basis for Processing (GDPR Mapping)
Processing Activity
Lawful Basis
Example
Merchant onboarding
Consent
Sign-up form
Order processing
Contractual necessity
Confirm orders
Email/SMS confirmations
Legitimate interest
Notify customers
Analytics tracking
Consent (via cookies)
Performance dashboard
Billing & payments
Legal obligation
Invoices via Stripe


🇮🇳 6. DPDPA (India 2023) Compliance Mapping
Principle
Confirmly Implementation
Consent-Based Processing
Explicit consent checkbox at signup
Data Fiduciary Duties
Disclose collection purpose & retention
Data Minimization
Collect only essential order identifiers
Right to Correction/Deletion
Self-serve data deletion option
Cross-Border Transfers
Only to GDPR-compliant processors
Data Protection Officer (DPO)
Founder acts as interim DPO


🧾 7. Data Retention Policy
Data Type
Retention Period
Deletion Mechanism
Merchant account
Until deletion request
Soft delete + purge after 30 days
Orders
180 days
Auto-anonymized (no PII)
Analytics
365 days
Aggregated only
Logs
180 days
S3 archive deletion
Stripe billing data
As per Stripe retention
External system only

Anonymization = replace PII with random hash IDs before archival.

💬 8. User Rights (GDPR Articles 12–23)
Right
Description
Confirmly Mechanism
Access
Request stored data
“Export My Data” button
Rectification
Fix incorrect details
Profile edit
Erasure (Right to be Forgotten)
Delete account/data
Delete request form
Portability
Export in JSON/CSV
Email link
Restriction
Limit processing
Manual toggle in account settings
Objection
Opt out of analytics
Cookie consent
Automated Decision Review
Contest AI risk score
Manual review via support

All requests logged and fulfilled within 30 days, as per law.

☁️ 9. Third-Party Data Processors
Processor
Purpose
Jurisdiction
Compliance
MongoDB Atlas
Data storage
US/EU
GDPR + ISO 27001
Stripe
Billing
Global
PCI DSS
SendGrid / SES
Email delivery
US
GDPR-compliant
MSG91 / Twilio
SMS
India/Global
DPDPA ready
Meta (WhatsApp Cloud API)
Messaging
Global
DPA compliant
PostHog
Analytics
EU region
GDPR compliant
AWS S3
Backups
India/EU
AES-256 encryption

No personal data shared with analytics or marketing tools without consent.

🧠 10. Data Encryption & Anonymization Standards
Layer
Method
In Transit
HTTPS (TLS 1.3)
At Rest
AES-256
API Tokens
Encrypted + rotated quarterly
Logs
Mask phone/email
Backups
Encrypted with separate KMS key
ML Features
Uses anonymized order signals only

Anonymization example:
const hashEmail = (email) => crypto.createHash('sha256').update(email).digest('hex').slice(0,10);


🔍 11. Privacy by Design Principles
Default data minimization — only required fields stored.


Encryption-first policy — encryption applied before transmission.


Access segmentation — strict tenant-level isolation.


Transparency — merchants always know what’s tracked.


Right to consent withdrawal — one-click unsubscribe or disable analytics.


Automated data lifecycle — scheduled deletion pipelines.



⚙️ 12. Cookie Policy
Cookie Type
Example
Purpose
Essential
Session ID
App authentication
Analytics
PostHog ID
Behavior analysis
Marketing
Meta Pixel
Retargeting (optional)

Cookie consent banner:
“We use cookies to enhance your experience. Manage preferences or opt out anytime.”
Stored in user_preferences table:
{
  merchantId,
  consent: { analytics: true, marketing: false },
  updatedAt
}


📋 13. Data Breach Response Plan
If breach detected:
Notify DPO and incident lead within 30 mins.


Contain and isolate affected systems.


Identify affected merchants/data scope.


Notify regulators within 72 hours (as per GDPR Art. 33).


Communicate with users transparently:


 “We identified unauthorized access to limited merchant data. Systems have been secured. No passwords or financial info were compromised.”



Conduct post-breach audit and publish RCA.



🧾 14. Legal Notices & Disclaimers
Liability
Confirmly provides software as a service and is not liable for losses due to:
3rd-party outages (e.g., Shopify, Twilio, WhatsApp API)


Misconfigurations by merchants


Unconfirmed or auto-canceled orders (based on merchant rules)


Governing Law
India for domestic merchants


GDPR (EU) for European users


Disputes resolved under Maharashtra, India jurisdiction.



📜 15. Audit & Compliance Review SOP
Activity
Frequency
Owner
Data access audit
Monthly
Security Officer
Policy review
Quarterly
DPO
Provider compliance check
Semi-annual
Legal Counsel
Privacy impact assessment
Annual
Founder/DPO
DPDPA documentation audit
Annual
External auditor

Audit results stored under /docs/legal/audit-reports/YYYY-MM.md.

✅ 16. Summary
The Confirmly Legal & Privacy Framework ensures:
Transparent and compliant handling of all merchant and customer data
End-to-end encryption and limited data exposure
Compliance with GDPR, DPDPA, and PCI DSS
Strong governance for breach, consent, and lifecycle management


Confirmly doesn’t just meet compliance standards — it exceeds them by embedding privacy into its product design and culture. 🔐📘
