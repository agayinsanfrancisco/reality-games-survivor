import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Navigation } from '@/components/Navigation';

interface Castaway {
  id: string;
  name: string;
  photo_url?: string;
  status: string;
}

interface RosterEntry {
  id: string;
  castaway_id: string;
  castaways: Castaway;
}

interface WeeklyPick {
  id: string;
  episode_id: string;
  castaway_id: string | null;
  status: string;
  points_earned: number;
  episodes: {
    number: number;
    title: string | null;
  };
  castaways: Castaway | null;
}

interface Episode {
  id: string;
  number: number;
  title: string | null;
  air_date: string;
  picks_lock_at: string;
}

interface League {
  id: string;
  name: string;
  season_id: string;
}

interface UserProfile {
  id: string;
  display_name: string;
}

export function WeeklyPick() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCastaway, setSelectedCastaway] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

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

  // Fetch league
  const { data: league } = useQuery({
    queryKey: ['league', leagueId],
    queryFn: async () => {
      if (!leagueId) throw new Error('No league ID');
      const { data, error } = await supabase
        .from('leagues')
        .select('id, name, season_id')
        .eq('id', leagueId)
        .single();
      if (error) throw error;
      return data as League;
    },
    enabled: !!leagueId,
  });

  // Fetch current/next episode
  const { data: currentEpisode } = useQuery({
    queryKey: ['currentEpisode', league?.season_id],
    queryFn: async () => {
      if (!league?.season_id) throw new Error('No season ID');
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('episodes')
        .select('*')
        .eq('season_id', league.season_id)
        .gte('picks_lock_at', now)
        .order('air_date', { ascending: true })
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as Episode | null;
    },
    enabled: !!league?.season_id,
  });

  // Fetch user's roster for this league
  const { data: roster } = useQuery({
    queryKey: ['roster', leagueId, user?.id],
    queryFn: async () => {
      if (!leagueId || !user?.id) throw new Error('Missing data');
      const { data, error } = await supabase
        .from('rosters')
        .select('id, castaway_id, castaways(*)')
        .eq('league_id', leagueId)
        .eq('user_id', user.id)
        .is('dropped_at', null);
      if (error) throw error;
      return data as RosterEntry[];
    },
    enabled: !!leagueId && !!user?.id,
  });

  // Fetch user's current pick for this episode
  const { data: currentPick } = useQuery({
    queryKey: ['currentPick', leagueId, currentEpisode?.id, user?.id],
    queryFn: async () => {
      if (!leagueId || !currentEpisode?.id || !user?.id) throw new Error('Missing data');
      const { data, error } = await supabase
        .from('weekly_picks')
        .select('*')
        .eq('league_id', leagueId)
        .eq('episode_id', currentEpisode.id)
        .eq('user_id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!leagueId && !!currentEpisode?.id && !!user?.id,
  });

  // Fetch previous picks
  const { data: previousPicks } = useQuery({
    queryKey: ['previousPicks', leagueId, user?.id],
    queryFn: async () => {
      if (!leagueId || !user?.id) throw new Error('Missing data');
      const { data, error } = await supabase
        .from('weekly_picks')
        .select('id, episode_id, castaway_id, status, points_earned, episodes(number, title), castaways(*)')
        .eq('league_id', leagueId)
        .eq('user_id', user.id)
        .neq('status', 'pending')
        .order('episodes(number)', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as WeeklyPick[];
    },
    enabled: !!leagueId && !!user?.id,
  });

  // Submit pick mutation
  const submitPickMutation = useMutation({
    mutationFn: async (castawayId: string) => {
      if (!leagueId || !user?.id || !currentEpisode?.id) {
        throw new Error('Missing required data');
      }

      // Check if pick already exists
      if (currentPick) {
        const { data, error } = await supabase
          .from('weekly_picks')
          .update({ castaway_id: castawayId, picked_at: new Date().toISOString() })
          .eq('id', currentPick.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('weekly_picks')
          .insert({
            league_id: leagueId,
            user_id: user.id,
            episode_id: currentEpisode.id,
            castaway_id: castawayId,
            status: 'pending',
            picked_at: new Date().toISOString(),
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentPick', leagueId, currentEpisode?.id, user?.id] });
    },
  });

  // Calculate countdown
  useEffect(() => {
    if (!currentEpisode?.picks_lock_at) return;

    const calculateTimeLeft = () => {
      const lockTime = new Date(currentEpisode.picks_lock_at).getTime();
      const now = Date.now();
      const diff = Math.max(0, lockTime - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({ days, hours, minutes });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, [currentEpisode?.picks_lock_at]);

  // Set initial selection from current pick
  useEffect(() => {
    if (currentPick?.castaway_id) {
      setSelectedCastaway(currentPick.castaway_id);
    }
  }, [currentPick?.castaway_id]);

  const handleSubmitPick = () => {
    if (!selectedCastaway) return;
    submitPickMutation.mutate(selectedCastaway);
  };

  const pickSubmitted = !!currentPick?.castaway_id;
  const isLocked = currentPick?.status === 'locked';
  const activeCastaways = roster?.filter(r => r.castaways?.status === 'active') || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-100 to-cream-200">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                Weekly Pick
              </h1>
            </div>
            <p className="text-neutral-500">
              {currentEpisode ? `Episode ${currentEpisode.number}` : 'Loading...'} • {league?.name || 'Select your castaway'}
            </p>
          </div>
        </div>

        {!currentEpisode ? (
          <div className="bg-white rounded-2xl shadow-elevated p-12 text-center animate-slide-up">
            <div className="w-20 h-20 mx-auto mb-6 bg-cream-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-display text-neutral-800 mb-3">No Episode Scheduled</h2>
            <p className="text-neutral-500 mb-8">
              There are no upcoming episodes with open picks. Check back later!
            </p>
            <Link to="/dashboard" className="btn btn-primary shadow-card">
              Back to Dashboard
            </Link>
          </div>
        ) : isLocked ? (
          <div className="bg-white rounded-2xl shadow-elevated p-12 text-center animate-slide-up">
            <div className="w-20 h-20 mx-auto mb-6 bg-burgundy-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-burgundy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-display text-neutral-800 mb-3">Picks Locked</h2>
            <p className="text-neutral-500 mb-2">
              Your pick for Episode {currentEpisode.number} is locked.
            </p>
            <p className="text-lg font-semibold text-burgundy-600 mb-8">
              {roster?.find(r => r.castaway_id === currentPick?.castaway_id)?.castaways?.name || 'Unknown'}
            </p>
            <Link to="/dashboard" className="btn btn-primary shadow-card">
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Countdown Banner */}
            <div className="bg-gradient-to-r from-burgundy-500 to-burgundy-600 rounded-2xl p-6 text-white shadow-elevated animate-slide-up">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-burgundy-100 text-sm font-medium">Picks Lock In</p>
                  <div className="flex items-baseline gap-3 mt-2">
                    <div className="text-center">
                      <span className="text-4xl font-display">{timeLeft.days}</span>
                      <p className="text-xs text-burgundy-200 mt-1">days</p>
                    </div>
                    <span className="text-2xl text-burgundy-200">:</span>
                    <div className="text-center">
                      <span className="text-4xl font-display">{timeLeft.hours}</span>
                      <p className="text-xs text-burgundy-200 mt-1">hours</p>
                    </div>
                    <span className="text-2xl text-burgundy-200">:</span>
                    <div className="text-center">
                      <span className="text-4xl font-display">{timeLeft.minutes}</span>
                      <p className="text-xs text-burgundy-200 mt-1">min</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-burgundy-100">Episode airs</p>
                  <p className="font-semibold text-lg">
                    {new Date(currentEpisode.air_date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Pick Selection */}
            <div className="bg-white rounded-2xl shadow-elevated overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="p-6 border-b border-cream-100">
                <h2 className="font-semibold text-neutral-800">Select Your Castaway</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Choose which player from your roster to play this week
                </p>
              </div>

              <div className="p-6 space-y-4">
                {activeCastaways.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    No active castaways on your roster. You may need to complete the draft first.
                  </div>
                ) : (
                  activeCastaways.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => setSelectedCastaway(entry.castaway_id)}
                      className={`w-full p-5 rounded-xl border-2 transition-all text-left flex items-center gap-5 ${
                        selectedCastaway === entry.castaway_id
                          ? 'border-burgundy-500 bg-burgundy-50 shadow-card'
                          : 'border-cream-200 bg-cream-50 hover:border-cream-300 hover:shadow-sm'
                      }`}
                    >
                      {/* Photo */}
                      {entry.castaways?.photo_url ? (
                        <img
                          src={entry.castaways.photo_url}
                          alt={entry.castaways.name}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                      ) : (
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                          selectedCastaway === entry.castaway_id ? 'bg-burgundy-100' : 'bg-cream-200'
                        }`}>
                          <svg className={`w-8 h-8 ${
                            selectedCastaway === entry.castaway_id ? 'text-burgundy-400' : 'text-neutral-300'
                          }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className={`font-semibold text-lg ${
                            selectedCastaway === entry.castaway_id ? 'text-burgundy-700' : 'text-neutral-800'
                          }`}>
                            {entry.castaways?.name}
                          </h3>
                          <span className={`badge text-xs ${
                            entry.castaways?.status === 'active' ? 'badge-success' : 'bg-neutral-100 text-neutral-500'
                          }`}>
                            {entry.castaways?.status?.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Selection indicator */}
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedCastaway === entry.castaway_id
                          ? 'border-burgundy-500 bg-burgundy-500'
                          : 'border-cream-300'
                      }`}>
                        {selectedCastaway === entry.castaway_id && (
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Submit */}
              <div className="p-6 border-t border-cream-100 bg-cream-50/50">
                <button
                  onClick={handleSubmitPick}
                  disabled={!selectedCastaway || submitPickMutation.isPending}
                  className={`w-full btn ${
                    selectedCastaway
                      ? 'btn-primary shadow-card'
                      : 'bg-cream-200 text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  {submitPickMutation.isPending
                    ? 'Saving...'
                    : pickSubmitted
                    ? 'Update Pick'
                    : selectedCastaway
                    ? 'Confirm Pick'
                    : 'Select a Castaway'
                  }
                </button>
                {pickSubmitted && (
                  <p className="text-center text-sm text-green-600 mt-3">
                    Pick saved! You can change it until picks lock.
                  </p>
                )}
              </div>
            </div>

            {/* Previous Picks */}
            {previousPicks && previousPicks.length > 0 && (
              <div className="bg-white rounded-2xl shadow-elevated p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <h3 className="font-semibold text-neutral-800 mb-4">Previous Picks</h3>
                <div className="space-y-3">
                  {previousPicks.map((pick) => (
                    <div key={pick.id} className="flex items-center justify-between p-3 bg-cream-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-neutral-500">
                          Ep {pick.episodes?.number}
                        </span>
                        <span className="font-medium text-neutral-800">
                          {pick.castaways?.name || 'Unknown'}
                        </span>
                      </div>
                      <span className={`badge ${pick.points_earned >= 0 ? 'badge-success' : 'bg-red-100 text-red-700'}`}>
                        {pick.points_earned >= 0 ? '+' : ''}{pick.points_earned} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
