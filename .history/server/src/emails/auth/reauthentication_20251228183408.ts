// Reauthentication Email Template for Supabase
// Copy this HTML into Supabase Dashboard > Authentication > Email Templates > Reauthentication

export const reauthenticationTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin:0; padding:40px 20px; background-color:#F5F0E6; font-family:Georgia, serif;">
  <div style="max-width:500px; margin:0 auto; background-color:#FEFDFB; border-radius:12px; padding:40px; border:1px solid #EDE5D5;">
    
    <div style="text-align:center; margin-bottom:30px;">
      <img src="https://survivor.realitygamesfantasyleague.com/logo.png" alt="Reality Games" width="160" style="max-width:160px;">
    </div>
    
    <h1 style="color:#5C1717; font-size:24px; margin:0 0 20px 0; text-align:center;">Confirm Your Identity</h1>
    
    <p style="color:#4A3728; font-size:16px; line-height:1.6; margin:0 0 25px 0; text-align:center;">
      You're attempting a sensitive action. Click below to confirm.
    </p>
    
    <div style="text-align:center; margin:30px 0;">
      <a href="{{ .ConfirmationURL }}" style="color:#A52A2A; font-size:16px; font-weight:bold;">
        → Confirm Identity
      </a>
    </div>
    
    <p style="color:#8A7654; font-size:13px; text-align:center; margin:30px 0 0 0;">
      If you didn't request this, please contact support@realitygamesfantasyleague.com
    </p>
    
    <hr style="border:none; border-top:1px solid #EDE5D5; margin:30px 0;">
    
    <p style="color:#5C1717; font-size:14px; font-weight:bold; text-align:center; margin:0;">
      Reality Games: Survivor
    </p>
    
  </div>
</body>
</html>
`;

export const reauthenticationSubject = 'Confirm your identity - Reality Games: Survivor';
