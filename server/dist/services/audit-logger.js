/**
 * Admin Audit Logger Service
 *
 * Logs all admin actions for accountability and debugging.
 * Every mutation in the admin dashboard should use this service.
 */
import { supabaseAdmin } from '../config/supabase.js';
/**
 * Log an admin action to the audit log
 */
export async function logAdminAction(req, action, targetType, targetId, metadata, beforeState, afterState) {
    try {
        const adminId = req.user?.id;
        if (!adminId) {
            console.warn('Audit log: No admin ID found in request');
            return;
        }
        // Extract IP and user agent from request
        const ipAddress = getClientIp(req);
        const userAgent = req.headers['user-agent'] || null;
        const entry = {
            admin_id: adminId,
            action,
            target_type: targetType,
            target_id: targetId,
            before_state: beforeState,
            after_state: afterState,
            ip_address: ipAddress,
            user_agent: userAgent,
            metadata: metadata || {},
        };
        const { error } = await supabaseAdmin
            .from('admin_audit_log')
            .insert(entry);
        if (error) {
            console.error('Failed to write audit log:', error);
        }
    }
    catch (err) {
        // Never throw from audit logging - it's a side effect
        console.error('Audit log error:', err);
    }
}
/**
 * Log an admin action with before/after state diff
 */
export async function logAdminActionWithDiff(req, action, targetType, targetId, beforeState, afterState, metadata) {
    return logAdminAction(req, action, targetType, targetId, metadata, beforeState, afterState);
}
/**
 * Get audit log entries for a specific target
 */
export async function getAuditLogsForTarget(targetType, targetId, limit = 50) {
    const { data, error } = await supabaseAdmin
        .from('admin_audit_log')
        .select(`
      id,
      action,
      before_state,
      after_state,
      metadata,
      created_at,
      admin:admin_id (
        id,
        display_name,
        email
      )
    `)
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error)
        throw error;
    return data;
}
/**
 * Get audit log entries for a specific admin
 */
export async function getAuditLogsForAdmin(adminId, limit = 50) {
    const { data, error } = await supabaseAdmin
        .from('admin_audit_log')
        .select('*')
        .eq('admin_id', adminId)
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error)
        throw error;
    return data;
}
/**
 * Get recent audit logs with filters
 */
export async function getAuditLogs(options) {
    let query = supabaseAdmin
        .from('admin_audit_log')
        .select(`
      id,
      action,
      target_type,
      target_id,
      before_state,
      after_state,
      metadata,
      ip_address,
      created_at,
      admin:admin_id (
        id,
        display_name,
        email
      )
    `, { count: 'exact' });
    if (options.action) {
        query = query.eq('action', options.action);
    }
    if (options.targetType) {
        query = query.eq('target_type', options.targetType);
    }
    if (options.adminId) {
        query = query.eq('admin_id', options.adminId);
    }
    if (options.startDate) {
        query = query.gte('created_at', options.startDate);
    }
    if (options.endDate) {
        query = query.lte('created_at', options.endDate);
    }
    query = query
        .order('created_at', { ascending: false })
        .range(options.offset || 0, (options.offset || 0) + (options.limit || 50) - 1);
    const { data, count, error } = await query;
    if (error)
        throw error;
    return { logs: data, total: count };
}
/**
 * Get distinct action types for filtering
 */
export async function getDistinctActions() {
    const { data, error } = await supabaseAdmin
        .from('admin_audit_log')
        .select('action')
        .limit(1000);
    if (error)
        throw error;
    const actions = [...new Set(data?.map(d => d.action) || [])];
    return actions.sort();
}
/**
 * Helper to extract client IP from request
 */
function getClientIp(req) {
    // Check various headers used by proxies
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
        return ips.trim();
    }
    const realIp = req.headers['x-real-ip'];
    if (realIp) {
        return Array.isArray(realIp) ? realIp[0] : realIp;
    }
    return req.ip || req.socket?.remoteAddress || null;
}
/**
 * Common action names for consistency
 */
export const AUDIT_ACTIONS = {
    // User actions
    USER_SUSPENDED: 'user_suspended',
    USER_UNSUSPENDED: 'user_unsuspended',
    USER_BANNED: 'user_banned',
    USER_ROLE_CHANGED: 'user_role_changed',
    USER_IMPERSONATED: 'user_impersonated',
    // League actions
    LEAGUE_DELETED: 'league_deleted',
    LEAGUE_SETTINGS_UPDATED: 'league_settings_updated',
    MEMBER_REMOVED: 'member_removed',
    DRAFT_FORCE_CLOSED: 'draft_force_closed',
    // Episode/Scoring actions
    EPISODE_CREATED: 'episode_created',
    EPISODE_UPDATED: 'episode_updated',
    SCORING_EVENT_ADDED: 'scoring_event_added',
    SCORING_EVENT_DELETED: 'scoring_event_deleted',
    SCORING_COMMITTED: 'scoring_committed',
    // Castaway actions
    CASTAWAY_CREATED: 'castaway_created',
    CASTAWAY_UPDATED: 'castaway_updated',
    CASTAWAY_ELIMINATED: 'castaway_eliminated',
    // Quick actions
    LOCK_PICKS: 'lock_picks',
    UNLOCK_PICKS: 'unlock_picks',
    PAUSE_DRAFTS: 'pause_drafts',
    RESUME_DRAFTS: 'resume_drafts',
    MAINTENANCE_ENABLED: 'enable_maintenance',
    MAINTENANCE_DISABLED: 'disable_maintenance',
    EMERGENCY_SHUTOFF_ENABLED: 'emergency_shutoff_enabled',
    EMERGENCY_SHUTOFF_DISABLED: 'emergency_shutoff_disabled',
    FORCE_REFRESH: 'force_refresh',
    SEND_BLAST: 'send_blast',
    // Incident actions
    INCIDENT_CREATED: 'incident_created',
    INCIDENT_UPDATED: 'incident_updated',
    INCIDENT_RESOLVED: 'incident_resolved',
    // Payment actions
    PAYMENT_REFUNDED: 'payment_refunded',
    PAYMENT_RETRIED: 'payment_retried',
    // Announcement actions
    ANNOUNCEMENT_CREATED: 'announcement_created',
    ANNOUNCEMENT_UPDATED: 'announcement_updated',
    ANNOUNCEMENT_DELETED: 'announcement_deleted',
    // System actions
    FEATURE_FLAG_UPDATED: 'feature_flag_updated',
    EMAIL_RETRY: 'email_retry',
    JOB_MANUAL_RUN: 'job_manual_run',
};
//# sourceMappingURL=audit-logger.js.map