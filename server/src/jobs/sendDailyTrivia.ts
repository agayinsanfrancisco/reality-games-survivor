/**
 * Send Daily Trivia Email Job
 * Sends trivia question to all users who have opted in
 */
import { supabaseAdmin } from '../config/supabase.js';
import { enqueueEmail } from '../lib/email-queue.js';
import { dailyTriviaEmailTemplate } from '../emails/trivia.js';

export interface DailyTriviaResult {
  success: boolean;
  questionDate: string;
  questionId: string | null;
  usersNotified: number;
  errors: string[];
}

export async function sendDailyTrivia(): Promise<DailyTriviaResult> {
  const result: DailyTriviaResult = {
    success: false,
    questionDate: new Date().toISOString().split('T')[0],
    questionId: null,
    usersNotified: 0,
    errors: [],
  };

  try {
    // Get today's question
    const today = new Date().toISOString().split('T')[0];
    const { data: question, error: questionError } = await supabaseAdmin
      .from('daily_trivia_questions')
      .select('*')
      .eq('question_date', today)
      .single();

    if (questionError || !question) {
      result.errors.push(`No trivia question found for ${today}`);
      return result;
    }

    result.questionId = question.id;

    // Get all users who want trivia emails
    // For now, get all active users - later we can add a preference field
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, display_name')
      .not('email', 'is', null);

    if (usersError || !users || users.length === 0) {
      result.errors.push('No users found to notify');
      return result;
    }

    // Check which users haven't answered today
    const { data: answeredUsers } = await supabaseAdmin
      .from('daily_trivia_answers')
      .select('user_id')
      .eq('question_id', question.id);

    const answeredUserIds = new Set(answeredUsers?.map((a) => a.user_id) || []);

    // Filter to users who haven't answered
    const usersToNotify = users.filter((u) => !answeredUserIds.has(u.id));

    // Send emails
    const triviaUrl = `${process.env.FRONTEND_URL || 'https://survivor.realitygamesfantasyleague.com'}/trivia`;

    for (const user of usersToNotify) {
      try {
        await enqueueEmail({
          to: user.email!,
          subject: "Today's Survivor Trivia Question",
          html: dailyTriviaEmailTemplate({
            displayName: user.display_name || 'Survivor Fan',
            question: question.question,
            options: question.options,
            questionId: question.id,
            triviaUrl: triviaUrl,
          }),
        });
        result.usersNotified++;
      } catch (error) {
        result.errors.push(`Failed to send to ${user.email}: ${error}`);
      }
    }

    result.success = true;
    return result;
  } catch (error) {
    result.errors.push(`Unexpected error: ${error}`);
    return result;
  }
}
