# Resend Email Configuration

This guide explains how to configure Resend for transactional emails.

## Quick Start

1. Create account at [Resend](https://resend.com)
2. Verify your domain
3. Create API key
4. Set environment variable

---

## Account Setup

### 1. Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up with email
3. Verify your email

### 2. Verify Domain

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter: `rgfl.app`
4. Add DNS records to your domain:

| Type | Name | Value |
|------|------|-------|
| TXT | `resend._domainkey` | (provided by Resend) |
| TXT | `@` | (SPF record provided) |

5. Wait for verification (usually 5-10 minutes)

### 3. Create API Key

1. Go to **API Keys** in Resend dashboard
2. Click **Create API Key**
3. Name: `RGFL Production`
4. Permission: `Sending access`
5. Domain: `rgfl.app`
6. Copy the key (starts with `re_`)

---

## Environment Configuration

Add to your environment variables:

```bash
# Production (Railway)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Development (.env)
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### Railway Configuration

1. Go to Railway dashboard
2. Select `rgfl-api` service
3. Go to **Variables**
4. Add `RESEND_API_KEY`

---

## Email Configuration

The email sender is configured in `server/src/config/email.ts`:

```typescript
export const FROM_EMAIL = 'Reality Games: Survivor <noreply@rgfl.app>';
export const REPLY_TO = 'support@rgfl.app';
```

---

## Email Types

### Critical Emails (with retry)
These use `sendEmailCritical()` with automatic retry:
- League Joined
- Draft Pick Confirmed
- Pick Confirmed
- Payment Confirmed
- Torch Snuffed

### Normal Emails
These use `sendEmail()`:
- Welcome
- League Created
- Draft Complete
- Auto-Pick Alert

### Background Emails (queued)
These use `enqueueEmail()` for batch processing:
- Draft Reminder
- Draft Final Warning
- Pick Reminder
- Pick Final Warning
- Episode Results
- Elimination Alert
- Payment Recovery

---

## Email Templates

All templates are in `server/src/emails/`:

```
emails/
├── transactional/      # Game-related emails
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
├── reminders/          # Reminder emails
│   ├── draft-reminder.ts
│   ├── draft-final-warning.ts
│   ├── pick-reminder.ts
│   └── pick-final-warning.ts
├── results/            # Results emails
│   ├── episode-results.ts
│   └── elimination-alert.ts
├── base.ts             # Shared components
├── service.ts          # EmailService class
└── index.ts            # Exports
```

---

## Testing

### Preview Emails
```bash
cd server
npx ts-node scripts/preview-all-emails.ts
```

### Send Test Email
```bash
# In Node.js console
import { EmailService } from './src/emails/index.js';

await EmailService.sendWelcome({
  displayName: 'Test User',
  email: 'test@example.com'
});
```

### Check Resend Dashboard
1. Go to **Emails** in Resend dashboard
2. View sent emails, delivery status, opens

---

## Rate Limits

### Free Tier
- 100 emails/day
- 3,000 emails/month

### Pro Tier ($20/month)
- 50,000 emails/month
- Custom sending domains
- Dedicated IPs available

---

## Troubleshooting

### Emails not sending
1. Check `RESEND_API_KEY` is set
2. Verify domain is verified in Resend
3. Check Resend dashboard for errors

### Emails going to spam
1. Verify SPF/DKIM records are correct
2. Check domain reputation
3. Avoid spam trigger words in subject

### Rate limit errors
1. Check daily/monthly limits
2. Upgrade plan if needed
3. Implement queue for bulk sends

---

## Monitoring

### Email Queue Stats
```bash
# API endpoint
GET /api/admin/email-queue/stats
```

### Resend Dashboard
- View delivery rates
- Track opens/clicks
- Monitor bounces
