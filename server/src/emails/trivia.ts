/**
 * Daily Trivia Email Template
 * Burgundy/red theme to match site branding
 */
import { emailWrapper, button, heading, paragraph, card, BASE_URL } from './base.js';

export interface DailyTriviaEmailData {
  displayName: string;
  question: string;
  options: string[];
  questionId: string;
  triviaUrl: string;
}

export function dailyTriviaEmailTemplate(data: DailyTriviaEmailData): string {
  const optionsList = data.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('<br>');

  return emailWrapper(`
    ${heading('🔥 Daily Survivor Trivia', 1, 'error')}
    
    ${paragraph(`Hey ${data.displayName},`)}
    
    ${paragraph('A new trivia question is waiting for you! Answer correctly to continue your streak, or come back tomorrow if you miss it.')}
    
    ${card(`
      <p style="font-size: 18px; font-weight: 600; color: #1F2937; margin-bottom: 16px; line-height: 1.5;">
        ${data.question}
      </p>
      <div style="background: #F5F0E8; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #8B0000;">
        <p style="color: #4B5563; line-height: 1.8; margin: 0;">
          ${optionsList}
        </p>
      </div>
      <p style="color: #DC2626; font-weight: 600; font-size: 14px; margin-top: 16px;">
        ⏰ You have 20 seconds to answer once you click the button!
      </p>
    `)}
    
    ${button('Answer Now →', data.triviaUrl, 'urgent')}
    
    ${paragraph(`
      <p style="color: #6B7280; font-size: 13px; margin-top: 24px;">
        <strong>How it works:</strong><br>
        • One question per day<br>
        • 20 seconds to answer or you timeout<br>
        • Get it wrong? Come back tomorrow<br>
        • Leaderboard tracks days to complete all questions
      </p>
    `)}
    
    ${paragraph(`
      <p style="color: #8A7654; font-size: 14px; text-align: center; margin-top: 32px;">
        Ready to play for real? <a href="${BASE_URL}/dashboard" style="color: #8B0000; font-weight: 600; text-decoration: underline;">Join a fantasy league →</a>
      </p>
    `)}
    `, 'Daily Survivor Trivia', 'tribal_council');
}
