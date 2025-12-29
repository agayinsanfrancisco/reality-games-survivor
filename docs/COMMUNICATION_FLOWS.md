# Reality Games: Survivor - Communication Flows

This document outlines all email, SMS, and authentication communication flows for the platform.

---

## Table of Contents

1. [Overview](#overview)
2. [Supabase Auth Emails](#supabase-auth-emails)
3. [Transactional Emails (Resend)](#transactional-emails-resend)
4. [SMS Commands (Twilio)](#sms-commands-twilio)
5. [Configuration Guides](#configuration-guides)

---

## Overview

| Platform | Purpose | Configuration Location |
|----------|---------|----------------------|
| **Supabase** | Authentication emails (sign up, password reset, magic link) | Supabase Dashboard > Authentication > Email Templates |
| **Resend** | Transactional emails (welcome, picks, results, etc.) | Environment variable `RESEND_API_KEY` |
| **Twilio** | SMS notifications and commands | Environment variables `TWILIO_*` |

---

## Supabase Auth Emails

These emails are sent automatically by Supabase for authentication flows. Configure them in **Supabase Dashboard > Authentication > Email Templates**.

### Email Templates

| Email Type | Trigger | Template File |
|------------|---------|---------------|
| **Confirm Sign Up** | User registers with email/password | `server/src/emails/auth/confirm-signup.html` |
| **Magic Link** | User requests passwordless sign-in | `server/src/emails/auth/magic-link.html` |
| **Reset Password** | User requests password reset | `server/src/emails/auth/reset-password.html` |
| **Change Email** | User changes their email address | `server/src/emails/auth/change-email.html` |
| **Invite User** | Admin invites a new user | `server/src/emails/auth/invite-user.html` |
| **Reauthentication** | User performs sensitive action | `server/src/emails/auth/reauthentication.html` |

### Subject Lines

| Email Type | Subject Line |
|------------|--------------|
| Confirm Sign Up | `Confirm your email - Reality Games: Survivor` |
| Magic Link | `Sign in to Reality Games: Survivor` |
| Reset Password | `Reset your password - Reality Games: Survivor` |
| Change Email | `Confirm your new email - Reality Games: Survivor` |
| Invite User | `You're invited to Reality Games: Survivor` |
| Reauthentication | `Confirm your identity - Reality Games: Survivor` |

### Template Variables

All templates use Go template syntax:
- `{{ .ConfirmationURL }}` - The action URL (required)
- `{{ .Email }}` - User's email address
- `{{ .Token }}` - The token value
- `{{ .TokenHash }}` - Hashed token
- `{{ .SiteURL }}` - Your site URL

---

## Transactional Emails (Resend)

These emails are sent via Resend API for game-related communications.

### Email Categories

#### 1. Onboarding Emails

| Email | Trigger | Priority | Method |
|-------|---------|----------|--------|
| **Welcome** | User completes registration | Normal | `sendEmail()` |
| **League Created** | User creates a league | Normal | `sendEmail()` |
| **League Joined** | User joins a league | **Critical** | `sendEmailCritical()` |

#### 2. Draft Emails

| Email | Trigger | Priority | Method |
|-------|---------|----------|--------|
| **Draft Pick Confirmed** | User is assigned a castaway | **Critical** | `sendEmailCritical()` |
| **Draft Complete** | User's draft is finished | Normal | `sendEmail()` |
| **Draft Reminder** | X days before draft deadline | Background | `enqueueEmail()` |
| **Draft Final Warning** | X hours before draft deadline | Background | `enqueueEmail()` |

#### 3. Weekly Pick Emails

| Email | Trigger | Priority | Method |
|-------|---------|----------|--------|
| **Pick Confirmed** | User submits weekly pick | **Critical** | `sendEmailCritical()` |
| **Auto-Pick Alert** | System auto-picks for user | Normal | `sendEmail()` |
| **Pick Reminder** | X hours before picks lock | Background | `enqueueEmail()` |
| **Pick Final Warning** | 30 minutes before picks lock | Background | `enqueueEmail()` |

#### 4. Results Emails

| Email | Trigger | Priority | Method |
|-------|---------|----------|--------|
| **Episode Results** | Scoring finalized (Friday 2pm) | Background | `enqueueEmail()` |
| **Elimination Alert** | User's castaway eliminated | Background | `enqueueEmail()` |
| **Torch Snuffed** | Both castaways eliminated | **Critical** | `sendEmailCritical()` |

#### 5. Payment Emails

| Email | Trigger | Priority | Method |
|-------|---------|----------|--------|
| **Payment Confirmed** | Stripe payment succeeds | **Critical** | `sendEmailCritical()` |
| **Payment Recovery** | Checkout session expires | Background | `enqueueEmail()` |
| **Refund Issued** | Refund processed | Normal | `sendEmail()` |

### Email Flow Diagrams

#### User Registration Flow
```
User Signs Up
    ↓
[Supabase] Confirm Sign Up Email
    ↓
User Clicks Confirmation Link
    ↓
[Resend] Welcome Email
```

#### League Join Flow
```
User Joins League
    ↓
(If paid league) → Stripe Checkout
    ↓
[Resend] Payment Confirmed Email (Critical)
    ↓
[Resend] League Joined Email (Critical)
```

#### Weekly Pick Flow
```
Wednesday Morning
    ↓
[Resend] Pick Reminder (24h before lock)
    ↓
User Submits Pick
    ↓
[Resend] Pick Confirmed Email (Critical)
    ↓
OR: User Misses Deadline
    ↓
[System] Auto-Pick Job Runs
    ↓
[Resend] Auto-Pick Alert Email
```

#### Episode Results Flow
```
Wednesday Night: Episode Airs
    ↓
Admin Scores Episode
    ↓
Admin Finalizes Scoring
    ↓
Friday 2pm PST: Results Release Job
    ↓
[Resend] Episode Results Email (all users)
    ↓
[Resend] Elimination Alert (if castaway eliminated)
    ↓
[Resend] Torch Snuffed (if both castaways out)
```

---

## SMS Commands (Twilio)

Users can interact with the platform via SMS. Commands are processed by the webhook at `/webhooks/sms`.

### Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| `PICK [name]` | Submit weekly pick | `PICK Kenzie` |
| `STATUS` | View recent picks | `STATUS` |
| `TEAM` | View roster | `TEAM` |
| `HELP` | Show available commands | `HELP` |
| `STOP` | Unsubscribe from SMS | `STOP` |
| `START` | Resubscribe to SMS | `START` |

### SMS Response Messages

#### PICK Command
```
Success: "Picked [Name] for Episode [X] in [Y] league(s)."
No castaway: "Castaway "[name]" not found or eliminated."
No leagues: "You are not in any leagues."
No episode: "No episode currently accepting picks."
Not on roster: (Castaway not on user's roster - no pick made)
```

#### STATUS Command
```
Success:
"Recent picks:
[Castaway] - [League]
[Castaway] - [League]
..."

No picks: "No recent picks found."
```

#### TEAM Command
```
Success:
"Your team:
[Castaway] (active) - [League]
[Castaway] (eliminated) - [League]
..."

No roster: "No castaways on roster."
```

#### HELP Command
```
"Reality Games: Survivor SMS Commands:

PICK [name] - Pick castaway
STATUS - View picks
TEAM - View roster
STOP - Unsubscribe
START - Resubscribe
HELP - Show this message"
```

#### STOP/UNSUBSCRIBE Commands
```
"You've been unsubscribed from Reality Games: Survivor SMS. Reply START to resubscribe or visit survivor.realitygamesfantasyleague.com to manage preferences."
```

#### START/SUBSCRIBE Commands
```
"You've been subscribed to Reality Games: Survivor SMS notifications. Text STOP to unsubscribe anytime."
```

### SMS Notification Types

These are outbound SMS messages sent by the system:

| Notification | Trigger | Content |
|--------------|---------|---------|
| **Pick Reminder** | X hours before picks lock | "Don't forget to make your pick for Episode X! Text PICK [name] or visit [url]" |
| **Pick Final Warning** | 30 min before picks lock | "⚠️ PICKS LOCK IN 30 MIN! Text PICK [name] now!" |
| **Results Available** | Friday 2pm (results release) | "Episode X results are in! You earned +Y points. View: [url]" |

### SMS Flow Diagrams

#### Inbound SMS Flow
```
User Sends SMS
    ↓
Twilio Webhook → /webhooks/sms
    ↓
Parse Command & Args
    ↓
Look Up User by Phone
    ↓
Route to Handler (PICK, STATUS, TEAM, etc.)
    ↓
Execute Command
    ↓
Return TwiML Response
```

#### PICK Command Flow
```
User: "PICK Kenzie"
    ↓
Parse: command=PICK, args=["Kenzie"]
    ↓
Find castaway matching "Kenzie"
    ↓
Get user's leagues
    ↓
Get current episode (picks not locked)
    ↓
For each league where user has castaway on roster:
    → Upsert weekly_pick
    ↓
Response: "Picked Kenzie for Episode 3 in 2 league(s)."
```

---

## Configuration Guides

### Supabase Configuration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project `qxrgejdfxcvsfktgysop`
3. Navigate to **Authentication** → **Email Templates**
4. For each email type:
   - Copy the HTML from `server/src/emails/auth/[type].html`
   - Set the subject line from the table above
   - Save changes

### Resend Configuration

1. Create account at [Resend](https://resend.com)
2. Verify your domain (`rgfl.app`)
3. Create API key
4. Set environment variables:
   ```bash
   RESEND_API_KEY=re_xxxxx
   ```
5. Configure sender:
   - From: `Reality Games: Survivor <noreply@rgfl.app>`
   - Reply-To: `support@rgfl.app`

### Twilio Configuration

1. Create account at [Twilio](https://twilio.com)
2. Purchase phone number (918-505-7435)
3. Set environment variables:
   ```bash
   TWILIO_ACCOUNT_SID=ACxxxxx
   TWILIO_AUTH_TOKEN=xxxxx
   TWILIO_PHONE_NUMBER=+19185057435
   ```
4. Configure webhook:
   - URL: `https://rgfl-api-production.up.railway.app/webhooks/sms`
   - Method: POST
   - Content Type: application/x-www-form-urlencoded

---

## File Locations

### Email Templates
```
server/src/emails/
├── auth/                    # Supabase Auth templates
│   ├── confirm-signup.html
│   ├── magic-link.html
│   ├── reset-password.html
│   ├── change-email.html
│   ├── invite-user.html
│   └── reauthentication.html
├── transactional/           # Resend transactional emails
│   ├── welcome.ts
│   ├── league-created.ts
│   ├── league-joined.ts
│   ├── pick-confirmed.ts
│   ├── auto-pick-alert.ts
│   ├── draft-complete.ts
│   ├── draft-pick-confirmed.ts
│   ├── payment-confirmed.ts
│   ├── refund-issued.ts
│   └── torch-snuffed.ts
├── reminders/               # Reminder emails
│   ├── draft-reminder.ts
│   ├── draft-final-warning.ts
│   ├── pick-reminder.ts
│   └── pick-final-warning.ts
├── results/                 # Results emails
│   ├── episode-results.ts
│   └── elimination-alert.ts
├── base.ts                  # Shared template components
├── service.ts               # EmailService class
└── index.ts                 # Exports
```

### SMS Handlers
```
server/src/services/sms/
├── commands.ts              # Command handlers
└── index.ts                 # Exports
```

### Configuration
```
server/src/config/
├── email.ts                 # Resend client
├── twilio.ts                # Twilio client
└── supabase.ts              # Supabase clients
```

---

## Testing

### Test Email Templates
```bash
cd server
npx ts-node scripts/preview-all-emails.ts
```

### Test SMS Commands
```bash
# Send test SMS via Twilio console or:
curl -X POST https://rgfl-api-production.up.railway.app/webhooks/sms \
  -d "From=+1234567890&Body=HELP"
```

### Test Supabase Auth
1. Go to Supabase Dashboard > Authentication > Users
2. Click "Invite user" to test invite email
3. Use "Send password reset" to test reset email
