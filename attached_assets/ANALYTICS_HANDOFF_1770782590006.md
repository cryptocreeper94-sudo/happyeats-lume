# PaintPros.io - Business Analytics Suite Handoff

## Purpose
This document provides a complete technical handoff of the PaintPros.io analytics and business intelligence systems. It contains everything needed for another agent or developer to understand, recreate, or extend the analytics infrastructure.

---

## 1. Platform Context

PaintPros.io is a multi-tenant SaaS platform for painting/home services contractors. The analytics system serves multiple tenants (brands) from a single codebase, filtering all data by `tenantId`.

### Key Tenants
| Tenant ID | Brand | Domain |
|-----------|-------|--------|
| `npp` | Nash PaintPros | nashpaintpros.io |
| `demo` | PaintPros.io (Flagship) | paintpros.io |
| `lumepaint` | Lume Paint Co | lumepaint.co |
| `tlid` | TrustLayer (TLID) | tlid.io |
| `tradeworks` | TradeWorks AI | tradeworksai.io |

All analytics tables include a `tenantId` column for data isolation.

---

## 2. Tech Stack

### Backend
- **Runtime:** Node.js with TypeScript (tsx)
- **Framework:** Express.js
- **ORM:** Drizzle ORM with PostgreSQL (Neon-backed)
- **Schema:** `shared/schema.ts` (Drizzle table definitions + Zod validation)
- **Routes:** `server/routes.ts` (all API endpoints)
- **Storage Layer:** `server/storage.ts` (CRUD interface between routes and database)
- **AI:** OpenAI GPT-4o for predictive analytics

### Frontend
- **Framework:** React 19 + Vite
- **Routing:** wouter
- **Data Fetching:** TanStack React Query v5
- **Charts:** Recharts (AreaChart, BarChart, PieChart)
- **Styling:** Tailwind CSS with custom design system
- **Animations:** Framer Motion
- **Components:** Shadcn/ui (Radix-based)
- **Icons:** lucide-react (never emoji)

### External Integrations
- **Google Analytics 4:** Client-side via `VITE_GA_MEASUREMENT_ID`
- **Meta Graph API:** Facebook/Instagram post insights and ad analytics
- **ip-api.com:** Free geo-lookup for visitor country/city
- **Stripe:** Payment and subscription analytics

---

## 3. Database Schema - Analytics Tables

All tables defined in `shared/schema.ts`. Each uses `drizzle-zod` for insert validation.

### 3.1 Core Web Analytics

#### `page_views` (line ~754)
Tracks every page visit across all tenants.
```
id: varchar PK (uuid)
tenantId: text (default "npp")
page: text NOT NULL          -- /home, /services, /estimate, etc.
referrer: text               -- where visitor came from
userAgent: text              -- raw user agent string
ipHash: text                 -- base64-hashed IP (privacy-safe)
sessionId: text              -- groups views into sessions
deviceType: text             -- "desktop", "mobile", "tablet"
browser: text                -- "Chrome", "Firefox", "Safari", "Edge"
country: text                -- geo-lookup result
city: text                   -- geo-lookup result
duration: integer            -- time on page in seconds
createdAt: timestamp
```

#### `analytics_summary` (line ~779)
Pre-computed daily stats for fast dashboard retrieval.
```
id: varchar PK (uuid)
date: timestamp NOT NULL     -- day of summary
totalViews: integer
uniqueVisitors: integer
avgDuration: integer         -- seconds
bounceRate: decimal(5,2)     -- percentage
topPages: jsonb              -- [{page, views}]
topReferrers: jsonb          -- [{referrer, count}]
deviceBreakdown: jsonb       -- {desktop: x, mobile: y, tablet: z}
createdAt: timestamp
updatedAt: timestamp
```

### 3.2 Marketing Analytics

#### `marketing_analytics` (line ~5531)
Aggregated marketing performance by platform and time period.
```
id: varchar PK (uuid)
tenantId: text NOT NULL
periodType: text             -- 'daily', 'weekly', 'monthly'
periodStart: timestamp
periodEnd: timestamp
platform: text               -- 'instagram', 'facebook', 'nextdoor', 'all'
postsScheduled: integer
postsPublished: integer
imagesUsed: integer
totalImpressions: integer
totalEngagements: integer
totalClicks: integer
engagementRate: real         -- engagements / impressions
clickThroughRate: real       -- clicks / impressions
topCategories: jsonb         -- [{category, count, engagement}]
topPosts: jsonb              -- [{postId, content, engagements}]
createdAt: timestamp
```
Indexed on: tenantId, periodStart, platform

