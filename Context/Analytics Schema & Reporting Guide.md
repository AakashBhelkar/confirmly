Confirmly Analytics, Metrics, and Data Tracking Framework

🧭 1. Overview
Confirmly’s analytics framework measures user engagement, product performance, and RTO reduction outcomes across merchants, channels, and plans.
This document defines:
What metrics and KPIs are tracked


Which events are logged (and how)


How data flows into PostHog, MongoDB, and the dashboard


What dashboards exist (for merchants and admins)


How ROI and efficiency are computed


Analytics is not just for reporting — it drives product decisions, pricing, and ML model feedback loops.

🧩 2. Analytics Architecture
Layer
Tool
Purpose
Client Tracking
PostHog JS SDK
Track merchant UI events
Server Tracking
Fastify Middleware
Log backend events
Storage
MongoDB (EventLog)
Persist audit and analytic events
Processing
PostHog pipelines
Transform and aggregate events
Visualization
Confirmly Dashboards + Grafana
Show KPIs to merchants/admins

Data Flow:
Web (Merchant) → PostHog → MongoDB (EventLog) → Aggregation Job → Dashboard Charts


📊 3. Primary Business KPIs
Category
KPI
Definition
Formula
RTO Reduction
RTO Rate
% of total orders that were returned/canceled
canceled_orders / total_orders
Confirmation Efficiency
Confirmation Rate
% of contacted orders confirmed
confirmed_orders / contacted_orders
Speed
Time to Confirm
Avg. hours between order and confirmation
avg(time_confirmed - time_ordered)
Financial Impact
Savings
Monetary savings via prevented RTOs
prevented_orders × avg_rto_cost
Engagement
Merchant Retention
% of merchants active in last 30 days
active_merchants / total_merchants
Channel Performance
WhatsApp Success Rate
% of WhatsApp confirmations delivered
delivered / sent


⚙️ 4. Core Events Schema
Every event sent to PostHog and/or EventLog follows this format:
{
  "event": "order_confirmed",
  "timestamp": "2025-11-07T09:00:00Z",
  "merchant_id": "mrc_123",
  "user_id": "usr_456",
  "properties": {
    "order_id": "ord_789",
    "payment_mode": "cod",
    "risk_score": 0.82,
    "channel": "whatsapp",
    "time_to_confirm": 3.2
  }
}

Common Properties (included in every event)
Property
Type
Description
merchant_id
string
Merchant account identifier
user_id
string
Triggering user (admin/team)
plan_id
string
Active subscription plan
region
string
Country code (e.g., IN, US)
timestamp
ISO string
UTC timestamp
environment
string
staging or production


🧱 5. Event Taxonomy
Merchant Lifecycle Events
Event
Description
Trigger
merchant_signup
New merchant registration
On account creation
merchant_connected_store
Store connected (Shopify/Woo)
On integration success
merchant_connected_channel
Connected WhatsApp/Email/SMS
On channel auth
merchant_activated_trial
Trial started
On plan start
merchant_upgraded_plan
Upgraded via Stripe
Stripe webhook
merchant_canceled_plan
Subscription canceled
Stripe webhook


Order Lifecycle Events
Event
Description
Source
order_created
New order ingested
Shopify webhook
order_scored
ML risk score computed
ML API
order_confirm_sent
Confirmation sent via channel
Worker queue
order_confirmed
Customer confirmed order
Inbound webhook
order_unconfirmed
Order timed out
Policy rule
order_canceled
Auto-canceled due to high risk
Policy rule
order_fulfilled
Confirmed order shipped
Shopify status


Messaging Events
Event
Description
Provider
whatsapp_message_sent
WhatsApp template sent
WhatsApp API
whatsapp_reply_received
Customer reply captured
WhatsApp webhook
sms_sent
SMS confirmation sent
MSG91/Twilio
email_sent
Confirmation email sent
SendGrid/SES


Product Usage Events
Event
Description
template_created
Merchant created a new message template
policy_added
New automation rule added
analytics_viewed
Merchant viewed Analytics tab
settings_updated
Account settings modified
team_member_invited
New user invited to team
billing_portal_opened
Stripe billing opened


