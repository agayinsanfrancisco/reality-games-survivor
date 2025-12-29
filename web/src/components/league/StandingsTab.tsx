/**
 * Standings Tab Component
 *
 * Shows the full league standings with podium for top 3.
 * Handles ties correctly by using stored rank or calculating based on points.
 */

import { Crown, Medal, Users } from 'lucide-react';
import type { LeagueMember } from '@/types';

interface LeagueMemberWithUser extends LeagueMember {
  users?: {
    display_name?: string;
    avatar_url?: string | null;
  };
}

interface StandingsTabProps {
  members: LeagueMemberWithUser[] | undefined;
  currentUserId: string | undefined;
}

function getRankStyle(rank: number) {
  if (rank === 1)
    return {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      icon: <Crown className="h-4 w-4 text-yellow-500" />,
    };
  if (rank === 2)
    return {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      icon: <Medal className="h-4 w-4 text-gray-400" />,
    };
  if (rank === 3)
    return {
      bg: 'bg-orange-100',
      text: 'text-orange-600',
      icon: <Medal className="h-4 w-4 text-orange-400" />,
    };
  return { bg: 'bg-cream-50', text: 'text-neutral-600', icon: null };
}

/**
 * Calculate ranks with proper tie handling
 * Members with the same points get the same rank
 */
function calculateRanks(members: LeagueMemberWithUser[]): Map<string, number> {
  const rankMap = new Map<string, number>();

  // Sort by points descending
  const sorted = [...members].sort((a, b) => (b.total_points || 0) - (a.total_points || 0));

  let currentRank = 1;
  let previousPoints: number | null = null;

  sorted.forEach((member, index) => {
    const points = member.total_points || 0;

    if (previousPoints === null || points !== previousPoints) {
      // Different points - new rank (accounting for ties)
      currentRank = index + 1;
    }
    // Same points as previous - keep same rank

    rankMap.set(member.id, currentRank);
    previousPoints = points;
  });

  return rankMap;
}

export function StandingsTab({ members, currentUserId }: StandingsTabProps) {
  // Sort members by points and calculate ranks with tie handling
  const sortedMembers = members
    ? [...members].sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
    : [];
  const rankMap = members ? calculateRanks(members) : new Map();

  // Empty state
  if (!members || members.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-12 border border-cream-200 text-center">
        <Users className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
        <h3 className="font-semibold text-neutral-700 mb-2">No Members Yet</h3>
        <p className="text-neutral-500">Standings will appear once players join the league.</p>
      </div>
    );
  }

  // Get top 3 for podium (only if we have at least 3 members)
  const first = sortedMembers[0];
  const second = sortedMembers[1];
  const third = sortedMembers[2];
  const showPodium = sortedMembers.length >= 3 && first && second && third;

  return (
    <div className="space-y-6">
      {/* Top 3 Podium */}
      {showPodium && (
        <div className="grid grid-cols-3 gap-4">
          {/* Second Place */}
          <div className="bg-gradient-to-b from-gray-100 to-gray-50 rounded-2xl p-5 border-2 border-gray-200 text-center mt-6">
            <div className="w-10 h-10 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center">
              <Medal className="h-5 w-5 text-gray-500" />
            </div>
            <p className="font-semibold text-neutral-800 truncate text-sm">
              {second.users?.display_name || 'Unknown'}
            </p>
            <p className="text-2xl font-display text-gray-600 mt-1">{second.total_points || 0}</p>
            <p className="text-xs text-neutral-400">pts</p>
          </div>

          {/* First Place */}
          <div className="bg-gradient-to-b from-yellow-100 to-amber-50 rounded-2xl p-5 border-2 border-yellow-300 text-center shadow-elevated">
            <div className="w-12 h-12 bg-yellow-300 rounded-full mx-auto mb-2 flex items-center justify-center">
              <Crown className="h-6 w-6 text-yellow-700" />
            </div>
            <p className="font-bold text-neutral-800 truncate">
              {first.users?.display_name || 'Unknown'}
            </p>
            <p className="text-3xl font-display text-yellow-700 mt-1">{first.total_points || 0}</p>
            <p className="text-xs text-neutral-500">pts</p>
          </div>

          {/* Third Place */}
          <div className="bg-gradient-to-b from-orange-100 to-amber-50 rounded-2xl p-5 border-2 border-orange-200 text-center mt-6">
            <div className="w-10 h-10 bg-orange-200 rounded-full mx-auto mb-2 flex items-center justify-center">
              <Medal className="h-5 w-5 text-orange-500" />
            </div>
            <p className="font-semibold text-neutral-800 truncate text-sm">
              {third.users?.display_name || 'Unknown'}
            </p>
            <p className="text-2xl font-display text-orange-600 mt-1">{third.total_points || 0}</p>
            <p className="text-xs text-neutral-400">pts</p>
          </div>
        </div>
      )}

      {/* Full Standings Table */}
      <div className="bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden">
        <div className="p-5 border-b border-cream-100">
          <h2 className="text-lg font-display font-bold text-neutral-800">Full Standings</h2>
        </div>

        <div className="divide-y divide-cream-100">
          {sortedMembers.map((member) => {
            const rank = rankMap.get(member.id) || 1;
            const rankStyle = getRankStyle(rank);
            const isYou = member.user_id === currentUserId;

            return (
              <div
                key={member.id}
                className={`flex items-center gap-4 p-4 transition-colors ${
                  isYou ? 'bg-burgundy-50 border-l-4 border-burgundy-500' : 'hover:bg-cream-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${rankStyle.bg}`}
                >
                  {rankStyle.icon || <span className={`font-bold ${rankStyle.text}`}>{rank}</span>}
                </div>

                <div className="flex-1">
                  <p
                    className={`font-semibold ${isYou ? 'text-burgundy-700' : 'text-neutral-800'}`}
                  >
                    {member.users?.display_name || 'Unknown'}
                    {isYou && (
                      <span className="ml-2 text-xs text-burgundy-500 font-normal">(You)</span>
                    )}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-display text-neutral-800">
                    {member.total_points || 0}
                  </p>
                  <p className="text-xs text-neutral-400">points</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
