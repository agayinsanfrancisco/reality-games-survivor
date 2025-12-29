// Reauthentication Email Template for Supabase
// Copy this HTML into Supabase Dashboard > Authentication > Email Templates > Reauthentication

export const reauthenticationTemplate = `
<h2 style="color:#5C1717; font-family:Georgia, serif;">Reality Games: Survivor</h2>

<p style="color:#4A3728; font-size:16px;">Please confirm your identity to continue.</p>

<p style="margin:25px 0;">
  <a href="{{ .ConfirmationURL }}" style="color:#A52A2A; font-weight:bold;">Confirm Identity</a>
</p>

<p style="color:#8A7654; font-size:13px;">If you didn't request this, contact support@realitygamesfantasyleague.com</p>
`;

export const reauthenticationSubject = 'Confirm your identity - Reality Games: Survivor';