#### `content_analytics` (line ~5876)
Per-post performance snapshots from Meta API.
```
id: varchar PK (uuid)
tenantId: text NOT NULL
postId: varchar FK -> scheduled_posts
snapshotAt: timestamp
impressions: integer
reach: integer
likes: integer
comments: integer
shares: integer
saves: integer
clicks: integer
videoViews: integer
engagementRate: real         -- (likes+comments+shares) / reach * 100
clickThroughRate: real       -- clicks / impressions * 100
```

#### `content_performance_summary` (line ~5907)
Aggregated insights by content type and platform.
```
id: varchar PK (uuid)
tenantId: text NOT NULL
contentType: text            -- 'project_showcase', 'before_after', etc.
contentCategory: text        -- 'interior', 'exterior', etc.
platform: text               -- 'facebook', 'instagram'
totalPosts: integer
avgImpressions: real
avgReach: real
avgEngagementRate: real
avgClickThroughRate: real
bestDayOfWeek: integer       -- 0-6 (Sun-Sat)
bestHourOfDay: integer       -- 0-23
overallScore: real           -- 0-100
lastCalculatedAt: timestamp
```

### 3.3 Marketing Budget & Expenses

#### `marketing_expenses` (line ~5623)
Tracks all marketing spend with ROI attribution.
```
id: varchar PK (uuid)
tenantId: text NOT NULL
title: text NOT NULL         -- "I-24 Billboard - January"
description: text
category: text               -- see MARKETING_EXPENSE_CATEGORIES below
vendor: text                 -- "Lamar Advertising"
amount: decimal(10,2)
budgetedAmount: decimal(10,2)
expenseDate: timestamp
startDate: timestamp         -- for ongoing campaigns
endDate: timestamp
isRecurring: boolean
recurringFrequency: text     -- 'monthly', 'weekly', 'yearly'
campaignName: text
invoiceNumber: text
receiptUrl: text
leadsGenerated: integer      -- attribution
revenueGenerated: decimal(10,2) -- attribution
status: text                 -- 'planned', 'active', 'completed', 'cancelled'
createdBy: text
createdAt: timestamp
updatedAt: timestamp
```

**MARKETING_EXPENSE_CATEGORIES:** billboard, car_wrap, yard_sign, flyer_door_hanger, direct_mail, print_ad, radio, tv, facebook_ads, google_ads, instagram_ads, nextdoor_ads, yelp_ads, homeadvisor, sponsorship, event, promo_item, other

#### `marketing_budgets` (line ~5672)
Monthly budget targets per tenant.
```
id: varchar PK (uuid)
tenantId: text NOT NULL
year: integer
month: integer               -- 1-12
categoryBudgets: jsonb       -- flexible budget by category
totalBudget: decimal(10,2)
```

### 3.4 Predictive Analytics & AI

#### `revenue_predictions` (line ~4087)
AI-generated revenue forecasts using GPT-4o.
```
id: varchar PK (uuid)
tenantId: varchar NOT NULL
predictionPeriod: varchar    -- 'monthly'
periodStart: timestamp
periodEnd: timestamp
predictedRevenue: integer    -- amount in cents
predictedJobs: integer
predictedLeads: integer
confidenceLevel: real        -- 0 to 1
factors: text                -- JSON array of factors
generatedAt: timestamp
```

### 3.5 Marketing Attribution

#### `marketing_channels` (line ~4116)
Tracks marketing channel definitions.
```
id: varchar PK (uuid)
tenantId: varchar NOT NULL
name: varchar                -- "Google Ads", "Facebook", "Referral"
type: varchar                -- 'paid', 'organic', 'referral', 'direct'
platform: varchar
monthlyBudget: integer
isActive: boolean
createdAt: timestamp
```

