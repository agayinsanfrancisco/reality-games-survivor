# Reality Games Fantasy League - Website Flow Diagrams

## Overview

This document describes the major user flows through the RGFL platform.

---

## 1. User Onboarding Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER ONBOARDING                              │
└─────────────────────────────────────────────────────────────────────┘

    [Landing Page]
         │
         ▼
    ┌─────────────┐     ┌─────────────┐
    │   Sign Up   │────▶│  Verify     │
    │   (Email)   │     │  Email      │
    └─────────────┘     └─────────────┘
         │                    │
         ▼                    ▼
    ┌─────────────────────────────────┐
    │       Profile Setup             │
    │  - Display Name                 │
    │  - Hometown                     │
    │  - Favorite Season              │
    │  - Favorite Castaway            │
    │  - Bio                          │
    │  - Avatar Upload                │
    └─────────────────────────────────┘
         │
         ▼
    ┌─────────────┐
    │  Dashboard  │
    └─────────────┘
         │
         ├──────────────┬──────────────┐
         ▼              ▼              ▼
    [Trivia]      [Join League]  [Create League]
```

---

## 2. Trivia Challenge Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                       TRIVIA CHALLENGE                               │
└─────────────────────────────────────────────────────────────────────┘

    [Start Trivia]
         │
         ▼
    ┌─────────────────────────────────┐
    │     Question Display            │
    │  - 20 second timer              │
    │  - 4 answer options             │
    │  - Progress (X/24)              │
    └─────────────────────────────────┘
         │
         ├─────────────────────────────┐
         ▼                             ▼
    [CORRECT]                    [INCORRECT]
         │                             │
         ▼                             ▼
    ┌─────────────┐           ┌─────────────────┐
    │ Fun Fact    │           │ Leaderboard     │
    │ Display     │           │ Modal           │
    │ (3 sec)     │           │ + Join League   │
    └─────────────┘           │ CTA             │
         │                    └─────────────────┘
         ▼                             │
    [Next Question]                    ▼
         │                    ┌─────────────────┐
         │                    │ 24-Hour Lockout │
         │                    └─────────────────┘
         ▼
    ┌─────────────────────────────────┐
    │  After 24 Questions:            │
    │  - Completion Modal             │
    │  - Leaderboard Entry            │
    │  - Join League CTA              │
    └─────────────────────────────────┘
```

---

## 3. League Creation Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                       LEAGUE CREATION                                │
└─────────────────────────────────────────────────────────────────────┘

    [Create League Button]
         │
         ▼
    ┌─────────────────────────────────┐
    │     League Settings Form        │
    │  - League Name                  │
    │  - Public/Private               │
    │  - Max Players (2-12)           │
    │  - Require Donation?            │
    │  - Donation Amount              │
    │  - Description                  │
    └─────────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────────┐
    │  If Paid League:                │
    │  - Stripe Checkout              │
    │  - Payment Processing           │
    └─────────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────────┐
    │     League Created!             │
    │  - Invite Code Generated        │
    │  - Commissioner = Creator       │
    │  - Status = "forming"           │
    └─────────────────────────────────┘
         │
         ▼
    [League Home Page]
         │
         ├──────────────────────┐
         ▼                      ▼
    [Share Invite]        [Start Draft]
```

---

## 4. League Joining Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        JOINING A LEAGUE                              │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐        ┌──────────────────┐
    │  Browse Public   │        │  Enter Invite    │
    │  Leagues         │        │  Code            │
    └──────────────────┘        └──────────────────┘
              │                          │
              └──────────┬───────────────┘
                         ▼
    ┌─────────────────────────────────┐
    │     League Preview              │
    │  - League Name                  │
    │  - Commissioner                 │
    │  - Member Count                 │
    │  - Donation Amount (if paid)    │
    └─────────────────────────────────┘
                         │
           ┌─────────────┴─────────────┐
           ▼                           ▼
    [FREE LEAGUE]              [PAID LEAGUE]
           │                           │
           ▼                           ▼
    ┌─────────────┐           ┌─────────────────┐
    │ Join        │           │ Stripe Checkout │
    │ Immediately │           │ ($X donation)   │
    └─────────────┘           └─────────────────┘
           │                           │
           └───────────┬───────────────┘
                       ▼
    ┌─────────────────────────────────┐
    │     Joined League!              │
    │  - Added to league_members      │
    │  - Welcome email sent           │
    │  - Redirected to league home    │
    └─────────────────────────────────┘
```

---

## 5. Draft Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                          DRAFT PROCESS                               │
└─────────────────────────────────────────────────────────────────────┘

    [Before Draft Deadline]
              │
              ▼
    ┌─────────────────────────────────┐
    │     Rank Castaways              │
    │  - Drag & drop 1-24             │
    │  - Rankings apply to ALL        │
    │    leagues for the season       │
    │  - Can update until deadline    │
    └─────────────────────────────────┘
              │
              ▼
    [Draft Order Deadline]
              │
              ▼
    ┌─────────────────────────────────┐
    │  Auto-Randomize Job Runs        │
    │  - Users without rankings       │
    │    get random rankings          │
    └─────────────────────────────────┘
              │
              ▼
    [Draft Deadline]
              │
              ▼
    ┌─────────────────────────────────┐
    │     Snake Draft Executes        │
    │  - Random draft positions       │
    │  - Round 1: Pick order 1→12     │
    │  - Round 2: Pick order 12→1     │
    │  - Each player gets 2 castaways │
    └─────────────────────────────────┘
              │
              ▼
    ┌─────────────────────────────────┐
    │     Draft Complete              │
    │  - Rosters assigned             │
    │  - League status = "active"     │
    │  - Email notification sent      │
    └─────────────────────────────────┘
