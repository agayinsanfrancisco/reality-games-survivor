/**
 * Admin Scoring Hooks
 *
 * Custom hooks for admin episode scoring functionality.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { apiWithAuth } from '@/lib/api';
import type { Episode, Castaway, ScoringRule, EpisodeScore, UserProfile } from '@/types';

export interface ScoringStatus {
  is_complete: boolean;
  total_castaways: number;
  scored_castaways: number;
  unscored_castaway_ids: string[];
  unscored_castaway_names: string[];
  is_finalized: boolean;
}

/**
 * Fetch admin user profile
 */
export function useAdminProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, display_name, role')
        .eq('id', userId!)
        .single();
      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!userId,
  });
}

/**
 * Fetch active season for scoring
 */
export function useActiveSeasonForScoring() {
  return useQuery({
    queryKey: ['activeSeason'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .eq('is_active', true)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });
}

/**
 * Fetch episodes for a season
 */
export function useEpisodesForScoring(seasonId: string | undefined) {
  return useQuery({
    queryKey: ['episodes', seasonId],
    queryFn: async () => {
      if (!seasonId) return [];
      const { data, error } = await supabase
        .from('episodes')
        .select('*')
        .eq('season_id', seasonId)
        .order('number', { ascending: true });
      if (error) throw error;
      return data as Episode[];
    },
    enabled: !!seasonId,
  });
}

/**
 * Fetch castaways for a season
 */
export function useCastawaysForScoring(seasonId: string | undefined) {
  return useQuery({
    queryKey: ['castaways', seasonId],
    queryFn: async () => {
      if (!seasonId) return [];
      const { data, error } = await supabase
        .from('castaways')
        .select('*')
        .eq('season_id', seasonId)
        .order('name');
      if (error) throw error;
      return data as Castaway[];
    },
    enabled: !!seasonId,
  });
}

/**
 * Fetch scoring rules for a season
 */
export function useScoringRulesForScoring(seasonId: string | undefined) {
  return useQuery({
    queryKey: ['scoringRules', seasonId],
    queryFn: async () => {
      if (!seasonId) return [];
      const { data, error } = await supabase
        .from('scoring_rules')
        .select('*')
        .eq('season_id', seasonId)
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data as ScoringRule[];
    },
    enabled: !!seasonId,
  });
}

/**
 * Fetch existing scores for an episode
 */
export function useExistingScores(episodeId: string | null) {
  return useQuery({
    queryKey: ['episodeScores', episodeId],
    queryFn: async () => {
      if (!episodeId) return [];
      const { data, error } = await supabase
        .from('episode_scores')
        .select('*')
        .eq('episode_id', episodeId);
      if (error) throw error;
      return data as EpisodeScore[];
    },
    enabled: !!episodeId,
  });
}

/**
 * Fetch scoring status (completeness) for an episode
 */
export function useScoringStatus(episodeId: string | null) {
  return useQuery({
    queryKey: ['scoringStatus', episodeId],
    queryFn: async () => {
      if (!episodeId) return null;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const result = await apiWithAuth<ScoringStatus>(
        `/episodes/${episodeId}/scoring/status`,
        session.access_token
      );

      if (result.error) throw new Error(result.error);
      return result.data;
    },
    enabled: !!episodeId,
    refetchInterval: 5000, // Refetch every 5 seconds to keep status current
  });
}

/**
 * Group scoring rules by category
 */
export function groupRulesByCategory(
  rules: ScoringRule[] | undefined
): Record<string, ScoringRule[]> {
  const groups =
    rules?.reduce(
      (acc, rule) => {
        const category = rule.category || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(rule);
        return acc;
      },
      {} as Record<string, ScoringRule[]>
    ) || {};

  // Sort categories alphabetically, but keep a sensible order
  const categoryOrder = [
    'Survival',
    'Tribal Council',
    'Challenges',
    'Strategy',
    'Social',
    'Advantages',
    'Finale',
    'Other',
  ];
  const orderedGroups: Record<string, ScoringRule[]> = {};

  categoryOrder.forEach((cat) => {
    if (groups[cat]) orderedGroups[cat] = groups[cat];
  });

  // Add any remaining categories not in our order
  Object.keys(groups).forEach((cat) => {
    if (!orderedGroups[cat]) orderedGroups[cat] = groups[cat];
  });

  return orderedGroups;
}

/**
 * Most commonly used scoring rule codes
 */
export const MOST_COMMON_CODES = [
  'RAND_CONFESSIONAL', // Shown in Confessional
  'PRE_SURVIVE_TRIBAL', // Survive Tribal (Pre-Merge)
  'POST_SURVIVE_TRIBAL', // Survive Tribal (Post-Merge)
  'PRE_NO_TRIBAL', // Avoid Tribal Council (Pre-Merge)
  'POST_NO_TRIBAL', // Avoid Tribal Council (Post-Merge)
  'PRE_TEAM_IMMUNITY_WIN', // Team Wins Immunity (Pre-Merge)
  'POST_IND_IMMUNITY_WIN', // Win Individual Immunity
  'IDOL_FIND', // Find Hidden Immunity Idol
  'PRE_SNUFFED', // Torch Snuffed (Pre-Merge)
  'POST_SNUFFED', // Torch Snuffed (Post-Merge)
  'PRE_VOTE_RECEIVED_COUNT', // Vote Received Counts (Pre-Merge)
  'POST_VOTE_RECEIVED_COUNT', // Vote Received Counts (Post-Merge)
];

/**
 * Get most common rules from all rules
 */
export function getMostCommonRules(rules: ScoringRule[] | undefined): ScoringRule[] {
  if (!rules) return [];
  return MOST_COMMON_CODES.map((code) => rules.find((r) => r.code === code)).filter(
    (r): r is ScoringRule => r !== undefined
  );
}
