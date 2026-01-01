/**
 * Admin Command Center Routes
 *
 * Real-time operations hub for platform management during live events.
 * Provides system status, active window context, attention items, and live activity feed.
 */
declare const router: import("express-serve-static-core").Router;
/**
 * Broadcast event to all connected SSE clients
 */
export declare function broadcastToCommandCenter(event: {
    type: string;
    data: any;
}): void;
export default router;
//# sourceMappingURL=command-center.d.ts.map