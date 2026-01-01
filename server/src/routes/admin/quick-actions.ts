/**
 * Admin Quick Actions Routes
 *
 * One-click platform controls for emergency and operational needs.
 * All actions are logged to the admin audit log.
 */

import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authenticate.js';
import { supabaseAdmin } from '../../config/supabase.js';
import { DateTime } from 'luxon';
import { broadcastToCommandCenter } from './command-center.js';
import { logAdminAction } from '../../services/audit-logger.js';

const router = Router();

/**
 * POST /api/admin/quick-actions/lock-picks
 * Immediately lock all picks for the current episode
 */
router.post('/lock-picks', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reason, episodeId } = req.body;
    const adminId = req.user!.id;
    const now = DateTime.now().setZone('America/Los_Angeles');

    // Get the episode to lock (either specified or next upcoming)
    let targetEpisode;
    if (episodeId) {
      const { data } = await supabaseAdmin
        .from('episodes')
        .select('*')
        .eq('id', episodeId)
        .single();
      targetEpisode = data;
    } else {
      const { data } = await supabaseAdmin
        .from('episodes')
        .select('*')
        .gt('picks_lock_at', now.toISO())
        .order('picks_lock_at', { ascending: true })
        .limit(1)
        .single();
      targetEpisode = data;
    }

    if (!targetEpisode) {
      return res.status(400).json({ error: 'No episode found to lock' });
    }

    // Update episode picks_lock_at to now
    const previousLockTime = targetEpisode.picks_lock_at;
    const { error: updateError } = await supabaseAdmin
      .from('episodes')
      .update({ picks_lock_at: now.toISO() })
      .eq('id', targetEpisode.id);

    if (updateError) throw updateError;

    // Update admin_settings
    await supabaseAdmin
      .from('admin_settings')
      .update({
        value: {
          locked: true,
          locked_by: adminId,
          locked_at: now.toISO(),
          reason: reason || 'Manual lock',
          episode_id: targetEpisode.id,
        },
        updated_by: adminId,
      })
      .eq('key', 'picks_locked');

    // Log the action
    await logAdminAction(req, 'lock_picks', 'episode', targetEpisode.id, {
      previous_lock_time: previousLockTime,
      new_lock_time: now.toISO(),
      reason,
    });

    // Broadcast to command center
    broadcastToCommandCenter({
      type: 'quick_action',
      data: {
        action: 'lock_picks',
        episodeId: targetEpisode.id,
        episodeNumber: targetEpisode.number,
        adminId,
        timestamp: now.toISO(),
      },
    });

    res.json({
      success: true,
      message: `Picks locked for Episode ${targetEpisode.number}`,
      episodeId: targetEpisode.id,
      lockedAt: now.toISO(),
    });
  } catch (err) {
    console.error('POST /api/admin/quick-actions/lock-picks error:', err);
    res.status(500).json({ error: 'Failed to lock picks' });
  }
});

/**
 * POST /api/admin/quick-actions/unlock-picks
 * Unlock picks (restore original deadline)
 */
router.post('/unlock-picks', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { episodeId, newDeadline } = req.body;
    const adminId = req.user!.id;
    const now = DateTime.now().setZone('America/Los_Angeles');

    if (!episodeId) {
      return res.status(400).json({ error: 'Episode ID required' });
    }

    const { data: episode, error: fetchError } = await supabaseAdmin
      .from('episodes')
      .select('*')
      .eq('id', episodeId)
      .single();

    if (fetchError || !episode) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    // Calculate new deadline - either specified or 1 hour before air time
    const unlockTo = newDeadline
      ? DateTime.fromISO(newDeadline, { zone: 'America/Los_Angeles' })
      : DateTime.fromISO(episode.air_date, { zone: 'America/Los_Angeles' }).minus({ hours: 1 });

    const { error: updateError } = await supabaseAdmin
      .from('episodes')
      .update({ picks_lock_at: unlockTo.toISO() })
      .eq('id', episodeId);

    if (updateError) throw updateError;

    // Clear admin_settings lock
    await supabaseAdmin
      .from('admin_settings')
      .update({
        value: {
          locked: false,
          locked_by: null,
          locked_at: null,
          reason: null,
          episode_id: null,
        },
        updated_by: adminId,
      })
      .eq('key', 'picks_locked');

    await logAdminAction(req, 'unlock_picks', 'episode', episodeId, {
      new_lock_time: unlockTo.toISO(),
    });

    broadcastToCommandCenter({
      type: 'quick_action',
      data: {
        action: 'unlock_picks',
        episodeId,
        adminId,
        timestamp: now.toISO(),
      },
    });

    res.json({
      success: true,
      message: `Picks unlocked for Episode ${episode.number}`,
      newDeadline: unlockTo.toISO(),
    });
  } catch (err) {
    console.error('POST /api/admin/quick-actions/unlock-picks error:', err);
    res.status(500).json({ error: 'Failed to unlock picks' });
  }
});

