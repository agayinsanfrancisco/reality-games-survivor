/**
 * Castaway Stats Hook
 *
 * Fetches all 5 castaway performance stats.
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface ScoringEfficiencyEntry {
  castaway_id: string;
  name: string;
  total_points: number;
  episodes_played: number;
  efficiency: number;
}

interface TribeScoringEntry {
  tribe_id?: string;
  name: string;
  color?: string;
  total_points: number;
  castaway_count: number;
  avg_per_castaway: number;
}

interface ScoringEfficiencyResponse {
  leaderboard: ScoringEfficiencyEntry[];
}

interface TribeScoringResponse {
  tribes: TribeScoringEntry[];
}

interface BustStealEntry {
  castaway_id: string;
  name: string;
  avg_draft_position: number;
  points_per_episode: number;
  bust_score?: number;
  steal_score?: number;
}

interface BustStealResponse {
  leaderboard: BustStealEntry[];
}

interface ConsistencyEntry {
  castaway_id: string;
  name: string;
  avg_points: number;
  std_dev: number;
  episodes_played: number;
}

interface ConsistencyResponse {
  most_consistent: ConsistencyEntry[];
  most_volatile: ConsistencyEntry[];
}

interface SkillCorrelatedEntry {
  castaway_id: string;
  name: string;
  top_player_ownership: number;
  bottom_player_ownership: number;
  differential: number;
}

interface SkillCorrelatedResponse {
  smart_picks: SkillCorrelatedEntry[];
  trap_picks: SkillCorrelatedEntry[];
}

export function useCastawayStats() {
  // Stat 19: Scoring Efficiency
  const scoringEfficiencyQuery = useQuery({
    queryKey: ['stats', 'scoring-efficiency'],
    queryFn: async () => {
      const response = await api<{ data: ScoringEfficiencyResponse }>('/stats/scoring-efficiency');
      if (response.error) throw new Error(response.error);
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Stat 23: Tribe Scoring
  const tribeScoringQuery = useQuery({
    queryKey: ['stats', 'tribe-scoring'],
    queryFn: async () => {
      const response = await api<{ data: TribeScoringResponse }>('/stats/tribe-scoring');
      if (response.error) throw new Error(response.error);
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Stat 16: Biggest Bust
  const biggestBustQuery = useQuery({
    queryKey: ['stats', 'biggest-bust'],
    queryFn: async () => {
      const response = await api<{ data: BustStealResponse }>('/stats/biggest-bust');
      if (response.error) throw new Error(response.error);
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Stat 17: Biggest Steal
  const biggestStealQuery = useQuery({
    queryKey: ['stats', 'biggest-steal'],
    queryFn: async () => {
      const response = await api<{ data: BustStealResponse }>('/stats/biggest-steal');
      if (response.error) throw new Error(response.error);
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Stat 18: Consistency
  const consistencyQuery = useQuery({
    queryKey: ['stats', 'consistency'],
    queryFn: async () => {
      const response = await api<{ data: ConsistencyResponse }>('/stats/consistency');
      if (response.error) throw new Error(response.error);
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Stat 20: Skill-Correlated Picks
  const skillCorrelatedQuery = useQuery({
    queryKey: ['stats', 'skill-correlated-picks'],
    queryFn: async () => {
      const response = await api<{ data: SkillCorrelatedResponse }>(
        '/stats/skill-correlated-picks'
      );
      if (response.error) throw new Error(response.error);
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const isLoading =
    scoringEfficiencyQuery.isLoading ||
    tribeScoringQuery.isLoading ||
    biggestBustQuery.isLoading ||
    biggestStealQuery.isLoading ||
    consistencyQuery.isLoading ||
    skillCorrelatedQuery.isLoading;

  const error =
    scoringEfficiencyQuery.error?.message ||
    tribeScoringQuery.error?.message ||
    biggestBustQuery.error?.message ||
    biggestStealQuery.error?.message ||
    consistencyQuery.error?.message ||
    skillCorrelatedQuery.error?.message ||
    null;

  return {
    scoringEfficiency: scoringEfficiencyQuery.data,
    tribeScoring: tribeScoringQuery.data,
    biggestBust: biggestBustQuery.data,
    biggestSteal: biggestStealQuery.data,
    consistency: consistencyQuery.data,
    skillCorrelated: skillCorrelatedQuery.data,
    isLoading,
    error,
  };
}
