/**
 * Admin Audit Logger Service
 *
 * Logs all admin actions for accountability and debugging.
 * Every mutation in the admin dashboard should use this service.
 */
import { AuthenticatedRequest } from '../middleware/authenticate.js';
export interface AuditLogEntry {
    admin_id: string;
    action: string;
    target_type: string | null;
    target_id: string | null;
    before_state?: any;
    after_state?: any;
    ip_address?: string | null;
    user_agent?: string | null;
    metadata?: Record<string, any>;
}
/**
 * Log an admin action to the audit log
 */
export declare function logAdminAction(req: AuthenticatedRequest, action: string, targetType: string | null, targetId: string | null, metadata?: Record<string, any>, beforeState?: any, afterState?: any): Promise<void>;
/**
 * Log an admin action with before/after state diff
 */
export declare function logAdminActionWithDiff(req: AuthenticatedRequest, action: string, targetType: string, targetId: string, beforeState: any, afterState: any, metadata?: Record<string, any>): Promise<void>;
/**
 * Get audit log entries for a specific target
 */
export declare function getAuditLogsForTarget(targetType: string, targetId: string, limit?: number): Promise<{
    id: any;
    action: any;
    before_state: any;
    after_state: any;
    metadata: any;
    created_at: any;
    admin: {
        id: any;
        display_name: any;
        email: any;
    }[];
}[]>;
/**
 * Get audit log entries for a specific admin
 */
export declare function getAuditLogsForAdmin(adminId: string, limit?: number): Promise<any[]>;
/**
 * Get recent audit logs with filters
 */
export declare function getAuditLogs(options: {
    action?: string;
    targetType?: string;
    adminId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
}): Promise<{
    logs: {
        id: any;
        action: any;
        target_type: any;
        target_id: any;
        before_state: any;
        after_state: any;
        metadata: any;
        ip_address: any;
        created_at: any;
        admin: {
            id: any;
            display_name: any;
            email: any;
        }[];
    }[];
    total: number | null;
}>;
/**
 * Get distinct action types for filtering
 */
export declare function getDistinctActions(): Promise<any[]>;
/**
 * Common action names for consistency
 */
export declare const AUDIT_ACTIONS: {
    readonly USER_SUSPENDED: "user_suspended";
    readonly USER_UNSUSPENDED: "user_unsuspended";
    readonly USER_BANNED: "user_banned";
    readonly USER_ROLE_CHANGED: "user_role_changed";
    readonly USER_IMPERSONATED: "user_impersonated";
    readonly LEAGUE_DELETED: "league_deleted";
    readonly LEAGUE_SETTINGS_UPDATED: "league_settings_updated";
    readonly MEMBER_REMOVED: "member_removed";
    readonly DRAFT_FORCE_CLOSED: "draft_force_closed";
    readonly EPISODE_CREATED: "episode_created";
    readonly EPISODE_UPDATED: "episode_updated";
    readonly SCORING_EVENT_ADDED: "scoring_event_added";
    readonly SCORING_EVENT_DELETED: "scoring_event_deleted";
    readonly SCORING_COMMITTED: "scoring_committed";
    readonly CASTAWAY_CREATED: "castaway_created";
    readonly CASTAWAY_UPDATED: "castaway_updated";
    readonly CASTAWAY_ELIMINATED: "castaway_eliminated";
    readonly LOCK_PICKS: "lock_picks";
    readonly UNLOCK_PICKS: "unlock_picks";
    readonly PAUSE_DRAFTS: "pause_drafts";
    readonly RESUME_DRAFTS: "resume_drafts";
    readonly MAINTENANCE_ENABLED: "enable_maintenance";
    readonly MAINTENANCE_DISABLED: "disable_maintenance";
    readonly EMERGENCY_SHUTOFF_ENABLED: "emergency_shutoff_enabled";
    readonly EMERGENCY_SHUTOFF_DISABLED: "emergency_shutoff_disabled";
    readonly FORCE_REFRESH: "force_refresh";
    readonly SEND_BLAST: "send_blast";
    readonly INCIDENT_CREATED: "incident_created";
    readonly INCIDENT_UPDATED: "incident_updated";
    readonly INCIDENT_RESOLVED: "incident_resolved";
    readonly PAYMENT_REFUNDED: "payment_refunded";
    readonly PAYMENT_RETRIED: "payment_retried";
    readonly ANNOUNCEMENT_CREATED: "announcement_created";
    readonly ANNOUNCEMENT_UPDATED: "announcement_updated";
    readonly ANNOUNCEMENT_DELETED: "announcement_deleted";
    readonly FEATURE_FLAG_UPDATED: "feature_flag_updated";
    readonly EMAIL_RETRY: "email_retry";
    readonly JOB_MANUAL_RUN: "job_manual_run";
};
export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];
//# sourceMappingURL=audit-logger.d.ts.map