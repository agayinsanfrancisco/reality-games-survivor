/**
 * Inline Weekly Pick Component
 *
 * Allows users to make their weekly pick directly from the dashboard
 * without navigating to a separate page.
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { apiPost } from '@/lib/api';
import { getAvatarUrl } from '@/lib/avatar';
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Target,
  Clock,
  ChevronDown,
  ChevronUp,
  Star,
} from 'lucide-react';

interface Castaway {
  id: string;
  name: string;
  photo_url: string | null;
  status: 'active' | 'eliminated' | 'winner';
}

interface RosterEntry {
  id: string;
  castaway_id: string;
  castaways: Castaway;
}

interface CastawayStats {
  castaway_id: string;
  total_points: number;
  times_picked: number;
}

interface InlineWeeklyPickProps {
  leagueId: string;
  leagueName: string;
  seasonId: string;
}

export function InlineWeeklyPick({
  leagueId,
  leagueName: _leagueName,
  seasonId,
}: InlineWeeklyPickProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCastaway, setSelectedCastaway] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  // Fetch current/next episode
  const { data: currentEpisode } = useQuery({
    queryKey: ['currentEpisode', seasonId],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('episodes')
        .select('*')
        .eq('season_id', seasonId)
        .gte('picks_lock_at', now)
        .order('air_date', { ascending: true })
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!seasonId,
  });

  // Fetch user's roster for this league
  const { data: roster } = useQuery({
    queryKey: ['roster', leagueId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rosters')
        .select('id, castaway_id, castaways(id, name, photo_url, status)')
        .eq('league_id', leagueId)
        .eq('user_id', user!.id)
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
      if (!currentEpisode?.id) return null;
      const { data, error } = await supabase
        .from('weekly_picks')
        .select('*')
        .eq('league_id', leagueId)
        .eq('episode_id', currentEpisode.id)
        .eq('user_id', user!.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!leagueId && !!currentEpisode?.id && !!user?.id,
  });

  // Fetch castaway stats (points earned from previous picks)
  const { data: castawayStats } = useQuery({
    queryKey: ['castawayStats', leagueId, user?.id],
    queryFn: async () => {
      if (!roster) return [];
      const castawayIds = roster.map((r) => r.castaway_id);
      if (castawayIds.length === 0) return [];

      const { data, error } = await supabase
        .from('weekly_picks')
        .select('castaway_id, points_earned')
        .eq('league_id', leagueId)
        .eq('user_id', user!.id)
        .in('castaway_id', castawayIds)
        .in('status', ['locked', 'auto_picked']);

      if (error) throw error;

      const statsMap = new Map<string, CastawayStats>();
      castawayIds.forEach((id) => {
        statsMap.set(id, { castaway_id: id, total_points: 0, times_picked: 0 });
      });

      data?.forEach((pick) => {
        if (pick.castaway_id) {
          const stat = statsMap.get(pick.castaway_id);
          if (stat) {
            stat.total_points += pick.points_earned || 0;
            stat.times_picked += 1;
          }
        }
      });

      return Array.from(statsMap.values());
    },
    enabled: !!leagueId && !!user?.id && !!roster && roster.length > 0,
  });

  // Calculate countdown
  useEffect(() => {
    if (!currentEpisode?.picks_lock_at) return;

    const calculateTimeLeft = () => {
      const lockTime = new Date(currentEpisode.picks_lock_at).getTime();
      const now = Date.now();
      const diff = Math.max(0, lockTime - now);

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [currentEpisode?.picks_lock_at]);

  // Set initial selection from current pick
  useEffect(() => {
    if (currentPick?.castaway_id) {
      setSelectedCastaway(currentPick.castaway_id);
    }
  }, [currentPick?.castaway_id]);

  // Submit pick mutation
  const submitPickMutation = useMutation({
    mutationFn: async (castawayId: string) => {
      if (!currentEpisode?.id) {
        throw new Error('No episode available');
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await apiPost(
        `/leagues/${leagueId}/picks`,
        { castaway_id: castawayId, episode_id: currentEpisode.id },
        session.access_token
      );

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['currentPick', leagueId, currentEpisode?.id, user?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['next-episode-picks'],
      });
      setShowSuccess(true);
      setMutationError(null);
      setTimeout(() => {
        setShowSuccess(false);
        setIsExpanded(false);
      }, 2000);
    },
    onError: (error: Error) => {
      setMutationError(error.message || 'Failed to save pick');
      setShowSuccess(false);
    },
  });

  const handleSubmitPick = () => {
    if (!selectedCastaway) return;
    setMutationError(null);
    submitPickMutation.mutate(selectedCastaway);
  };

  // Don't render if no episode or picks are locked
  if (!currentEpisode) return null;

  const timeExpired =
    currentEpisode.picks_lock_at && new Date(currentEpisode.picks_lock_at) <= new Date();
  if (timeExpired) return null;

  const pickSubmitted = !!currentPick?.castaway_id;
  const activeCastaways = roster?.filter((r) => r.castaways?.status === 'active') || [];
  const currentPickCastaway = roster?.find((r) => r.castaway_id === currentPick?.castaway_id);

  const getStatsForCastaway = (castawayId: string): CastawayStats | undefined => {
    return castawayStats?.find((s) => s.castaway_id === castawayId);
  };

  // Compact view when collapsed
  if (!isExpanded) {
    return (
      <div
        className={`mt-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
          pickSubmitted
            ? 'bg-green-50 border-green-200 hover:border-green-300'
            : 'bg-burgundy-50 border-burgundy-200 hover:border-burgundy-300'
        }`}
        onClick={() => setIsExpanded(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                pickSubmitted ? 'bg-green-100' : 'bg-burgundy-100'
              }`}
            >
              {pickSubmitted ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Target className="h-5 w-5 text-burgundy-600" />
              )}
            </div>
            <div>
              <p
                className={`font-medium ${pickSubmitted ? 'text-green-800' : 'text-burgundy-800'}`}
              >
                Episode {currentEpisode.number} Pick
              </p>
              {pickSubmitted && currentPickCastaway ? (
                <p className="text-sm text-green-600">
                  {currentPickCastaway.castaways.name} selected
                </p>
              ) : (
                <p className="text-sm text-burgundy-600">
                  {timeLeft.days > 0
                    ? `${timeLeft.days}d ${timeLeft.hours}h left`
                    : `${timeLeft.hours}h ${timeLeft.minutes}m left`}
                </p>
              )}
            </div>
          </div>
          <ChevronDown
            className={`h-5 w-5 ${pickSubmitted ? 'text-green-400' : 'text-burgundy-400'}`}
          />
        </div>
      </div>
    );
  }

  // Expanded view for picking
  return (
    <div className="mt-4 bg-white rounded-xl border-2 border-burgundy-200 overflow-hidden">
      {/* Header */}
      <div
        className="p-4 bg-burgundy-50 border-b border-burgundy-100 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(false)}
      >
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-burgundy-600" />
          <div>
            <p className="font-medium text-burgundy-800">Episode {currentEpisode.number} Pick</p>
            <div className="flex items-center gap-1 text-sm text-burgundy-600">
              <Clock className="h-3 w-3" />
              {timeLeft.days > 0
                ? `${timeLeft.days}d ${timeLeft.hours}h left`
                : `${timeLeft.hours}h ${timeLeft.minutes}m left`}
            </div>
          </div>
        </div>
        <ChevronUp className="h-5 w-5 text-burgundy-400" />
      </div>

      {/* Castaway Selection */}
      <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
        {activeCastaways.length === 0 ? (
          <div className="text-center py-4">
            <AlertCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <p className="text-sm text-neutral-600">No active castaways available</p>
          </div>
        ) : (
          activeCastaways.map((entry) => {
            const stats = getStatsForCastaway(entry.castaway_id);
            const isSelected = selectedCastaway === entry.castaway_id;
            const isCurrent = currentPick?.castaway_id === entry.castaway_id;

            return (
              <button
                key={entry.id}
                onClick={() => setSelectedCastaway(entry.castaway_id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-burgundy-100 border-2 border-burgundy-400'
                    : 'bg-cream-50 border-2 border-transparent hover:border-cream-300'
                }`}
              >
                <img
                  src={getAvatarUrl(entry.castaways.name, entry.castaways.photo_url)}
                  alt={entry.castaways.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 text-left">
                  <p className="font-medium text-neutral-800">{entry.castaways.name}</p>
                  {stats && stats.times_picked > 0 && (
                    <p className="text-xs text-neutral-500">
                      <Star className="h-3 w-3 inline mr-1 text-amber-500" />
                      {stats.total_points} pts from {stats.times_picked} pick
                      {stats.times_picked !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                {isCurrent && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Current
                  </span>
                )}
                {isSelected && !isCurrent && (
                  <div className="w-5 h-5 rounded-full bg-burgundy-500 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Submit Section */}
      <div className="p-4 border-t border-cream-100 bg-cream-50/50">
        {showSuccess && (
          <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <p className="text-sm text-green-700 font-medium">Pick saved!</p>
          </div>
        )}

        {mutationError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-700">{mutationError}</p>
          </div>
        )}

        <button
          onClick={handleSubmitPick}
          disabled={!selectedCastaway || submitPickMutation.isPending}
          className={`w-full py-2.5 rounded-lg font-medium transition-all ${
            selectedCastaway
              ? 'bg-burgundy-500 hover:bg-burgundy-600 text-white'
              : 'bg-cream-200 text-neutral-400 cursor-not-allowed'
          }`}
        >
          {submitPickMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </span>
          ) : pickSubmitted ? (
            'Update Pick'
          ) : (
            'Confirm Pick'
          )}
        </button>
      </div>
    </div>
  );
}
