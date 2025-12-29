// Reauthentication Email Template for Supabase
// Copy this HTML into Supabase Dashboard > Authentication > Email Templates > Reauthentication

export const reauthenticationTemplate = `
<h2>Confirm your identity</h2>

<p>You're attempting a sensitive action on your account.</p>

<p>Click the link below to confirm:</p>

<p><a href="{{ .ConfirmationURL }}">Confirm Identity</a></p>

<p>If you didn't request this, please contact support@realitygamesfantasyleague.com</p>

<p>— Reality Games: Survivor</p>
`;

export const reauthenticationSubject = 'Confirm your identity';
