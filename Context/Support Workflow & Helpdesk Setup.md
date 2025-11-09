Confirmly Customer Support, Helpdesk, and Knowledge Base Framework

🧭 1. Overview
Confirmly’s mission isn’t just to reduce RTO losses — it’s to make every eCommerce merchant feel supported and successful while using the platform.
This document outlines how Confirmly handles:
Customer support channels (chat, ticket, email)


Ticket workflows, SLAs, and escalation protocols


Role definitions for support agents


Help center structure (self-service content)


Internal SOPs for issue resolution and incident handling


Confirmly’s support system is built to provide 99% customer satisfaction (CSAT) and under 2-hour median response time.

💬 2. Support Channels
Channel
Purpose
Tool
In-App Chat
Real-time issue reporting & onboarding help
Intercom (Phase 1) → custom widget later
Email Support
General inquiries, billing, and API help
support@confirmly.io (via HelpScout/Zendesk)
Help Center
Self-service articles & FAQs
Notion/Markdown-based KB on help.confirmly.io
WhatsApp Support (Optional)
Urgent merchant escalations
Twilio WhatsApp (future)


🧑‍💻 3. Support Roles
Role
Description
Support Agent
First responder; handles tickets, chats, FAQs.
Technical Specialist
Handles API, integration, and webhook-related issues.
Customer Success Manager (CSM)
Owns key merchant accounts, provides ROI reviews.
Support Admin (You)
Oversees support ops, metrics, escalations, SLAs.

Role Access in Admin Panel
Role
Access Level
Can View
Support Agent
Basic
Tickets assigned to them
Technical Specialist
Medium
All open tickets tagged technical
CSM
High
Merchant-level ticket history
Admin
Full
All tickets + SLA logs


📩 4. Ticket Lifecycle
Every support ticket passes through these stages:
New → Assigned → In Progress → Waiting for Merchant → Resolved → Closed

Status Definitions
Status
Description
New
Ticket auto-created by chat/email
Assigned
Agent picked up ticket
In Progress
Actively resolving
Waiting for Merchant
Awaiting user response
Resolved
Issue fixed and verified
Closed
Auto-closed after 72h inactivity


📦 5. Ticket Metadata Schema
Stored in SupportTickets collection (MongoDB).
SupportTicket {
  _id: ObjectId,
  merchantId: ObjectId,
  createdBy: { id: ObjectId, name: string, email: string },
  assignedTo?: ObjectId,
  category: "billing" | "integration" | "technical" | "general",
  priority: "low" | "medium" | "high" | "urgent",
  status: "new" | "in_progress" | "waiting" | "resolved" | "closed",
  subject: string,
  description: string,
  messages: [{ senderId, text, createdAt }],
  tags: [string],
  sla: { createdAt, firstResponse, resolvedAt },
  createdAt,
  updatedAt
}

Indexes:
db.supporttickets.createIndex({ merchantId: 1, status: 1 });
db.supporttickets.createIndex({ priority: 1 });


⏱️ 6. SLA Policy (Service Level Agreements)
Priority
First Response
Resolution Target
Escalation Level
Low
6 hours
48 hours
None
Medium
3 hours
24 hours
CSM
High
1 hour
8 hours
Support Admin
Urgent (System Down)
15 minutes
2 hours
CTO/Admin

Auto-reminders trigger if SLA time exceeded.
Example alert:
🚨 High Priority Ticket #2491 breached SLA (8h limit exceeded)

🧾 7. Ticket Categories & Tagging
Category
Description
Typical Examples
Billing
Plan, Stripe, or refund issues
“Charged twice”, “Invoice missing”
Integration
Shopify, WooCommerce, API connection
“Shopify token expired”, “Webhook error”
Technical
WhatsApp/SMS/Email failures
“SMS not delivered”, “Webhook timeout”
General
How-to, onboarding, UI questions
“How to confirm prepaid orders?”

Tags:
#billing


#shopify


#sms-failure


#rto-policy


#ai-score


Helps segment issues and analyze recurring problem types.

