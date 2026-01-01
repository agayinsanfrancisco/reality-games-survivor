/**
 * Lifecycle Email Jobs
 * Scheduled jobs that send emails based on user lifecycle stage
 */

import { supabaseAdmin } from '../config/supabase.js';
import { EmailService } from '../emails/service.js';
import { DateTime } from 'luxon';

const BASE_URL = process.env.FRONTEND_URL || 'https://survivor.realitygamesfantasyleague.com';

export interface LifecycleResult {
  success: boolean;
  emailsSent: number;
  errors: string[];
}

/**
 * Send join league nudge emails
 * Target: Users who signed up 3+ days ago but haven't joined any non-global league
 */
export async function sendJoinLeagueNudges(): Promise<LifecycleResult> {
  const result: LifecycleResult = { success: false, emailsSent: 0, errors: [] };

  try {
    // Get users who signed up 3-7 days ago
    const threeDaysAgo = DateTime.now().minus({ days: 3 }).toISO();
    const sevenDaysAgo = DateTime.now().minus({ days: 7 }).toISO();

    // Get all users who signed up in this window
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, display_name, created_at')
      .lt('created_at', threeDaysAgo)
      .gt('created_at', sevenDaysAgo)
      .not('email', 'is', null);

    if (usersError || !users?.length) {
      result.success = true;
      return result;
    }

    // Get users who are in non-global leagues
    const { data: leagueMembers } = await supabaseAdmin
      .from('league_members')
      .select('user_id, leagues!inner(is_global)')
      .eq('leagues.is_global', false)
      .in('user_id', users.map((u) => u.id));

    const usersInPrivateLeagues = new Set(leagueMembers?.map((m) => m.user_id) || []);

    // Get current season info
    const { data: season } = await supabaseAdmin
      .from('seasons')
      .select('name, premiere_date')
      .eq('is_active', true)
      .single();

    // Filter to users who need the nudge
    const usersToNudge = users.filter((u) => !usersInPrivateLeagues.has(u.id));

    for (const user of usersToNudge) {
      try {
        const daysSinceSignup = Math.floor(
          DateTime.now().diff(DateTime.fromISO(user.created_at), 'days').days
        );

        await EmailService.sendJoinLeagueNudge({
          displayName: user.display_name || 'Survivor Fan',
          email: user.email!,
          daysSinceSignup,
          seasonName: season?.name || 'Season 50',
          premiereDate: season?.premiere_date ? new Date(season.premiere_date) : new Date(),
        });

        result.emailsSent++;
      } catch (err) {
        result.errors.push(`Failed to send to ${user.email}: ${err}`);
      }
    }

    result.success = true;
    return result;
  } catch (err) {
    result.errors.push(`Unexpected error: ${err}`);
    return result;
  }
}

/**
 * Send pre-season hype emails
 * Target: All users, sent at specific intervals before premiere (14, 7, 3, 1 days)
 */
export async function sendPreSeasonHype(): Promise<LifecycleResult> {
  const result: LifecycleResult = { success: false, emailsSent: 0, errors: [] };

  try {
    // Get active season
    const { data: season } = await supabaseAdmin
      .from('seasons')
      .select('id, name, number, premiere_date')
      .eq('is_active', true)
      .single();

    if (!season?.premiere_date) {
      result.success = true;
      return result;
    }

    const premiereDate = DateTime.fromISO(season.premiere_date);
    const daysUntilPremiere = Math.floor(premiereDate.diff(DateTime.now(), 'days').days);

    // Only send on specific days
    const sendDays = [14, 7, 3, 1];
    if (!sendDays.includes(daysUntilPremiere)) {
      result.success = true;
      return result;
    }

    // Get all users with email
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, email, display_name')
      .not('email', 'is', null);

    if (!users?.length) {
      result.success = true;
      return result;
    }

    // Get users in leagues for this season
    const { data: leagueMembers } = await supabaseAdmin
      .from('league_members')
      .select('user_id, leagues!inner(name)')
      .eq('leagues.season_id', season.id);

    const userLeagues = new Map<string, string>();
    leagueMembers?.forEach((m: any) => {
      if (!userLeagues.has(m.user_id)) {
        userLeagues.set(m.user_id, m.leagues.name);
      }
    });

    for (const user of users) {
      try {
        const hasLeague = userLeagues.has(user.id);

        await EmailService.sendPreSeasonHype({
          displayName: user.display_name || 'Survivor Fan',
          email: user.email!,
          seasonName: season.name,
          seasonNumber: season.number,
          premiereDate: new Date(season.premiere_date),
          daysUntilPremiere,
          hasLeague,
          leagueName: hasLeague ? userLeagues.get(user.id) : undefined,
        });

        result.emailsSent++;
      } catch (err) {
        result.errors.push(`Failed to send to ${user.email}: ${err}`);
      }
    }

    result.success = true;
    return result;
  } catch (err) {
    result.errors.push(`Unexpected error: ${err}`);
    return result;
  }
}

