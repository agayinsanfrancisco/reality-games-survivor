// Script to generate email previews for testing
import {
  emailWrapper,
  button,
  card,
  heading,
  paragraph,
  highlight,
  divider,
  BASE_URL,
} from '../src/emails/base.js';

// Generate welcome email preview
const welcomeHtml = emailWrapper(`
  ${heading('Welcome to the Game!')}
  ${paragraph(`Hey TestUser,`)}
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
`, 'Welcome to RGFL Survivor - your fantasy league adventure begins!');

console.log(welcomeHtml);
