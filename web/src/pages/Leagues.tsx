import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import {
  Users,
  Search,
  Lock,
  Globe,
  Heart,
  Plus,
  Loader2,
  Crown,
  ArrowRight,
  UserPlus,
} from 'lucide-react';

interface _League {
  id: string;
  name: string;
  code: string;
  is_public: boolean;
  is_global: boolean;
  require_donation: boolean;
  donation_amount: number | null;
  max_players: number;
  status: string;
  commissioner_id: string;
  commissioner?: {
    display_name: string;
  };
  member_count?: number;
}

// Color presets for league cards
const LEAGUE_COLORS = [
  'from-burgundy-500 to-red-600',
  'from-blue-500 to-indigo-600',
  'from-green-500 to-emerald-600',
  'from-purple-500 to-violet-600',
  'from-orange-500 to-amber-600',
  'from-pink-500 to-rose-500',
  'from-teal-500 to-cyan-600',
];

// Get a consistent color based on league id
function getLeagueColor(leagueId: string): string {
  const hash = leagueId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return LEAGUE_COLORS[hash % LEAGUE_COLORS.length];
}

export default function Leagues() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [filter, setFilter] = useState<'all' | 'commissioner' | 'member'>('all');

  // Fetch all leagues
  const { data: leagues, isLoading } = useQuery({
    queryKey: ['all-leagues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leagues')
        .select(
          `
          *,
          commissioner:users!leagues_commissioner_id_fkey (display_name)
        `
        )
        .eq('is_global', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as _League[];
    },
  });

  // Fetch member counts for each league
  const { data: memberCounts } = useQuery({
    queryKey: ['league-member-counts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('league_members').select('league_id');

      if (error) throw error;

      const counts: Record<string, number> = {};
      data?.forEach((m: { league_id: string }) => {
        counts[m.league_id] = (counts[m.league_id] || 0) + 1;
      });
      return counts;
    },
  });

  // Fetch user's league memberships
  const { data: myMemberships } = useQuery({
    queryKey: ['my-memberships', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('league_members')
        .select('league_id')
        .eq('user_id', user.id);

      if (error) throw error;
      return data?.map((m: { league_id: string }) => m.league_id) || [];
    },
    enabled: !!user?.id,
  });

  // Filter and search leagues
  const filteredLeagues = leagues?.filter((league) => {
    // Search filter
    const matchesSearch =
      league.name.toLowerCase().includes(search.toLowerCase()) ||
      league.commissioner?.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      league.code.toLowerCase().includes(search.toLowerCase());

    // Type filter
    const isMember = myMemberships?.includes(league.id);
    const isCommissioner = league.commissioner_id === user?.id;

    if (filter === 'commissioner' && !isCommissioner) return false;
    if (filter === 'member' && !isMember) return false;

    return matchesSearch;
  });

  const handleJoinWithCode = () => {
    if (joinCode.trim()) {
      navigate(`/join/${joinCode.trim().toUpperCase()}`);
    }
  };

  const isAlreadyMember = (leagueId: string) => myMemberships?.includes(leagueId);

  // Count leagues by role
  const commissionerCount = leagues?.filter((l) => l.commissioner_id === user?.id).length || 0;
  const memberCount = myMemberships?.length || 0;

  return (
    <div className="max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-800 flex items-center gap-3">
            <span className="text-3xl">🏆</span> My Leagues
          </h1>
          <p className="text-neutral-500 mt-1">Manage your fantasy leagues and track standings</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              const modal = document.getElementById('join-modal');
              if (modal) modal.classList.toggle('hidden');
            }}
            className="px-4 py-2 bg-white border border-cream-200 text-neutral-700 rounded-xl font-medium hover:bg-cream-50 transition shadow-sm"
          >
            Join League
          </button>
          <Link
            to="/leagues/create"
            className="px-4 py-2 bg-burgundy-500 text-white rounded-xl font-semibold hover:bg-burgundy-600 transition shadow-lg flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Create League
          </Link>
        </div>
      </div>

      {/* Join with Code Section - Collapsible Modal Style */}
      <div
        id="join-modal"
        className="hidden bg-white rounded-2xl shadow-card p-6 border border-cream-200 mb-6 animate-fade-in"
      >
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1">
            <h2 className="font-semibold text-neutral-800 flex items-center gap-2">
              <Lock className="h-5 w-5 text-burgundy-500" />
              Have an invite code?
            </h2>
            <p className="text-neutral-500 text-sm mt-1">
              Enter your 6-character code to join a private league
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              className="input font-mono text-center tracking-widest uppercase w-32"
            />
            <button
              onClick={handleJoinWithCode}
              disabled={joinCode.length !== 6}
              className="btn btn-primary disabled:opacity-50"
            >
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-4 mb-6 border border-cream-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leagues..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-cream-200 bg-cream-50 focus:outline-none focus:ring-2 focus:ring-burgundy-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === 'all'
                ? 'bg-burgundy-500 text-white'
                : 'bg-cream-100 text-neutral-600 hover:bg-cream-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('commissioner')}
            className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
              filter === 'commissioner'
                ? 'bg-burgundy-500 text-white'
                : 'bg-cream-100 text-neutral-600 hover:bg-cream-200'
            }`}
          >
            <Crown className="h-4 w-4" />
            Commissioner {commissionerCount > 0 && `(${commissionerCount})`}
          </button>
          <button
            onClick={() => setFilter('member')}
            className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
              filter === 'member'
                ? 'bg-burgundy-500 text-white'
                : 'bg-cream-100 text-neutral-600 hover:bg-cream-200'
            }`}
          >
            <Users className="h-4 w-4" />
            Member {memberCount > 0 && `(${memberCount})`}
          </button>
        </div>
      </div>

      {/* Leagues Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-burgundy-500 animate-spin" />
          </div>
          <p className="text-neutral-500">Loading leagues...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeagues?.map((league) => {
            const leagueMemberCount = memberCounts?.[league.id] || 0;
            const isMember = isAlreadyMember(league.id);
            const isFull = leagueMemberCount >= league.max_players;
            const isCommissioner = league.commissioner_id === user?.id;
            const colorGradient = getLeagueColor(league.id);

            return (
              <div
                key={league.id}
                className="bg-white rounded-2xl shadow-lg border border-cream-200 overflow-hidden hover:shadow-xl transition group cursor-pointer"
                onClick={() => isMember && navigate(`/leagues/${league.id}`)}
              >
                {/* Colored Top Bar */}
                <div className={`h-3 bg-gradient-to-r ${colorGradient}`}></div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      {/* Role Badge */}
                      <div className="flex items-center gap-2 mb-1">
                        {isCommissioner ? (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                            <Crown className="h-3 w-3" />
                            Commissioner
                          </span>
                        ) : isMember ? (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            Member
                          </span>
                        ) : league.is_public ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            Public
                          </span>
                        ) : (
                          <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            Private
                          </span>
                        )}

                        {/* Charity Badge */}
                        {league.require_donation && (
                          <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            Charity
                          </span>
                        )}
                      </div>

                      {/* League Name */}
                      <h3 className="text-xl font-display font-bold text-neutral-800 group-hover:text-burgundy-600 transition">
                        {league.name}
                      </h3>
                      <p className="text-neutral-500 text-sm">Code: {league.code}</p>
                    </div>

                    {/* Points - Only show for members */}
                    {isMember && (
                      <div className="text-right">
                        <p className="text-2xl font-display font-bold text-burgundy-500">--</p>
                        <p className="text-xs text-neutral-400">points</p>
                      </div>
                    )}
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-neutral-400" />
                      <span className="text-neutral-600">
                        {leagueMemberCount}/{league.max_players} players
                      </span>
                    </div>
                    {isMember && (
                      <div className="flex items-center gap-1">
                        <span className="text-neutral-400">📍</span>
                        <span className="text-neutral-600">Rank #--</span>
                      </div>
                    )}
                  </div>

                  {/* Donation Info */}
                  {league.require_donation && (
                    <div className="flex items-center gap-2 mb-4 p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100">
                      <Heart className="h-5 w-5 text-pink-500" />
                      <div>
                        <p className="text-pink-700 font-medium text-sm">
                          ${league.donation_amount} Entry
                        </p>
                        <p className="text-pink-500 text-xs">All proceeds to charity</p>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-cream-100">
                    {/* Member Avatars */}
                    <div className="flex -space-x-2">
                      {[...Array(Math.min(leagueMemberCount, 3))].map((_, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full border-2 border-white bg-cream-200 flex items-center justify-center text-xs text-neutral-500"
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                      ))}
                      {leagueMemberCount > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-cream-100 flex items-center justify-center text-xs text-neutral-500">
                          +{leagueMemberCount - 3}
                        </div>
                      )}
                    </div>

                    {/* Action Link */}
                    {isMember ? (
                      <Link
                        to={`/leagues/${league.id}`}
                        className="text-burgundy-500 font-medium text-sm group-hover:underline flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View League <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : league.is_public ? (
                      <Link
                        to={`/join/${league.code}`}
                        className={`text-sm font-medium flex items-center gap-1 ${
                          isFull
                            ? 'text-neutral-400 cursor-not-allowed'
                            : 'text-burgundy-500 hover:underline'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isFull) e.preventDefault();
                        }}
                      >
                        <UserPlus className="h-4 w-4" />
                        {isFull ? 'League Full' : 'Join League'}
                      </Link>
                    ) : (
                      <span className="text-sm text-neutral-400 flex items-center gap-1">
                        <Lock className="h-4 w-4" />
                        Invite Only
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty State / Create New Card */}
          <div
            onClick={() => navigate('/leagues/create')}
            className="bg-cream-50 rounded-2xl border-2 border-dashed border-cream-300 p-6 flex flex-col items-center justify-center text-center hover:border-burgundy-400 hover:bg-cream-100 transition cursor-pointer group min-h-[300px]"
          >
            <div className="w-16 h-16 bg-cream-200 rounded-full flex items-center justify-center mb-4 group-hover:bg-burgundy-100 transition">
              <Plus className="h-8 w-8 text-neutral-500 group-hover:text-burgundy-500" />
            </div>
            <h3 className="font-semibold text-neutral-700 mb-1">Create New League</h3>
            <p className="text-neutral-500 text-sm">Start your own fantasy competition</p>
          </div>
        </div>
      )}

      {/* Empty State when no leagues match filter */}
      {!isLoading && filteredLeagues?.length === 0 && (
        <div className="bg-white rounded-2xl shadow-card p-12 border border-cream-200 text-center mt-6">
          <Users className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-800 mb-2">No leagues found</h3>
          <p className="text-neutral-500 mb-6">
            {filter === 'commissioner'
              ? "You haven't created any leagues yet"
              : filter === 'member'
                ? "You haven't joined any leagues yet"
                : search
                  ? 'Try a different search term'
                  : 'Be the first to create a league!'}
          </p>
          <Link to="/leagues/create" className="btn btn-primary inline-flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create a League
          </Link>
        </div>
      )}
    </div>
  );
}
