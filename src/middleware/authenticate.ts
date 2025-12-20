import type { Request, Response, NextFunction } from 'express';
import { getUserFromToken } from '../config/supabase.js';
import { prisma } from '../config/database.js';
import type { User } from '@prisma/client';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
      authUserId?: string;
    }
  }
}

/**
 * Requires valid Supabase JWT token.
 * Attaches full user record from public.users to req.user
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authUser = await getUserFromToken(req.headers.authorization);

  if (!authUser) {
    res.status(401).json({ error: 'Unauthorized', message: 'Valid token required' });
    return;
  }

  // Get full user record from our users table
  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!user) {
    // User exists in auth.users but not public.users (trigger failed?)
    res.status(401).json({ error: 'Unauthorized', message: 'User profile not found' });
    return;
  }

  req.user = user;
  req.authUserId = authUser.id;
  next();
}

/**
 * Optional authentication - doesn't fail if no token, but attaches user if valid
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authUser = await getUserFromToken(req.headers.authorization);

  if (authUser) {
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
    });
    if (user) {
      req.user = user;
      req.authUserId = authUser.id;
    }
  }

  next();
}
