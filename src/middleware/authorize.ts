import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';

/**
 * Requires user to have admin role
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden', message: 'Admin access required' });
    return;
  }

  next();
}

/**
 * Requires user to be commissioner of the league specified in params
 */
export async function requireCommissioner(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const leagueId = req.params['id'] ?? req.params['leagueId'];
  if (!leagueId) {
    res.status(400).json({ error: 'Bad Request', message: 'League ID required' });
    return;
  }

  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    select: { commissionerId: true },
  });

  if (!league) {
    res.status(404).json({ error: 'Not Found', message: 'League not found' });
    return;
  }

  // Admins can also act as commissioner
  if (league.commissionerId !== req.user.id && req.user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden', message: 'Commissioner access required' });
    return;
  }

  next();
}

/**
 * Requires user to be a member of the league specified in params
 */
export async function requireLeagueMember(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const leagueId = req.params['id'] ?? req.params['leagueId'];
  if (!leagueId) {
    res.status(400).json({ error: 'Bad Request', message: 'League ID required' });
    return;
  }

  const membership = await prisma.leagueMember.findUnique({
    where: {
      leagueId_userId: {
        leagueId,
        userId: req.user.id,
      },
    },
  });

  // Admins bypass membership check
  if (!membership && req.user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden', message: 'League membership required' });
    return;
  }

  next();
}