#### `marketing_attribution` (line ~4131)
Links marketing spend to business outcomes.
```
id: varchar PK (uuid)
tenantId: varchar NOT NULL
channelId: varchar FK -> marketing_channels
period: varchar
spend: integer
impressions: integer
clicks: integer
leadsGenerated: integer
jobsWon: integer
revenueGenerated: integer
costPerLead: integer         -- calculated: spend / leadsGenerated
costPerJob: integer          -- calculated: spend / jobsWon
roi: integer                 -- calculated: ((revenue - spend) / spend) * 100
createdAt: timestamp
```

### 3.6 Business Intelligence

#### `customer_lifetime_values` (line ~4412)
```
id: varchar PK (uuid)
tenantId: varchar NOT NULL
customerId: varchar
totalRevenue: integer
totalJobs: integer
avgJobValue: integer
firstJobDate: timestamp
lastJobDate: timestamp
predictedNextJob: timestamp
lifetimeValue: integer
churnRisk: real              -- 0 to 1
calculatedAt: timestamp
```

#### `demand_forecasts` (line ~4390)
Seasonal demand predictions.

#### `competitor_data` (line ~4436)
Competitor intelligence tracking.

#### `customer_sentiments` (line ~4875)
Customer sentiment analysis.

#### `cashflow_forecasts` (line ~4609)
Cash flow prediction system.

#### `franchise_analytics` (line ~4967)
Per-franchise performance reporting.
```
id: varchar PK (uuid)
tenantId: varchar NOT NULL
reportPeriod: varchar
totalRevenue: integer
totalJobs: integer
avgJobValue: integer
conversionRate: real
customerSatisfaction: real
employeeCount: integer
marketingSpend: integer
costPerLead: integer
topServices: text
growthRate: real
benchmarkComparison: text
insights: text
generatedAt: timestamp
```

### 3.7 CRM Pipeline (feeds into analytics)

#### `crm_deals` (line ~256)
Sales pipeline tracking.
```
tenantId, title, value, stage, probability, expectedCloseDate, 
leadId, assignedTo, source, tags, createdAt, updatedAt
```

#### `crm_activities` (line ~294)
Activity tracking for deals.

#### `crm_notes` (line ~314)
Notes on deals/leads.

---

## 4. API Endpoints

### 4.1 Web Analytics APIs (`server/routes.ts`)

| Method | Endpoint | Description | Line |
|--------|----------|-------------|------|
| POST | `/api/analytics/track` | Track a page view (auto-detects device, browser, geo) | 9586 |
| GET | `/api/analytics/geography` | Geographic breakdown of visitors (by country/city) | 9651 |
| GET | `/api/analytics/tenants` | List available tenants for filtering | 9671 |
| GET | `/api/analytics/dashboard` | Full dashboard data (filterable by tenantId) | 9682 |
| GET | `/api/analytics/live` | Live visitor count (last 5 min) | 9704 |
| GET | `/api/analytics/live-visitors` | Detailed live visitor data with device/browser/page | 9723 |
| GET | `/api/analytics/page/:page` | Analytics for a specific page | 9804 |

### 4.2 Predictive Analytics APIs

| Method | Endpoint | Description | Line |
|--------|----------|-------------|------|
| POST | `/api/predictions/revenue` | Create revenue prediction manually | 7137 |
| GET | `/api/predictions/revenue` | Get predictions for tenant | 7151 |
| POST | `/api/predictions/generate` | AI-generated prediction (GPT-4o) | 7158 |

### 4.3 Marketing Attribution APIs

| Method | Endpoint | Description | Line |
|--------|----------|-------------|------|
| POST | `/api/marketing/channels` | Create marketing channel | 7209 |
| GET | `/api/marketing/channels` | List channels for tenant | 7223 |
| POST | `/api/marketing/attribution` | Create attribution record (auto-calcs ROI) | 7229 |

### 4.4 Meta/Social Analytics APIs

| Method | Endpoint | Description | Line |
|--------|----------|-------------|------|
| GET | `/api/meta/:tenantId/analytics` | Facebook/Instagram analytics | 12944 |
| GET | `/api/meta/:tenantId/ad-insights` | Ad campaign insights | 13112 |
| GET | `/api/meta/:tenantId/ad-campaigns` | Ad campaign list | 13138 |
| GET | `/api/meta/:tenantId/post/:postId/insights` | Individual post performance | 13358 |
| POST | `/api/meta/:tenantId/sync-analytics` | Sync analytics from Meta API | 13418 |
| GET | `/api/meta/:tenantId/performance-summary` | Performance summary | 13553 |
| GET | `/api/marketing/:tenantId/stats` | Marketing dashboard stats | 13157 |
| GET | `/api/marketing/:tenantId/live-posts` | Live posts feed | 13248 |
| GET | `/api/marketing/:tenantId/content-library` | Content library | 13338 |

