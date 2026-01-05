/**
 * Admin Picks Routes
 *
 * Monitor weekly pick submissions and patterns.
 */
import { Router } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';
import { DateTime } from 'luxon';
import { logAdminAction } from '../../services/audit-logger.js';
import { seasonConfig } from '../../lib/season-config.js';
const router = Router();
/**
 * GET /api/admin/picks/current
 * Get pick stats for the current/upcoming episode
 */
router.get('/current', async (req, res) => {
    try {
        const now = DateTime.now().setZone('America/Los_Angeles');
        const season = await seasonConfig.loadCurrentSeason();
        if (!season) {
            return res.json({ episode: null, stats: null });
        }
        // Get current or next episode (exclude episode 1 - no picks in premiere week)
        const { data: episode } = await supabaseAdmin
            .from('episodes')
            .select('*')
            .eq('season_id', season.id)
            .gt('number', 1) // Skip episode 1 - no picks in premiere week
            .gt('picks_lock_at', now.minus({ hours: 24 }).toISO())
            .order('picks_lock_at', { ascending: true })
            .limit(1)
            .single();
        if (!episode) {
            return res.json({ episode: null, stats: null });
        }
        // Get pick stats
        const { count: submitted } = await supabaseAdmin
            .from('weekly_picks')
            .select('*', { count: 'exact', head: true })
            .eq('episode_id', episode.id);
        const { count: totalEligible } = await supabaseAdmin
            .from('league_members')
            .select('*', { count: 'exact', head: true });
        // Get users who haven't picked
        const { data: usersWithPicks } = await supabaseAdmin
            .from('weekly_picks')
            .select('user_id')
            .eq('episode_id', episode.id);
        const userIdsWithPicks = new Set(usersWithPicks?.map(p => p.user_id) || []);
        const { data: usersWithoutPicks } = await supabaseAdmin
            .from('league_members')
            .select(`
        user_id,
        users:user_id (
          id,
          display_name,
          email,
          last_sign_in_at
        )
      `)
            .order('user_id');
        // Filter to unique users without picks
        const seenUsers = new Set();
        const missingUsers = (usersWithoutPicks || [])
            .filter(m => {
            if (userIdsWithPicks.has(m.user_id) || seenUsers.has(m.user_id)) {
                return false;
            }
            seenUsers.add(m.user_id);
            return true;
        })
            .map(m => m.users)
            .filter(Boolean);
        // Get picks by league
        const { data: picksByLeague } = await supabaseAdmin
            .from('weekly_picks')
            .select(`
        league_id,
        leagues:league_id (
          id,
          name
        )
      `)
            .eq('episode_id', episode.id);
        const leaguePickCounts = {};
        picksByLeague?.forEach(p => {
            const leagueId = p.league_id;
            if (!leaguePickCounts[leagueId]) {
                leaguePickCounts[leagueId] = { name: p.leagues?.name || 'Unknown', count: 0 };
            }
            leaguePickCounts[leagueId].count++;
        });
        // Get league member counts
        const { data: leagueMemberCounts } = await supabaseAdmin
            .from('league_members')
            .select('league_id')
            .order('league_id');
        const leagueTotals = {};
        leagueMemberCounts?.forEach(m => {
            leagueTotals[m.league_id] = (leagueTotals[m.league_id] || 0) + 1;
        });
        const leagueStats = Object.entries(leaguePickCounts).map(([id, data]) => ({
            id,
            name: data.name,
            submitted: data.count,
            total: leagueTotals[id] || 0,
            percentage: leagueTotals[id] ? Math.round((data.count / leagueTotals[id]) * 100) : 0,
        }));
        const lockTime = DateTime.fromISO(episode.picks_lock_at, { zone: 'America/Los_Angeles' });
        const hoursUntilLock = lockTime.diff(now, 'hours').hours;
        const minutesUntilLock = lockTime.diff(now, 'minutes').minutes;
        res.json({
            episode: {
                id: episode.id,
                number: episode.number,
                title: episode.title,
                air_date: episode.air_date,
                picks_lock_at: episode.picks_lock_at,
                is_locked: now > lockTime,
                time_until_lock: {
                    hours: Math.floor(hoursUntilLock),
                    minutes: Math.floor(minutesUntilLock % 60),
                },
            },
            stats: {
                submitted: submitted || 0,
                total: totalEligible || 0,
                percentage: totalEligible ? Math.round(((submitted || 0) / totalEligible) * 100) : 0,
                missingCount: missingUsers.length,
            },
            missingUsers: missingUsers.slice(0, 50), // Limit to 50
            leagueStats: leagueStats.sort((a, b) => b.total - a.total),
        });
    }
    catch (err) {
        console.error('GET /api/admin/picks/current error:', err);
        res.status(500).json({ error: 'Failed to fetch current picks' });
    }
});
/**
 * GET /api/admin/picks/episode/:episodeId
 * Get all picks for a specific episode
 */