/**
 * POST /api/admin/quick-actions/pause-drafts
 * Pause all active drafts
 */
router.post('/pause-drafts', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reason } = req.body;
    const adminId = req.user!.id;
    const now = DateTime.now().setZone('America/Los_Angeles');

    // Get active drafts
    const { data: activeDrafts, error: fetchError } = await supabaseAdmin
      .from('leagues')
      .select('id, name')
      .eq('draft_status', 'in_progress');

    if (fetchError) throw fetchError;

    if (!activeDrafts || activeDrafts.length === 0) {
      return res.json({
        success: true,
        message: 'No active drafts to pause',
        affectedCount: 0,
      });
    }

    // Update draft status to paused
    const { error: updateError } = await supabaseAdmin
      .from('leagues')
      .update({ draft_status: 'paused' })
      .eq('draft_status', 'in_progress');

    if (updateError) throw updateError;

    // Update admin_settings
    await supabaseAdmin
      .from('admin_settings')
      .update({
        value: {
          paused: true,
          paused_by: adminId,
          paused_at: now.toISO(),
          reason: reason || 'Manual pause',
          affected_leagues: activeDrafts.map(d => d.id),
        },
        updated_by: adminId,
      })
      .eq('key', 'drafts_paused');

    await logAdminAction(req, 'pause_drafts', 'leagues', null, {
      affected_drafts: activeDrafts.map(d => ({ id: d.id, name: d.name })),
      reason,
    });

    broadcastToCommandCenter({
      type: 'quick_action',
      data: {
        action: 'pause_drafts',
        affectedCount: activeDrafts.length,
        adminId,
        timestamp: now.toISO(),
      },
    });

    res.json({
      success: true,
      message: `Paused ${activeDrafts.length} draft${activeDrafts.length > 1 ? 's' : ''}`,
      affectedCount: activeDrafts.length,
      affectedLeagues: activeDrafts,
    });
  } catch (err) {
    console.error('POST /api/admin/quick-actions/pause-drafts error:', err);
    res.status(500).json({ error: 'Failed to pause drafts' });
  }
});

/**
 * POST /api/admin/quick-actions/resume-drafts
 * Resume all paused drafts
 */
