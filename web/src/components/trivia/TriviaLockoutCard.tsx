/**
 * Trivia Lockout Card Component
 *
 * Shows when user is locked out for 24 hours.
 */

import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

interface TriviaLockoutCardProps {
  lockedUntil: string;
}

export function TriviaLockoutCard({ lockedUntil }: TriviaLockoutCardProps) {
  const getLockoutTimeRemaining = () => {
    const now = new Date();
    const lockout = new Date(lockedUntil);
    const diff = lockout.getTime() - now.getTime();
    if (diff <= 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-gradient-to-br from-red-50 to-red-100 border-4 border-red-400 rounded-2xl p-8 mb-8 text-center shadow-lg">
      <div className="text-6xl mb-4">💀</div>
      <h2 className="text-4xl font-display font-bold text-red-800 mb-4">It's Time For You To Go</h2>
      <p className="text-xl text-red-700 mb-2 font-semibold">The tribe has spoken.</p>
      <p className="text-lg text-red-600 mb-6">
        You got a question wrong. Come back in{' '}
        <strong className="text-2xl">{getLockoutTimeRemaining() || '24 hours'}</strong> to continue.
      </p>
      <p className="text-sm text-red-500 mb-6">Lockout expires: {formatDate(lockedUntil)}</p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-8 py-4 bg-burgundy-600 text-white font-bold rounded-xl hover:bg-burgundy-700 transition-colors shadow-md text-lg"
      >
        Join a League While You Wait
        <ArrowRight className="h-5 w-5" />
      </Link>
    </div>
  );
}
