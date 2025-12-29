# Supabase Auth Email Configuration

This guide explains how to configure branded email templates in Supabase for authentication flows.

## Quick Start

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project: `qxrgejdfxcvsfktgysop`
3. Navigate to **Authentication** → **Email Templates**
4. Configure each template as described below

---

## Email Templates

### 1. Confirm Sign Up

**When sent:** User registers with email/password

**Subject:**
```
Confirm your email - Reality Games: Survivor
```

**HTML Template:**
Copy from: `server/src/emails/auth/confirm-signup.html`

---

### 2. Magic Link

**When sent:** User requests passwordless sign-in

**Subject:**
```
Sign in to Reality Games: Survivor
```

**HTML Template:**
Copy from: `server/src/emails/auth/magic-link.html`

---

### 3. Reset Password

**When sent:** User requests password reset

**Subject:**
```
Reset your password - Reality Games: Survivor
```

**HTML Template:**
Copy from: `server/src/emails/auth/reset-password.html`

---

### 4. Change Email Address

**When sent:** User changes their email address

**Subject:**
```
Confirm your new email - Reality Games: Survivor
```

**HTML Template:**
Copy from: `server/src/emails/auth/change-email.html`

---

### 5. Invite User

**When sent:** Admin invites a new user

**Subject:**
```
You're invited to Reality Games: Survivor
```

**HTML Template:**
Copy from: `server/src/emails/auth/invite-user.html`

---

### 6. Reauthentication

**When sent:** User performs sensitive action requiring verification

**Subject:**
```
Confirm your identity - Reality Games: Survivor
```

**HTML Template:**
Copy from: `server/src/emails/auth/reauthentication.html`

---

## Template Variables

All templates use Go template syntax. Available variables:

| Variable | Description |
|----------|-------------|
| `{{ .ConfirmationURL }}` | The action URL (required in all templates) |
| `{{ .Email }}` | User's email address |
| `{{ .Token }}` | The token value |
| `{{ .TokenHash }}` | Hashed token |
| `{{ .SiteURL }}` | Your site URL (https://survivor.realitygamesfantasyleague.com) |

---

## Additional Settings

### Site URL
In **Authentication** → **URL Configuration**:
- Site URL: `https://survivor.realitygamesfantasyleague.com`
- Redirect URLs: 
  - `https://survivor.realitygamesfantasyleague.com/*`
  - `http://localhost:5173/*` (for development)

### Email Settings
In **Authentication** → **Email**:
- Enable email confirmations: ✅
- Secure email change: ✅
- Double confirm email changes: Optional

---

## Testing

1. **Test Confirm Sign Up:**
   - Sign up with a new email
   - Check inbox for confirmation email
   - Verify link works

2. **Test Magic Link:**
   - Go to sign-in page
   - Click "Sign in with magic link"
   - Check inbox for magic link email
   - Verify link works

3. **Test Password Reset:**
   - Go to sign-in page
   - Click "Forgot password"
   - Check inbox for reset email
   - Verify link works

4. **Test Invite User:**
   - Go to Supabase Dashboard > Authentication > Users
   - Click "Invite user"
   - Enter email and send
   - Check inbox for invite email

---

## Troubleshooting

### Emails not sending
1. Check Supabase email rate limits (4 emails/hour on free tier)
2. Verify SMTP settings if using custom SMTP
3. Check spam folder

### Links not working
1. Verify Site URL is correct in URL Configuration
2. Check that redirect URLs include your domain
3. Ensure `{{ .ConfirmationURL }}` is used (not `{{ .Token }}`)

### Styling issues
1. Use inline CSS only (email clients strip `<style>` tags)
2. Use table-based layouts for compatibility
3. Test in multiple email clients (Gmail, Outlook, Apple Mail)
