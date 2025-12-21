import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Navigation } from '@/components/Navigation';
import { CastawayCard } from '@/components/CastawayCard';

interface Castaway {
  id: string;
  name: string;
  photo_url?: string;
  hometown?: string;
  age?: number;
  tribe_original?: string;
  status: string;
}

interface RosterEntry {
  id: string;
  user_id: string;
  castaway_id: string;
  draft_round: number;
  draft_pick: number;
}

interface LeagueMember {
  id: string;
  user_id: string;
  draft_position: number | null;
  users: { id: string; display_name: string };
}

interface League {
  id: string;
  name: string;
  code: string;
  draft_status: string;
  draft_order: string[] | null;
  season_id: string;
}

interface UserProfile {
  id: string;
  display_name: string;
}

export function Draft() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCastaway, setSelectedCastaway] = useState<string | null>(null);
  const [tribeFilter, setTribeFilter] = useState<string | null>(null);

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, display_name')
        .eq('id', user!.id)
        .single();
      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!user?.id,
  });

  // Fetch league details
  const { data: league } = useQuery({
    queryKey: ['league', leagueId],
    queryFn: async () => {
      if (!leagueId) throw new Error('No league ID');
      const { data, error } = await supabase
        .from('leagues')
        .select('*')
        .eq('id', leagueId)
        .single();
      if (error) throw error;
      return data as League;
    },
    enabled: !!leagueId,
  });

  // Fetch league members with their draft positions
  const { data: leagueMembers } = useQuery({
    queryKey: ['leagueMembers', leagueId],
    queryFn: async () => {
      if (!leagueId) throw new Error('No league ID');
      const { data, error } = await supabase
        .from('league_members')
        .select('id, user_id, draft_position, users(id, display_name)')
        .eq('league_id', leagueId)
        .order('draft_position', { ascending: true });
      if (error) throw error;
      return data as LeagueMember[];
    },
    enabled: !!leagueId,
  });

  // Fetch all castaways for this season
  const { data: castaways } = useQuery({
    queryKey: ['castaways', league?.season_id],
    queryFn: async () => {
      if (!league?.season_id) throw new Error('No season ID');
      const { data, error } = await supabase
        .from('castaways')
        .select('*')
        .eq('season_id', league.season_id)
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      return data as Castaway[];
    },
    enabled: !!league?.season_id,
  });

  // Fetch all roster entries (drafted castaways) for this league
  const { data: rosters } = useQuery({
    queryKey: ['rosters', leagueId],
    queryFn: async () => {
      if (!leagueId) throw new Error('No league ID');
      const { data, error } = await supabase
        .from('rosters')
        .select('*')
        .eq('league_id', leagueId)
        .is('dropped_at', null);
      if (error) throw error;
      return data as RosterEntry[];
    },
    enabled: !!leagueId,
  });

  // Mutation to make a draft pick
  const draftPickMutation = useMutation({
    mutationFn: async (castawayId: string) => {
      if (!leagueId || !user?.id) throw new Error('Missing required data');

      const myRoster = rosters?.filter(r => r.user_id === user.id) || [];
      const draftRound = myRoster.length + 1;
      const totalPicks = (rosters?.length || 0) + 1;

      const { data, error } = await supabase
        .from('rosters')
        .insert({
          league_id: leagueId,
          user_id: user.id,
          castaway_id: castawayId,
          draft_round: draftRound,
          draft_pick: totalPicks,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rosters', leagueId] });
      setSelectedCastaway(null);
    },
  });

  // Compute draft state
  const draftedCastawayIds = useMemo(() => {
    return new Set(rosters?.map(r => r.castaway_id) || []);
  }, [rosters]);

  const myPicks = useMemo(() => {
    return rosters?.filter(r => r.user_id === user?.id) || [];
  }, [rosters, user?.id]);

  const availableCastaways = useMemo(() => {
    let available = castaways?.filter(c => !draftedCastawayIds.has(c.id)) || [];
    if (tribeFilter) {
      available = available.filter(c => c.tribe_original === tribeFilter);
    }
    return available;
  }, [castaways, draftedCastawayIds, tribeFilter]);

  // Get unique tribes for filter
  const tribes = useMemo(() => {
    const tribeSet = new Set(castaways?.map(c => c.tribe_original).filter(Boolean));
    return Array.from(tribeSet) as string[];
  }, [castaways]);

  // Determine whose turn it is (simplified - in production this would be more complex)
  const totalMembers = leagueMembers?.length || 0;
  const currentPickNumber = (rosters?.length || 0) + 1;
  const currentRound = Math.ceil(currentPickNumber / Math.max(totalMembers, 1));

  // Snake draft logic
  const positionInRound = ((currentPickNumber - 1) % totalMembers);
  const isReverseRound = currentRound % 2 === 0;
  const currentPickerIndex = isReverseRound ? (totalMembers - 1 - positionInRound) : positionInRound;
  const currentPicker = leagueMembers?.[currentPickerIndex];
  const isMyTurn = currentPicker?.user_id === user?.id;

  const draftComplete = myPicks.length >= 2;
  const allDraftComplete = (rosters?.length || 0) >= (totalMembers * 2);

  const handleDraftPick = () => {
    if (!selectedCastaway || !isMyTurn) return;
    draftPickMutation.mutate(selectedCastaway);
  };

  // Build draft order display
  const draftOrderDisplay = useMemo(() => {
    return leagueMembers?.map((member, index) => {
      const memberPicks = rosters?.filter(r => r.user_id === member.user_id) || [];
      const pickedCastaways = memberPicks.map(pick =>
        castaways?.find(c => c.id === pick.castaway_id)?.name
      ).filter(Boolean);

      return {
        position: index + 1,
        name: member.users?.display_name || 'Unknown',
        isCurrentUser: member.user_id === user?.id,
        picks: pickedCastaways as string[],
        userId: member.user_id,
      };
    }) || [];
  }, [leagueMembers, rosters, castaways, user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-100 to-cream-200">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                to="/dashboard"
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-display text-neutral-800">
                Draft Room
              </h1>
            </div>
            <p className="text-neutral-500">
              {league?.name || 'Loading...'} • Round {currentRound} of 2
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-neutral-500">Draft Deadline</p>
              <p className="font-semibold text-burgundy-500">Mar 2, 8:00 PM PST</p>
            </div>
          </div>
        </div>

        {allDraftComplete || draftComplete ? (
          /* Draft Complete State */
          <div className="bg-white rounded-2xl shadow-elevated p-12 text-center animate-slide-up">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-display text-neutral-800 mb-3">
              {allDraftComplete ? 'Draft Complete!' : 'Your Picks Complete!'}
            </h2>
            <p className="text-neutral-500 mb-8 max-w-md mx-auto">
              {allDraftComplete
                ? "The draft is complete. Make your weekly picks when episodes air."
                : "You've picked your team. Wait for other players to complete the draft."
              }
            </p>

            <div className="flex justify-center gap-4 mb-8">
              {myPicks.map((pick) => {
                const castaway = castaways?.find(c => c.id === pick.castaway_id);
                return castaway ? (
                  <div key={pick.id} className="bg-cream-50 rounded-xl p-4 text-center">
                    {castaway.photo_url ? (
                      <img
                        src={castaway.photo_url}
                        alt={castaway.name}
                        className="w-16 h-16 mx-auto mb-3 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 mx-auto mb-3 bg-cream-200 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    <p className="font-semibold text-neutral-800">{castaway.name}</p>
                    <p className="text-xs text-neutral-500">{castaway.tribe_original}</p>
                  </div>
                ) : null;
              })}
            </div>

            <Link to="/dashboard" className="btn btn-primary shadow-card">
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Draft Order Sidebar */}
            <div className="lg:col-span-1 animate-slide-up">
              <div className="bg-white rounded-2xl shadow-elevated overflow-hidden sticky top-24">
                <div className="p-5 border-b border-cream-100">
                  <h2 className="font-semibold text-neutral-800">Draft Order</h2>
                  <p className="text-sm text-neutral-500 mt-1">Snake format</p>
                </div>

                <div className="p-4 space-y-2">
                  {draftOrderDisplay.map((player, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl flex items-center justify-between transition-all ${
                        currentPicker?.user_id === player.userId
                          ? 'bg-burgundy-50 border-2 border-burgundy-200'
                          : 'bg-cream-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                          currentPicker?.user_id === player.userId
                            ? 'bg-burgundy-500 text-white'
                            : 'bg-cream-200 text-neutral-600'
                        }`}>
                          {player.position}
                        </span>
                        <div>
                          <p className={`font-medium text-sm ${
                            player.isCurrentUser ? 'text-burgundy-600' : 'text-neutral-800'
                          }`}>
                            {player.isCurrentUser ? 'You' : player.name}
                          </p>
                          {player.picks.length > 0 && (
                            <p className="text-xs text-neutral-400">
                              {player.picks.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      {currentPicker?.user_id === player.userId && (
                        <span className="badge badge-burgundy text-xs animate-pulse">
                          Picking
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Your Team */}
                <div className="p-4 border-t border-cream-100 bg-cream-50/50">
                  <h3 className="font-semibold text-neutral-800 mb-3">Your Team</h3>
                  {myPicks.length === 0 ? (
                    <p className="text-sm text-neutral-400">No picks yet</p>
                  ) : (
                    <div className="space-y-2">
                      {myPicks.map((pick) => {
                        const castaway = castaways?.find(c => c.id === pick.castaway_id);
                        return castaway ? (
                          <div key={pick.id} className="flex items-center gap-2 text-sm">
                            <div className="w-6 h-6 bg-burgundy-100 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-burgundy-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="font-medium text-neutral-800">{castaway.name}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                  <p className="text-xs text-neutral-400 mt-3">
                    {2 - myPicks.length} pick{2 - myPicks.length !== 1 ? 's' : ''} remaining
                  </p>
                </div>
              </div>
            </div>

            {/* Main Draft Area */}
            <div className="lg:col-span-3 space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {/* Current Pick Banner */}
              {isMyTurn ? (
                <div className="bg-gradient-to-r from-burgundy-500 to-burgundy-600 rounded-2xl p-6 text-white shadow-elevated">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-burgundy-100 text-sm font-medium">Round {currentRound}, Pick {currentPickNumber}</p>
                      <h2 className="text-2xl font-display mt-1">It's Your Turn!</h2>
                      <p className="text-burgundy-100 mt-2">Select a castaway below to add to your team.</p>
                    </div>
                    {selectedCastaway && (
                      <button
                        onClick={handleDraftPick}
                        disabled={draftPickMutation.isPending}
                        className="btn bg-white text-burgundy-600 hover:bg-cream-50 shadow-lg disabled:opacity-50"
                      >
                        {draftPickMutation.isPending ? 'Drafting...' : 'Confirm Pick'}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-cream-100 rounded-2xl p-6 border border-cream-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-cream-200 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-neutral-500 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-neutral-500 text-sm">Waiting for</p>
                      <p className="font-semibold text-neutral-800">
                        {currentPicker?.users?.display_name || 'Next player'} to pick...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Filter Tabs */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setTribeFilter(null)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-all ${
                    !tribeFilter
                      ? 'bg-burgundy-500 text-white'
                      : 'bg-white text-neutral-600 shadow-card hover:shadow-card-hover'
                  }`}
                >
                  All ({castaways?.filter(c => !draftedCastawayIds.has(c.id)).length || 0})
                </button>
                {tribes.map(tribe => {
                  const count = castaways?.filter(c => c.tribe_original === tribe && !draftedCastawayIds.has(c.id)).length || 0;
                  return (
                    <button
                      key={tribe}
                      onClick={() => setTribeFilter(tribe)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-all ${
                        tribeFilter === tribe
                          ? 'bg-burgundy-500 text-white'
                          : 'bg-white text-neutral-600 shadow-card hover:shadow-card-hover'
                      }`}
                    >
                      {tribe} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Castaway Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {availableCastaways.map((castaway) => (
                  <CastawayCard
                    key={castaway.id}
                    id={castaway.id}
                    name={castaway.name}
                    photoUrl={castaway.photo_url}
                    hometown={castaway.hometown}
                    tribe={castaway.tribe_original}
                    selected={selectedCastaway === castaway.id}
                    disabled={!isMyTurn}
                    showButton={isMyTurn}
                    buttonText="Select"
                    onSelect={(id) => setSelectedCastaway(id === selectedCastaway ? null : id)}
                  />
                ))}
              </div>

              {availableCastaways.length === 0 && (
                <div className="bg-white rounded-2xl shadow-elevated p-12 text-center">
                  <p className="text-neutral-500">
                    {tribeFilter
                      ? `No available castaways from ${tribeFilter}.`
                      : 'All castaways have been drafted!'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
