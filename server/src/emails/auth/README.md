# Supabase Auth Email Templates

These branded HTML templates are designed to be used with Supabase Auth's email system. They maintain the Reality Games: Survivor brand with the logo on a cream/white background.

## Templates

| Template | File | Description |
|----------|------|-------------|
| Confirm Sign Up | `confirm-signup.ts` | Email confirmation after registration |
| Magic Link | `magic-link.ts` | Passwordless sign-in link |
| Reset Password | `reset-password.ts` | Password reset link |
| Change Email | `change-email.ts` | Email change confirmation |
| Invite User | `invite-user.ts` | Admin user invitation |
| Reauthentication | `reauthentication.ts` | Sensitive action verification |

## How to Configure in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select the `qxrgejdfxcvsfktgysop` project (Reality Games: Survivor)
3. Navigate to **Authentication** → **Email Templates**
4. For each template:
   - Click on the template type (e.g., "Confirm sign up")
   - Copy the HTML from the corresponding `.ts` file (the template string)
   - Paste into the "Body" field
   - Update the "Subject" field with the exported subject line
   - Click **Save**

## Subject Lines

| Template | Subject |
|----------|---------|
| Confirm Sign Up | `Confirm your email for Reality Games: Survivor` |
| Magic Link | `Your sign-in link for Reality Games: Survivor` |
| Reset Password | `Reset your password for Reality Games: Survivor` |
| Change Email | `Confirm your new email for Reality Games: Survivor` |
| Invite User | `You're invited to Reality Games: Survivor` |
| Reauthentication | `Confirm your identity - Reality Games: Survivor` |

## Template Variables

Supabase provides these variables for use in templates:

- `{{ .ConfirmationURL }}` - The action link (required)
- `{{ .Email }}` - User's email address
- `{{ .Token }}` - The token (if needed separately)
- `{{ .TokenHash }}` - Hash of the token
- `{{ .SiteURL }}` - Your site URL

## Design Notes

- Logo always appears on cream/white background (`#FEFDFB`)
- Burgundy (`#A52A2A`) primary accent color
- Georgia serif font for headings
- System fonts for body text
- Responsive design that works in all major email clients