```

---

## 6. Weekly Pick Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        WEEKLY PICKS                                  │
└─────────────────────────────────────────────────────────────────────┘

    [Friday 11am ET / 8am PT: Picks Open]
              │
              ▼
    ┌─────────────────────────────────┐
    │     Dashboard / League Home     │
    │  - "Make Your Pick" CTA         │
    │  - Shows both castaways         │
    │  - Current episode info         │
    └─────────────────────────────────┘
              │
              ▼
    ┌─────────────────────────────────┐
    │     Pick Selection              │
    │  - Choose: Start or Bench       │
    │  - See castaway stats           │
    │  - Confirm selection            │
    └─────────────────────────────────┘
              │
              ▼
    [Wednesday 2pm: Reminder Email]
              │
              ▼
    [Wednesday 5pm PST: Picks Lock]
              │
              ├─────────────────────────────┐
              ▼                             ▼
    [User Made Pick]              [No Pick Made]
              │                             │
              │                             ▼
              │                    ┌─────────────────┐
              │                    │ Auto-Pick Job   │
              │                    │ (Random select) │
              │                    └─────────────────┘
              │                             │
              └──────────┬──────────────────┘
                         ▼
    ┌─────────────────────────────────┐
    │     Pick Status = "locked"      │
    │  - Cannot be changed            │
    │  - Ready for scoring            │
    └─────────────────────────────────┘
```

---

## 7. Scoring Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        EPISODE SCORING                               │
└─────────────────────────────────────────────────────────────────────┘

    [Episode Airs - Wednesday 8pm EST]
              │
              ▼
    ┌─────────────────────────────────┐
    │     Admin Scoring Interface     │
    │  - Select Episode               │
    │  - Select Castaway              │
    │  - Enter scores per rule        │
    │  - Auto-save as you go          │
    └─────────────────────────────────┘
              │
              ▼
    ┌─────────────────────────────────┐
    │     Grid View (Alternative)     │
    │  - All castaways × rules        │
    │  - Quick bulk entry             │
    │  - Category filters             │
    └─────────────────────────────────┘
              │
              ▼
    ┌─────────────────────────────────┐
    │     Finalize Scoring            │
    │  - Verify all castaways scored  │
    │  - Mark eliminated castaways    │
    │  - Confirm finalization         │
    └─────────────────────────────────┘
              │
              ▼
    ┌─────────────────────────────────┐
    │     Points Calculated           │
    │  - weekly_picks.points_earned   │
    │  - league_members.total_points  │
    │  - Leaderboard updated          │
    └─────────────────────────────────┘
              │
              ▼
    [Thursday 10am: Results Emails]
```

---

## 8. Payment Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PAYMENT PROCESSING                            │
└─────────────────────────────────────────────────────────────────────┘

    [User Clicks "Join Paid League"]
              │
              ▼
    ┌─────────────────────────────────┐
    │     Create Stripe Session       │
    │  - Amount from league settings  │
    │  - Success URL: /leagues/{id}   │
    │  - Cancel URL: /leagues         │
    └─────────────────────────────────┘
              │
              ▼
    ┌─────────────────────────────────┐
    │     Stripe Checkout Page        │
    │  - Card details                 │
    │  - Payment processing           │
    └─────────────────────────────────┘
              │
              ├─────────────────────────────┐
              ▼                             ▼
    [SUCCESS]                        [CANCELLED]
              │                             │
              ▼                             ▼
    ┌─────────────────────────────────┐    [Return to
    │  Webhook: checkout.session.     │     Leagues]
    │           completed             │
    │  - Verify payment               │
    │  - Add user to league           │
    │  - Update payment status        │
    └─────────────────────────────────┘
              │
              ▼
    ┌─────────────────────────────────┐
    │     User Added to League        │
    │  - league_members record        │
    │  - payments record (completed)  │
    │  - Redirect to league home      │
    └─────────────────────────────────┘
```

---

## Database Tables Involved

| Flow | Primary Tables |
|------|----------------|
| Onboarding | `users`, `notification_preferences` |
| Trivia | `daily_trivia_questions`, `daily_trivia_answers`, `daily_trivia_leaderboard` |
| League Creation | `leagues`, `league_members` |
| League Joining | `leagues`, `league_members`, `payments` |
| Draft | `draft_rankings`, `rosters`, `leagues` |
| Weekly Picks | `weekly_picks`, `episodes` |
| Scoring | `episode_scores`, `scoring_rules`, `scoring_sessions` |
| Payments | `payments`, `league_members` |

---

## API Endpoints by Flow

### Onboarding
- `POST /api/auth/signup`
- `GET /api/users/me`
- `PATCH /api/users/me`

### Trivia
- `GET /api/trivia/next`
- `POST /api/trivia/answer`
- `GET /api/trivia/progress`
- `GET /api/trivia/leaderboard`

### Leagues
- `GET /api/leagues`
- `POST /api/leagues`
- `GET /api/leagues/:id`
- `POST /api/leagues/:id/join`

### Draft
- `GET /api/draft/rankings`
- `PUT /api/draft/rankings`
- `POST /api/draft/finalize`

### Weekly Picks
- `GET /api/picks/current`
- `POST /api/picks`
- `GET /api/picks/history`

### Scoring (Admin)
- `GET /api/episodes/:id/scoring/status`
- `POST /api/episodes/:id/scoring/save`
- `POST /api/episodes/:id/scoring/finalize`

### Payments
- `POST /api/payments/create-checkout`
- `POST /api/webhooks/stripe`
