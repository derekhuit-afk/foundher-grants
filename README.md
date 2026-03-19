# FoundHer Grants

> The only grant discovery and application platform built exclusively for women-owned and Indigenous-owned businesses.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Payments**: Stripe (Subscriptions)
- **AI Engine**: Anthropic Claude API (claude-sonnet-4-20250514)
- **Email**: Resend
- **Deploy**: Vercel

---

## Setup Guide

### 1. Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor → paste and run `supabase-schema.sql`
3. Copy your project URL and keys to `.env.local`

### 2. Stripe

1. Create products in Stripe Dashboard:
   - **Tier 1**: $29/month recurring → copy Price ID
   - **Tier 2**: $199/month recurring → copy Price ID
2. Set up webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
3. Copy webhook secret to `.env.local`

### 3. Anthropic

1. Get API key from [console.anthropic.com](https://console.anthropic.com)
2. Add to `.env.local`

### 4. Resend

1. Create account at [resend.com](https://resend.com)
2. Add and verify your domain
3. Copy API key to `.env.local`

### 5. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

### 6. Local Development

```bash
npm install
npm run dev
```

### 7. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_PUBLISHABLE_KEY
vercel env add STRIPE_WEBHOOK_SECRET
vercel env add STRIPE_TIER1_PRICE_ID
vercel env add STRIPE_TIER2_PRICE_ID
vercel env add ANTHROPIC_API_KEY
vercel env add RESEND_API_KEY
vercel env add RESEND_FROM_EMAIL
vercel env add NEXT_PUBLIC_APP_URL
vercel env add ADMIN_EMAILS
vercel env add CRON_SECRET

# Production deploy
vercel --prod
```

---

## Architecture

### AI Agent Pipeline (6 agents)

```
CLIENT INTAKE AGENT      → Loads Founder Intelligence Profile (FIP)
GRANT RESEARCH AGENT     → Fetches full grant specification (GSO)
ELIGIBILITY AGENT        → Validates eligibility, surfaces certification gaps
NARRATIVE WRITING AGENT  → Claude API writes all narrative sections
PACKAGE ASSEMBLY AGENT   → Formats, QC checks, compiles full package
DELIVERY AGENT           → Saves to portal, triggers notifications
```

### Subscription Tiers

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | Browse only |
| Tier 1 — Database | $29/month | Full database access, search, save, alerts |
| Tier 2 — Concierge | $199/month (12-mo min) | AI writes complete applications |

### Database Tables

- `profiles` — User accounts + subscription state
- `founder_profiles` — Founder Intelligence Profile (FIP)
- `grants` — Curated grant database (300+ at launch)
- `saved_grants` — User bookmarks + status tracking
- `applications` — Tier 2 AI-generated application packages
- `grant_scores` — Cached match scores per user/grant
- `alert_preferences` — Email notification settings

---

## Admin Access

Set `ADMIN_EMAILS` env var to comma-separated admin email addresses.
Admin dashboard: `/admin`

## Weekly Digest Cron

Runs every Monday at 8am via Vercel Cron (`vercel.json`).
Manually trigger: `GET /api/digest` with `Authorization: Bearer {CRON_SECRET}`

---

Built by FoundHer Grants. For women-owned and Indigenous-owned businesses.
