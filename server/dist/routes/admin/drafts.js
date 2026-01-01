/**
 * Admin Drafts Routes
 *
 * Monitor and manage fantasy drafts.
 */
import { Router } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';
import { DateTime } from 'luxon';
import { logAdminAction } from '../../services/audit-logger.js';
import { broadcastToCommandCenter } from './command-center.js';
const router = Router();
/**
 * GET /api/admin/drafts/active
 * Get all active drafts with real-time status
 */
router.get('/active', async (req, res) => {
    try {
        const now = DateTime.now().setZone('America/Los_Angeles');
        const { data: activeDrafts, error } = await supabaseAdmin
            .from('leagues')
            .select(`
        id,
        name,
        code,
        draft_status,
        draft_started_at,
        draft_type,
        draft_time_per_pick,
        current_pick,
        draft_order,
        commissioner_id,
        commissioner:commissioner_id (
          id,
          display_name
        ),
        league_members (
          user_id,
          users:user_id (
            id,
            display_name
          )
        )
      `)
            .eq('draft_status', 'in_progress')
            .order('draft_started_at', { ascending: true });
        if (error)
            throw error;
        // Enrich with timing info
        const enrichedDrafts = (activeDrafts || []).map(draft => {
            const startedAt = draft.draft_started_at
                ? DateTime.fromISO(draft.draft_started_at, { zone: 'America/Los_Angeles' })
                : null;
            const durationMinutes = startedAt
                ? Math.round(now.diff(startedAt, 'minutes').minutes)
                : 0;
            const memberCount = draft.league_members?.length || 0;
            const totalPicks = memberCount * 6; // Assuming 6 rounds
            const currentPickNum = draft.current_pick || 1;
            const progress = totalPicks > 0 ? Math.round((currentPickNum / totalPicks) * 100) : 0;
            // Determine current picker
            const draftOrder = draft.draft_order || [];
            const currentPickerIndex = (currentPickNum - 1) % memberCount;
            const round = Math.ceil(currentPickNum / memberCount);
            const isSnake = draft.draft_type === 'snake';
            let actualPickerIndex = currentPickerIndex;
            if (isSnake && round % 2 === 0) {
                actualPickerIndex = memberCount - 1 - currentPickerIndex;
            }
            const currentPickerId = draftOrder[actualPickerIndex];
            const currentPicker = draft.league_members?.find((m) => m.user_id === currentPickerId);
            // Check if stalled (no pick in last 5 minutes)
            const isStalled = durationMinutes > 5 && progress < 100;
            return {
                id: draft.id,
                name: draft.name,
                code: draft.code,
                commissioner: draft.commissioner,
                memberCount,
                draftType: draft.draft_type,
                timePerPick: draft.draft_time_per_pick,
                startedAt: draft.draft_started_at,
                durationMinutes,
                currentPick: currentPickNum,
                totalPicks,
                progress,
                currentPicker: currentPicker?.users || null,
                round,
                isStalled,
            };
        });
        res.json({
            drafts: enrichedDrafts,
            totalActive: enrichedDrafts.length,
            stalledCount: enrichedDrafts.filter(d => d.isStalled).length,
        });
    }
    catch (err) {
        console.error('GET /api/admin/drafts/active error:', err);
        res.status(500).json({ error: 'Failed to fetch active drafts' });
    }
});
/**
 * GET /api/admin/drafts/queue
 * Get upcoming/pending drafts
 */
router.get('/queue', async (req, res) => {
    try {
        const { data: pendingDrafts, error } = await supabaseAdmin
            .from('leagues')
            .select(`
        id,
        name,
        code,
        draft_status,
        created_at,
        commissioner_id,
        commissioner:commissioner_id (
          id,
          display_name
        ),
        league_members (count)
      `)
            .eq('draft_status', 'pending')
            .eq('is_global', false)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        const enrichedDrafts = (pendingDrafts || []).map(draft => ({
            id: draft.id,
            name: draft.name,
            code: draft.code,
            commissioner: draft.commissioner,
            memberCount: draft.league_members?.[0]?.count || 0,
            createdAt: draft.created_at,
            isReady: (draft.league_members?.[0]?.count || 0) >= 2,
        }));
        res.json({
            drafts: enrichedDrafts,
            totalPending: enrichedDrafts.length,
            readyCount: enrichedDrafts.filter(d => d.isReady).length,
        });
    }
    catch (err) {
        console.error('GET /api/admin/drafts/queue error:', err);
        res.status(500).json({ error: 'Failed to fetch draft queue' });
    }
});
/**
 * GET /api/admin/drafts/history
 * Get completed drafts
 */