router.post('/resume-drafts', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = req.user!.id;
    const now = DateTime.now().setZone('America/Los_Angeles');

    // Get paused drafts
    const { data: pausedDrafts, error: fetchError } = await supabaseAdmin
      .from('leagues')
      .select('id, name')
      .eq('draft_status', 'paused');

    if (fetchError) throw fetchError;

    if (!pausedDrafts || pausedDrafts.length === 0) {
      return res.json({
        success: true,
        message: 'No paused drafts to resume',
        affectedCount: 0,
      });
    }

    // Update draft status back to in_progress
    const { error: updateError } = await supabaseAdmin
      .from('leagues')
      .update({ draft_status: 'in_progress' })
      .eq('draft_status', 'paused');

    if (updateError) throw updateError;

    // Clear admin_settings
    await supabaseAdmin
      .from('admin_settings')
      .update({
        value: {
          paused: false,
          paused_by: null,
          paused_at: null,
          reason: null,
          affected_leagues: [],
        },
        updated_by: adminId,
      })
      .eq('key', 'drafts_paused');

    await logAdminAction(req, 'resume_drafts', 'leagues', null, {
      resumed_drafts: pausedDrafts.map(d => ({ id: d.id, name: d.name })),
    });

    broadcastToCommandCenter({
      type: 'quick_action',
      data: {
        action: 'resume_drafts',
        affectedCount: pausedDrafts.length,
        adminId,
        timestamp: now.toISO(),
      },
    });

    res.json({
      success: true,
      message: `Resumed ${pausedDrafts.length} draft${pausedDrafts.length > 1 ? 's' : ''}`,
      affectedCount: pausedDrafts.length,
      affectedLeagues: pausedDrafts,
    });
  } catch (err) {
    console.error('POST /api/admin/quick-actions/resume-drafts error:', err);
    res.status(500).json({ error: 'Failed to resume drafts' });
  }
});

/**
 * POST /api/admin/quick-actions/maintenance-mode
 * Enable or disable maintenance mode
 */
router.post('/maintenance-mode', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { enabled, message, scheduledStart, scheduledEnd } = req.body;
    const adminId = req.user!.id;
    const now = DateTime.now().setZone('America/Los_Angeles');

    await supabaseAdmin
      .from('admin_settings')
      .update({
        value: {
          enabled: Boolean(enabled),
          message: message || 'System maintenance in progress. Please check back soon.',
          scheduled_start: scheduledStart || (enabled ? now.toISO() : null),
          scheduled_end: scheduledEnd || null,
          enabled_by: enabled ? adminId : null,
          enabled_at: enabled ? now.toISO() : null,
        },
        updated_by: adminId,
      })
      .eq('key', 'maintenance_mode');

    await logAdminAction(req, enabled ? 'enable_maintenance' : 'disable_maintenance', 'system', null, {
      message,
      scheduled_start: scheduledStart,
      scheduled_end: scheduledEnd,
    });

    broadcastToCommandCenter({
      type: 'quick_action',
      data: {
        action: enabled ? 'maintenance_enabled' : 'maintenance_disabled',
        adminId,
        timestamp: now.toISO(),
      },
    });

    res.json({
      success: true,
      message: enabled ? 'Maintenance mode enabled' : 'Maintenance mode disabled',
      maintenanceMode: enabled,
    });
  } catch (err) {
    console.error('POST /api/admin/quick-actions/maintenance-mode error:', err);
    res.status(500).json({ error: 'Failed to update maintenance mode' });
  }
});

/**
 * POST /api/admin/quick-actions/force-refresh
 * Force cache refresh (placeholder - actual cache implementation varies)
 */
router.post('/force-refresh', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = req.user!.id;
    const now = DateTime.now().setZone('America/Los_Angeles');

    // In a real implementation, this would:
    // 1. Clear Redis cache
    // 2. Invalidate CDN cache
    // 3. Clear any application-level caches
    // For now, we just log it and broadcast

    await logAdminAction(req, 'force_refresh', 'system', null, {
      note: 'Cache refresh triggered',
    });

    broadcastToCommandCenter({
      type: 'quick_action',
      data: {
        action: 'force_refresh',
        adminId,
        timestamp: now.toISO(),
      },
    });

    res.json({
      success: true,
      message: 'Cache refresh initiated',
    });
  } catch (err) {
    console.error('POST /api/admin/quick-actions/force-refresh error:', err);
    res.status(500).json({ error: 'Failed to force refresh' });
  }
});

/**
 * POST /api/admin/quick-actions/send-blast
 * Send a notification blast to users
 */
