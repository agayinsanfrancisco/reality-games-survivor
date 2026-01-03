/**
 * Player Stats Hook
 *
 * Fetches all 15 player performance stats.
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface MostLeaguesEntry {
  user_id: string;
  display_name: string;
  league_count: number;
}

interface MostLeaguesResponse {
  leaderboard: MostLeaguesEntry[];
  distribution?: { bucket: string; count: number }[];
}

interface LastMinuteLarryEntry {
  user_id: string;
  display_name: string;
  last_minute_picks: number;
  total_picks: number;
  ratio: number;
}

interface LastMinuteLarryResponse {
  leaderboard: LastMinuteLarryEntry[];
}

interface EarlyBirdEntry {
  user_id: string;
  display_name: string;
  early_picks: number;
  total_picks: number;
  ratio: number;
}

interface EarlyBirdResponse {
  leaderboard: EarlyBirdEntry[];
}

interface SubmissionSpeedEntry {
  user_id: string;
  display_name: string;
  avg_hours_to_submit: number;
  fastest_submission: number;
  slowest_submission: number;
}

interface SubmissionSpeedResponse {
  leaderboard: SubmissionSpeedEntry[];
}

interface SubmissionTimingEntry {
  user_id: string;
  display_name: string;
  first_hour_picks?: number;
  last_hour_picks?: number;
  total_picks: number;
  ratio: number;
}

interface SubmissionTimingResponse {
  early_birds: SubmissionTimingEntry[];
  procrastinators: SubmissionTimingEntry[];
}

interface SuccessfulPickRatioEntry {
  user_id: string;
  display_name: string;
  successful_picks: number;
  total_picks: number;
  ratio: number;
}

interface SuccessfulPickRatioResponse {
  leaderboard: SuccessfulPickRatioEntry[];
}

interface MostActiveEntry {
  user_id: string;
  display_name: string;
  picks_count: number;
  messages_count: number;
  composite_score: number;
}

interface MostActiveResponse {
  leaderboard: MostActiveEntry[];
}

interface ImprovementEntry {
  user_id: string;
  display_name: string;
  first_half_avg: number;
  second_half_avg: number;
  improvement?: number;
  decline?: number;
}

interface ImprovementTrendResponse {
  most_improved: ImprovementEntry[];
  most_declined: ImprovementEntry[];
}

interface LuckiestPlayerEntry {
  user_id: string;
  display_name: string;
  luck_points: number;
  castaways_count: number;
}

interface LuckiestPlayerResponse {
  leaderboard: LuckiestPlayerEntry[];
}

interface UnluckiestPlayerEntry {
  user_id: string;
  display_name: string;
  missed_points: number;
  eliminations_count: number;
}

interface UnluckiestPlayerResponse {
  leaderboard: UnluckiestPlayerEntry[];
}

interface CurseCarrierEntry {
  user_id: string;
  display_name: string;
  cursed_castaways: number;
  total_castaways: number;
  curse_rate: number;
}

interface CurseCarrierResponse {
  leaderboard: CurseCarrierEntry[];
}

interface BenchwarmerRegretEntry {
  user_id: string;
  display_name: string;
  bench_points: number;
  best_bench_week?: number;
}

interface BenchwarmerRegretResponse {
  leaderboard: BenchwarmerRegretEntry[];
}

interface IndecisiveEntry {
  user_id: string;
  display_name: string;
  total_changes: number;
  episodes_changed: number;
}

interface IndecisiveResponse {
  leaderboard: IndecisiveEntry[];
}

interface SetAndForgetEntry {
  user_id: string;
  display_name: string;
  episodes_played: number;
}

interface SetAndForgetResponse {
  users: SetAndForgetEntry[];
}

interface WaiverWonderEntry {
  user_id: string;
  display_name: string;
  waiver_points: number;
  undrafted_castaways: number;
}

interface WaiverWonderResponse {
  leaderboard: WaiverWonderEntry[];
}

interface ComebackRoyaltyEntry {
  user_id: string;
  display_name: string;
  league_name: string;
  max_deficit: number;
  deficit_week: number;
}

interface ComebackRoyaltyResponse {
  leaderboard: ComebackRoyaltyEntry[];
}

interface ChokeArtistEntry {
  user_id: string;
  display_name: string;
  league_name: string;
  max_lead: number;
  lead_week: number;
  final_position: number;
}

interface ChokeArtistResponse {
  leaderboard: ChokeArtistEntry[];
}

export function usePlayerStats() {
  // Stat 13: Most Leagues Joined
  const mostLeaguesQuery = useQuery({
    queryKey: ['stats', 'most-leagues'],
    queryFn: async () => {
      const response = await api<{ data: MostLeaguesResponse }>('/stats/most-leagues');
      if (response.error) throw new Error(response.error);
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Stat 4: Last-Minute Larry
  const lastMinuteLarryQuery = useQuery({
    queryKey: ['stats', 'last-minute-larry'],
    queryFn: async () => {
      const response = await api<{ data: LastMinuteLarryResponse }>('/stats/last-minute-larry');
      if (response.error) throw new Error(response.error);
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Stat 5: Early Bird
  const earlyBirdQuery = useQuery({
    queryKey: ['stats', 'early-bird'],
    queryFn: async () => {
      const response = await api<{ data: EarlyBirdResponse }>('/stats/early-bird');
      if (response.error) throw new Error(response.error);
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Stat 27: Submission Speed
  const submissionSpeedQuery = useQuery({
    queryKey: ['stats', 'submission-speed'],
    queryFn: async () => {
      const response = await api<{ data: SubmissionSpeedResponse }>('/stats/submission-speed');
      if (response.error) throw new Error(response.error);
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Stat 24: Submission Timing
  const submissionTimingQuery = useQuery({
    queryKey: ['stats', 'submission-timing'],
    queryFn: async () => {
      const response = await api<{ data: SubmissionTimingResponse }>('/stats/submission-timing');
      if (response.error) throw new Error(response.error);
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Stat 1: Successful Pick Ratio
  const successfulPickRatioQuery = useQuery({
    queryKey: ['stats', 'successful-pick-ratio'],
    queryFn: async () => {
      const response = await api<{ data: SuccessfulPickRatioResponse }>(
        '/stats/successful-pick-ratio'
      );
      if (response.error) throw new Error(response.error);
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Stat 14: Most Active Player
  const mostActiveQuery = useQuery({
    queryKey: ['stats', 'most-active'],
    queryFn: async () => {
      const response = await api<{ data: MostActiveResponse }>('/stats/most-active');
      if (response.error) throw new Error(response.error);
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Stat 15: Improvement Trend
  const improvementTrendQuery = useQuery({
    queryKey: ['stats', 'improvement-trend'],
    queryFn: async () => {
      const response = await api<{ data: ImprovementTrendResponse }>('/stats/improvement-trend');
      if (response.error) throw new Error(response.error);
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Stat 2: Luckiest Player
  const luckiestPlayerQuery = useQuery({
    queryKey: ['stats', 'luckiest-player'],
    queryFn: async () => {
      const response = await api<{ data: LuckiestPlayerResponse }>('/stats/luckiest-player');
      if (response.error) throw new Error(response.error);
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Stat 3: Unluckiest Player
  const unluckiestPlayerQuery = useQuery({
    queryKey: ['stats', 'unluckiest-player'],
    queryFn: async () => {
      const response = await api<{ data: UnluckiestPlayerResponse }>('/stats/unluckiest-player');
      if (response.error) throw new Error(response.error);
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Stat 9: Curse Carrier
  const curseCarrierQuery = useQuery({
    queryKey: ['stats', 'curse-carrier'],
    queryFn: async () => {
      const response = await api<{ data: CurseCarrierResponse }>('/stats/curse-carrier');
      if (response.error) throw new Error(response.error);
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Stat 8: Benchwarmer Regret
  const benchwarmerRegretQuery = useQuery({
    queryKey: ['stats', 'benchwarmer-regret'],
    queryFn: async () => {
      const response = await api<{ data: BenchwarmerRegretResponse }>('/stats/benchwarmer-regret');
      if (response.error) throw new Error(response.error);
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Stat 6: Indecisive Award
  const indecisiveQuery = useQuery({
    queryKey: ['stats', 'indecisive'],
    queryFn: async () => {
      const response = await api<{ data: IndecisiveResponse }>('/stats/indecisive');
      if (response.error) throw new Error(response.error);
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Stat 7: Set It and Forget It
  const setAndForgetQuery = useQuery({
    queryKey: ['stats', 'set-and-forget'],
    queryFn: async () => {
      const response = await api<{ data: SetAndForgetResponse }>('/stats/set-and-forget');
      if (response.error) throw new Error(response.error);
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Stat 10: Waiver Wire Wonder
  const waiverWonderQuery = useQuery({
    queryKey: ['stats', 'waiver-wonder'],
    queryFn: async () => {
      const response = await api<{ data: WaiverWonderResponse }>('/stats/waiver-wonder');
      if (response.error) throw new Error(response.error);
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Stat 11: Comeback King/Queen
  const comebackRoyaltyQuery = useQuery({
    queryKey: ['stats', 'comeback-royalty'],
    queryFn: async () => {
      const response = await api<{ data: ComebackRoyaltyResponse }>('/stats/comeback-royalty');
      if (response.error) throw new Error(response.error);
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Stat 12: Choke Artist
  const chokeArtistQuery = useQuery({
    queryKey: ['stats', 'choke-artist'],
    queryFn: async () => {
      const response = await api<{ data: ChokeArtistResponse }>('/stats/choke-artist');
      if (response.error) throw new Error(response.error);
      return response.data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const isLoading =
    mostLeaguesQuery.isLoading ||
    lastMinuteLarryQuery.isLoading ||
    earlyBirdQuery.isLoading ||
    submissionSpeedQuery.isLoading ||
    submissionTimingQuery.isLoading ||
    successfulPickRatioQuery.isLoading ||
    mostActiveQuery.isLoading ||
    improvementTrendQuery.isLoading ||
    luckiestPlayerQuery.isLoading ||
    unluckiestPlayerQuery.isLoading ||
    curseCarrierQuery.isLoading ||
    benchwarmerRegretQuery.isLoading ||
    indecisiveQuery.isLoading ||
    setAndForgetQuery.isLoading ||
    waiverWonderQuery.isLoading ||
    comebackRoyaltyQuery.isLoading ||
    chokeArtistQuery.isLoading;

  const error =
    mostLeaguesQuery.error?.message ||
    lastMinuteLarryQuery.error?.message ||
    earlyBirdQuery.error?.message ||
    submissionSpeedQuery.error?.message ||
    submissionTimingQuery.error?.message ||
    successfulPickRatioQuery.error?.message ||
    mostActiveQuery.error?.message ||
    improvementTrendQuery.error?.message ||
    luckiestPlayerQuery.error?.message ||
    unluckiestPlayerQuery.error?.message ||
    curseCarrierQuery.error?.message ||
    benchwarmerRegretQuery.error?.message ||
    indecisiveQuery.error?.message ||
    setAndForgetQuery.error?.message ||
    waiverWonderQuery.error?.message ||
    comebackRoyaltyQuery.error?.message ||
    chokeArtistQuery.error?.message ||
    null;

  return {
    mostLeagues: mostLeaguesQuery.data,
    lastMinuteLarry: lastMinuteLarryQuery.data,
    earlyBird: earlyBirdQuery.data,
    submissionSpeed: submissionSpeedQuery.data,
    submissionTiming: submissionTimingQuery.data,
    successfulPickRatio: successfulPickRatioQuery.data,
    mostActive: mostActiveQuery.data,
    improvementTrend: improvementTrendQuery.data,
    luckiestPlayer: luckiestPlayerQuery.data,
    unluckiestPlayer: unluckiestPlayerQuery.data,
    curseCarrier: curseCarrierQuery.data,
    benchwarmerRegret: benchwarmerRegretQuery.data,
    indecisive: indecisiveQuery.data,
    setAndForget: setAndForgetQuery.data,
    waiverWonder: waiverWonderQuery.data,
    comebackRoyalty: comebackRoyaltyQuery.data,
    chokeArtist: chokeArtistQuery.data,
    isLoading,
    error,
  };
}
