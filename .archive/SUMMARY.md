# Survivor Fantasy Season 50 - Development Summary

**Generated:** December 19, 2024
**Updated:** December 19, 2024
**Target Launch:** Before February 25, 2026 (Season 50 Premiere)
**Plan File:** `/Users/richard/.claude/plans/rustling-prancing-tarjan.md`

---

## Session Accomplishments

### Completed This Session
| Task | Details |
|------|---------|
| **Auth0 Backend Migration** | Removed local JWT auth, implemented Auth0 JWKS validation |
| **Auth0 Web Frontend** | Login, Signup, ForgotPassword, Auth0Callback, AuthContext all updated |
| **Auth0 Mobile** | AuthContext + LoginScreen using react-native-auth0 |
| **Frontend Pages Verified** | MyLeagues, CreateLeague, JoinLeague, GlobalLeaderboard all exist and complete |
| **Multi-League Backend** | picks.ts updated to filter by leagueId |
| **Multi-League Frontend** | WeeklyPicks, Dashboard, Leaderboard, DraftResults all use LeagueSwitcher |

### Auth0 Migration Details
```
✅ Removed /signup endpoint from server/auth.ts
✅ Removed /login endpoint from server/auth.ts
✅ Removed /forgot-password endpoint from server/auth.ts
✅ Removed /reset-password endpoint from server/auth.ts
✅ Added Auth0 JWKS token validation middleware
✅ Added /auth0-sync endpoint for user creation/sync
✅ Updated AuthContext to use Auth0 hooks
✅ Login.tsx now uses Auth0 loginWithRedirect
✅ Signup.tsx now uses Auth0 with screen_hint='signup'
✅ TypeScript compilation verified
```

### Previous Session Accomplishments
| Task | Details |
|------|---------|
| **CEREBRO Analysis** | Read Skills #3, #4, #8, #9, #10, #15, #19, #43-45, #52, #55, #65, #103 |
| **Codebase Assessment** | Full production readiness audit (5/10 score) |
| **Launch Plan Created** | 8-phase plan saved to plan file |
| **render.yaml Fixed** | Removed `--accept-data-loss`, secured DATABASE_URL |
| **Database Optimizations** | Added 6 indexes + LeaderboardCache table |
| **Migration System Fixed** | Baseline migration created, clean state |
| **Linear MCP Installed** | Added to Claude config |

### Database Optimizations Applied
```
✅ Castaway.eliminated index
✅ Castaway.tribe index
✅ DraftPick.castawayId index
✅ DraftPick.userId index
✅ RankingEntry.castawayId index
✅ LeaderboardCache table (solves weeks-in-first TODO)
```

---

## Current Codebase State

| Component | Status | Notes |
|-----------|--------|-------|
| **Backend APIs** | 85% | Multi-league done, scoring works, picks league-scoped |
| **Web Frontend** | 85% | All league pages complete, multi-league UI ready |
| **Mobile App** | 60% | Auth0 complete, missing: push notifications, offline sync |
| **Auth** | 100% | **Auth0 COMPLETE for web + mobile** |
| **Payments** | 0% | Stripe not integrated |
| **Testing** | 2% | Minimal tests, no CI/CD |
| **Monitoring** | 3% | Console logging only |

---

## Next Priority: Stripe Integration

### Phase 3: Stripe + Charity (Next Up)
- Install Stripe dependencies
- Add STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY to env
- Create server/routes/payments.ts
- Implement Checkout for league join

### Also Pending
- Dynu DNS integration for custom domain
- Season 50 castaways (cast not yet announced - returnee season)
- FE-009: Fix weeks-in-first TODO in Leaderboard.tsx:64

---

## Master Todo List

### Phase 1: Foundation (Week 1-2)

#### Auth0 Migration (COMPLETE - Web + Mobile)
```
[x] AUTH-001: Remove /signup endpoint from server/auth.ts
[x] AUTH-002: Remove /login endpoint from server/auth.ts
[x] AUTH-003: Remove /forgot-password endpoint from server/auth.ts
[x] AUTH-004: Remove /reset-password endpoint from server/auth.ts
[x] AUTH-005: Configure Auth0 application (already configured in render.yaml)
[x] AUTH-006: Set up Auth0 API (backend) - JWKS validation implemented
[x] AUTH-007: Configure Auth0 rules/actions for user sync - /auth0-sync endpoint
[x] AUTH-008: Wire up Auth0Provider in client/src/main.tsx
[x] AUTH-009: Install react-native-auth0 in mobile
[x] AUTH-010: Configure Auth0 in mobile AuthContext + LoginScreen
[x] AUTH-011: Implement Auth0 token validation middleware
[x] AUTH-012: Remove password field requirement from User model (password now nullable)
```

