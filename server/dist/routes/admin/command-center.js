/**
 * Admin Command Center Routes
 *
 * Real-time operations hub for platform management during live events.
 * Provides system status, active window context, attention items, and live activity feed.
 */
import { Router } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';
import { DateTime } from 'luxon';
import { getDraftStats, getRecentActivity } from '../../services/admin-dashboard.js';
import { measureDbLatency } from '../../lib/shared-utils.js';
import { getQueueStats } from '../../config/email.js';
import { seasonConfig } from '../../lib/season-config.js';
const router = Router();
// Store connected SSE clients
const sseClients = new Set();
/**
 * GET /api/admin/command-center/status
 * System status panel - health of all critical services
 */
router.get('/status', async (req, res) => {
    try {
        const now = DateTime.now().setZone('America/Los_Angeles');
        // Check all services in parallel
        const [dbLatency, emailStats, stripeStatus, jobHealth] = await Promise.all([
            measureDbLatency(),
            getQueueStats(),
            checkStripeHealth(),
            checkJobHealth(),
        ]);
        // Determine status for each service
        const services = {
            api: {
                status: 'up',
                latencyMs: null,
                message: 'API responding normally',
            },
            database: {
                status: dbLatency < 500 ? 'up' : dbLatency < 2000 ? 'degraded' : 'down',
                latencyMs: dbLatency,
                message: dbLatency < 500 ? 'Healthy' : `High latency: ${dbLatency}ms`,
            },
            email: {
                status: emailStats.failed_today < 10 ? 'up' : emailStats.failed_today < 50 ? 'degraded' : 'down',
                pending: emailStats.pending,
                failed: emailStats.failed_today,
                message: emailStats.failed_today === 0 ? 'Healthy' : `${emailStats.failed_today} failed today`,
            },
            payments: {
                status: stripeStatus.healthy ? 'up' : 'down',
                message: stripeStatus.message,
            },
            jobs: {
                status: jobHealth.status,
                failedLast24h: jobHealth.failedCount,
                message: jobHealth.message,
            },
        };
        // Check for active incidents
        const { data: activeIncidents } = await supabaseAdmin
            .from('incidents')
            .select('id, severity, title, status')
            .neq('status', 'resolved')
            .order('severity', { ascending: true })
            .limit(5);
        // Overall status
        const overallStatus = determineOverallStatus(services);
        res.json({
            status: overallStatus,
            services,
            activeIncidents: activeIncidents || [],
            lastChecked: now.toISO(),
        });
    }
    catch (err) {
        console.error('GET /api/admin/command-center/status error:', err);
        res.status(500).json({ error: 'Failed to fetch system status' });
    }
});
/**
 * GET /api/admin/command-center/active-window
 * Current operational context - what time-sensitive event is relevant
 */