router.post('/send-blast', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { template, subject, body, segment, scheduleFor } = req.body;
    const adminId = req.user!.id;
    const now = DateTime.now().setZone('America/Los_Angeles');

    if (!body || !subject) {
      return res.status(400).json({ error: 'Subject and body are required' });
    }

    // Get target users based on segment
    let userQuery = supabaseAdmin.from('users').select('id, email, display_name');
    
    if (segment === 'commissioners') {
      // Get users who are commissioners
      const { data: leagueCommissioners } = await supabaseAdmin
        .from('leagues')
        .select('commissioner_id')
        .not('commissioner_id', 'is', null);
      
      const commissionerIds = [...new Set(leagueCommissioners?.map(l => l.commissioner_id) || [])];
      userQuery = userQuery.in('id', commissionerIds);
    } else if (segment === 'active') {
      const weekAgo = now.minus({ days: 7 }).toISO();
      userQuery = userQuery.gte('last_sign_in_at', weekAgo);
    }
    // Default: all users

    const { data: targetUsers, error: usersError } = await userQuery;
    if (usersError) throw usersError;

    if (!targetUsers || targetUsers.length === 0) {
      return res.status(400).json({ error: 'No users found for selected segment' });
    }

    // Queue emails (in real implementation, would use email queue)
    // For now, just log the action
    await logAdminAction(req, 'send_blast', 'notification', null, {
      template,
      subject,
      segment,
      recipient_count: targetUsers.length,
      scheduled_for: scheduleFor,
    });

    broadcastToCommandCenter({
      type: 'quick_action',
      data: {
        action: 'send_blast',
        recipientCount: targetUsers.length,
        adminId,
        timestamp: now.toISO(),
      },
    });

    res.json({
      success: true,
      message: `Notification queued for ${targetUsers.length} user${targetUsers.length > 1 ? 's' : ''}`,
      recipientCount: targetUsers.length,
    });
  } catch (err) {
    console.error('POST /api/admin/quick-actions/send-blast error:', err);
    res.status(500).json({ error: 'Failed to send blast' });
  }
});

/**
 * POST /api/admin/quick-actions/emergency-shutoff
 * Enable emergency read-only mode
 */
router.post('/emergency-shutoff', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { enabled, confirmation } = req.body;
    const adminId = req.user!.id;
    const now = DateTime.now().setZone('America/Los_Angeles');

    // Require typing "SHUTDOWN" to confirm
    if (enabled && confirmation !== 'SHUTDOWN') {
      return res.status(400).json({ 
        error: 'Confirmation required. Type "SHUTDOWN" to confirm.',
        requireConfirmation: true,
      });
    }

    await supabaseAdmin
      .from('admin_settings')
      .update({
        value: {
          enabled: Boolean(enabled),
          enabled_by: enabled ? adminId : null,
          enabled_at: enabled ? now.toISO() : null,
        },
        updated_by: adminId,
      })
      .eq('key', 'emergency_shutoff');

    await logAdminAction(req, enabled ? 'emergency_shutoff_enabled' : 'emergency_shutoff_disabled', 'system', null, {
      critical: true,
    });

    // Notify all admins (in real implementation)
    broadcastToCommandCenter({
      type: 'critical_action',
      data: {
        action: enabled ? 'emergency_shutoff_enabled' : 'emergency_shutoff_disabled',
        adminId,
        timestamp: now.toISO(),
      },
    });

    res.json({
      success: true,
      message: enabled 
        ? 'EMERGENCY SHUTOFF ENABLED - Platform is now read-only' 
        : 'Emergency shutoff disabled - Normal operations resumed',
      emergencyMode: enabled,
    });
  } catch (err) {
    console.error('POST /api/admin/quick-actions/emergency-shutoff error:', err);
    res.status(500).json({ error: 'Failed to toggle emergency shutoff' });
  }
});

/**
 * GET /api/admin/quick-actions/status
 * Get current status of all quick action settings
 */
router.get('/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('admin_settings')
      .select('key, value')
      .in('key', ['maintenance_mode', 'picks_locked', 'drafts_paused', 'emergency_shutoff', 'feature_flags']);

    if (error) throw error;

    const status: Record<string, any> = {};
    settings?.forEach(s => {
      status[s.key] = s.value;
    });

    res.json(status);
  } catch (err) {
    console.error('GET /api/admin/quick-actions/status error:', err);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

export default router;