### 4.5 Budget & Expense APIs

| Method | Endpoint | Description | Line |
|--------|----------|-------------|------|
| GET | `/api/marketing-expenses/:tenantId` | Get expenses for tenant | 14857 |
| POST | `/api/marketing-expenses/:tenantId` | Create expense record | 14898 |

### 4.6 Franchise Analytics APIs

| Method | Endpoint | Description | Line |
|--------|----------|-------------|------|
| GET | `/api/franchise/analytics` | Franchise performance data | 9265 |

---

## 5. Frontend Components

### 5.1 Analytics Dashboard (`client/src/components/analytics-dashboard.tsx` - 591 lines)
The main analytics dashboard component. Features:
- **Live visitors counter** (auto-refreshes every 30 seconds)
- **Today/Week/Month/All-time traffic cards** with views + unique visitors
- **Hourly traffic chart** (AreaChart via Recharts)
- **Daily traffic trend** (AreaChart with views + visitors lines)
- **Top pages table** (sorted by views)
- **Top referrers table** (sorted by count)
- **Device breakdown pie chart** (desktop/mobile/tablet)
- **Geographic breakdown** (country/city data)
- **Metric explanation dialogs** (help icons that explain each metric in plain language)
- Uses `GlassCard` and `BentoGrid` layout components
- Animated with Framer Motion

### 5.2 Tenant Analytics Dashboard (`client/src/components/tenant-analytics-dashboard.tsx` - 416 lines)
Multi-tenant analytics view that shows data for each tenant side-by-side using accordion sections. Each tenant section includes the same metrics as the main dashboard but filtered by `tenantId`.

Tenant colors defined:
- NPP: #1e3a5f (navy)
- PaintPros: #d4a853 (gold)
- ORBIT: #9945FF (purple)

### 5.3 Analytics Hook (`client/src/hooks/useAnalytics.ts` - 83 lines)
Auto-tracking hook that fires on every route change:
- Generates a session ID (persisted in `sessionStorage`)
- POSTs to `/api/analytics/track` on each navigation
- Tracks time-on-page (calculates duration between navigations)
- Uses `navigator.sendBeacon` on page unload for accurate exit tracking
- Also fires Google Analytics 4 tracking if `VITE_GA_MEASUREMENT_ID` is set
- Mounted globally in `App.tsx` via `<AnalyticsTracker />` component

### 5.4 GA4 Integration (`client/src/lib/analytics.ts` - 97 lines)
Google Analytics 4 client-side integration:
- Injects gtag.js script dynamically
- Tracks page views with tenant_id as custom dimension
- Tracks custom events (estimate_submitted, lead_captured, booking_completed)
- Tracks conversion events with value

### 5.5 Live Visitors Card (`client/src/components/live-visitors-card.tsx`)
Standalone component showing real-time visitor count with pulse animation.

---

## 6. Data Flow Architecture

### Page View Tracking Flow
```
User visits page
    -> useAnalytics() hook fires (client/src/hooks/useAnalytics.ts)
    -> POST /api/analytics/track (with page, session, referrer, tenantId)
    -> Server parses user agent (device type, browser)
    -> Server hashes IP (base64, privacy-safe)
    -> Server does geo-lookup via ip-api.com (non-blocking, skips local IPs)
    -> storage.trackPageView() inserts into page_views table
    -> Also fires GA4 trackPageView if configured
```

### Dashboard Data Flow
```
Admin opens analytics dashboard
    -> useQuery fetches GET /api/analytics/dashboard?tenantId=X
    -> storage.getAnalyticsDashboard() queries page_views
    -> Computes: today/week/month/alltime views+visitors
    -> Computes: top pages, top referrers, device breakdown
    -> Computes: hourly traffic, daily traffic trends
    -> Returns aggregated JSON
    -> Auto-refreshes every 30 seconds
```

