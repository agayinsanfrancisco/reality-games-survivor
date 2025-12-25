import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Flame, Users, Trophy, Calendar, ChevronRight, Megaphone, Clock, Target, ListChecks, ArrowRight, Share2, Sparkles } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  role: string;
}

interface Season {
  id: string;
  number: number;
  name: string;
  is_active: boolean;
  premiere_at: string;
  registration_opens_at: string;
}

interface League {
  id: string;
  name: string;
  code: string;
  status: string;
  is_global: boolean;
}

interface LeagueMembership {
  league_id: string;
  total_points: number;
  rank: number | null;
  league: League;
}

interface Castaway {
  id: string;
  name: string;
  photo_url: string | null;
  status: 'active' | 'eliminated' | 'winner';
}

interface RosterEntry {
  castaway_id: string;
  castaway: Castaway;
}

interface Episode {
  id: string;
  number: number;
  title: string | null;
  air_date: string;
  picks_lock_at: string;
  is_scored: boolean;
}

// Game phase detection
type GamePhase = 'pre_registration' | 'registration' | 'pre_draft' | 'draft' | 'pre_season' | 'active' | 'post_season';

function getGamePhase(season: Season | null, nextEpisode: Episode | null): GamePhase {
  if (!season) return 'pre_registration';

  const now = new Date();
  const registrationOpens = new Date(season.registration_opens_at);
  const premiere = new Date(season.premiere_at);

  if (now < registrationOpens) return 'pre_registration';
  if (now < premiere) return 'pre_draft';
  if (nextEpisode) return 'active';
  return 'post_season';
}

