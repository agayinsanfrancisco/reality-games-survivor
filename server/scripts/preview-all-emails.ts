// Script to generate previews for ALL email templates
import { EmailService } from '../src/emails/service.js';

// We need to access the template functions directly, so let's import the building blocks
import {
  emailWrapper,
  button,
  statBox,
  card,
  heading,
  paragraph,
  highlight,
  divider,
  formatDate,
  BASE_URL,
} from '../src/emails/base.js';

const previewDate = new Date('2026-02-25T20:00:00-08:00');
const previewDate2 = new Date('2026-03-02T20:00:00-08:00');
const previewDate3 = new Date('2026-03-04T15:00:00-08:00');

// Generate all email previews in a single HTML file
const allEmails = `
<!DOCTYPE html>
<html>
<head>
  <title>RGFL Email Template Previews</title>
  <style>
    body { font-family: -apple-system, sans-serif; background: #333; padding: 40px; }
    .email-section { margin-bottom: 60px; }
    .email-title { color: #fff; font-size: 24px; margin-bottom: 16px; padding: 12px; background: #A52A2A; border-radius: 8px; }
    .email-container { max-width: 640px; margin: 0 auto; }
    hr { border: none; border-top: 3px dashed #666; margin: 60px 0; }
  </style>
</head>
<body>

<h1 style="color: white; text-align: center; font-size: 36px;">RGFL Email Template Previews</h1>
<p style="color: #aaa; text-align: center;">All 14 email templates</p>

<hr>

<!-- 1. Welcome Email -->
<div class="email-section">
  <div class="email-title">1. Welcome Email</div>
  <div class="email-container">
    ${emailWrapper(`
      ${heading('Welcome to the Game!')}
      ${paragraph(`Hey Blake,`)}
      ${paragraph(`You're now part of the most strategic Survivor fantasy league ever created. With 100+ scoring rules that reward real gameplay strategy, every episode is an opportunity to prove your Survivor knowledge.`)}
      ${divider()}
      ${card(`
        ${heading('Getting Started', 2)}
        ${paragraph(`<strong>1. Create or join a league</strong> — Play with friends or join the global rankings`)}
        ${paragraph(`<strong>2. Rank your castaways</strong> — Rank all 24 castaways from 1-24. Players are assigned in turn order based on a random draw.`)}
        ${paragraph(`<strong>3. Make weekly picks</strong> — Choose which castaway to play each episode`)}
        ${paragraph(`<strong>4. Dominate!</strong> — Climb the leaderboard and prove you're the ultimate fan`)}
      `)}
      ${button('Go to Dashboard', `${BASE_URL}/dashboard`)}
      ${divider()}
      ${card(`
        <div style="text-align: center;">
          <div style="font-size: 32px; margin-bottom: 8px;">📱</div>
          ${heading('Text Your Picks!', 2)}
          ${paragraph(`Add your phone number to use SMS commands. Text <strong>PICK [Name]</strong> to make picks, <strong>STATUS</strong> to check your current pick, and <strong>TEAM</strong> to see your roster — all from your phone.`)}
          <p style="color: #8A7654; font-size: 14px; margin: 16px 0 8px 0;">Text us at:</p>
          <div style="font-family: -apple-system, sans-serif; font-size: 28px; font-weight: 700; color: #A52A2A; letter-spacing: 2px;">(918) 505-RGFL</div>
          <p style="color: #8A7654; font-size: 12px; margin: 4px 0 16px 0;">(918) 505-7435</p>
          ${button('Set Up SMS', `${BASE_URL}/profile/notifications`, 'success')}
        </div>
      `)}
      ${paragraph(`Questions? Reply to this email or check out our <a href="${BASE_URL}/how-to-play" style="color:#A52A2A; font-weight: 500;">How to Play</a> guide.`)}
      ${paragraph(`<em style="color: #8A7654;">The tribe has spoken. Let's play.</em>`)}
    `, 'Welcome to RGFL Survivor!')}
  </div>
</div>

<hr>

<!-- 2. League Created -->
<div class="email-section">
  <div class="email-title">2. League Created Email</div>
  <div class="email-container">
    ${emailWrapper(`
      ${heading('Your League is Ready!')}
      ${paragraph(`Hey Blake,`)}
      ${paragraph(`You've successfully created ${highlight('Blake\'s Survivors')} for Season 50. As commissioner, you're in charge of inviting players and managing the league.`)}
      ${card(`
        <p style="color: #8A7654; margin: 0 0 8px 0; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; text-align: center;">League Code</p>
        <div style="font-family: -apple-system, sans-serif; font-size: 42px; font-weight: 700; color: #A52A2A; letter-spacing: 6px; text-align: center;">ABC123</div>
      `, 'immunity')}
      ${heading('Share Your League', 2)}
      ${paragraph('Send this invite link to your friends:')}
      <div style="background: #F5F0E6; padding: 16px; border-radius: 8px; font-family: monospace; color: #A52A2A; font-size: 14px; border: 1px solid #EDE5D5; text-align: center; margin: 16px 0;">
        ${BASE_URL}/join/ABC123
      </div>
      ${button('Manage Your League', `${BASE_URL}/leagues/ABC123`)}
      ${divider()}
      ${heading('What You Can Do', 2)}
      ${paragraph('As commissioner, you can:')}
      ${paragraph('✓ Invite 2-12 players to your league')}
      ${paragraph('✓ Set an optional league donation amount')}
      ${paragraph('✓ Customize your league name and settings')}
      ${paragraph('✓ View all league member activity')}
      ${card(`
        ${heading('Key Dates', 2)}
        ${paragraph(`<strong>Registration closes:</strong> ${formatDate(previewDate, { includeTime: true })}`)}
        ${paragraph(`<strong>Premiere:</strong> ${formatDate(previewDate, { includeTime: true })}`)}
        ${paragraph(`<strong>Draft deadline:</strong> ${formatDate(previewDate2, { includeTime: true })}`)}
      `)}
      ${paragraph(`<em style="color: #8A7654;">Good luck, Commissioner.</em>`)}
    `, 'Your league is ready!')}
  </div>
</div>

<hr>

<!-- 3. League Joined -->
<div class="email-section">
  <div class="email-title">3. League Joined Email</div>
  <div class="email-container">
    ${emailWrapper(`
      ${heading("You're In!")}
      ${paragraph(`Hey Blake,`)}
      ${paragraph(`You've joined ${highlight("Blake's Survivors")} for Season 50!`)}
      ${card(`
        <div style="text-align: center;">
          <div style="font-family: -apple-system, sans-serif; font-size: 48px; font-weight: 700; color: #A52A2A;">6<span style="color: #8A7654; font-size: 24px;">/12</span></div>
          <p style="color: #8A7654; margin: 4px 0 0 0; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">Players Joined</p>
        </div>
      `)}
      ${button('View League', `${BASE_URL}/leagues/abc123`)}
      ${card(`
        ${heading('Key Dates', 2)}
        ${paragraph(`<strong>Premiere:</strong> ${formatDate(previewDate, { includeTime: true })}`)}
        ${paragraph(`<strong>Draft deadline:</strong> ${formatDate(previewDate2, { includeTime: true })}`)}
        ${paragraph(`<strong>First weekly pick due:</strong> ${formatDate(previewDate3, { includeTime: true })} (Episode 2)`)}
      `)}
      ${divider()}
      ${heading('How The Draft Works', 2)}
      ${paragraph('• Rank all 24 castaways from 1-24 based on your preferences')}
      ${paragraph('• A random draw determines the turn order')}
      ${paragraph('• Players are assigned in reverse order each round')}
      ${paragraph("• You'll get 2 castaways for your team")}
      ${paragraph(`<em style="color: #8A7654;">May the best fan win.</em>`)}
    `, 'You\'ve joined the league!')}
  </div>
</div>

<hr>

<!-- 4. Draft Pick Confirmed -->
<div class="email-section">
  <div class="email-title">4. Draft Pick Confirmed Email</div>
  <div class="email-container">
    ${emailWrapper(`
      ${heading('Draft Pick Confirmed')}
      ${paragraph(`Hey Blake,`)}
      ${paragraph(`You've been assigned ${highlight('Parvati Shallow')} in Round 1 for ${highlight("Blake's Survivors")}.`)}
      <div style="text-align: center; margin: 24px 0;">
        ${statBox(3, 'Pick Number')}
        ${statBox('1/2', 'Round')}
      </div>
      <p style="text-align: center; color: #8A7654;">Next pick: <strong style="color: #5C1717;">Round 2</strong></p>
      ${button('View Your Team', `${BASE_URL}/leagues/abc123/team`)}
    `, 'Draft pick confirmed!')}
  </div>
</div>

<hr>

<!-- 5. Draft Complete -->
<div class="email-section">
  <div class="email-title">5. Draft Complete Email</div>
  <div class="email-container">
    ${emailWrapper(`
      ${heading('Your Team is Set!')}
      ${paragraph(`Hey Blake,`)}
      ${paragraph(`The draft for ${highlight("Blake's Survivors")} is complete. Here's your roster:`)}
      ${card(`
        <h2 style="font-family: Georgia, serif; color: #8B6914; margin: 0 0 16px 0; font-size: 20px;">Your Castaways</h2>
        <div style="display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #D4C4A8;">
          <span style="background: #A52A2A; color: #fff; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; margin-right: 12px;">1</span>
          <span><strong>Parvati Shallow</strong> <span style="color:#8A7654;">• Manu</span></span>
        </div>
        <div style="display: flex; align-items: center; padding: 12px 0;">
          <span style="background: #A52A2A; color: #fff; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; margin-right: 12px;">2</span>
          <span><strong>Tony Vlachos</strong> <span style="color:#8A7654;">• Kama</span></span>
        </div>
      `, 'immunity')}
      ${button('View Your Team', `${BASE_URL}/leagues/abc123/team`)}
      ${card(`
        ${heading("What's Next", 2)}
        ${paragraph(`The premiere airs ${formatDate(previewDate, { includeTime: true })}.`)}
        ${paragraph(`<strong>Your first weekly pick is due ${formatDate(previewDate3, { includeTime: true })}</strong> (before Episode 2). No pick is needed for the premiere episode.`)}
      `)}
      ${divider()}
      ${card(`
        <div style="text-align: center;">
          <div style="font-size: 24px; margin-bottom: 8px;">📱 Pro Tip: Text Your Picks!</div>
          ${paragraph(`Make picks on the go! Text <strong>PICK Parvati Shallow</strong> to submit your weekly pick. <a href="${BASE_URL}/profile/notifications" style="color:#A52A2A; font-weight: 500;">Set up SMS now →</a>`)}
        </div>
      `)}
      ${paragraph(`<em style="color: #8A7654;">Good luck this season.</em>`)}
    `, 'Your draft is complete!')}
  </div>
</div>

<hr>

<!-- 6. Pick Confirmed -->
<div class="email-section">
  <div class="email-title">6. Pick Confirmed Email</div>
  <div class="email-container">
    ${emailWrapper(`
      ${heading('Pick Confirmed')}
      ${paragraph(`Hey Blake,`)}
      ${card(`
        <p style="color: #8A7654; margin: 0 0 8px 0; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; text-align: center;">Your Pick for Episode 3</p>
        <div style="font-family: Georgia, serif; font-size: 32px; font-weight: 700; color: #A52A2A; text-align: center;">Parvati Shallow</div>
        <p style="color: #5C1717; font-size: 14px; margin: 12px 0 0 0; text-align: center;">Blake's Survivors</p>
      `)}
      ${paragraph(`<p style="text-align: center;">You have until <strong>${formatDate(previewDate3, { includeTime: true })}</strong> to change your pick.</p>`)}
      ${button('View Pick', `${BASE_URL}/leagues/abc123/pick`)}
      ${paragraph(`<em style="color: #8A7654; text-align: center; display: block;">Good luck!</em>`)}
    `, 'Pick confirmed!')}
  </div>
</div>

<hr>

<!-- 7. Auto-Pick Alert -->
<div class="email-section">
  <div class="email-title">7. Auto-Pick Alert Email</div>
  <div class="email-container">
    ${emailWrapper(`
      ${heading('Auto-Pick Applied')}
      ${paragraph(`Hey Blake,`)}
      ${paragraph(`You missed the pick deadline for Episode 4 in ${highlight("Blake's Survivors")}.`)}
      ${card(`
        <p style="color: #92400E; margin: 0; font-weight: 600; font-size: 18px; text-align: center;">Auto-selected: Tony Vlachos</p>
        <p style="color: #A16207; margin: 8px 0 0 0; font-size: 14px; text-align: center;">We selected the castaway you didn't play last week.</p>
      `, 'warning')}
      ${button('View Your Team', `${BASE_URL}/leagues/abc123/team`)}
      ${card(`
        <div style="text-align: center;">
          <div style="font-size: 24px; margin-bottom: 8px;">📱 Never Miss a Pick Again!</div>
          ${paragraph(`Set up SMS to make picks on the go. Just text <strong>PICK [Name]</strong> from anywhere!`)}
          ${button('Set Up SMS', `${BASE_URL}/profile/notifications`, 'success')}
        </div>
      `)}
    `, 'Auto-pick applied')}
  </div>
</div>

<hr>

<!-- 8. Payment Confirmed -->
<div class="email-section">
  <div class="email-title">8. Payment Confirmed Email</div>
  <div class="email-container">
    ${emailWrapper(`
      ${heading('Payment Received')}
      ${paragraph(`Hey Blake,`)}
      ${paragraph(`Your payment for ${highlight("Blake's Survivors")} has been received. Thank you!`)}
      ${card(`
        ${heading('Receipt', 2)}
        <table style="width: 100%; color: #5C1717; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #EDE5D5;">
            <td style="padding: 12px 0; color: #8A7654;">League</td>
            <td style="padding: 12px 0; text-align: right; font-weight: 500;">Blake's Survivors</td>
          </tr>
          <tr style="border-bottom: 1px solid #EDE5D5;">
            <td style="padding: 12px 0; color: #8A7654;">Amount</td>
            <td style="padding: 12px 0; text-align: right; color: #A52A2A; font-weight: 700; font-size: 18px;">$25.00</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #8A7654;">Date</td>
            <td style="padding: 12px 0; text-align: right; font-weight: 500;">${formatDate(new Date())}</td>
          </tr>
        </table>
      `)}
      ${button('Go to League', `${BASE_URL}/leagues/abc123`)}
      <p style="color: #8A7654; font-size: 12px; text-align: center; margin-top: 24px;">This is your official receipt. Keep it for your records.</p>
      <p style="font-size: 11px; color: #8A7654; margin-top: 16px; text-align: center; border-top: 1px solid #EDE5D5; padding-top: 16px;">Reality Games Fantasy League is a program of Follow the Unicorn Productions, a 501(c)(3) nonprofit (EIN: 99-3779763). All contributions are tax-deductible to the extent allowed by law.</p>
    `, 'Payment confirmed!')}
  </div>
</div>

<hr>

<!-- 9. Draft Reminder -->
<div class="email-section">
  <div class="email-title">9. Draft Reminder Email</div>
  <div class="email-container">
    ${emailWrapper(`
      ${heading('Complete Your Draft')}
      ${paragraph(`Hey Blake,`)}
      <div style="text-align: center; margin: 24px 0;">
        <div style="background: #FEF3C7; border: 2px solid #F59E0B; border-radius: 12px; padding: 20px; display: inline-block; min-width: 140px;">
          <div style="font-family: -apple-system, sans-serif; font-size: 36px; font-weight: 700; color: #B45309;">3</div>
          <div style="color: #92400E; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Days Remaining</div>
        </div>
      </div>
      ${paragraph(`<p style="text-align: center;">Rank your castaways for ${highlight("Blake's Survivors")} before the deadline.</p>`)}
      ${button('Complete Your Draft', `${BASE_URL}/leagues/abc123/draft`)}
      ${paragraph(`<p style="color: #8A7654; font-size: 14px; text-align: center;">If you don't complete your rankings, castaways will be auto-assigned from remaining available players.</p>`)}
    `, '3 days left to complete your draft')}
  </div>
</div>

<hr>

<!-- 10. Draft Final Warning -->
<div class="email-section">
  <div class="email-title">10. Draft Final Warning Email</div>
  <div class="email-container">
    ${emailWrapper(`
      ${heading('RANKINGS CLOSE SOON!', 1, 'error')}
      ${paragraph(`Hey Blake,`)}
      ${card(`
        <div style="font-family: -apple-system, sans-serif; font-size: 56px; font-weight: 700; color: #DC2626; text-align: center;">2h</div>
        <div style="color: #991B1B; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; font-weight: 600; text-align: center;">Until Rankings Close</div>
      `, 'error')}
      ${paragraph(`<p style="text-align: center;">Complete your castaway rankings for ${highlight("Blake's Survivors")} now!</p>`)}
      ${paragraph(`<p style="text-align: center; color: #8A7654; font-size: 14px;">Players will be assigned the following day.</p>`)}
      ${button('COMPLETE RANKINGS NOW', `${BASE_URL}/leagues/abc123/draft`, 'urgent')}
    `, 'URGENT: 2 hours left!')}
  </div>
</div>

<hr>

<!-- 11. Pick Reminder -->
<div class="email-section">
  <div class="email-title">11. Pick Reminder Email</div>
  <div class="email-container">
    ${emailWrapper(`
      ${heading('Make Your Pick!')}
      ${paragraph(`Hey Blake,`)}
      ${paragraph(`You haven't locked in your pick for ${highlight('Episode 5')} yet.`)}
      <div style="text-align: center; margin: 24px 0;">
        <div style="background: #FEF3C7; border: 2px solid #F59E0B; border-radius: 12px; padding: 20px; display: inline-block; min-width: 140px;">
          <div style="font-family: -apple-system, sans-serif; font-size: 36px; font-weight: 700; color: #B45309;">3h</div>
          <div style="color: #92400E; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Until Picks Lock</div>
        </div>
      </div>
      ${button('Make Your Pick', `${BASE_URL}/dashboard`)}
      ${paragraph(`<p style="text-align: center; color: #8A7654; font-size: 14px;">📱 <strong>Quick tip:</strong> Text <strong>PICK [Name]</strong> to make your pick via SMS! <a href="${BASE_URL}/profile/notifications" style="color:#A52A2A;">Set up SMS →</a></p>`)}
    `, '3 hours to make your pick!')}
  </div>
</div>

<hr>

<!-- 12. Pick Final Warning -->
<div class="email-section">
  <div class="email-title">12. Pick Final Warning Email</div>
  <div class="email-container">
    ${emailWrapper(`
      ${heading('PICKS LOCK IN 30 MINUTES!', 1, 'error')}
      ${paragraph(`Hey Blake,`)}
      ${card(`
        <div style="font-family: -apple-system, sans-serif; font-size: 56px; font-weight: 700; color: #DC2626; text-align: center;">30m</div>
        <div style="color: #991B1B; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; font-weight: 600; text-align: center;">Until Picks Lock</div>
      `, 'error')}
      ${paragraph(`<p style="text-align: center;">Lock in your pick for Episode 5 now.</p>`)}
      ${button('PICK NOW', `${BASE_URL}/dashboard`, 'urgent')}
    `, 'URGENT: 30 minutes!')}
  </div>
</div>

<hr>

<!-- 13. Episode Results -->
<div class="email-section">
  <div class="email-title">13. Episode Results Email</div>
  <div class="email-container">
    ${emailWrapper(`
      ${heading('Episode 5 Results Are In!', 1, 'gold')}
      ${paragraph(`Hey Blake,`)}
      ${paragraph(`<em>"Come on in, guys!" The results are in...</em>`)}
      ${card(`
        <p style="color: #8A7654; margin: 0 0 4px 0; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; text-align: center;">Your Pick</p>
        <div style="font-family: Georgia, serif; font-size: 24px; font-weight: 700; color: #5C1717; margin-bottom: 12px; text-align: center;">Parvati Shallow</div>
        <div style="font-family: -apple-system, sans-serif; font-size: 52px; font-weight: 700; color: #8B6914; text-align: center;">+47</div>
        <p style="color: #8A7654; margin: 4px 0 0 0; font-size: 13px; text-align: center;">Points This Episode</p>
      `, 'immunity')}
      ${divider()}
      ${heading('Your Leagues', 2, 'gold')}
      <div style="background-color: #FBF8F3; border: 1px solid #EDE5D5; border-radius: 12px; padding: 20px; margin: 12px 0;">
        <h3 style="margin: 0 0 12px 0; color: #A52A2A; font-family: Georgia, serif;">Blake's Survivors</h3>
        <div style="display: flex; justify-content: space-around; text-align: center;">
          <div>
            <div style="font-family: -apple-system, sans-serif; font-size: 32px; font-weight: 700; color: #A52A2A;">312</div>
            <div style="color: #8A7654; font-size: 11px; text-transform: uppercase;">Total Points</div>
          </div>
          <div>
            <div style="font-family: -apple-system, sans-serif; font-size: 32px; font-weight: 700; color: #8B6914;">#2</div>
            <div style="color: #8A7654; font-size: 11px; text-transform: uppercase;">Rank <span style="color: #22c55e;">▲1</span></div>
          </div>
          <div>
            <div style="font-family: -apple-system, sans-serif; font-size: 32px; font-weight: 700; color: #5C1717;">8</div>
            <div style="color: #8A7654; font-size: 11px; text-transform: uppercase;">Players</div>
          </div>
        </div>
      </div>
      ${button('View Full Breakdown', `${BASE_URL}/dashboard`, 'gold')}
      ${paragraph(`<em style="color: #8A7654; text-align: center; display: block;">"Worth playing for?" Absolutely. See you next week!</em>`)}
    `, 'Episode 5 results: +47 points!', 'immunity')}
  </div>
</div>

<hr>

<!-- 14. Elimination Alert -->
<div class="email-section">
  <div class="email-title">14. Elimination Alert Email</div>
  <div class="email-container">
    ${emailWrapper(`
      ${heading('The Tribe Has Spoken', 1, 'error')}
      ${paragraph(`Hey Blake,`)}
      ${paragraph('Bad news from the island...')}
      ${card(`
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 64px; margin-bottom: 12px;">🔥</div>
          <p style="font-family: Georgia, serif; color: #DC2626; font-weight: 700; font-size: 28px; margin: 16px 0 0 0;">Tony Vlachos</p>
          <p style="color: #991B1B; margin: 8px 0 0 0; font-style: italic;">has been voted out.</p>
        </div>
      `, 'error')}
      ${card(`
        ${heading('What This Means', 2)}
        ${paragraph(`Tony Vlachos is no longer earning points for you in ${highlight("Blake's Survivors")}. You'll continue with your remaining castaway.`)}
        ${paragraph('Each week, choose wisely from whoever is left on your roster!')}
      `)}
      ${button('View Your Team', `${BASE_URL}/leagues/abc123/team`)}
      ${paragraph(`<em style="color: #8A7654; text-align: center; display: block;">"The game is afoot." Don't give up!</em>`)}
    `, 'Tony Vlachos has been eliminated', 'tribal_council')}
  </div>
</div>

<hr>

<p style="color: #888; text-align: center; padding: 40px;">End of email previews</p>

</body>
</html>
`;

console.log(allEmails);
