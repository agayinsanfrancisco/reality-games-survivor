/**
 * Scoring Routes
 *
 * HTTP layer for scoring operations.
 * Business logic is delegated to the scoring service.
 */

import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest, requireAdmin } from '../middleware/authenticate.js';
import * as ScoringService from '../services/scoring.js';
import { supabaseAdmin } from '../config/supabase.js';
import { logAdminAction, AUDIT_ACTIONS } from '../services/audit-logger.js';

const router = Router();

// POST /api/episodes/:id/scoring/start - Begin scoring session
router.post('/:id/scoring/start', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const episodeId = req.params.id;

    const result = await ScoringService.startScoringSession(episodeId);

    if (result.error) {
      return res.status(result.status || 500).json({ error: result.error });
    }

    res.json(result.data);
  } catch (err) {
    console.error('POST /api/episodes/:id/scoring/start error:', err);
    res.status(500).json({ error: 'Failed to start scoring session' });
  }
});

// POST /api/episodes/:id/scoring/save - Save progress
router.post('/:id/scoring/save', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const episodeId = req.params.id;
    const userId = req.user!.id;
    const { scores } = req.body;

    const result = await ScoringService.saveScores(episodeId, userId, scores);

    if (result.error) {
      return res.status(result.status || 500).json({ error: result.error });
    }

    // Log the scoring action to audit
    if (scores && scores.length > 0) {
      await logAdminAction(req, AUDIT_ACTIONS.SCORING_EVENT_ADDED, 'episode', episodeId, {
        scores_count: scores.filter((s: any) => s.quantity > 0).length,
        castaways: [...new Set(scores.map((s: any) => s.castaway_id))],
      });
    }

    res.json(result.data);
  } catch (err) {
    console.error('POST /api/episodes/:id/scoring/save error:', err);
    res.status(500).json({ error: 'Failed to save scores' });
  }
});

// GET /api/episodes/:id/scoring/status - Get scoring completeness status
router.get('/:id/scoring/status', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const episodeId = req.params.id;

    const result = await ScoringService.getScoringStatus(episodeId);

    if (result.error) {
      return res.status(result.status || 500).json({ error: result.error });
    }

    res.json(result.data);
  } catch (err) {
    console.error('GET /api/episodes/:id/scoring/status error:', err);
    res.status(500).json({ error: 'Failed to get scoring status' });
  }
});

// POST /api/episodes/:id/scoring/finalize - Finalize scores
router.post('/:id/scoring/finalize', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const episodeId = req.params.id;
    const userId = req.user!.id;

    const result = await ScoringService.finalizeScoring(episodeId, userId);

    if (result.error) {
      return res.status(result.status || 500).json({ error: result.error });
    }

    // Log the finalization to audit
    await logAdminAction(req, AUDIT_ACTIONS.SCORING_COMMITTED, 'episode', episodeId, {
      eliminated: result.data?.eliminated || [],
      standings_updated: result.data?.standings_updated,
    });

    res.json(result.data);
  } catch (err) {
    console.error('POST /api/episodes/:id/scoring/finalize error:', err);
    res.status(500).json({ error: 'Failed to finalize scoring' });
  }
});

// GET /api/episodes/:id/scoring/audit - Get scoring audit trail
router.get('/:id/scoring/audit', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const episodeId = req.params.id;

    // Get audit logs for this episode
    const { data: auditLogs, error: auditError } = await supabaseAdmin
      .from('admin_audit_log')
      .select(`
        id,
        action,
        metadata,
        created_at,
        admin:admin_id (
          id,
          display_name
        )
      `)
      .eq('target_type', 'episode')
      .eq('target_id', episodeId)
      .in('action', [AUDIT_ACTIONS.SCORING_EVENT_ADDED, AUDIT_ACTIONS.SCORING_EVENT_DELETED, AUDIT_ACTIONS.SCORING_COMMITTED])
      .order('created_at', { ascending: false })
      .limit(100);

    if (auditError) throw auditError;

    res.json({ audit: auditLogs || [] });
  } catch (err) {
    console.error('GET /api/episodes/:id/scoring/audit error:', err);
    res.status(500).json({ error: 'Failed to fetch audit trail' });
  }
});

