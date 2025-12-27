# Survivor Fantasy League

## Project Overview

Fantasy sports app for CBS Survivor TV show. Players draft castaways, make weekly picks, and compete in leagues.

## Tech Stack

| Layer | Technology | Service |
|-------|------------|---------|
| **Frontend** | React + Vite + Tailwind | Railway |
| **Backend** | Express + TypeScript | Railway (`rgfl-api`) |
| **Database** | PostgreSQL | Supabase |
| **Auth** | Supabase Auth | Supabase |
| **Realtime** | WebSocket subscriptions | Supabase Realtime |
| **Payments** | Stripe Checkout | Stripe |
| **Email** | Resend | Resend |
| **SMS** | Twilio | Twilio |
| **DNS** | Dynu | Dynu |
| **Hosting** | Railway | Railway |

## Live URLs

| Service | URL |
|---------|-----|
| Web App | https://survivor.realitygamesfantasyleague.com |
| API | https://rgfl-api-production.up.railway.app |
| Health Check | https://rgfl-api-production.up.railway.app/health |

## Railway Configuration

**Project:** `rgfl-survivor`
**Services:**
- `rgfl-api` - Express backend (deploys from `/server`)

**Deploy Command:**
```bash
cd server && railway up --detach
```

## Supabase Configuration

**Project Ref:** `qxrgejdfxcvsfktgysop`
**MCP Server:** `https://mcp.supabase.com/mcp?project_ref=qxrgejdfxcvsfktgysop`

## Dynu DNS Configuration

Dynu manages DNS for all domains. Configure via API or dashboard.

**Domains:**
- `realitygamesfantasyleague.com` - Main domain
- `survivor.realitygamesfantasyleague.com` - App subdomain
- `rgfl.app` - Short URL (redirects)
- `rgflapp.com` - Alt domain (redirects)

**DNS Script:** `scripts/configure-dynu-dns.sh`

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
│  React Web (Vite)  |  React Native (Expo)  |  SMS Commands      │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   Supabase    │    │  Express API  │    │    Twilio     │
│               │    │   (Railway)   │    │   (Webhooks)  │
│ • Auth        │    │               │    │               │
│ • REST API    │    │ • Scoring     │    │ • PICK cmd    │
│ • Realtime    │    │ • Draft algo  │    │ • STATUS cmd  │
│ • Storage     │    │ • Waivers     │    │ • TEAM cmd    │
└───────┬───────┘    └───────┬───────┘    └───────────────┘
        │                    │
        └────────┬───────────┘
                 ▼
        ┌───────────────┐
        │   PostgreSQL  │
        │  (Supabase)   │
        └───────────────┘
```

## Folder Structure

```
rgfl-survivor/
├── server/                   # Express API (Railway)
│   ├── src/
│   │   ├── server.ts         # Entry point
│   │   ├── config/           # Supabase, Stripe, Twilio
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Auth, rate limiting
│   │   ├── emails/           # Email templates
│   │   └── jobs/             # Scheduled tasks
│   ├── Dockerfile            # Railway build
│   └── package.json
├── web/                      # React frontend
│   ├── src/
│   │   ├── pages/            # Route components
│   │   ├── components/       # Shared UI
│   │   └── lib/              # Supabase client, utils
│   └── package.json
├── mobile/                   # React Native (Expo)
├── scripts/                  # DNS, deployment scripts
├── Dockerfile                # Root Dockerfile
├── railway.json              # Railway config
└── CLAUDE.md                 # This file
```

## Environment Variables

### Server (.env)
```env
# Supabase
SUPABASE_URL=https://qxrgejdfxcvsfktgysop.supabase.co
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Server
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://rgfl.app
BASE_URL=https://api.rgfl.app
APP_URL=https://rgfl.app
ENABLE_SCHEDULER=true

# Email (Resend)
RESEND_API_KEY=

# SMS (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=+14247227529

# Payments (Stripe)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PUBLISHABLE_KEY=