#### Database Tasks
```
[~] DB-001: Season 50 castaways - NOT YET ANNOUNCED (returnee season, add closer to Feb 2026)
[ ] DB-002: Create Season 50 entry with status COLLECTING (when cast announced)
[ ] DB-003: Implement LeaderboardCache update trigger/function
[ ] DB-004: Add Redis for leaderboard caching (CEREBRO #04)
```

### Phase 2: Frontend Completion (Week 2-3)
```
[x] FE-001: Create MyLeagues page (client/src/pages/MyLeagues.tsx)
[x] FE-002: Create CreateLeague page with charity toggle
[x] FE-003: Create JoinLeague page with payment flow placeholder
[x] FE-004: Create GlobalLeaderboard page
[x] FE-005: Add league switcher dropdown to Dashboard
[x] FE-006: Add league switcher to Leaderboard
[x] FE-007: Scope WeeklyPicks to selected league
[x] FE-008: Show draft results for selected league
[ ] FE-009: Fix weeks-in-first TODO in Leaderboard.tsx:64
```

### Phase 3: Stripe + Charity (Week 3-4)
```
[ ] PAY-001: Install stripe, @stripe/stripe-js, @stripe/react-stripe-js
[ ] PAY-002: Add STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY to env
[ ] PAY-003: Create server/routes/payments.ts
[ ] PAY-004: Add Payment model to Prisma schema
[ ] PAY-005: Add CharityPayout model to Prisma schema
[ ] PAY-006: Add entryFee, charityEnabled fields to League model
[ ] PAY-007: Add favoriteCharity, charityUrl fields to User model
[ ] PAY-008: Implement Stripe Checkout for league join
[ ] PAY-009: Implement webhook handler with signature validation
[ ] PAY-010: Create admin "Pending Payouts" dashboard
[ ] PAY-011: Implement "Mark as Paid" functionality
[ ] PAY-012: Add payment confirmation email template
```

### Phase 4: Mobile Completion (Week 4-5)
```
[ ] MOB-001: Complete expo-notifications setup
[ ] MOB-002: Add device token storage to User model
[ ] MOB-003: Create server push notification sending logic
[ ] MOB-004: Implement pick reminder notifications
[ ] MOB-005: Implement score update notifications
[ ] MOB-006: Complete OfflineProvider sync logic
[ ] MOB-007: Create league management screens
[ ] MOB-008: Create payment/join league flow
[ ] MOB-009: Create charity selection screen
[ ] MOB-010: Improve error screens
```

### Phase 5: Production Hardening (Week 5-6)
```
[ ] HARD-001: Add Sentry to server/index.ts
[ ] HARD-002: Implement structured JSON logging
[ ] HARD-003: Enhanced global error handler with context
[ ] HARD-004: Database connection retry logic
[ ] HARD-005: Create .github/workflows/ci.yml
[ ] HARD-006: Add test step to CI pipeline
[ ] HARD-007: Add lint step to CI pipeline
[ ] HARD-008: Add type-check step to CI pipeline
[ ] HARD-009: Write integration tests for auth flow
[ ] HARD-010: Write integration tests for payment flow
[ ] HARD-011: Write integration tests for pick/score workflow
[ ] HARD-012: Add CSRF protection
[ ] HARD-013: Move SMS rate limiting to Redis
[ ] HARD-014: Load testing with Artillery/k6
```

### Phase 6: Growth Features (Week 6-7)
```
[ ] GROW-001: One-tap league invites with tracking
[ ] GROW-002: Pre-written share messages
[ ] GROW-003: Shareable score graphics generator
[ ] GROW-004: K-factor tracking implementation
[ ] GROW-005: Streak mechanics
[ ] GROW-006: Weekly pick reminders (push + email)
[ ] GROW-007: Comeback mechanics for trailing players
[ ] GROW-008: Onboarding flow: Welcome → Auth0 → Join/Create → Tutorial
[ ] GROW-009: Just-in-time tooltips
[ ] GROW-010: Empty states with CTAs
```