### Live Visitors Flow
```
Dashboard polls GET /api/analytics/live every 30 seconds
    -> Queries page_views from last 5 minutes
    -> Groups by sessionId to get unique visitors
    -> Filters out bots (regex: bot|crawler|spider|headless|preview|replit)
    -> Returns: total, realVisitors, bots, byDevice, byPage
```

### AI Prediction Flow
```
Admin requests prediction
    -> POST /api/predictions/generate with tenantId + historicalData
    -> Server sends historical data to GPT-4o
    -> GPT-4o returns: predictedRevenue, predictedJobs, predictedLeads, confidenceLevel, factors
    -> Server stores prediction in revenue_predictions table
    -> Returns prediction to frontend
```

### Marketing Attribution Flow
```
Admin creates marketing channel (Google Ads, Facebook, etc.)
    -> POST /api/marketing/channels
Admin logs attribution data (spend, leads, jobs, revenue)
    -> POST /api/marketing/attribution
    -> Server auto-calculates: costPerLead, costPerJob, ROI
    -> Stores in marketing_attribution table
```

### Meta Analytics Sync Flow
```
POST /api/meta/:tenantId/sync-analytics
    -> Fetches post insights from Meta Graph API
    -> For each post: impressions, reach, likes, comments, shares, clicks
    -> Stores snapshots in content_analytics table
    -> Aggregates into content_performance_summary
    -> Updates marketing_analytics period records
```

---

## 7. Storage Interface Methods

The storage layer (`server/storage.ts`) provides these analytics-related methods. Any recreated system should implement these:

```typescript
// Page view tracking
trackPageView(data: InsertPageView): Promise<PageView>
getPageViews(startDate: Date, endDate: Date): Promise<PageView[]>
getPageViewsByPage(page: string): Promise<PageView[]>

// Dashboard aggregation
getAnalyticsDashboard(): Promise<DashboardData>
getAnalyticsDashboardByTenant(tenantId: string): Promise<DashboardData>

// Live visitors
getLiveVisitorCount(): Promise<number>
getLiveVisitorCountByTenant(tenantId: string): Promise<number>

// Geographic data
getGeographicBreakdown(start: Date, end: Date, tenantId?: string): Promise<GeoData[]>

// Tenant management
getAvailableTenants(): Promise<string[]>

// Predictions
createRevenuePrediction(data: InsertRevenuePrediction): Promise<RevenuePrediction>
getRevenuePredictions(tenantId: string): Promise<RevenuePrediction[]>

// Marketing channels
createMarketingChannel(data: InsertMarketingChannel): Promise<MarketingChannel>
getMarketingChannels(tenantId: string): Promise<MarketingChannel[]>

// Marketing attribution
createMarketingAttribution(data: InsertMarketingAttribution): Promise<MarketingAttribution>
```

---

## 8. UI/UX Design System