router.get('/history', async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        const { data: completedDrafts, error } = await supabaseAdmin
            .from('leagues')
            .select(`
        id,
        name,
        code,
        draft_status,
        draft_started_at,
        draft_completed_at,
        commissioner:commissioner_id (
          id,
          display_name
        ),
        league_members (count)
      `)
            .eq('draft_status', 'completed')
            .eq('is_global', false)
            .order('draft_completed_at', { ascending: false })
            .limit(Number(limit));
        if (error)
            throw error;
        const enrichedDrafts = (completedDrafts || []).map(draft => {
            const startedAt = draft.draft_started_at
                ? DateTime.fromISO(draft.draft_started_at)
                : null;
            const completedAt = draft.draft_completed_at
                ? DateTime.fromISO(draft.draft_completed_at)
                : null;
            const durationMinutes = startedAt && completedAt
                ? Math.round(completedAt.diff(startedAt, 'minutes').minutes)
                : null;
            return {
                id: draft.id,
                name: draft.name,
                code: draft.code,
                commissioner: draft.commissioner,
                memberCount: draft.league_members?.[0]?.count || 0,
                startedAt: draft.draft_started_at,
                completedAt: draft.draft_completed_at,
                durationMinutes,
            };
        });
        res.json({
            drafts: enrichedDrafts,
        });
    }
    catch (err) {
        console.error('GET /api/admin/drafts/history error:', err);
        res.status(500).json({ error: 'Failed to fetch draft history' });
    }
});
/**
 * GET /api/admin/drafts/:id
 * Get detailed draft info
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data: draft, error } = await supabaseAdmin
            .from('leagues')
            .select(`
        *,
        commissioner:commissioner_id (
          id,
          display_name,
          email
        ),
        league_members (
          user_id,
          draft_position,
          users:user_id (
            id,
            display_name
          )
        ),
        rosters (
          user_id,
          castaway_id,
          draft_pick_number,
          castaways:castaway_id (
            id,
            name,
            tribe_id
          )
        )
      `)
            .eq('id', id)
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Draft not found' });
            }
            throw error;
        }
        res.json(draft);
    }
    catch (err) {
        console.error('GET /api/admin/drafts/:id error:', err);
        res.status(500).json({ error: 'Failed to fetch draft' });
    }
});
/**
 * POST /api/admin/drafts/:id/pause
 * Pause an active draft
 */
router.post('/:id/pause', async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;
        const now = DateTime.now().setZone('America/Los_Angeles');
        // Get current state
        const { data: draft, error: fetchError } = await supabaseAdmin
            .from('leagues')
            .select('id, name, draft_status')
            .eq('id', id)
            .single();
        if (fetchError || !draft) {
            return res.status(404).json({ error: 'Draft not found' });
        }
        if (draft.draft_status !== 'in_progress') {
            return res.status(400).json({ error: 'Draft is not in progress' });
        }
        // Update to paused
        const { error: updateError } = await supabaseAdmin
            .from('leagues')
            .update({ draft_status: 'paused' })
            .eq('id', id);
        if (updateError)
            throw updateError;
        await logAdminAction(req, 'pause_draft', 'league', id, {
            league_name: draft.name,
            reason,
        });
        broadcastToCommandCenter({
            type: 'draft_paused',
            data: {
                leagueId: id,
                leagueName: draft.name,
                adminId,
                timestamp: now.toISO(),
            },
        });
        res.json({ success: true, message: `Draft "${draft.name}" paused` });
    }
    catch (err) {
        console.error('POST /api/admin/drafts/:id/pause error:', err);
        res.status(500).json({ error: 'Failed to pause draft' });
    }
});
/**
 * POST /api/admin/drafts/:id/resume
 * Resume a paused draft
 */
router.post('/:id/resume', async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;
        const now = DateTime.now().setZone('America/Los_Angeles');
        const { data: draft, error: fetchError } = await supabaseAdmin
            .from('leagues')
            .select('id, name, draft_status')
            .eq('id', id)
            .single();
        if (fetchError || !draft) {
            return res.status(404).json({ error: 'Draft not found' });
        }
        if (draft.draft_status !== 'paused') {
            return res.status(400).json({ error: 'Draft is not paused' });
        }
        const { error: updateError } = await supabaseAdmin
            .from('leagues')
            .update({ draft_status: 'in_progress' })
            .eq('id', id);
        if (updateError)
            throw updateError;
        await logAdminAction(req, 'resume_draft', 'league', id, {
            league_name: draft.name,
        });
        broadcastToCommandCenter({
            type: 'draft_resumed',
            data: {
                leagueId: id,
                leagueName: draft.name,
                adminId,
                timestamp: now.toISO(),
            },
        });
        res.json({ success: true, message: `Draft "${draft.name}" resumed` });
    }
    catch (err) {
        console.error('POST /api/admin/drafts/:id/resume error:', err);
        res.status(500).json({ error: 'Failed to resume draft' });
    }
});
/**
 * POST /api/admin/drafts/:id/skip
 * Skip current picker (auto-pick for them)
 */