/**
 * Send inactivity reminder emails
 * Target: Users who haven't logged in or made a pick in 7+ days during active season
 */
export async function sendInactivityReminders(): Promise<LifecycleResult> {
  const result: LifecycleResult = { success: false, emailsSent: 0, errors: [] };

  try {
    // Get active season
    const { data: season } = await supabaseAdmin
      .from('seasons')
      .select('id')
      .eq('is_active', true)
      .single();

    if (!season) {
      result.success = true;
      return result;
    }

    const sevenDaysAgo = DateTime.now().minus({ days: 7 }).toISO();

    // Get users who have made picks in this season
    const { data: recentPickers } = await supabaseAdmin
      .from('weekly_picks')
      .select('user_id')
      .gte('created_at', sevenDaysAgo);

    const activeUserIds = new Set(recentPickers?.map((p) => p.user_id) || []);

    // Get users in leagues for this season who haven't been active
    const { data: leagueMembers } = await supabaseAdmin
      .from('league_members')
      .select('user_id, users!inner(email, display_name, last_sign_in_at)')
      .not('users.email', 'is', null);

    // Count missed episodes per user
    const { data: episodes } = await supabaseAdmin
      .from('episodes')
      .select('id')
      .eq('season_id', season.id)
      .eq('picks_locked', true);

    const totalLockedEpisodes = episodes?.length || 0;

    for (const member of leagueMembers || []) {
      const userId = member.user_id;
      const user = member.users as any;

      // Skip if user was recently active
      if (activeUserIds.has(userId)) continue;

      // Check last sign in
      const lastSignIn = user.last_sign_in_at
        ? DateTime.fromISO(user.last_sign_in_at)
        : null;
      
      if (lastSignIn && lastSignIn > DateTime.now().minus({ days: 7 })) continue;

      try {
        // Count this user's picks
        const { count: pickCount } = await supabaseAdmin
          .from('weekly_picks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        const missedEpisodes = totalLockedEpisodes - (pickCount || 0);
        const daysSinceActivity = lastSignIn
          ? Math.floor(DateTime.now().diff(lastSignIn, 'days').days)
          : 30;

        await EmailService.sendInactivityReminder({
          displayName: user.display_name || 'Survivor Fan',
          email: user.email,
          daysSinceLastActivity: daysSinceActivity,
          missedEpisodes: Math.max(0, missedEpisodes),
        });

        result.emailsSent++;
      } catch (err) {
        result.errors.push(`Failed to send to ${user.email}: ${err}`);
      }
    }

    result.success = true;
    return result;
  } catch (err) {
    result.errors.push(`Unexpected error: ${err}`);
    return result;
  }
}

/**
 * Send trivia progress emails
 * Target: Users who started trivia but didn't finish (50%+ progress, not completed)
 */
export async function sendTriviaProgressEmails(): Promise<LifecycleResult> {
  const result: LifecycleResult = { success: false, emailsSent: 0, errors: [] };

  try {
    const totalQuestions = 24;

    // Get users with partial trivia progress
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, email, display_name, trivia_score, trivia_completed')
      .eq('trivia_completed', false)
      .gt('trivia_score', Math.floor(totalQuestions * 0.5)) // 50%+ progress
      .not('email', 'is', null);

    if (!users?.length) {
      result.success = true;
      return result;
    }

    for (const user of users) {
      try {
        const questionsAnswered = user.trivia_score || 0;
        const percentComplete = Math.round((questionsAnswered / totalQuestions) * 100);

        await EmailService.sendTriviaProgress({
          displayName: user.display_name || 'Survivor Fan',
          email: user.email!,
          questionsAnswered,
          questionsCorrect: questionsAnswered, // In our trivia, answered = correct
          totalQuestions,
        });

        result.emailsSent++;
      } catch (err) {
        result.errors.push(`Failed to send to ${user.email}: ${err}`);
      }
    }

    result.success = true;
    return result;
  } catch (err) {
    result.errors.push(`Unexpected error: ${err}`);
    return result;
  }
}