router.get('/active-window', async (req, res) => {
    try {
        const now = DateTime.now().setZone('America/Los_Angeles');
        const season = await seasonConfig.loadCurrentSeason();
        if (!season) {
            return res.json({
                mode: 'off-cycle',
                title: 'No Active Season',
                subtitle: 'Season not configured',
                data: {},
            });
        }
        // Get next episode
        const { data: nextEpisode } = await supabaseAdmin
            .from('episodes')
            .select('*')
            .eq('season_id', season.id)
            .gte('air_date', now.toISO())
            .order('air_date', { ascending: true })
            .limit(1)
            .single();
        // Get draft stats
        const draftStats = await getDraftStats();
        // Get pick submission stats
        let pickStats = { submitted: 0, total: 0, percentage: 0 };
        if (nextEpisode) {
            const { count: submitted } = await supabaseAdmin
                .from('weekly_picks')
                .select('*', { count: 'exact', head: true })
                .eq('episode_id', nextEpisode.id);
            const { count: total } = await supabaseAdmin
                .from('league_members')
                .select('*', { count: 'exact', head: true });
            pickStats = {
                submitted: submitted || 0,
                total: total || 0,
                percentage: total ? Math.round(((submitted || 0) / total) * 100) : 0,
            };
        }
        // Determine mode based on context
        let mode = 'normal';
        let windowData = {};
        // Check for active incidents first
        const { count: activeIncidents } = await supabaseAdmin
            .from('incidents')
            .select('*', { count: 'exact', head: true })
            .neq('status', 'resolved');
        if (activeIncidents && activeIncidents > 0) {
            mode = 'incident';
            windowData = { activeIncidents };
        }
        // Check for active drafts
        else if (draftStats.inProgress > 0) {
            mode = 'draft';
            windowData = {
                activeDrafts: draftStats.inProgress,
                pendingDrafts: draftStats.pending,
            };
        }
        // Check episode timing
        else if (nextEpisode) {
            const airDate = DateTime.fromISO(nextEpisode.air_date, { zone: 'America/Los_Angeles' });
            const pickLockTime = nextEpisode.picks_lock_at
                ? DateTime.fromISO(nextEpisode.picks_lock_at, { zone: 'America/Los_Angeles' })
                : airDate.minus({ hours: 1 });
            const hoursUntilAir = airDate.diff(now, 'hours').hours;
            const hoursUntilLock = pickLockTime.diff(now, 'hours').hours;
            // Episode mode: 2 hours before airtime
            if (hoursUntilAir <= 2 && hoursUntilAir > 0) {
                mode = 'episode';
                windowData = {
                    episodeNumber: nextEpisode.number,
                    episodeTitle: nextEpisode.title,
                    airsIn: Math.round(hoursUntilAir * 60), // minutes
                    locksIn: Math.round(hoursUntilLock * 60), // minutes
                    pickStats,
                    picksLocked: hoursUntilLock <= 0,
                };
            }
            // Check if episode just aired (within 4 hours after) - scoring mode
            else if (hoursUntilAir >= -4 && hoursUntilAir <= 0) {
                mode = 'scoring';
                const { count: pendingEvents } = await supabaseAdmin
                    .from('episode_scores')
                    .select('*', { count: 'exact', head: true })
                    .eq('episode_id', nextEpisode.id)
                    .eq('is_committed', false);
                windowData = {
                    episodeNumber: nextEpisode.number,
                    episodeTitle: nextEpisode.title,
                    isScored: nextEpisode.is_scored,
                    pendingEvents: pendingEvents || 0,
                };
            }
            // Pre-episode: less than 24 hours
            else if (hoursUntilLock <= 24 && hoursUntilLock > 0) {
                mode = 'episode';
                windowData = {
                    episodeNumber: nextEpisode.number,
                    episodeTitle: nextEpisode.title,
                    airsIn: Math.round(hoursUntilAir * 60),
                    locksIn: Math.round(hoursUntilLock * 60),
                    pickStats,
                    picksLocked: false,
                };
            }
        }
        // Generate title/subtitle based on mode
        const { title, subtitle } = generateWindowText(mode, windowData);
        res.json({
            mode,
            title,
            subtitle,
            data: windowData,
        });
    }
    catch (err) {
        console.error('GET /api/admin/command-center/active-window error:', err);
        res.status(500).json({ error: 'Failed to fetch active window' });
    }
});
/**
 * GET /api/admin/command-center/attention
 * Items requiring admin attention, sorted by urgency
 */