### Phase 7: Launch Prep (Week 7-8)
```
[ ] LAUNCH-001: iOS App Store listing draft
[ ] LAUNCH-002: Google Play Store listing draft
[ ] LAUNCH-003: Create app screenshots (Draft, Scoring, Leaderboard, Charity)
[ ] LAUNCH-004: Update privacy policy for payments
[ ] LAUNCH-005: Submit iOS for review
[ ] LAUNCH-006: Submit Android for review
[ ] LAUNCH-007: Create landing page
[ ] LAUNCH-008: Set up support email
[ ] LAUNCH-009: Create FAQ
[ ] LAUNCH-010: Prepare launch email sequence
[ ] LAUNCH-011: Schedule social posts
```

### Phase 8: Testing (Week 8-9)
```
[ ] TEST-001: Sign up with required fields only
[ ] TEST-002: Sign up with all fields
[ ] TEST-003: Character limit validation
[ ] TEST-004: Profile update
[ ] TEST-005: Admin view
[ ] TEST-006: Username in rankings
[ ] TEST-007: Complete user flow (signup → rank → draft → picks → scores)
[ ] TEST-008: Draft Manager functionality
[ ] TEST-009: Profile page width consistency
[ ] TEST-010: Image paths & Game Tracker
[ ] TEST-011: Payment flow end-to-end
[ ] TEST-012: Charity selection flow
```

---

## Key Files Reference

| Purpose | File Path |
|---------|-----------|
| Launch Plan | `/Users/richard/.claude/plans/rustling-prancing-tarjan.md` |
| Auth (to modify) | `server/auth.ts` |
| Schema | `prisma/schema.prisma` |
| Render Config | `render.yaml` |
| Web Entry | `client/src/main.tsx` |
| Mobile Entry | `mobile/App.tsx` |
| CEREBRO Index | `/Users/richard/Projects/CEREBRO/CEREBRO-INDEX.md` |

---

## Timeline

| Week | Focus | Key Milestone |
|------|-------|---------------|
| 1-2 | Auth0 + Database | Single auth system working |
| 2-3 | Frontend | All league pages live |
| 3-4 | Stripe | Paid leagues with charity |
| 4-5 | Mobile | Both platforms complete |
| 5-6 | Hardening | Tests + monitoring |
| 6-7 | Growth | Viral mechanics |
| 7-8 | Launch Prep | App store submission |
| 8-9 | Testing | QA + buffer |

---

## CEREBRO Skills Applied

| Skill | Application |
|-------|-------------|
| #03 PostgreSQL Advanced | Indexes, LeaderboardCache denormalization |
| #04 Redis Caching | Leaderboard caching (pending) |
| #08 Authentication Flows | Auth0 migration design |
| #09 Stripe Payments | Charity donation flow design |
| #10 Push Notifications | Mobile notification plan |
| #15 Database Optimization | Query optimization, indexes |
| #19 App Store Optimization | Launch prep checklist |
| #43 Gamification | Streak mechanics, engagement |
| #44 Retention Mechanics | Pick reminders, comebacks |
| #45 Viral Loops | League invites, sharing |
| #52 User Onboarding | Flow design |
| #55 Referral Mechanics | K-factor tracking |
| #65 Landing Pages | Launch page design |
| #103 Seasonal Infrastructure | Multi-season architecture |

---

## MCP Servers to Use Next Session

1. **Linear** - Sync all todos above
2. **Auth0** - Configure authentication
3. **Dynu** - DNS configuration

---

## Charity Flow Design (Approved)

**Approach:** Manual payout by admin (MVP)

1. League admin enables "charity pot" when creating league
2. League admin sets entry fee ($5-$50)
3. Users select favorite charity name + URL when joining paid league
4. Payments collected via Stripe Checkout
5. End of season: Admin manually donates to winner's charity
6. Admin clicks "Mark as Paid" to record completion
7. Auto-generate social proof: "This season, players donated $X to charities"
8. Winner notification email: "We've donated $X to [Charity] in your name"

**Future (v2):** Integrate Every.org API for automated donations

---

## Success Metrics (from CEREBRO)

| Metric | Target |
|--------|--------|
| D1 Retention | 40%+ |
| D7 Retention | 20%+ |
| Signup → Core Action | 50%+ |
| K-factor (viral) | 0.7+ |
| App Store Rating | 4.5+ |
| Crash Rate | <1% |

---

*Ready to restart session and continue with Auth0 + Dynu integration using MCPs*