function getCountdownText(targetDate: Date): string {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) return 'Now';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function Dashboard() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user!.id)
        .single();
      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!user?.id,
  });

  const { data: activeSeason } = useQuery({
    queryKey: ['active-season'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .eq('is_active', true)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as Season | null;
    },
  });

  // Fetch leagues with membership details
  const { data: myLeagues } = useQuery({
    queryKey: ['my-leagues-detailed', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('league_members')
        .select(`
          league_id,
          total_points,
          rank,
          league:leagues (
            id,
            name,
            code,
            status,
            is_global
          )
        `)
        .eq('user_id', user!.id);
      if (error) throw error;
      return (data as any[]).map(d => ({
        league_id: d.league_id,
        total_points: d.total_points,
        rank: d.rank,
        league: d.league as League
      })).filter(d => d.league !== null) as LeagueMembership[];
    },
    enabled: !!user?.id,
  });

  // Fetch rosters for each league
  const { data: myRosters } = useQuery({
    queryKey: ['my-rosters', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rosters')
        .select(`
          league_id,
          castaway_id,
          castaway:castaways (
            id,
            name,
            photo_url,
            status
          )
        `)
        .eq('user_id', user!.id)
        .is('dropped_at', null);
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user?.id,
  });

  // Fetch next upcoming episode
  const { data: nextEpisode } = useQuery({
    queryKey: ['next-episode', activeSeason?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('episodes')
        .select('*')
        .eq('season_id', activeSeason!.id)
        .gt('air_date', new Date().toISOString())
        .order('air_date', { ascending: true })
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as Episode | null;
    },
    enabled: !!activeSeason?.id,
  });

  // Group rosters by league
  const rostersByLeague = myRosters?.reduce((acc, roster) => {
    if (!acc[roster.league_id]) acc[roster.league_id] = [];
    acc[roster.league_id].push(roster);
    return acc;
  }, {} as Record<string, RosterEntry[]>) || {};

  const nonGlobalLeagues = myLeagues?.filter(l => !l.league.is_global) || [];
  const globalLeague = myLeagues?.find(l => l.league.is_global);
  const gamePhase = getGamePhase(activeSeason || null, nextEpisode || null);

  // Mock announcements - in production, fetch from database
  const announcements = [
    {
      id: 1,
      title: 'Season 50: In the Hands of the Fans — Coming Soon!',
      message: 'Get ready for the biggest season yet. Registration opens December 19th.',
      type: 'info',
      date: '2025-12-21'
    }
  ];

  return (
    <div className="pb-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-neutral-800">
            Welcome back, {profile?.display_name || 'Survivor'}!
          </h1>
          <p className="text-neutral-500 mt-1">Here's your fantasy command center</p>
        </div>

        {/* Announcements */}
        {announcements.length > 0 && (
          <div className="mb-8">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="bg-gradient-to-r from-burgundy-500 to-burgundy-600 rounded-2xl p-6 text-white shadow-elevated"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Megaphone className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{announcement.title}</h3>
                    <p className="text-burgundy-100 mt-1">{announcement.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Phase-Based Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Primary Action Card - Changes based on game phase */}
          {gamePhase === 'pre_draft' || gamePhase === 'pre_registration' ? (
            <Link
              to="/draft/rankings"
              className="bg-gradient-to-br from-burgundy-500 to-burgundy-700 rounded-2xl p-6 shadow-elevated hover:scale-[1.02] transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <ListChecks className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-white mb-1">Set Your Draft Rankings</h3>
                  <p className="text-burgundy-100 text-sm">Rank all 24 castaways before the draft</p>
                </div>
                <ArrowRight className="h-6 w-6 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              {activeSeason && (
                <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-burgundy-200" />
                  <span className="text-sm text-burgundy-100">
                    Premiere in {getCountdownText(new Date(activeSeason.premiere_at))}
                  </span>
                </div>
              )}
            </Link>
          ) : gamePhase === 'active' && nextEpisode ? (
            <Link
              to={nonGlobalLeagues.length > 0 ? `/leagues/${nonGlobalLeagues[0].league_id}` : '/leagues'}
              className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 shadow-elevated hover:scale-[1.02] transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-white mb-1">Make Your Pick</h3>
                  <p className="text-orange-100 text-sm">Episode {nextEpisode.number} — {nextEpisode.title || 'Coming Up'}</p>
                </div>
                <ArrowRight className="h-6 w-6 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-200" />
                <span className="text-sm text-orange-100">
                  Picks lock in {getCountdownText(new Date(nextEpisode.picks_lock_at))}
                </span>
              </div>
            </Link>
          ) : (
            <Link
              to="/leaderboard"
              className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 shadow-elevated hover:scale-[1.02] transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-white mb-1">View Final Standings</h3>
                  <p className="text-amber-100 text-sm">Season 50 results are in!</p>
                </div>
                <ArrowRight className="h-6 w-6 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          )}

          {/* Secondary Action Card - Global Rank or Invite */}
          {globalLeague?.rank ? (
            <Link
              to="/leaderboard"
              className="bg-white rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all border border-cream-200 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-500 transition-colors">
                    <Trophy className="h-6 w-6 text-amber-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-lg text-neutral-800 mb-1">Your Global Rank</h3>
                  <p className="text-neutral-500 text-sm">{globalLeague.total_points} total points</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-display font-bold text-burgundy-500">#{globalLeague.rank}</p>
                  <p className="text-xs text-neutral-400 mt-1">out of all players</p>
                </div>
              </div>
            </Link>
          ) : (
            <div className="bg-white rounded-2xl p-6 shadow-card border border-cream-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Share2 className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-neutral-800 mb-1">Invite Friends</h3>
                  <p className="text-neutral-500 text-sm mb-3">Share the excitement — create or join a league with friends</p>
                  <div className="flex gap-2">
                    <Link to="/leagues/create" className="btn btn-sm btn-primary">
                      Create League
                    </Link>
                    <Link to="/leagues" className="btn btn-sm btn-secondary">
                      Browse
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats Row */}
          <div className="md:col-span-2 grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-card border border-cream-200 text-center">
              <div className="w-10 h-10 bg-burgundy-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Users className="h-5 w-5 text-burgundy-500" />
              </div>
              <p className="text-2xl font-display font-bold text-neutral-800">{nonGlobalLeagues.length}</p>
              <p className="text-xs text-neutral-500">My Leagues</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-card border border-cream-200 text-center">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-2xl font-display font-bold text-neutral-800">
                {Object.values(rostersByLeague).flat().filter((r: any) => r.castaway?.status === 'active').length}
              </p>
              <p className="text-xs text-neutral-500">Active Castaways</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-card border border-cream-200 text-center">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Sparkles className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-2xl font-display font-bold text-neutral-800">
                {globalLeague?.total_points || 0}
              </p>
              <p className="text-xs text-neutral-500">Total Points</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* My Leagues - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-neutral-800">My Leagues</h2>
              <Link to="/leagues" className="text-burgundy-500 hover:text-burgundy-600 text-sm font-semibold flex items-center gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {nonGlobalLeagues.length > 0 ? (
              <div className="space-y-4">
                {nonGlobalLeagues.map((membership) => {
                  const leagueRosters = rostersByLeague[membership.league_id] || [];
                  return (
                    <Link
                      key={membership.league_id}
                      to={`/leagues/${membership.league_id}`}
                      className="block bg-white rounded-2xl shadow-card hover:shadow-elevated transition-all border border-cream-200 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg text-neutral-800">{membership.league.name}</h3>
                            <p className="text-sm text-neutral-400 font-mono">{membership.league.code}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-display text-burgundy-500">{membership.total_points}</p>
                            <p className="text-xs text-neutral-400">points</p>
                          </div>
                        </div>

                        {/* Castaways */}
                        <div className="flex gap-3">
                          {leagueRosters.length > 0 ? (
                            leagueRosters.map((roster: any) => (
                              <div
                                key={roster.castaway_id}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl flex-1 ${
                                  roster.castaway?.status === 'eliminated'
                                    ? 'bg-neutral-100 opacity-60'
                                    : 'bg-cream-50'
                                }`}
                              >
                                {roster.castaway?.photo_url ? (
                                  <img
                                    src={roster.castaway.photo_url}
                                    alt={roster.castaway?.name}
                                    className={`w-10 h-10 rounded-full object-cover ${
                                      roster.castaway?.status === 'eliminated' ? 'grayscale' : ''
                                    }`}
                                  />
                                ) : (
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    roster.castaway?.status === 'eliminated'
                                      ? 'bg-neutral-300'
                                      : 'bg-burgundy-100'
                                  }`}>
                                    <Flame className={`h-5 w-5 ${
                                      roster.castaway?.status === 'eliminated'
                                        ? 'text-neutral-500'
                                        : 'text-burgundy-500'
                                    }`} />
                                  </div>
                                )}
                                <div>
                                  <p className={`font-medium text-sm ${
                                    roster.castaway?.status === 'eliminated'
                                      ? 'text-neutral-500 line-through'
                                      : 'text-neutral-800'
                                  }`}>
                                    {roster.castaway?.name || 'Unknown'}
                                  </p>
                                  <p className="text-xs text-neutral-400">
                                    {roster.castaway?.status === 'eliminated' ? 'Eliminated' : 'Active'}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex-1 text-center py-4 bg-cream-50 rounded-xl">
                              <p className="text-sm text-neutral-400">No castaways drafted yet</p>
                            </div>
                          )}
                        </div>

                        {/* Rank indicator */}
                        {membership.rank && (
                          <div className="mt-4 pt-4 border-t border-cream-100 flex items-center justify-between">
                            <span className="text-sm text-neutral-500">Your Rank</span>
                            <span className="font-semibold text-burgundy-500">#{membership.rank}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-card p-12 text-center border border-cream-200">
                <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-neutral-400" />
                </div>
                <h3 className="font-semibold text-neutral-800 mb-2">No leagues yet</h3>
                <p className="text-neutral-500 mb-6">Join or create a league to start playing!</p>
                <div className="flex gap-3 justify-center">
                  <Link to="/leagues/create" className="btn btn-primary">
                    Create League
                  </Link>
                  <Link to="/leagues" className="btn btn-secondary">
                    Browse Leagues
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Season Info */}
            <div className="bg-white rounded-2xl shadow-card p-6 border border-cream-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-burgundy-100 rounded-xl flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-burgundy-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-800">Season 50: In the Hands of the Fans</h3>
                  <p className="text-sm text-neutral-400">{activeSeason?.name || 'Coming Soon'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Registration Opens</span>
                  <span className="text-burgundy-500 font-semibold">Dec 19, 2025</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Premiere</span>
                  <span className="text-neutral-800 font-semibold">Feb 25, 2026</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Draft Deadline</span>
                  <span className="text-neutral-800 font-semibold">Mar 2, 2026</span>
                </div>
              </div>
            </div>

            {/* Weekly Timeline */}
            <div className="bg-white rounded-2xl shadow-card p-6 border border-cream-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="font-semibold text-neutral-800">Weekly Timeline</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-burgundy-500 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-neutral-800">Wednesday 3pm PST</p>
                    <p className="text-xs text-neutral-500">Picks lock for the week</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-neutral-800">Wednesday 8pm EST</p>
                    <p className="text-xs text-neutral-500">Episode airs (live scoring!)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-neutral-800">Friday 12pm PST</p>
                    <p className="text-xs text-neutral-500">Official results posted</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-neutral-800">Saturday 12pm PST</p>
                    <p className="text-xs text-neutral-500">Next week's picks open</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