📦 6. Database Schema (EventLog Collection)
EventLog {
  _id: ObjectId,
  merchantId: ObjectId,
  event: string,
  timestamp: ISODate,
  userId?: ObjectId,
  channel?: "whatsapp" | "sms" | "email",
  orderId?: ObjectId,
  planId?: ObjectId,
  properties: Object,
  environment: "staging" | "production"
}

Indexes:
db.eventlogs.createIndex({ merchantId: 1, event: 1, timestamp: -1 });


📈 7. Merchant Dashboard Metrics
Each merchant sees:
Section
Metrics Displayed
Top KPIs
RTO reduction %, confirmation rate, savings ₹
Trend Chart
Confirmations over last 30 days
Channel Performance
WhatsApp vs SMS vs Email
Risk Analysis
Breakdown by risk category
ROI Report
Estimated savings vs plan cost
Orders by State
Choropleth map (geo visualization)
Top Products by Risk
Bar chart


🧠 8. Admin Analytics (Internal Dashboard)
Admins see a global, cross-merchant view:
Metric
Description
Active merchants
Currently using Confirmly
Monthly Recurring Revenue (MRR)
From Stripe
Total RTO saved (₹)
Across all merchants
WhatsApp API health
Delivery success rate
ML Engine accuracy
AUC score trend
Feature adoption
Templates, policies, etc.

Admin reports stored in Grafana dashboards and PostHog cohorts.

📊 9. ROI Formula & Merchant Value
Estimated RTO Cost per Order = average logistics + packaging + COD handling
 (default ₹80/order for Indian D2C)
Savings per Merchant:
prevented_orders × avg_rto_cost

Example:
Prevented 400 orders × ₹80 = ₹32,000 saved/month


Growth Plan cost = ₹4,999/month
 → ROI = 6.4× within first month


This ROI figure is shown in the merchant dashboard and used in marketing materials.

🧰 10. Data Collection & Privacy Controls
Only non-sensitive data is tracked (no names, addresses, or full phone numbers).


Data anonymization at collection:


Phone → hashed last 4 digits.


Email → domain only.


Merchant opt-out toggle: “Disable analytics tracking.”


Backend event logging respects DPA and privacy policy.

🔎 11. PostHog Event Configuration
All frontend events prefixed by ui_ (e.g., ui_click_upgrade_plan, ui_view_dashboard).
Event Grouping in PostHog:
Category
Example Events
Onboarding
ui_complete_setup, merchant_connected_store
Engagement
analytics_viewed, template_created
Conversion
ui_click_upgrade_plan, merchant_upgraded_plan
Retention
merchant_login, merchant_active_day

Funnels:
Activation Funnel: signup → store connected → first confirmation sent


Retention Funnel: weekly active merchants


Upgrade Funnel: free trial → upgrade → recurring payment



📈 12. Visualization Components (Frontend)
Confirmly uses Recharts for dynamic analytics:
Component
Chart Type
Description
RtoReductionChart
Area Chart
Trend of RTO reduction %
ChannelPerformanceChart
Pie Chart
WhatsApp/SMS/Email comparison
RiskBandChart
Bar Chart
Orders by risk category
SavingsTrend
Line Chart
Savings over time
MerchantActivityLog
Table
Recent actions feed

All charts powered by /analytics/summary API endpoint.

🧮 13. Aggregation Logic (API Layer)
Endpoint: GET /analytics/summary
Aggregates:
Orders by status


Average confirmation time


Channel stats


RTO reduction over time


Example output:
{
  "metrics": {
    "rto_reduction": 0.58,
    "confirmation_rate": 0.93,
    "avg_confirm_time": 3.4,
    "total_savings": 24500
  },
  "channels": [
    { "channel": "whatsapp", "rate": 0.94 },
    { "channel": "sms", "rate": 0.89 },
    { "channel": "email", "rate": 0.76 }
  ]
}


📘 14. Analytics Maintenance & SOP
Task
Frequency
Owner
Validate PostHog tracking
Weekly
DevOps
Monitor event volume
Weekly
Data Analyst
Verify RTO formula
Monthly
Product Owner
Rebuild dashboards
Monthly
Frontend Dev
Archive logs > 180 days
Monthly
Backend Dev


✅ 15. Summary
The Confirmly Analytics Framework ensures:
Every action, confirmation, and decision is measurable.


Merchants see quantifiable ROI.


The team can detect issues before users notice.


Data fuels ML model retraining and business growth.


All analytics data drives the feedback loop between AI → UI → Product decisions.