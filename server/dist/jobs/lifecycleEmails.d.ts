/**
 * Lifecycle Email Jobs
 * Scheduled jobs that send emails based on user lifecycle stage
 */
export interface LifecycleResult {
    success: boolean;
    emailsSent: number;
    errors: string[];
}
/**
 * Send join league nudge emails
 * Target: Users who signed up 3+ days ago but haven't joined any non-global league
 */
export declare function sendJoinLeagueNudges(): Promise<LifecycleResult>;
/**
 * Send pre-season hype emails
 * Target: All users, sent at specific intervals before premiere (14, 7, 3, 1 days)
 */
export declare function sendPreSeasonHype(): Promise<LifecycleResult>;
/**
 * Send inactivity reminder emails
 * Target: Users who haven't logged in or made a pick in 7+ days during active season
 */
export declare function sendInactivityReminders(): Promise<LifecycleResult>;
/**
 * Send trivia progress emails
 * Target: Users who started trivia but didn't finish (50%+ progress, not completed)
 */
export declare function sendTriviaProgressEmails(): Promise<LifecycleResult>;
//# sourceMappingURL=lifecycleEmails.d.ts.map