# H&H House Maintenance CRM (hnhpros.ca)

A specialized, full-stack CRM built with **Next.js**, **MongoDB (Mongoose)**, **Tailwind CSS**, and **TypeScript**, tailored specifically for exterior house maintenance companies like **[H&H House Maintenance](https://hnhpros.ca/)** (serving Metro Vancouver & Fraser Valley, BC).

---

## 🌟 Key Features Built for H&H

### 1. ⚡ Automatic 8-Stage Customer Communication Sequence
The CRM automatically triggers SMS and Email messages at every milestone of the customer lifecycle:
1. **When estimate is sent**: *"Hi John, your H&H House Maintenance estimate is ready."*
2. **Estimate reminder**: *"Just following up on your H&H estimate."*
3. **Day before job (24h reminder)**: *"Your H&H service is scheduled for tomorrow at 10:00 AM."*
4. **Crew leaving (Live Dispatch)**: *"Our crew is on the way. ETA: 25 minutes."*
5. **Job completed**: *"Your H&H service has been completed."*
6. **Invoice sent**: *"Your invoice is ready."*
7. **Payment received**: *"Thank you for your payment."*
8. **Review request**: *"How was your experience with H&H?"*

---

### 2. ⭐ Smart Review Management & 5-Star Google Review Funnel
- **Automated Post-Payment Review Prompt**: Triggered automatically when an invoice is marked paid.
- **Smart Review Landing Page (`/review/[id]`)**:
  - Displays: **⭐ How did we do?**
  - Interactive Buttons: **⭐⭐⭐⭐⭐ Excellent** and **Other feedback**.
  - **If 5 Stars Selected**:
    - Triggers confetti celebration.
    - Redirects the customer directly to the official **Google Business Review Page** (`NEXT_PUBLIC_GOOGLE_REVIEW_URL`).
  - **If Lower Rating (1-4 Stars)**:
    - Captures constructive private feedback securely.
    - Immediately alerts H&H management for prompt resolution **without hurting public Google ratings**.
- **CRM Review Tracking Dashboard (`/reviews`)**:
  - Reviews Requested
  - Reviews Received & Response Rate
  - Average Rating (5.0 / 5.0)
  - Google Funnel Conversion Rate
  - Response Status Pipeline: *New, Reviewed, Contacted Client, Resolved*.

---

### 3. 🍁 Automatic Seasonal Reminders & Re-engagement
Predictive maintenance campaigns configured for H&H exterior services:
- **🌸 Spring**:
  - Gutter cleaning
  - House wash (vinyl siding)
  - Driveway power washing
  - Window cleaning
- **☀️ Summer**:
  - Pressure washing (patios/walkways)
  - Lawn care & edging
  - Fence wash & stain prep
  - Deck restoration
- **🍂 Fall**:
  - Gutter cleaning (leaf blockages)
  - Roof cleaning & de-mossing
  - Moss treatment & prevention
- **1-Click Seasonal Blast**: Filters past customers and dispatches personalized reminders with early-bird incentives.

---

### 4. 🏢 Full Operational CRM Capabilities
- **Dashboard (`/`)**: Real-time KPIs, active crew dispatch map/list, revenue collected vs pending, live auto-SMS feed.
- **Customer Directory (`/customers`)**: Property addresses, gate codes, service tags, complete communication logs.
- **Estimates Hub (`/estimates`)**: Quote builder with line items, tax calculator, 1-click approve, convert to job.
- **Jobs & Live Dispatch (`/jobs`)**: Schedule calendar, send 24h reminder, dispatch crew with ETA slider (5–60 mins), mark completed.
- **Invoices & Billing (`/invoices`)**: Invoice generator, online card payment checkout (`/portal/invoice/[id]`), auto receipt & review request.
- **Public Client Portals**:
  - `/portal/estimate/[id]`: Interactive estimate approval.
  - `/portal/invoice/[id]`: Interactive card checkout & payment.
  - `/review/[id]`: Smart 5-Star Google review funnel.
- **CRM Settings (`/settings`)**: Google Review URL configuration, company information, automation switches.

---

## 🚀 Getting Started

### 1. Requirements
- Node.js 18+ (Tested on v22)
- MongoDB running locally (`mongodb://127.0.0.1:27017/hnh_housecrm`) or MongoDB Atlas URI.

### 2. Setup & Environment
Configure `.env.local`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/hnh_housecrm
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_COMPANY_NAME="H&H House Maintenance"
NEXT_PUBLIC_COMPANY_WEBSITE="https://hnhpros.ca/"
NEXT_PUBLIC_COMPANY_PHONE="(604) 555-0199"
NEXT_PUBLIC_COMPANY_EMAIL="info@hnhpros.ca"
NEXT_PUBLIC_GOOGLE_REVIEW_URL="https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4"
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

Click the **"Seed Demo Data"** button in the top header or visit `/api/seed` to instantly load realistic H&H customers, estimates, jobs, invoices, reviews, and seasonal campaigns.