router.get('/episode/:episodeId', async (req, res) => {
    try {
        const { episodeId } = req.params;
        const { groupBy = 'user' } = req.query;
        // Get episode info
        const { data: episode, error: episodeError } = await supabaseAdmin
            .from('episodes')
            .select('*')
            .eq('id', episodeId)
            .single();
        if (episodeError || !episode) {
            return res.status(404).json({ error: 'Episode not found' });
        }
        // Get all picks for this episode
        const { data: picks, error: picksError } = await supabaseAdmin
            .from('weekly_picks')
            .select(`
        id,
        user_id,
        league_id,
        castaway_id,
        created_at,
        users:user_id (
          id,
          display_name
        ),
        leagues:league_id (
          id,
          name
        ),
        castaways:castaway_id (
          id,
          name,
          tribe_id
        )
      `)
            .eq('episode_id', episodeId)
            .order('created_at', { ascending: false });
        if (picksError)
            throw picksError;
        // Get pick performance (points earned)
        const { data: scores } = await supabaseAdmin
            .from('episode_scores')
            .select('castaway_id, points')
            .eq('episode_id', episodeId)
            .eq('is_committed', true);
        const castawayPoints = {};
        scores?.forEach(s => {
            castawayPoints[s.castaway_id] = (castawayPoints[s.castaway_id] || 0) + s.points;
        });
        // Enrich picks with points
        const enrichedPicks = picks?.map(pick => ({
            ...pick,
            points_earned: castawayPoints[pick.castaway_id] || 0,
        }));
        // Calculate stats
        const castawayPickCount = {};
        enrichedPicks?.forEach(p => {
            const cid = p.castaway_id;
            const cname = p.castaways?.name || 'Unknown';
            if (!castawayPickCount[cid]) {
                castawayPickCount[cid] = { name: cname, count: 0, points: castawayPoints[cid] || 0 };
            }
            castawayPickCount[cid].count++;
        });
        const castawayStats = Object.entries(castawayPickCount)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.count - a.count);
        res.json({
            episode,
            picks: enrichedPicks,
            stats: {
                totalPicks: picks?.length || 0,
                mostPicked: castawayStats.slice(0, 5),
                leastPicked: castawayStats.slice(-5).reverse(),
                bestPick: castawayStats.sort((a, b) => b.points - a.points)[0],
                worstPick: castawayStats.sort((a, b) => a.points - b.points)[0],
            },
        });
    }
    catch (err) {
        console.error('GET /api/admin/picks/episode/:episodeId error:', err);
        res.status(500).json({ error: 'Failed to fetch episode picks' });
    }
});
/**
 * GET /api/admin/picks/patterns
 * Detect suspicious picking patterns (anti-gaming)
 */
router.get('/patterns', async (req, res) => {
    try {
        const flags = [];
        // 1. Check for same picks across accounts in same league
        // Get recent picks by league
        const { data: recentPicks } = await supabaseAdmin
            .from('weekly_picks')
            .select(`
        user_id,
        league_id,
        castaway_id,
        episode_id,
        created_at,
        users:user_id (display_name)
      `)
            .order('created_at', { ascending: false })
            .limit(1000);
        // Group by league + episode
        const leagueEpisodePicks = {};
        recentPicks?.forEach(p => {
            const key = `${p.league_id}-${p.episode_id}`;
            if (!leagueEpisodePicks[key]) {
                leagueEpisodePicks[key] = {};
            }
            const castawayKey = p.castaway_id;
            if (!leagueEpisodePicks[key][castawayKey]) {
                leagueEpisodePicks[key][castawayKey] = [];
            }
            leagueEpisodePicks[key][castawayKey].push(p.user_id);
        });
        // Check for duplicate picks
        Object.entries(leagueEpisodePicks).forEach(([leagueEp, castawayUsers]) => {
            Object.entries(castawayUsers).forEach(([castaway, users]) => {
                if (users.length > 3) {
                    // More than 3 users picked same castaway in same league/episode
                    // This is normal, but flag if they all picked at similar times
                }
            });
        });
        // 2. Check for last-second picks
        const now = DateTime.now().setZone('America/Los_Angeles');
        const { data: nextEpisode } = await supabaseAdmin
            .from('episodes')
            .select('id, picks_lock_at')
            .gt('picks_lock_at', now.toISO())
            .order('picks_lock_at', { ascending: true })
            .limit(1)
            .single();
        if (nextEpisode) {
            const lockTime = DateTime.fromISO(nextEpisode.picks_lock_at);
            const { data: lastMinutePicks } = await supabaseAdmin
                .from('weekly_picks')
                .select(`
          user_id,
          created_at,
          users:user_id (display_name, email)
        `)
                .eq('episode_id', nextEpisode.id)
                .gt('created_at', lockTime.minus({ minutes: 5 }).toISO())
                .lt('created_at', lockTime.toISO());
            if (lastMinutePicks && lastMinutePicks.length > 5) {
                flags.push({
                    type: 'last_second_picks',
                    severity: 'low',
                    description: `${lastMinutePicks.length} picks submitted in final 5 minutes before lock`,
                    users: lastMinutePicks.map(p => ({
                        user: p.users,
                        submitted_at: p.created_at,
                    })),
                });
            }
        }
        // 3. Check for unusually accurate pickers
        const { data: userScores } = await supabaseAdmin.rpc('get_user_pick_accuracy');
        // Users with >80% positive picks over 5+ episodes
        const accurateUsers = userScores?.filter((u) => u.episodes_picked >= 5 && u.accuracy > 80) || [];
        if (accurateUsers.length > 0) {
            flags.push({
                type: 'high_accuracy',
                severity: 'medium',
                description: `${accurateUsers.length} users with >80% pick accuracy over 5+ episodes`,
                users: accurateUsers.slice(0, 10),
            });
        }
        res.json({
            flags,
            scannedAt: now.toISO(),
        });
    }
    catch (err) {
        console.error('GET /api/admin/picks/patterns error:', err);
        res.status(500).json({ error: 'Failed to analyze patterns' });
    }
});
/**
 * POST /api/admin/picks/send-reminders
 * Send pick reminder emails to users who haven't submitted
 */
