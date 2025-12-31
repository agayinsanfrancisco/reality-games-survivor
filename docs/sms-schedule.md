# Reality Games Fantasy League - SMS Schedule

## Overview

SMS notifications are a **Coming Soon** feature. This document outlines the planned SMS schedule for when the feature launches.

---

## SMS Message Types

| Message Type | Trigger | Timing | Priority |
|--------------|---------|--------|----------|
| Pick Reminder | User hasn't made weekly pick | Wed 3pm PST | High |
| Results Ready | Episode scoring complete | Wed 10pm PST | Medium |
| Draft Reminder | User hasn't ranked castaways | 24h before deadline | High |
| Elimination Alert | User's castaway eliminated | After scoring | Medium |

---

## Weekly SMS Schedule

### Wednesday (Episode Day)

| Time (PST) | Message | Recipients |
|------------|---------|------------|
| 3:00 PM | Pick Reminder | Users who opted in + haven't picked |
| 10:00 PM | Results Ready | All opted-in users |

### Thursday

| Time (PST) | Message | Recipients |
|------------|---------|------------|
| 10:00 AM | Elimination Alert | Users whose castaway was eliminated |

---

## Message Templates

### Pick Reminder
```
🔥 RGFL: Don't forget your pick! Episode airs in 5 hours. 
Picks lock at 5pm PST. 
Make your pick: [short link]
Reply STOP to opt out.
```

### Results Ready
```
📊 RGFL: Episode results are in! 
Your pick {{castaway}} scored {{points}} pts. 
You're ranked #{{rank}} in {{league}}.
View: [short link]
```

### Draft Reminder
```
📋 RGFL: Rank your castaways before the draft! 
Deadline: {{deadline}}
Unranked players will be randomized.
Rank now: [short link]
```

### Elimination Alert
```
😢 RGFL: {{castaway}} was eliminated tonight.
You have 1 castaway remaining: {{remaining}}.
View standings: [short link]
```

---

## Opt-In Requirements

1. User must verify phone number
2. User must explicitly opt in to SMS notifications
3. Every message must include opt-out instructions
4. Comply with TCPA and carrier requirements

---

## Technical Implementation

### Provider
- **Twilio** (planned)
- Estimated cost: $0.0075/message

### Database Tables
```sql
-- Phone verification
ALTER TABLE users ADD COLUMN phone_number TEXT;
ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN phone_verified_at TIMESTAMPTZ;

-- SMS preferences
CREATE TABLE sms_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  pick_reminders BOOLEAN DEFAULT false,
  results_notifications BOOLEAN DEFAULT false,
  draft_reminders BOOLEAN DEFAULT false,
  elimination_alerts BOOLEAN DEFAULT false,
  opted_out_at TIMESTAMPTZ
);

-- SMS log
CREATE TABLE sms_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  phone_number TEXT,
  message_type TEXT,
  message_body TEXT,
  status TEXT, -- 'sent', 'delivered', 'failed'
  twilio_sid TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  error_message TEXT
);
```

### Cron Jobs
```javascript
// SMS jobs (to be added to scheduler.ts)
{
  name: 'sms-pick-reminders',
  schedule: pstToCron(15, 0, 3), // Wed 3pm PST
  description: 'Send SMS pick reminders',
  handler: sendSmsPickReminders,
  enabled: false, // Enable when feature launches
},
{
  name: 'sms-results-notification',
  schedule: pstToCron(22, 0, 3), // Wed 10pm PST
  description: 'Send SMS results notifications',
  handler: sendSmsResults,
  enabled: false,
}
```

---

## Budget Considerations

### Estimated Monthly Costs

| Scenario | Users | Messages/Month | Cost |
|----------|-------|----------------|------|
| Small | 100 | 400 | $3 |
| Medium | 500 | 2,000 | $15 |
| Large | 2,000 | 8,000 | $60 |

*Assumes 4 messages/user/month average*

### Cost Controls
- $10/month initial budget cap
- Alert at 80% usage
- Auto-disable at 100%

---

## Launch Checklist

- [ ] Twilio account setup
- [ ] Phone verification flow
- [ ] SMS preference UI
- [ ] Message templates approved
- [ ] Opt-out handling
- [ ] Budget alerts configured
- [ ] Testing with test numbers
- [ ] TCPA compliance review
- [ ] Carrier registration (if needed)

---

## Compliance Notes

### TCPA Requirements
1. Prior express written consent
2. Clear opt-out mechanism
3. Honor opt-outs within 10 business days
4. Maintain consent records

### Best Practices
- Send during reasonable hours (9am-9pm local)
- Limit to 4 messages/week max
- Include sender identification
- Keep messages under 160 characters when possible
