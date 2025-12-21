import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Users, Calendar, ArrowRight, Loader2, Crown } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function LeagueHome() {
  const { id } = useParams<{ id: string }>();

  // Fetch league details
  const { data: league, isLoading: leagueLoading } = useQuery({
    queryKey: ['league', id],
    queryFn: async () => {
      if (!id) throw new Error('No league ID');
      const { data, error } = await supabase
        .from('leagues')
        .select('*, seasons(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch league members with standings
  const { data: members } = useQuery({
    queryKey: ['league-members', id],
    queryFn: async () => {
      if (!id) throw new Error('No league ID');
      const { data, error } = await supabase
        .from('league_members')
        .select('*, users(id, display_name, avatar_url)')
        .eq('league_id', id)
        .order('total_points', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch current user's roster
  const { data: myRoster } = useQuery({
    queryKey: ['my-roster', id],
    queryFn: async () => {
      if (!id) throw new Error('No league ID');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('rosters')
        .select('*, castaways(*)')
        .eq('league_id', id)
        .eq('user_id', user.id)
        .is('dropped_at', null);

      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  // Get current user ID
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  if (leagueLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream-100 to-cream-200 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-burgundy-500 animate-spin" />
      </div>
    );
  }

  if (!league) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream-100 to-cream-200 flex items-center justify-center">
        <p className="text-neutral-800">League not found</p>
      </div>
    );
  }

  const myMembership = members?.find(m => m.user_id === currentUser?.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-100 to-cream-200 p-4 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-neutral-800">{league.name}</h1>
        <p className="text-neutral-500">
          Season {league.seasons?.number}: {league.seasons?.name}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl shadow-card p-4 border border-cream-200 text-center">
          <Trophy className="h-6 w-6 text-burgundy-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-neutral-800">{myMembership?.rank || '-'}</p>
          <p className="text-neutral-500 text-sm">Your Rank</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-4 border border-cream-200 text-center">
          <Users className="h-6 w-6 text-burgundy-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-neutral-800">{members?.length || 0}</p>
          <p className="text-neutral-500 text-sm">Players</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-4 border border-cream-200 text-center">
          <Calendar className="h-6 w-6 text-burgundy-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-neutral-800">{myMembership?.total_points || 0}</p>
          <p className="text-neutral-500 text-sm">Points</p>
        </div>
      </div>

      {/* My Team */}
      <div className="bg-white rounded-2xl shadow-card p-4 border border-cream-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-neutral-800">My Team</h2>
          <Link
            to={`/leagues/${id}/team`}
            className="text-burgundy-500 hover:text-burgundy-600 text-sm flex items-center gap-1"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {myRoster && myRoster.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {myRoster.map((roster: any) => (
              <div
                key={roster.id}
                className={`p-3 rounded-xl ${
                  roster.castaways?.status === 'eliminated'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-cream-50 border border-cream-200'
                }`}
              >
                <p className="text-neutral-800 font-medium">{roster.castaways?.name}</p>
                <p className="text-neutral-500 text-sm capitalize">
                  {roster.castaways?.status}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-500 text-center py-4">
            Draft hasn't started yet
          </p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link
          to={`/leagues/${id}/pick`}
          className="btn btn-primary py-4 text-center"
        >
          Make Pick
        </Link>
        <Link
          to={`/leagues/${id}/draft`}
          className="btn btn-secondary py-4 text-center"
        >
          Draft Room
        </Link>
      </div>

      {/* Standings Preview */}
      <div className="bg-white rounded-2xl shadow-card p-4 border border-cream-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-neutral-800">Standings</h2>
          <Link
            to={`/leagues/${id}/leaderboard`}
            className="text-burgundy-500 hover:text-burgundy-600 text-sm flex items-center gap-1"
          >
            Full Leaderboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-2">
          {members?.slice(0, 5).map((member: any, index: number) => (
            <div
              key={member.id}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                member.user_id === currentUser?.id
                  ? 'bg-burgundy-50 border border-burgundy-200'
                  : 'bg-cream-50 border border-cream-200'
              }`}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                {index === 0 ? (
                  <Crown className="h-5 w-5 text-amber-500" />
                ) : (
                  <span className="text-neutral-500 font-bold">{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-neutral-800 font-medium">{member.users?.display_name}</p>
              </div>
              <p className="text-burgundy-500 font-bold">{member.total_points || 0}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
