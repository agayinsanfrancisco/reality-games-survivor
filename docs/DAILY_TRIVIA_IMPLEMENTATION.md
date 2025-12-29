# Daily Trivia Implementation

## Overview

Daily trivia feature with account requirement, 20-second timer, and leaderboard tracking days to complete all questions.

## Features

1. **One Question Per Day** - Users can only answer one question per day
2. **20-Second Timer** - Users have 20 seconds to answer or they timeout
3. **Wrong Answer = Tomorrow** - If they get it wrong or timeout, they must come back the next day
4. **Leaderboard** - Tracks how many days it took each user to complete all questions
5. **Email Notifications** - Daily emails sent at 10am PST with the trivia question
6. **Account Required** - Users must be logged in to participate

## Database Schema

### Tables

- `daily_trivia_questions` - Stores daily questions (one per day)
- `daily_trivia_answers` - Stores user answers
- `daily_trivia_leaderboard` - Tracks completion times

### Migration

Run: `npx supabase db push`

Migration file: `supabase/migrations/029_daily_trivia_tracking.sql`

## API Routes

### GET `/api/trivia/today`
- Returns today's question for authenticated user
- Includes: question, options, castaway name, progress stats
- Response format: `{ data: { question, alreadyAnswered, userAnswer, totalQuestions, questionsAnswered, daysToComplete } }`

### POST `/api/trivia/answer`
- Submits answer to today's question
- Body: `{ questionId, selectedIndex }` (selectedIndex = -1 for timeout)
- Updates leaderboard when user completes all questions
- Response format: `{ data: { isCorrect, correctIndex, funFact, isTimeout } }`

## Frontend

### Page: `/trivia`

- **Navigation & Footer** - Full site layout
- **Progress Card** - Shows questions answered / total
- **Question Card** - Displays question with 20-second timer
- **Leaderboard** - Shows top 20 fastest completions
- **Conversion CTA** - Links to join leagues

### Timer Logic

- Starts at 20 seconds when question loads
- Counts down every second
- At 0, automatically submits timeout answer (selectedIndex = -1)
- Timer stops if user already answered or result is shown

## Email Notifications

### Job: `sendDailyTrivia`

- **Schedule**: Daily at 10am PST (auto-adjusts for DST)
- **Template**: `server/src/emails/trivia.ts`
- **Theme**: Burgundy/red (tribal_council theme)
- **Content**: Question, options, castaway name, CTA button

### Email Features

- Shows question and all options
- Includes castaway name if available
- 20-second timer reminder
- "How it works" explanation
- Conversion CTA to join leagues

## Leaderboard Calculation

When a user answers their final question correctly:

1. Find first correct answer date
2. Find last correct answer date
3. Calculate days: `(lastDate - firstDate) + 1`
4. Upsert into `daily_trivia_leaderboard` table
5. Leaderboard ranks by days (ascending), then completion date (ascending)

## Styling

- **Colors**: Burgundy (#8B0000) and red (#DC2626) theme
- **Background**: Cream gradient (from-cream-100 to-cream-200)
- **Cards**: White with burgundy borders
- **Timer**: Red background with countdown
- **Buttons**: Burgundy/red gradient

## Testing

1. Create a daily question in `daily_trivia_questions` table
2. Log in as a user
3. Visit `/trivia`
4. Answer question (or let timer expire)
5. Check leaderboard updates when all questions completed

## Next Steps

1. Admin interface to create daily questions
2. User preferences for email notifications
3. Streak tracking (consecutive correct answers)
4. Badges/achievements for milestones