🧠 8. Escalation Workflow
Step
Who
Action
1
Agent
Assigns ticket → investigates
2
Tech Specialist
If issue involves integrations or API
3
Support Admin
SLA breached or critical incident
4
Product Team
Escalate as bug or feature request
5
Post-mortem
Summary logged in IncidentReports collection

Escalations follow Slack/Email alerts → #support-escalations channel.

🧩 9. Support Automation Rules
Auto-ticket creation
Every inbound email → new ticket (via HelpScout webhook)


Chat session > 5 min inactivity → auto-convert to ticket


Auto-assignment
billing → Agent Group 1


integration → Specialist 1


technical → Specialist 2


Auto-closure
Tickets with no merchant response in 3 days → mark closed automatically.



📚 10. Help Center (Knowledge Base)
Hosted at: help.confirmly.io
Structure
Category
Example Articles
Getting Started
“How to Connect Your Shopify Store”, “WhatsApp API Setup”
Automations
“Auto-Cancel High-Risk Orders”, “Delay Policies Explained”
Analytics
“Understanding the RTO Dashboard”, “Channel Performance Metrics”
Billing
“Change or Cancel Plan”, “Download Invoice”
Technical
“Troubleshooting SMS Delivery”, “Webhook Verification”

Each article written in Markdown or Notion, synced to the site via static build (Next.js MDX).
 Each has:
Title


Problem summary


Step-by-step solution


Screenshots or short GIFs


Related articles list



🧠 11. Tone & Communication Guidelines
Confirmly’s support tone should reflect:
Empathy (“We understand your concern”)


Clarity (no jargon for non-technical merchants)


Confidence (always propose a next step)


Positivity (end messages with encouragement)


Examples:
❌ “That’s not possible.”
 ✅ “Currently, this isn’t supported, but here’s a workaround.”
❌ “We can’t help with that.”
 ✅ “Our team can check that for you. Could you please share your order ID?”

💡 12. Feedback & CSAT System
After ticket closure → auto CSAT email:
“How satisfied were you with our support?”
 ⭐⭐⭐⭐⭐ → Options: Very Satisfied / Neutral / Unsatisfied
Collected via HelpScout or internal /feedback endpoint.
Scores stored in:
SupportFeedback {
  ticketId: ObjectId,
  merchantId: ObjectId,
  rating: 1–5,
  comment?: string,
  createdAt
}

Target: 4.8+ average rating.

🧰 13. Support Dashboard (Admin View)
Metrics
Metric
Description
Total Tickets
All open + closed
SLA Compliance
% tickets resolved within SLA
Avg Response Time
Mean of first responses
Avg Resolution Time
Mean time to close
CSAT
Average customer rating
Top Categories
% by issue type

Displayed via charts (Recharts):
SLA trends (Line)


Ticket volume by category (Bar)


Avg response time (Area)


CSAT over time (Gauge)



⚙️ 14. Integrations
Tool
Purpose
HelpScout API
Ticket creation, email sync
PostHog
Track support article usage
Sentry
Auto-create tickets for exceptions
Slack
Escalation alerts
Stripe Webhooks
Billing-related ticket tagging


🧾 15. Support SOPs
Task
Frequency
Owner
Ticket audit & tagging cleanup
Weekly
Support Admin
Knowledge base updates
Weekly
Content Specialist
CSAT review
Bi-weekly
CSM
Escalation drill
Monthly
Support Team
Incident post-mortem
As needed
Product Owner


🧩 16. Escalation Matrix Example
Issue Type
First Responder
Escalation 1
Escalation 2
Billing
Support Agent
CSM
Admin
Integration
Technical Specialist
Product Dev
Admin
System Down
Admin
DevOps
CTO
ML Risk Misclassification
Specialist
ML Engineer
Admin


✅ 17. Summary
The Confirmly Support Framework ensures:
Fast, structured responses


Transparent SLAs and accountability


Continuous learning via knowledge base updates


Seamless escalation to product & engineering teams


Support is the heart of merchant retention — every ticket is a chance to build trust and showcase Confirmly’s reliability.