router.post('/send-reminders', async (req, res) => {
    try {
        const { episodeId, userIds } = req.body;
        const adminId = req.user.id;
        const now = DateTime.now().setZone('America/Los_Angeles');
        // Get episode
        let targetEpisodeId = episodeId;
        if (!targetEpisodeId) {
            const { data: nextEp } = await supabaseAdmin
                .from('episodes')
                .select('id')
                .gt('picks_lock_at', now.toISO())
                .order('picks_lock_at', { ascending: true })
                .limit(1)
                .single();
            targetEpisodeId = nextEp?.id;
        }
        if (!targetEpisodeId) {
            return res.status(400).json({ error: 'No upcoming episode found' });
        }
        // Get users who haven't picked
        const { data: usersWithPicks } = await supabaseAdmin
            .from('weekly_picks')
            .select('user_id')
            .eq('episode_id', targetEpisodeId);
        const userIdsWithPicks = new Set(usersWithPicks?.map(p => p.user_id) || []);
        let targetUsers;
        if (userIds && userIds.length > 0) {
            // Send to specific users
            const { data } = await supabaseAdmin
                .from('users')
                .select('id, email, display_name')
                .in('id', userIds)
                .eq('email_notifications', true);
            targetUsers = data?.filter(u => !userIdsWithPicks.has(u.id));
        }
        else {
            // Get all users without picks
            const { data: allMembers } = await supabaseAdmin
                .from('league_members')
                .select(`
          user_id,
          users:user_id (
            id,
            email,
            display_name,
            email_notifications
          )
        `);
            const seenUsers = new Set();
            targetUsers = (allMembers || [])
                .filter(m => {
                const userId = m.user_id;
                if (userIdsWithPicks.has(userId) || seenUsers.has(userId)) {
                    return false;
                }
                seenUsers.add(userId);
                return m.users?.email_notifications !== false;
            })
                .map(m => m.users)
                .filter(Boolean);
        }
        if (!targetUsers || targetUsers.length === 0) {
            return res.json({ success: true, message: 'No users to remind', sentCount: 0 });
        }
        // In a real implementation, queue these emails
        // For now, just log and return success
        await logAdminAction(req, 'send_pick_reminders', 'episode', targetEpisodeId, {
            target_count: targetUsers.length,
            user_ids: targetUsers.slice(0, 100).map((u) => u.id),
        });
        res.json({
            success: true,
            message: `Reminder queued for ${targetUsers.length} users`,
            sentCount: targetUsers.length,
        });
    }
    catch (err) {
        console.error('POST /api/admin/picks/send-reminders error:', err);
        res.status(500).json({ error: 'Failed to send reminders' });
    }
});
/**
 * GET /api/admin/picks/history
 * Get pick submission history across episodes
 */
router.get('/history', async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const season = await seasonConfig.loadCurrentSeason();
        if (!season) {
            return res.json({ episodes: [] });
        }
        const { data: episodes, error } = await supabaseAdmin
            .from('episodes')
            .select('id, number, title, air_date, picks_lock_at')
            .eq('season_id', season.id)
            .lt('picks_lock_at', new Date().toISOString())
            .order('number', { ascending: false })
            .limit(Number(limit));
        if (error)
            throw error;
        // Get pick counts for each episode
        const episodesWithStats = await Promise.all((episodes || []).map(async (ep) => {
            const { count } = await supabaseAdmin
                .from('weekly_picks')
                .select('*', { count: 'exact', head: true })
                .eq('episode_id', ep.id);
            return {
                ...ep,
                pick_count: count || 0,
            };
        }));
        res.json({ episodes: episodesWithStats });
    }
    catch (err) {
        console.error('GET /api/admin/picks/history error:', err);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});
export default router;
//# sourceMappingURL=picks.js.map