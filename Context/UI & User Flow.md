(Covers Dashboard, Onboarding, Marketing Website, Admin Panel & Billing)

🧭 1. Visual Design Direction
✨ Visual Identity:
Clean, airy, product-led SaaS aesthetic (like Notion + Linear + Stripe).


Light theme default, dark mode supported.


Primary Color: #3C73FF (trust + tech), Accent: #00C48C (success).


Rounded cards (border-radius: 16px), soft shadows, and neutral backgrounds (#F7F8FA).


Font: Inter / Manrope.


🎯 Design Goals:
Simplicity over density — focus on “clarity of next action.”


Real-time feedback, rich empty states, and delight moments (animated stats).


Consistent spacing system (8pt grid).



🧱 2. Layout Architecture (Global)
┌─────────────────────────────────────────────┐
│  AppBar: Logo | Search | Date Range | User  │
├─────────────────────────────────────────────┤
│  Sidebar: Dashboard | Orders | Templates... │
│                                             │
│  Content: varies by section                 │
│                                             │
│  Footer: version | docs | support           │
└─────────────────────────────────────────────┘

📐 Sidebar
Collapsible


Active route highlight


Tooltip on hover (when collapsed)


Sections:


Overview


Orders


Templates


Policies


Analytics


Integrations


Team & Billing



📊 3. Dashboard UI (Merchant)
Screen: Dashboard Overview
Hero Section
Greeting: “Good Morning, Aakash 👋”


Quick Stats:


RTO Reduction % (Animated)


Confirmed Orders %


Monthly Savings ₹


Messages Sent Count


Sparkline chart behind each KPI card (subtle motion)


Middle Section
📈 Confirmation Trend Chart: Orders confirmed vs unconfirmed over time.


🧩 Channel Performance Chart: WhatsApp vs SMS vs Email breakdown (donut).


⚙️ Risk Band Distribution: Bar chart of low/medium/high risk orders.


Bottom Section
🕓 Recent Activity Table: Logs of “Order Confirmed”, “Auto-canceled”, “Customer replied YES”.


Empty state: “No recent activity yet. Start confirming orders!”



Screen: Orders
Layout:
Search bar + Filters (status, date range, risk band).


DataGrid (infinite scroll):
 | Order ID | Date | Amount | Payment | Risk | Status | Channels | Actions |


Click Row → Slide Drawer (Right Pane)
 Tabs:
Timeline → all confirmation messages, replies, actions.


Risk → model score, confidence, top contributing features.


Actions → buttons [Confirm Now], [Cancel Order], [Hold].


Bulk Actions:
Multi-select checkboxes.


Top bar: “Send WhatsApp confirmations”, “Export CSV”.



Screen: Templates
List View
Cards with template name, channel, variant (A/B), approval status, CTR metric.


Template Editor Modal
Left: Editor (variables, placeholders)


Right: Live Preview (mobile view)


Tabs: “Content”, “A/B Variants”, “Testing”


Buttons: [Save Draft], [Send Test], [Submit for Approval]



Screen: Policies (Automation Rules)
Policy Builder UI
Drag-and-drop condition builder:

 IF [PaymentMode = COD] AND [Risk > 0.8]
THEN [Send WhatsApp + SMS]


Add multiple conditions with AND/OR.


Reorder rules (priority).


Test rule on past orders (mini-simulator).


Policy Summary View
Cards showing active/inactive policies, success rates.



Screen: Analytics
KPI Banner: RTO saved ₹, Confirm Rate %, Avg Time to Confirm.


Visuals:


Line Chart: Confirmations over time.


Donut: Confirmation by Channel.


Map: RTO Hotspots (by pincode).


Bar: Risk distribution.


Filters: Date range, channel, payment mode.


Export Buttons: CSV / PDF.



Screen: Integrations
Connect Page (Cards Layout)
Shopify → “Connect Store” CTA


WhatsApp → “Connect via Meta Cloud API”


Input: Access Token, Business ID, Phone Number ID


Button: [Validate Connection]


Test send → success toast.


Email → Select Provider (SendGrid / SES)


SMS → MSG91 / Twilio setup (auth key, sender ID)


Stripe Billing → Auto-connected (shows plan info)



Screen: Team & Billing
Team Tab
Members list with roles (Owner, Admin, Member)


Invite Member modal


Role dropdown


Status badges (Active, Pending Invite)


Billing Tab
Subscription info card:


Plan: Growth


Usage: 1,242 / 2,000 orders


Next Invoice: 02 Dec 2025


Buttons: [Manage Billing (Stripe Portal)] [Upgrade Plan]


Invoice History Table


Animated Usage Meter (“You've used 72% of this month’s quota”)



🧾 4. Onboarding Flow
Flow Steps
 1️⃣ Welcome Screen
Hero: “Let’s reduce your RTO losses!”


CTA: [Start Setup]


2️⃣ Connect Store
Shopify Connect (OAuth)


Success screen → “Shopify connected ✅”


3️⃣ Connect WhatsApp
Inputs: App ID, Phone Number ID, Access Token


Validate → “Verified Name: Confirmly Store Bot”


4️⃣ Connect Email & SMS (optional)
Toggles with test buttons.


5️⃣ Set Confirmation Policy
Choose “COD-only” or “All orders”


Set delay window (e.g., 12h).


6️⃣ Trial Success Page
“Setup complete! Your first confirmation will send automatically.”


CTA: [Go to Dashboard]


🎨 Visual Note: Animated progress bar (step indicator, gradient fill).

🏠 5. Marketing Website (Sales Funnel UI)
Header (Sticky)
Logo | Features | Pricing | Demo | Login | [Start Free Trial]


Hero Section
Big Headline: “Reduce RTO losses by 60%+ 🚀”


Subtext: “Confirm every COD order automatically via WhatsApp, SMS & Email.”


CTA Buttons: [Start Free Trial] [Book a Demo]


Visual: Animated dashboard mockup with chat bubbles.


Social Proof
“Trusted by 500+ D2C brands” with logos & 4.9★ rating.


Feature Scroll Section
Each feature block (WhatsApp, Analytics, AI Risk Scoring)
 → Fades in as user scrolls.


Background: gradient overlays, subtle animations.


How It Works (4-Step Timeline)
Order Received


Auto Confirmation Sent


Customer Confirms


RTO Prevented


Pricing Section
Three-tier cards (Starter / Growth / Scale)


Pricing toggles (Monthly/Annual)


Highlight Growth Plan (“Most Popular”)


CTA under each → “Start Free Trial”.


Testimonials Section
Customer cards with headshots, ratings, savings data.


FAQ Accordion
Top 8 questions (billing, setup, API).


Footer
Sitemap links (Docs, Terms, Privacy)


Contact: support@confirmly.io


Social icons


SEO Additions
JSON-LD schema


OG image: Confirmly Dashboard preview


Live counter (“₹2.5L+ saved this month”)



🧮 6. Admin Panel (Super Admin)
Dashboard
Cards:


Total merchants


Active subscriptions


MRR (Stripe)


API uptime


Chart: Orders processed/day (PostHog data)


Table: Top 10 active merchants


Merchants Page
Table: Merchant Name | Plan | Usage | Last Activity | Actions


Buttons:


[View Details]


[Impersonate]


[Suspend]


Sidebar Drawer (Merchant details):


Store domain


Active channels


Plan usage


Logs


Plans Page
Table: Plan Name | Price | Orders Limit | Status | Visibility


Actions:


[Edit Plan] modal → update price/features dynamically


Reflects instantly on marketing site (via /plans public API)


Health Page
Provider metrics:


WhatsApp: Latency + Uptime


Stripe: Webhook health


ML Risk Engine: Response time


Manual Circuit Breaker toggles


Logs viewer (error feed)



💳 7. Billing Flow (Merchant)
Flow Overview
User clicks “Upgrade Plan”


Fastify API → POST /billing/checkout


Stripe Checkout opens → payment completes


Stripe webhook → updates merchant plan


Merchant redirected to dashboard → “🎉 Upgrade successful!”


Billing UI
“Manage Billing” → Stripe Customer Portal


Trial badge on top-right corner if active


Renewal reminder (7 days before expiry)


Upgrade CTA visible when limits reached



🧩 8. UX Microinteractions
✨ Micro details that make it delightful:
Smooth motion.div fade/slide transitions.


Success toasts (“Template saved ✅”).


Empty states with illustrations (Lottie animations).


Charts animate on first render.


Hover tooltips with subtle glass effect.


Confirmation modals use blur + scaling animations.



✅ 9. Design Deliverables Checklist (Figma)
Frame
Description
Notes
F1
Dashboard Overview
KPIs, charts, activity
F2
Orders Table + Drawer
Full state flow
F3
Template Editor
Preview variants
F4
Policy Builder
If/Then rules
F5
Analytics
Filters + visualizations
F6
Integrations
Connection cards
F7
Team & Billing
Members + invoices
F8
Onboarding Wizard
6-step guided setup
F9
Marketing Site
Hero → Pricing funnel
F10
Admin Panel
Merchants + Health
F11
Stripe Checkout
Redirect success
F12
Empty States
Generic + error views