### Design Principles
- **Ultra Premium:** Glassmorphism, glow effects, subtle animations
- **Dark Premium Aesthetic:** Navy (#0f172a) backgrounds with white text
- **NO green or cream colors anywhere** (hard rule)
- **Icons only:** lucide-react icons, never emoji
- **Mobile-first responsive** using Tailwind breakpoints

### Key UI Components Used
- `GlassCard` - Frosted glass card with backdrop blur and glow borders
- `BentoGrid` / `BentoItem` - Dashboard grid layout system
- `Recharts` - AreaChart, BarChart, PieChart for data visualization
- `Dialog` - Modal explanations for each metric
- `Accordion` - Collapsible tenant sections in multi-tenant view

### Chart Color Palette
```
Desktop: #f59e0b (amber)
Mobile: #3b82f6 (blue)
Tablet: #0ea5e9 (sky)
Area fills: blue-500/20 with blue-500 stroke
Bar charts: amber-500
```

### Animation Patterns
- Cards fade in with `motion.div` (initial opacity 0, y offset)
- Staggered children animations (0.1s delay between items)
- Pulse animation on live visitor count
- 30-second auto-refresh with loading spinner on refetch

### Metric Explanation System
Each metric card has a help icon (HelpCircle) that opens a dialog with:
- **Title:** Plain language name
- **Description:** What the metric means
- **Details:** Bullet points explaining how it's calculated
- **Tips:** Actionable advice for the business owner

This is critical because the target user is a non-technical painting contractor.

---

## 9. Environment Variables

### Required for Analytics
| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection (auto-set by Replit) |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics 4 measurement ID (optional) |

### Required for Meta Analytics
| Variable | Purpose |
|----------|---------|
| Meta integration tokens | Stored in `meta_integrations` table per tenant |

### Required for AI Predictions
| Variable | Purpose |
|----------|---------|
| OpenAI API key | Used via Replit AI integrations (auto-configured) |

---

## 10. What Exists vs What Needs Building

### Already Built (Working)
- Page view tracking with full pipeline (hook -> API -> DB)
- Live visitor counter with bot filtering
- Dashboard with today/week/month/alltime aggregation
- Device/browser/geographic breakdown
- Hourly and daily traffic charts
- Top pages and referrers
- Multi-tenant filtering on all analytics
- Google Analytics 4 dual-tracking
- Revenue prediction with GPT-4o
- Marketing channel and attribution tracking
- Meta post insights syncing
- Marketing expense tracking with ROI
- Franchise analytics reporting

### Could Be Extended (Business Suite Gaps)
- **Real-time revenue dashboard** - CRM deals exist but no live revenue chart
- **Lead-to-close funnel visualization** - Data exists in leads + estimates + bookings tables but no funnel UI
- **Automated daily/weekly email reports** - Resend integration exists but no scheduled analytics emails
- **Customer lifetime value dashboard** - Table exists, no frontend component
- **Competitor benchmarking UI** - Table exists, no frontend component
- **Cash flow forecasting UI** - Table exists, no frontend component
- **A/B testing for marketing content** - Content library exists, no split testing
- **Heatmap/scroll depth tracking** - Not implemented
- **Conversion goal tracking** - GA4 events exist but no custom goal dashboard

---

## 11. Key Patterns to Follow

### Multi-Tenant Isolation
Every query MUST filter by `tenantId`. Never return cross-tenant data unless the user is a platform admin.

### Drizzle ORM Pattern
```typescript
// Schema definition
export const myTable = pgTable("my_table", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: text("tenant_id").notNull(),
  // ... fields
}, (table) => [index("idx_my_table_tenant").on(table.tenantId)]);

export const insertMyTableSchema = createInsertSchema(myTable).omit({ id: true, createdAt: true });
export type InsertMyTable = z.infer<typeof insertMyTableSchema>;
export type MyTable = typeof myTable.$inferSelect;
```

### API Route Pattern
```typescript
app.get("/api/my-data", async (req, res) => {
  try {
    const tenantId = (req.query.tenantId as string) || "demo";
    const data = await storage.getMyData(tenantId);
    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});
```

### Frontend Query Pattern
```typescript
const { data, isLoading, refetch } = useQuery<MyDataType>({
  queryKey: ["/api/my-data", tenantId],
  queryFn: async () => {
    const res = await fetch(`/api/my-data?tenantId=${tenantId}`);
    if (!res.ok) throw new Error("Failed");
    return res.json();
  },
  refetchInterval: 30000, // auto-refresh for live data
});
```

### Privacy Pattern
- Never store raw IP addresses - hash them with base64
- Geo-lookup is non-blocking and skips local/private IPs
- Session IDs are generated client-side and stored in sessionStorage
- Bot traffic is filtered out of visitor counts

---

## 12. File Reference Map

| File | Purpose | Lines |
|------|---------|-------|
| `shared/schema.ts` | All database table definitions | ~6,347 |
| `server/routes.ts` | All API endpoints | ~15,635 |
| `server/storage.ts` | Database CRUD interface | ~4,193 |
| `client/src/hooks/useAnalytics.ts` | Auto page-view tracking hook | 83 |
| `client/src/lib/analytics.ts` | Google Analytics 4 integration | 97 |
| `client/src/components/analytics-dashboard.tsx` | Main analytics dashboard | 591 |
| `client/src/components/tenant-analytics-dashboard.tsx` | Multi-tenant analytics view | 416 |
| `client/src/components/live-visitors-card.tsx` | Real-time visitor widget | ~100 |
| `client/src/config/tenant.ts` | Tenant configuration (1,041 lines) | 1,041 |
| `client/src/context/TenantContext.tsx` | Tenant React context provider | 84 |

---

*Last updated: February 11, 2026*
*Platform: PaintPros.io by Orbit*