router.get('/attention', async (req, res) => {
    try {
        const now = DateTime.now().setZone('America/Los_Angeles');
        const attentionItems = [];
        // 1. Users without picks (if deadline within 24h)
        const { data: nextEpisode } = await supabaseAdmin
            .from('episodes')
            .select('id, number, picks_lock_at, air_date')
            .gt('picks_lock_at', now.toISO())
            .order('picks_lock_at', { ascending: true })
            .limit(1)
            .single();
        if (nextEpisode) {
            const lockTime = DateTime.fromISO(nextEpisode.picks_lock_at || nextEpisode.air_date, {
                zone: 'America/Los_Angeles',
            });
            const hoursUntilLock = lockTime.diff(now, 'hours').hours;
            if (hoursUntilLock <= 24) {
                // Get users who haven't picked
                const { data: usersWithPicks } = await supabaseAdmin
                    .from('weekly_picks')
                    .select('user_id')
                    .eq('episode_id', nextEpisode.id);
                const userIdsWithPicks = new Set(usersWithPicks?.map(p => p.user_id) || []);
                const { data: allMembers } = await supabaseAdmin
                    .from('league_members')
                    .select('user_id')
                    .not('user_id', 'in', `(${Array.from(userIdsWithPicks).join(',') || 'null'})`);
                const uniqueUsersWithoutPicks = new Set(allMembers?.map(m => m.user_id) || []);
                if (uniqueUsersWithoutPicks.size > 0) {
                    attentionItems.push({
                        id: 'missing-picks',
                        category: 'picks',
                        severity: hoursUntilLock < 4 ? 'critical' : hoursUntilLock < 12 ? 'warning' : 'info',
                        title: `${uniqueUsersWithoutPicks.size} users haven't submitted picks`,
                        description: `Episode ${nextEpisode.number} locks in ${Math.round(hoursUntilLock)}h`,
                        actionLabel: 'Send Reminder',
                        actionEndpoint: '/api/admin/picks/send-reminders',
                        actionType: 'mutation',
                        count: uniqueUsersWithoutPicks.size,
                        createdAt: now.toISO(),
                    });
                }
            }
        }
        // 2. Failed payments
        const { data: failedPayments, count: failedPaymentCount } = await supabaseAdmin
            .from('payments')
            .select('*', { count: 'exact' })
            .eq('status', 'failed')
            .order('created_at', { ascending: false })
            .limit(5);
        if (failedPaymentCount && failedPaymentCount > 0) {
            attentionItems.push({
                id: 'failed-payments',
                category: 'payments',
                severity: failedPaymentCount > 5 ? 'critical' : 'warning',
                title: `${failedPaymentCount} failed payment${failedPaymentCount > 1 ? 's' : ''}`,
                description: 'Payments need retry or follow-up',
                actionLabel: 'View Payments',
                actionEndpoint: '/admin/payments',
                actionType: 'link',
                count: failedPaymentCount,
                createdAt: now.toISO(),
            });
        }
        // 3. Failed emails
        const { count: failedEmailCount } = await supabaseAdmin
            .from('failed_emails')
            .select('*', { count: 'exact', head: true })
            .eq('retry_attempted', false);
        if (failedEmailCount && failedEmailCount > 0) {
            attentionItems.push({
                id: 'failed-emails',
                category: 'email',
                severity: failedEmailCount > 20 ? 'critical' : failedEmailCount > 5 ? 'warning' : 'info',
                title: `${failedEmailCount} failed email${failedEmailCount > 1 ? 's' : ''}`,
                description: 'Emails need retry',
                actionLabel: 'Retry All',
                actionEndpoint: '/api/admin/failed-emails/retry-all',
                actionType: 'mutation',
                count: failedEmailCount,
                createdAt: now.toISO(),
            });
        }
        // 4. Uncommitted scoring
        const { data: lastAiredEpisode } = await supabaseAdmin
            .from('episodes')
            .select('id, number, is_scored')
            .lt('air_date', now.toISO())
            .order('air_date', { ascending: false })
            .limit(1)
            .single();
        if (lastAiredEpisode && !lastAiredEpisode.is_scored) {
            attentionItems.push({
                id: 'uncommitted-scoring',
                category: 'scoring',
                severity: 'warning',
                title: `Episode ${lastAiredEpisode.number} scoring not finalized`,
                description: 'Scoring events need to be committed',
                actionLabel: 'Go to Scoring',
                actionEndpoint: `/admin/scoring?episode=${lastAiredEpisode.id}`,
                actionType: 'link',
                count: 1,
                createdAt: now.toISO(),
            });
        }
        // 5. Failed jobs (last 24h)
        const { count: failedJobCount } = await supabaseAdmin
            .from('job_runs')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'failed')
            .gte('started_at', now.minus({ hours: 24 }).toISO());
        if (failedJobCount && failedJobCount > 0) {
            attentionItems.push({
                id: 'failed-jobs',
                category: 'system',
                severity: failedJobCount > 5 ? 'critical' : 'warning',
                title: `${failedJobCount} job failure${failedJobCount > 1 ? 's' : ''} in last 24h`,
                description: 'Background jobs failed',
                actionLabel: 'View Jobs',
                actionEndpoint: '/admin/jobs',
                actionType: 'link',
                count: failedJobCount,
                createdAt: now.toISO(),
            });
        }
        // 6. Stalled drafts (in progress for > 1 hour with no recent picks)
        const { data: stalledDrafts } = await supabaseAdmin
            .from('leagues')
            .select('id, name')
            .eq('draft_status', 'in_progress')
            .lt('draft_started_at', now.minus({ hours: 1 }).toISO());
        if (stalledDrafts && stalledDrafts.length > 0) {
            attentionItems.push({
                id: 'stalled-drafts',
                category: 'drafts',
                severity: 'warning',
                title: `${stalledDrafts.length} stalled draft${stalledDrafts.length > 1 ? 's' : ''}`,
                description: 'Drafts in progress for over 1 hour',
                actionLabel: 'View Drafts',
                actionEndpoint: '/admin/drafts',
                actionType: 'link',
                count: stalledDrafts.length,
                createdAt: now.toISO(),
            });
        }
        // Sort by severity
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        attentionItems.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
        res.json({
            items: attentionItems,
            totalCount: attentionItems.reduce((sum, item) => sum + (item.count || 1), 0),
        });
    }
    catch (err) {
        console.error('GET /api/admin/command-center/attention error:', err);
        res.status(500).json({ error: 'Failed to fetch attention items' });
    }
});
/**
 * GET /api/admin/command-center/operations
 * Active operations metrics
 */
