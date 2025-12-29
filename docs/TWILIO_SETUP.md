# Twilio SMS Configuration

This guide explains how to configure Twilio for SMS notifications and commands.

## Quick Start

1. Create account at [Twilio](https://twilio.com)
2. Purchase a phone number
3. Configure webhook
4. Set environment variables

---

## Account Setup

### 1. Create Twilio Account

1. Go to [twilio.com](https://twilio.com)
2. Sign up with email
3. Verify your phone number
4. Complete account verification

### 2. Purchase Phone Number

1. Go to **Phone Numbers** → **Buy a Number**
2. Search for a number (we use: `+1 918-505-7435`)
3. Ensure capabilities include **SMS**
4. Purchase the number

### 3. Get Credentials

1. Go to **Account** → **API keys & tokens**
2. Copy:
   - Account SID (starts with `AC`)
   - Auth Token

---

## Environment Configuration

Add to your environment variables:

```bash
# Production (Railway)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+19185057435

# Development (.env)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+19185057435
```

### Railway Configuration

1. Go to Railway dashboard
2. Select `rgfl-api` service
3. Go to **Variables**
4. Add all three Twilio variables

---

## Webhook Configuration

### Configure Inbound SMS

1. Go to **Phone Numbers** → **Manage** → **Active Numbers**
2. Click on your number (`+1 918-505-7435`)
3. Scroll to **Messaging Configuration**
4. Set:
   - **Configure with:** Webhooks
   - **A message comes in:** 
     - URL: `https://rgfl-api-production.up.railway.app/webhooks/sms`
     - HTTP Method: `POST`

### Webhook Security (Optional)

To validate webhook signatures:

```typescript
// In server/src/routes/webhooks.ts
import twilio from 'twilio';

const validateRequest = (req, res, next) => {
  const signature = req.headers['x-twilio-signature'];
  const url = `https://rgfl-api-production.up.railway.app${req.originalUrl}`;
  
  if (twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN,
    signature,
    url,
    req.body
  )) {
    next();
  } else {
    res.status(403).send('Invalid signature');
  }
};
```

---

## SMS Commands

Users can text the following commands:

| Command | Description | Example |
|---------|-------------|---------|
| `PICK [name]` | Submit weekly pick | `PICK Kenzie` |
| `STATUS` | View recent picks | `STATUS` |
| `TEAM` | View roster | `TEAM` |
| `HELP` | Show commands | `HELP` |
| `STOP` | Unsubscribe | `STOP` |
| `START` | Resubscribe | `START` |

### Command Handlers

Located in `server/src/services/sms/commands.ts`:

```typescript
// PICK command
export async function handlePick(ctx: SmsContext): Promise<SmsResult>

// STATUS command
export async function handleStatus(ctx: SmsContext): Promise<SmsResult>

// TEAM command
export async function handleTeam(ctx: SmsContext): Promise<SmsResult>

// HELP command
export function handleHelp(ctx: SmsContext): SmsResult

// STOP command (FCC/TCPA compliance)
export async function handleStop(ctx: SmsContext): Promise<SmsResult>

// START command
export async function handleStart(ctx: SmsContext): Promise<SmsResult>
```

---

## Outbound SMS

### Sending SMS

```typescript
import { sendSMS } from './config/twilio.js';

// Transactional (always send)
await sendSMS({
  to: '+1234567890',
  text: 'Your pick has been confirmed!',
  isTransactional: true
});

// Marketing/Notification (respects STOP)
await sendSMS({
  to: '+1234567890',
  text: 'Pick reminder: Make your pick before 3pm!',
  isTransactional: false
});
```

### SMS Types

| Type | When Sent | isTransactional |
|------|-----------|-----------------|
| Pick Reminder | 24h before lock | `false` |
| Pick Final Warning | 30min before lock | `false` |
| Results Available | Friday 2pm | `false` |
| Elimination Alert | After scoring | `false` |
| Torch Snuffed | Both castaways out | `true` |

---

## STOP Compliance (FCC/TCPA)

### Required Behavior

1. **STOP keywords:** STOP, UNSUBSCRIBE, CANCEL, END, QUIT
2. **Response:** Confirmation message
3. **Database:** Set `notification_sms = false`
4. **Enforcement:** Check preference before sending non-transactional SMS

### Implementation

```typescript
// In server/src/config/twilio.ts
export async function sendSMS({ to, text, isTransactional = false }) {
  // Non-transactional: check opt-in status
  if (!isTransactional) {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('notification_sms')
      .eq('phone', normalizedPhone)
      .single();

    if (!user?.notification_sms) {
      return { success: false, reason: 'User opted out' };
    }
  }
  
  // Send SMS...
}
```

---

## Testing

### Test Inbound SMS

```bash
# Using curl to simulate Twilio webhook
curl -X POST https://rgfl-api-production.up.railway.app/webhooks/sms \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=+1234567890&Body=HELP"
```

### Test Outbound SMS

```bash
# In Node.js console
import { sendSMS } from './src/config/twilio.js';

await sendSMS({
  to: '+1234567890',
  text: 'Test message from Reality Games: Survivor',
  isTransactional: true
});
```

### Twilio Console

1. Go to **Monitor** → **Logs** → **Messaging**
2. View sent/received messages
3. Check delivery status

---

## Rate Limits & Pricing

### Messaging Limits
- 1 SMS/second per phone number
- For higher volume, use Messaging Service

### Pricing (US)
- Outbound SMS: ~$0.0079/segment
- Inbound SMS: ~$0.0075/segment
- Phone number: ~$1.15/month

### Segment Limits
- 160 characters for GSM-7
- 70 characters for Unicode
- Longer messages split into segments

---

## Troubleshooting

### SMS not sending
1. Check Twilio credentials are correct
2. Verify phone number is active
3. Check Twilio console for errors
4. Verify user has `notification_sms = true`

### Webhook not receiving
1. Verify webhook URL is correct
2. Check Railway logs for errors
3. Test with Twilio's webhook debugger

### STOP not working
1. Check database update is successful
2. Verify STOP keywords are recognized
3. Check response message is sent

---

## Monitoring

### Twilio Dashboard
- **Monitor** → **Logs** → **Messaging**: View all SMS
- **Monitor** → **Alerts**: Set up error alerts
- **Usage** → **Messaging**: Track costs

### Application Logs
```bash
# Railway logs
railway logs --service rgfl-api

# Search for SMS logs
railway logs --service rgfl-api | grep SMS
```