router.post('/:id/skip', async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;
        const { data: draft, error: fetchError } = await supabaseAdmin
            .from('leagues')
            .select('id, name, draft_status, current_pick')
            .eq('id', id)
            .single();
        if (fetchError || !draft) {
            return res.status(404).json({ error: 'Draft not found' });
        }
        if (draft.draft_status !== 'in_progress') {
            return res.status(400).json({ error: 'Draft is not in progress' });
        }
        // In a real implementation, this would:
        // 1. Auto-select a castaway for the current picker
        // 2. Advance to the next pick
        // For now, just log the action
        await logAdminAction(req, 'skip_draft_pick', 'league', id, {
            league_name: draft.name,
            skipped_pick: draft.current_pick,
        });
        res.json({
            success: true,
            message: `Skipped pick ${draft.current_pick} in "${draft.name}"`,
            note: 'Auto-pick functionality needs implementation',
        });
    }
    catch (err) {
        console.error('POST /api/admin/drafts/:id/skip error:', err);
        res.status(500).json({ error: 'Failed to skip pick' });
    }
});
/**
 * POST /api/admin/drafts/:id/end
 * Force end a draft (auto-complete remaining picks)
 */
router.post('/:id/end', async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;
        const now = DateTime.now().setZone('America/Los_Angeles');
        const { data: draft, error: fetchError } = await supabaseAdmin
            .from('leagues')
            .select('id, name, draft_status')
            .eq('id', id)
            .single();
        if (fetchError || !draft) {
            return res.status(404).json({ error: 'Draft not found' });
        }
        if (draft.draft_status === 'completed') {
            return res.status(400).json({ error: 'Draft is already completed' });
        }
        // Update to completed
        const { error: updateError } = await supabaseAdmin
            .from('leagues')
            .update({
            draft_status: 'completed',
            draft_completed_at: now.toISO(),
        })
            .eq('id', id);
        if (updateError)
            throw updateError;
        await logAdminAction(req, 'force_end_draft', 'league', id, {
            league_name: draft.name,
            previous_status: draft.draft_status,
            reason,
        });
        broadcastToCommandCenter({
            type: 'draft_force_ended',
            data: {
                leagueId: id,
                leagueName: draft.name,
                adminId,
                timestamp: now.toISO(),
            },
        });
        res.json({ success: true, message: `Draft "${draft.name}" force-completed` });
    }
    catch (err) {
        console.error('POST /api/admin/drafts/:id/end error:', err);
        res.status(500).json({ error: 'Failed to end draft' });
    }
});
/**
 * GET /api/admin/drafts/stats
 * Get overall draft statistics
 */
router.get('/stats/overview', async (req, res) => {
    try {
        const [pending, inProgress, paused, completed, total] = await Promise.all([
            supabaseAdmin
                .from('leagues')
                .select('*', { count: 'exact', head: true })
                .eq('draft_status', 'pending')
                .eq('is_global', false),
            supabaseAdmin
                .from('leagues')
                .select('*', { count: 'exact', head: true })
                .eq('draft_status', 'in_progress')
                .eq('is_global', false),
            supabaseAdmin
                .from('leagues')
                .select('*', { count: 'exact', head: true })
                .eq('draft_status', 'paused')
                .eq('is_global', false),
            supabaseAdmin
                .from('leagues')
                .select('*', { count: 'exact', head: true })
                .eq('draft_status', 'completed')
                .eq('is_global', false),
            supabaseAdmin
                .from('leagues')
                .select('*', { count: 'exact', head: true })
                .eq('is_global', false),
        ]);
        res.json({
            pending: pending.count || 0,
            inProgress: inProgress.count || 0,
            paused: paused.count || 0,
            completed: completed.count || 0,
            total: total.count || 0,
        });
    }
    catch (err) {
        console.error('GET /api/admin/drafts/stats/overview error:', err);
        res.status(500).json({ error: 'Failed to fetch draft stats' });
    }
});
export default router;
//# sourceMappingURL=drafts.js.map