router.get('/operations', async (req, res) => {
    try {
        const now = DateTime.now().setZone('America/Los_Angeles');
        const fiveMinAgo = now.minus({ minutes: 5 }).toISO();
        // Users online (active in last 5 min)
        const { count: usersOnline } = await supabaseAdmin
            .from('users')
            .select('*', { count: 'exact', head: true })
            .gte('last_sign_in_at', fiveMinAgo);
        // Active drafts
        const { data: activeDrafts } = await supabaseAdmin
            .from('leagues')
            .select('id, name, draft_started_at')
            .eq('draft_status', 'in_progress');
        // Pick stats for current episode
        const { data: nextEpisode } = await supabaseAdmin
            .from('episodes')
            .select('id')
            .gt('picks_lock_at', now.toISO())
            .order('picks_lock_at', { ascending: true })
            .limit(1)
            .single();
        let pickStats = { submitted: 0, total: 0 };
        if (nextEpisode) {
            const { count: submitted } = await supabaseAdmin
                .from('weekly_picks')
                .select('*', { count: 'exact', head: true })
                .eq('episode_id', nextEpisode.id);
            const { count: total } = await supabaseAdmin
                .from('league_members')
                .select('*', { count: 'exact', head: true });
            pickStats = { submitted: submitted || 0, total: total || 0 };
        }
        res.json({
            usersOnline: usersOnline || 0,
            activeDrafts: activeDrafts?.length || 0,
            draftsInProgress: activeDrafts || [],
            picks: pickStats,
            timestamp: now.toISO(),
        });
    }
    catch (err) {
        console.error('GET /api/admin/command-center/operations error:', err);
        res.status(500).json({ error: 'Failed to fetch operations data' });
    }
});
/**
 * GET /api/admin/command-center/live-feed
 * Server-Sent Events for real-time activity stream
 */
router.get('/live-feed', async (req, res) => {
    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    // Add to connected clients
    sseClients.add(res);
    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);
    // Send recent activity on connect
    try {
        const recentActivity = await getRecentActivity(10);
        res.write(`data: ${JSON.stringify({ type: 'initial', activities: recentActivity })}\n\n`);
    }
    catch (err) {
        console.error('Error fetching initial activity:', err);
    }
    // Keep connection alive with heartbeat
    const heartbeat = setInterval(() => {
        res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`);
    }, 30000);
    // Clean up on disconnect
    req.on('close', () => {
        clearInterval(heartbeat);
        sseClients.delete(res);
    });
});
/**
 * Broadcast event to all connected SSE clients
 */
export function broadcastToCommandCenter(event) {
    const message = JSON.stringify(event);
    sseClients.forEach(client => {
        client.write(`data: ${message}\n\n`);
    });
}
async function checkStripeHealth() {
    try {
        // Check if Stripe is configured
        if (!process.env.STRIPE_SECRET_KEY) {
            return { healthy: false, message: 'Stripe not configured' };
        }
        // Basic health - just check env is set
        // Could add actual Stripe API health check here
        return { healthy: true, message: 'Connected' };
    }
    catch {
        return { healthy: false, message: 'Stripe connection error' };
    }
}
async function checkJobHealth() {
    try {
        const now = DateTime.now();
        const { count: failedCount } = await supabaseAdmin
            .from('job_runs')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'failed')
            .gte('started_at', now.minus({ hours: 24 }).toISO());
        const failed = failedCount || 0;
        if (failed === 0) {
            return { status: 'up', failedCount: 0, message: 'All jobs healthy' };
        }
        else if (failed < 5) {
            return { status: 'degraded', failedCount: failed, message: `${failed} failures in 24h` };
        }
        else {
            return { status: 'down', failedCount: failed, message: `${failed} failures in 24h` };
        }
    }
    catch {
        return { status: 'down', failedCount: 0, message: 'Job health check failed' };
    }
}
function determineOverallStatus(services) {
    const statuses = Object.values(services).map(s => s.status);
    if (statuses.includes('down'))
        return 'down';
    if (statuses.includes('degraded'))
        return 'degraded';
    return 'operational';
}
function generateWindowText(mode, data) {
    switch (mode) {
        case 'episode':
            return {
                title: `Episode ${data.episodeNumber}`,
                subtitle: data.picksLocked
                    ? 'Picks are locked'
                    : `Locks in ${Math.floor(data.locksIn / 60)}h ${data.locksIn % 60}m`,
            };
        case 'scoring':
            return {
                title: `Episode ${data.episodeNumber} Scoring`,
                subtitle: data.isScored ? 'Scoring complete' : `${data.pendingEvents} events pending`,
            };
        case 'draft':
            return {
                title: 'Active Drafts',
                subtitle: `${data.activeDrafts} draft${data.activeDrafts > 1 ? 's' : ''} in progress`,
            };
        case 'incident':
            return {
                title: 'Active Incident',
                subtitle: `${data.activeIncidents} incident${data.activeIncidents > 1 ? 's' : ''} open`,
            };
        case 'off-cycle':
            return {
                title: 'Off-Cycle',
                subtitle: 'No active events',
            };
        default:
            return {
                title: 'Normal Operations',
                subtitle: 'System running normally',
            };
    }
}
export default router;
//# sourceMappingURL=command-center.js.map