# DNS (Dynu) - for scripts only
DYNU_API_KEY=
DYNU_CLIENT_ID=
DYNU_CLIENT_SECRET=
```

## Key Dates (Season 50)

| Event | Date | Time (PST) |
|-------|------|------------|
| Registration Opens | Dec 19, 2025 | 12:00 PM |
| Draft Order Deadline | Jan 5, 2026 | 12:00 PM |
| Registration Closes | Feb 25, 2026 | 5:00 PM |
| Premiere | Feb 25, 2026 | 8:00 PM |
| Draft Deadline | Mar 2, 2026 | 8:00 PM |
| Finale | May 27, 2026 | 8:00 PM |

## Weekly Rhythm

```
Wednesday 3:00 PM  →  Picks lock
Wednesday 8:00 PM  →  Episode airs
Friday 12:00 PM    →  Results posted
Saturday 12:00 PM  →  Waiver window opens
Wednesday 3:00 PM  →  Waiver window closes / Next picks due
```

## Game Rules

| Mechanic | Rule |
|----------|------|
| Roster Size | 2 castaways per player |
| Draft | Snake draft, async, deadline Mar 2 8pm PST |
| Weekly Picks | 1 castaway from roster per week, locks Wed 3pm |
| Auto-Pick | System picks highest-ranked available if missed |
| Waiver Priority | Inverse standings (last place picks first) |
| Scoring | 100+ rules, admin enters per episode |
| Private Leagues | 12 players max, code-based join |
| Global League | All users auto-enrolled |

## API Routes

### Health & Status
```
GET  /health                    → { status: 'ok' }
```

### Auth & Profile
```
GET   /api/me                   → Current user + leagues
PATCH /api/me/phone             → Update phone
POST  /api/me/verify-phone      → Verify SMS code
PATCH /api/me/notifications     → Update preferences
GET   /api/me/payments          → Payment history
```

### Leagues
```
POST  /api/leagues              → Create league
POST  /api/leagues/:id/join     → Join league
GET   /api/leagues/:id/standings → League standings
PATCH /api/leagues/:id/settings → Update settings (commissioner)
```

### Draft
```
GET   /api/leagues/:id/draft/state  → Draft state
POST  /api/leagues/:id/draft/pick   → Make pick
POST  /api/leagues/:id/draft/set-order → Set draft order
```

### Weekly Picks
```
POST  /api/leagues/:id/picks        → Submit pick
GET   /api/leagues/:id/picks/current → Current week status
```

### Scoring (Admin)
```
POST  /api/episodes/:id/scoring/start    → Begin session
POST  /api/episodes/:id/scoring/save     → Save progress
POST  /api/episodes/:id/scoring/finalize → Finalize scores
```

### Webhooks
```
POST  /webhooks/sms      → Twilio inbound
POST  /webhooks/stripe   → Stripe events
```

## Database Tables (16)

| Table | Purpose |
|-------|---------|
| users | Accounts, links to Supabase Auth |
| seasons | Season metadata, key dates |
| episodes | 14 per season, air dates, deadlines |
| castaways | Up to 24 per season, status |
| scoring_rules | 100+ rules with point values |
| leagues | User-created + global league |
| league_members | Players in leagues, standings |
| rosters | Draft results (2 castaways per player) |
| weekly_picks | 1 pick per player per week |
| waiver_rankings | Player preferences |
| waiver_results | Processed transactions |
| episode_scores | Scores per castaway per rule |
| scoring_sessions | Track scoring entry status |
| notifications | Email/SMS/push log |
| sms_commands | Inbound SMS log |
| payments | Stripe payment records |

## Commands

```bash
# Development
cd server && npm run dev        # Start API server
cd web && npm run dev           # Start web frontend

# Build
cd server && npm run build      # Build TypeScript
cd web && npm run build         # Build React app

# Deploy
cd server && railway up --detach  # Deploy API to Railway

# Database
npx supabase db push            # Push migrations
npx supabase gen types          # Generate TypeScript types
```

## SMS Commands

| Command | Format | Example |
|---------|--------|---------|
| PICK | `PICK [name]` | `PICK Boston Rob` |
| STATUS | `STATUS` | Shows current pick status |
| TEAM | `TEAM` | Shows current roster |

## Critical Constraints

1. **Picks lock Wed 3pm PST** — Cannot be undone
2. **Draft deadline is hard** — Auto-complete triggers at Mar 2 8pm
3. **Waiver is inverse snake** — Last place picks first
4. **Scoring rules are global** — Same for all leagues
5. **RLS enforced** — Backend uses service role for system ops
