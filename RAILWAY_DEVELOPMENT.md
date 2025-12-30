# Railway CLI Development Workflow

**Last Updated:** Dec 29, 2025

## Overview

This project uses **Railway CLI** for local development instead of `.env` files. This provides:
- ✅ Production parity (same env vars as deployed services)
- ✅ No secrets in git (`.env` never committed)
- ✅ Single source of truth (Railway dashboard)
- ✅ Team synchronization (everyone uses same config)

---

## Prerequisites

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
# or
brew install railway
```

### 2. Login to Railway
```bash
railway login
```

### 3. Link Your Project
```bash
# In the root directory
railway link

# Select:
# - Project: rgfl-survivor
# - Environment: production (or development if you have one)
```

**Note:** Each directory (`/server`, `/web`) can be linked to a different Railway service.

---

## Development Workflow

### Start Backend (Server)
```bash
cd server
npm run dev  # Uses: railway run tsx watch src/server.ts
```

This automatically injects all environment variables from Railway:
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`, `RESEND_API_KEY`
- `TWILIO_*` credentials
- All other production env vars

### Start Frontend (Web)
```bash
cd web
npm run dev  # Uses: railway run vite
```

Vite will pick up `VITE_*` prefixed environment variables from Railway.

### Fallback: Local Development Without Railway
If you need to run without Railway (e.g., offline or testing):

```bash
# Backend
cd server
npm run dev:local  # Plain tsx watch (requires manual env vars)

# Frontend
cd web
npm run dev:local  # Plain vite (requires .env file)
```

---

## Railway Service Architecture

Your Railway project has multiple services:

| Service | Directory | Purpose |
|---------|-----------|---------|
| **survivor-api** | `/server` | Express backend API |
| **survivor-web** | `/web` | React frontend (Vite) |

### Linking to Specific Services

If you need to link to a specific service:

```bash
cd server
railway link
# Select: rgfl-survivor → production → survivor-api

cd ../web
railway link
# Select: rgfl-survivor → production → survivor-web
```

---

## Environment Variables Management

### View Current Variables
```bash
railway variables
```

### Add/Update Variables
```bash
# Via Railway Dashboard (recommended)
https://railway.app/project/your-project-id

# Or via CLI
railway variables set KEY=value
```

### Local Override (Temporary)
If you need to override a variable temporarily:

```bash
CUSTOM_VAR=override railway run npm run dev
```

---

## Common Issues & Solutions

### Issue: "No project linked"
```bash
# Solution: Link the project
railway link
```

### Issue: "Authentication required"
```bash
# Solution: Login to Railway
railway login
```

### Issue: Variables not loading
```bash
# Solution: Check you're linked to the right service
railway status

# Re-link if needed
railway unlink
railway link
```

### Issue: Different service context
```bash
# Each directory can be linked to a different service
# Check which service you're linked to:
railway status

# Change service:
railway link
```

---

## Production Deployment

Production doesn't use Railway CLI - it uses Railway's automatic deployments:

### Backend (survivor-api)
- **Trigger:** Push to `main` branch
- **Build:** `npm run build` (TypeScript → JavaScript)
- **Start:** `npm start` (runs `node dist/server.js`)
- **Env vars:** Injected by Railway automatically

### Frontend (survivor-web)
- **Trigger:** Push to `main` branch
- **Build:** `npm run build` (Vite build)
- **Start:** `npm start` (serves static files)
- **Env vars:** `VITE_*` vars baked into build

---

## Why No .env Files?

### Old Approach (Problems)
```
❌ .env files committed to git (security risk)
❌ Secrets out of sync between team members
❌ Production vs development config mismatch
❌ Manual updates when secrets rotate
```

### New Approach (Railway CLI)
```
✅ No secrets in git (protected)
✅ Always in sync with production
✅ Automatic secret rotation
✅ Team collaboration simplified
```

---

## Migration from .env

If you have old `.env` files:

1. **Deleted:** `server/.env`, `web/.env` (removed Dec 29, 2025)
2. **Kept:** `.env.example` files (for documentation)
3. **Blocked:** `.gitignore` prevents `.env` commits

### If you need to create .env.example
```bash
# Export current Railway variables
railway variables > .env.example

# Then manually remove sensitive values
```

---

## Team Onboarding

New developer setup:

```bash
# 1. Clone repo
git clone https://github.com/your-org/reality-games-survivor.git
cd reality-games-survivor

# 2. Install dependencies
cd server && npm install
cd ../web && npm install

# 3. Install Railway CLI
npm install -g @railway/cli

# 4. Login and link
railway login
railway link

# 5. Start development
cd server && npm run dev  # Terminal 1
cd web && npm run dev      # Terminal 2
```

**That's it!** No manual .env file creation needed.

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `railway login` | Authenticate with Railway |
| `railway link` | Link current directory to Railway service |
| `railway status` | Show current project/service |
| `railway variables` | List all environment variables |
| `railway run <command>` | Run command with Railway env vars |
| `railway unlink` | Disconnect current directory |
| `npm run dev` | Start dev server (uses Railway) |
| `npm run dev:local` | Start dev server (no Railway) |

---

## Support

- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **Internal docs:** See `CLAUDE.md` for project specifics