// GET /api/episodes/:id/scoring/preview - Preview standings impact before finalize
router.get('/:id/scoring/preview', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const episodeId = req.params.id;

    // Get episode info
    const { data: episode, error: epError } = await supabaseAdmin
      .from('episodes')
      .select('id, number, season_id, is_scored')
      .eq('id', episodeId)
      .single();

    if (epError || !episode) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    if (episode.is_scored) {
      return res.status(400).json({ error: 'Episode already finalized' });
    }

    // Get current draft scores
    const { data: draftScores, error: scoresError } = await supabaseAdmin
      .from('episode_scores')
      .select(`
        castaway_id,
        points,
        castaways:castaway_id (
          id,
          name
        )
      `)
      .eq('episode_id', episodeId);

    if (scoresError) throw scoresError;

    // Aggregate scores by castaway
    const castawayPoints: Record<string, { name: string; points: number }> = {};
    for (const score of draftScores || []) {
      const cid = score.castaway_id;
      const cname = (score.castaways as any)?.name || 'Unknown';
      if (!castawayPoints[cid]) {
        castawayPoints[cid] = { name: cname, points: 0 };
      }
      castawayPoints[cid].points += score.points;
    }

    // Get users who picked each castaway (affects their standings)
    const castawayIds = Object.keys(castawayPoints);
    const { data: picks, error: picksError } = await supabaseAdmin
      .from('weekly_picks')
      .select(`
        user_id,
        castaway_id,
        league_id,
        users:user_id (
          id,
          display_name
        ),
        leagues:league_id (
          id,
          name
        )
      `)
      .eq('episode_id', episodeId)
      .in('castaway_id', castawayIds.length > 0 ? castawayIds : ['none']);

    // Calculate impact per user
    const userImpact: Record<string, { 
      user: { id: string; display_name: string };
      leagues: string[];
      pointsToGain: number;
      picks: string[];
    }> = {};

    for (const pick of picks || []) {
      const userId = pick.user_id;
      const castawayData = castawayPoints[pick.castaway_id];
      if (!castawayData) continue;

      if (!userImpact[userId]) {
        userImpact[userId] = {
          user: pick.users as any,
          leagues: [],
          pointsToGain: 0,
          picks: [],
        };
      }

      userImpact[userId].pointsToGain += castawayData.points;
      userImpact[userId].picks.push(castawayData.name);
      const leagueName = (pick.leagues as any)?.name;
      if (leagueName && !userImpact[userId].leagues.includes(leagueName)) {
        userImpact[userId].leagues.push(leagueName);
      }
    }

    // Sort users by points to gain
    const sortedImpact = Object.values(userImpact)
      .sort((a, b) => b.pointsToGain - a.pointsToGain);

    // Summary stats
    const totalPoints = Object.values(castawayPoints).reduce((sum, c) => sum + c.points, 0);
    const castawaysScored = Object.keys(castawayPoints).length;
    const usersAffected = Object.keys(userImpact).length;

    res.json({
      episode: {
        id: episode.id,
        number: episode.number,
      },
      summary: {
        totalPoints,
        castawaysScored,
        usersAffected,
      },
      castawayScores: Object.entries(castawayPoints)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.points - a.points),
      userImpact: sortedImpact.slice(0, 20), // Top 20
    });
  } catch (err) {
    console.error('GET /api/episodes/:id/scoring/preview error:', err);
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

// GET /api/episodes/:id/scores - Get all scores for episode
router.get('/:id/scores', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const episodeId = req.params.id;

    const result = await ScoringService.getEpisodeScores(episodeId);

    if (result.error) {
      return res.status(result.status || 500).json({ error: result.error });
    }

    res.json(result.data);
  } catch (err) {
    console.error('GET /api/episodes/:id/scores error:', err);
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});

// GET /api/episodes/:id/scores/:castawayId - Get castaway's episode scores
router.get('/:id/scores/:castawayId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id: episodeId, castawayId } = req.params;

    const result = await ScoringService.getCastawayScores(episodeId, castawayId);

    if (result.error) {
      return res.status(result.status || 500).json({ error: result.error });
    }

    res.json(result.data);
  } catch (err) {
    console.error('GET /api/episodes/:id/scores/:castawayId error:', err);
    res.status(500).json({ error: 'Failed to fetch castaway scores' });
  }
});

export default router;
