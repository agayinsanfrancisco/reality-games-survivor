import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Navigation } from '@/components/Navigation';
import { 
  ScoringRuleRow, 
  FinalizeModal, 
  FinalizeResultModal, 
  CastawayList,
  CastawayHeader 
} from '@/components/admin/scoring';
import { 
  Loader2, 
  Grid3X3, 
  ChevronDown, 
  ChevronRight, 
  Star, 
  CheckCircle, 
  AlertTriangle
} from 'lucide-react';
import { apiWithAuth } from '@/lib/api';
import type { Episode, Castaway, ScoringRule, EpisodeScore, UserProfile } from '@/types';

interface ScoringStatus {
  is_complete: boolean;
  total_castaways: number;
  scored_castaways: number;
  unscored_castaway_ids: string[];
  unscored_castaway_names: string[];
  is_finalized: boolean;
}

export function AdminScoring() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const episodeIdParam = searchParams.get('episode');

  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(episodeIdParam);
  const [selectedCastawayId, setSelectedCastawayId] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [_showSummary, _setShowSummary] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [skipNextScoreReset, setSkipNextScoreReset] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Most Common': true,
  });
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [finalizeResult, setFinalizeResult] = useState<{
    success: boolean;
    eliminated: string[];
  } | null>(null);
  const previousCastawayRef = useRef<string | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scoresRef = useRef<Record<string, number>>(scores);

  // Most commonly used scoring rule codes
  const MOST_COMMON_CODES = [
    'SURVIVED_EPISODE',
    'VOTE_CORRECT',
    'VOTE_RECEIVED',
    'WON_IMMUNITY_IND',
    'WON_IMMUNITY_TRIBE',
    'WON_REWARD',
    'FOUND_IDOL',
    'PLAYED_IDOL_SELF',
    'ELIMINATED',
    'CONFESSIONAL',
  ];

  // Keep scoresRef in sync with scores state
  useEffect(() => {
    scoresRef.current = scores;
  }, [scores]);

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, display_name, role')
        .eq('id', user!.id)
        .single();
      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!user?.id,
  });

  const { data: activeSeason } = useQuery({
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

  const { data: episodes } = useQuery({
    queryKey: ['episodes', activeSeason?.id],
    queryFn: async () => {
      if (!activeSeason?.id) return [];
      const { data, error } = await supabase
        .from('episodes')
        .select('*')
        .eq('season_id', activeSeason.id)
        .order('number', { ascending: true });
      if (error) throw error;
      return data as Episode[];
    },
    enabled: !!activeSeason?.id,
  });

  const { data: castaways } = useQuery({
    queryKey: ['castaways', activeSeason?.id],
    queryFn: async () => {
      if (!activeSeason?.id) return [];
      const { data, error } = await supabase
        .from('castaways')
        .select('*')
        .eq('season_id', activeSeason.id)
        .order('name');
      if (error) throw error;
      return data as Castaway[];
    },
    enabled: !!activeSeason?.id,
  });

  const { data: scoringRules } = useQuery({
    queryKey: ['scoringRules', activeSeason?.id],
    queryFn: async () => {
      if (!activeSeason?.id) return [];
      const { data, error } = await supabase
        .from('scoring_rules')
        .select('*')
        .eq('season_id', activeSeason.id)
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data as ScoringRule[];
    },
    enabled: !!activeSeason?.id,
  });

  const { data: existingScores } = useQuery({
    queryKey: ['episodeScores', selectedEpisodeId],
    queryFn: async () => {
      if (!selectedEpisodeId) return [];
      const { data, error } = await supabase
        .from('episode_scores')
        .select('*')
        .eq('episode_id', selectedEpisodeId);
      if (error) throw error;
      return data as EpisodeScore[];
    },
    enabled: !!selectedEpisodeId,
  });

  // Get scoring status (completeness)
  const { data: scoringStatus, refetch: refetchStatus } = useQuery({
    queryKey: ['scoringStatus', selectedEpisodeId],
    queryFn: async () => {
      if (!selectedEpisodeId) return null;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const result = await apiWithAuth<ScoringStatus>(
        `/episodes/${selectedEpisodeId}/scoring/status`,
        session.access_token
      );

      if (result.error) throw new Error(result.error);
      return result.data;
    },
    enabled: !!selectedEpisodeId,
    refetchInterval: 5000, // Refetch every 5 seconds to keep status current
  });

  // Get most common rules
  const mostCommonRules = useMemo(() => {
    if (!scoringRules) return [];
    return MOST_COMMON_CODES.map((code) => scoringRules.find((r) => r.code === code)).filter(
      (r): r is ScoringRule => r !== undefined
    );
  }, [scoringRules]);

  // Group rules by category (excluding most common from their original categories)
  const groupedRules = useMemo(() => {
    const groups =
      scoringRules?.reduce(
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
  }, [scoringRules]);

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Initialize scores from existing data when castaway changes
  useEffect(() => {
    // Don't reset scores while saving (could cause data loss)
    if (isSaving) return;

    // Skip the reset if we just saved (prevents race condition)
    if (skipNextScoreReset) {
      setSkipNextScoreReset(false);
      return;
    }

    if (existingScores && selectedCastawayId) {
      const castawayScores = existingScores.filter((s) => s.castaway_id === selectedCastawayId);
      const scoreMap: Record<string, number> = {};
      castawayScores.forEach((s) => {
        scoreMap[s.scoring_rule_id] = s.quantity;
      });
      setScores(scoreMap);
      setIsDirty(false);
    } else if (selectedCastawayId) {
      setScores({});
      setIsDirty(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCastawayId, existingScores]); // Load initial scores when data is available or castaway changes

  // Save scores for a specific castaway
  const saveScoresForCastaway = useCallback(
    async (castawayId: string, scoresToSave: Record<string, number>) => {
      if (!selectedEpisodeId || !castawayId || !user?.id) {
        return;
      }

      // Delete existing scores for this castaway/episode
      await supabase
        .from('episode_scores')
        .delete()
        .eq('episode_id', selectedEpisodeId)
        .eq('castaway_id', castawayId);

      // Insert new scores
      const scoresToInsert = Object.entries(scoresToSave)
        .filter(([_, quantity]) => quantity > 0)
        .map(([ruleId, quantity]) => {
          const rule = scoringRules?.find((r) => r.id === ruleId);
          return {
            episode_id: selectedEpisodeId,
            castaway_id: castawayId,
            scoring_rule_id: ruleId,
            quantity,
            points: (rule?.points || 0) * quantity,
            entered_by: user.id,
          };
        });

      if (scoresToInsert.length > 0) {
        const { error } = await supabase.from('episode_scores').insert(scoresToInsert);
        if (error) throw error;
      }

      setLastSavedAt(new Date());
      setIsDirty(false);
      // Skip the next score reset to prevent the query invalidation from resetting local state
      setSkipNextScoreReset(true);
      queryClient.invalidateQueries({ queryKey: ['episodeScores', selectedEpisodeId] });
      refetchStatus(); // Update completion status after saving
    },
    [selectedEpisodeId, user?.id, scoringRules, queryClient, refetchStatus]
  );

  const _saveScoresMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCastawayId) return;
      await saveScoresForCastaway(selectedCastawayId, scores);
    },
    onSuccess: () => {
      setLastSavedAt(new Date());
      setIsDirty(false);
    },
  });

  // Finalize scores mutation
  const finalizeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedEpisodeId) throw new Error('No episode selected');

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const result = await apiWithAuth<{
        finalized: boolean;
        eliminated: string[];
        standings_updated: boolean;
        error?: string;
        error_code?: string;
      }>(`/episodes/${selectedEpisodeId}/scoring/finalize`, session.access_token, {
        method: 'POST',
      });

      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data) => {
      setFinalizeResult({ success: true, eliminated: data?.eliminated || [] });
      setShowFinalizeModal(false);
      queryClient.invalidateQueries({ queryKey: ['episodes'] });
      queryClient.invalidateQueries({ queryKey: ['episodeScores'] });
      queryClient.invalidateQueries({ queryKey: ['castaways'] });
      queryClient.invalidateQueries({ queryKey: ['scoringStatus'] });
      refetchStatus();
    },
    onError: (error: Error) => {
      setFinalizeResult({ success: false, eliminated: [] });
      setShowFinalizeModal(false);
      console.error('Finalize error:', error);
    },
  });

  // Auto-save when switching castaways
  useEffect(() => {
    const previousCastaway = previousCastawayRef.current;

    // If we're switching from one castaway to another and have dirty scores
    if (previousCastaway && previousCastaway !== selectedCastawayId && isDirty) {
      // Save the previous castaway's scores
      const previousScores = { ...scores };
      setIsSaving(true);
      saveScoresForCastaway(previousCastaway, previousScores).finally(() => {
        setIsSaving(false);
      });
    }

    previousCastawayRef.current = selectedCastawayId;
  }, [selectedCastawayId, isDirty, scores, saveScoresForCastaway]);

  // Debounced auto-save (2 seconds after last change)
  useEffect(() => {
    // Don't start a new timeout if we're already saving
    if (!isDirty || !selectedCastawayId) return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Capture current castaway ID for the timeout
    const castawayToSave = selectedCastawayId;

    // Set new timeout for auto-save
    autoSaveTimeoutRef.current = setTimeout(async () => {
      // Use ref to get the latest scores at time of save
      const currentScores = { ...scoresRef.current };
      setIsSaving(true);
      try {
        await saveScoresForCastaway(castawayToSave, currentScores);
      } finally {
        setIsSaving(false);
      }
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
    // Include scores in deps so timeout resets on each change
  }, [scores, isDirty, selectedCastawayId, saveScoresForCastaway]);

  const updateScore = (ruleId: string, value: number) => {
    setScores((prev) => ({
      ...prev,
      [ruleId]: Math.max(0, value),
    }));
    setIsDirty(true);
  };

  const selectedEpisode = episodes?.find((e) => e.id === selectedEpisodeId);
  const selectedCastaway = castaways?.find((c) => c.id === selectedCastawayId);

  // Calculate live total as user edits
  const liveTotal = useMemo(() => {
    return Object.entries(scores).reduce((total, [ruleId, quantity]) => {
      const rule = scoringRules?.find((r) => r.id === ruleId);
      return total + (rule?.points || 0) * quantity;
    }, 0);
  }, [scores, scoringRules]);

  if (profile && profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream-100 to-cream-200">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl shadow-elevated p-12">
            <h1 className="text-2xl font-display text-neutral-800 mb-3">Access Denied</h1>
            <p className="text-neutral-500 mb-8">You don't have permission to access this page.</p>
            <Link to="/dashboard" className="btn btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-100 to-cream-200">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                to="/admin"
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>
              <h1 className="text-2xl font-display text-neutral-800">Score Episode</h1>
            </div>
            <p className="text-neutral-500">Enter scores for each castaway</p>
          </div>
          <div className="flex items-center gap-3">
            {scoringStatus && selectedEpisodeId && !selectedEpisode?.is_scored && (
              <div
                className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
                  scoringStatus.is_complete
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {scoringStatus.is_complete ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
                <span className="font-medium">
                  {scoringStatus.scored_castaways}/{scoringStatus.total_castaways} castaways scored
                </span>
              </div>
            )}
            <Link
              to={`/admin/scoring/grid${selectedEpisodeId ? `?episode=${selectedEpisodeId}` : ''}`}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Grid3X3 className="h-4 w-4" />
              Grid View
            </Link>
            {selectedEpisodeId && !selectedEpisode?.is_scored && (
              <button
                onClick={() => setShowFinalizeModal(true)}
                className="btn btn-primary flex items-center gap-2"
                disabled={finalizeMutation.isPending || !scoringStatus?.is_complete}
                title={
                  !scoringStatus?.is_complete
                    ? `Score all ${scoringStatus?.total_castaways || 0} castaways before finalizing`
                    : 'Finalize episode scoring'
                }
              >
                {finalizeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Finalize Scores
              </button>
            )}
            {selectedEpisode?.is_scored && (
              <span className="flex items-center gap-2 text-green-600 font-medium">
                <CheckCircle className="h-5 w-5" />
                Finalized
              </span>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Episode & Castaway Selection */}
          <div className="lg:col-span-1 space-y-6">
            {/* Episode Selector */}
            <div className="bg-white rounded-2xl shadow-elevated p-5">
              <h3 className="font-semibold text-neutral-800 mb-3">Select Episode</h3>
              <select
                value={selectedEpisodeId || ''}
                onChange={(e) => {
                  setSelectedEpisodeId(e.target.value || null);
                  setSelectedCastawayId(null);
                }}
                className="w-full p-3 border border-cream-200 rounded-xl focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"
              >
                <option value="">Choose episode...</option>
                {episodes?.map((ep) => (
                  <option key={ep.id} value={ep.id}>
                    Ep {ep.number}: {ep.title || 'TBD'} {ep.is_scored ? '✓' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Castaway List */}
            {selectedEpisodeId && (
              <div className="bg-white rounded-2xl shadow-elevated overflow-hidden flex flex-col h-[500px]">
                <div className="p-5 border-b border-cream-100 flex items-center justify-between">
                  <h3 className="font-semibold text-neutral-800">Castaways</h3>
                  {scoringStatus && (
                    <span className="text-[10px] bg-cream-100 text-neutral-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {scoringStatus.scored_castaways}/{scoringStatus.total_castaways}
                    </span>
                  )}
                </div>
                <CastawayList 
                  castaways={castaways || []}
                  selectedCastawayId={selectedCastawayId}
                  onSelect={(id) => setSelectedCastawayId(id)}
                  existingScores={existingScores || []}
                />
              </div>
            )}
          </div>

          {/* Scoring Form */}
          <div className="lg:col-span-3">
            {!selectedEpisodeId ? (
              <div className="bg-white rounded-2xl shadow-elevated p-12 text-center">
                <p className="text-neutral-500">Select an episode to begin scoring</p>
              </div>
            ) : !selectedCastawayId ? (
              <div className="bg-white rounded-2xl shadow-elevated p-12 text-center">
                <p className="text-neutral-500">Select a castaway to enter scores</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Castaway Header with Live Total */}
                <CastawayHeader 
                  castaway={selectedCastaway!}
                  totalPoints={liveTotal}
                  episodeNumber={selectedEpisode?.number || 0}
                  isSaving={isSaving}
                  isDirty={isDirty}
                  lastSavedAt={lastSavedAt}
                />

                {/* Most Common Rules (Always Expanded) */}
                {mostCommonRules.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-elevated overflow-hidden border-2 border-burgundy-200">
                    <button
                      onClick={() => toggleCategory('Most Common')}
                      className="w-full p-4 border-b border-cream-100 bg-gradient-to-r from-burgundy-50 to-cream-50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-burgundy-500 fill-burgundy-500" />
                        <h3 className="font-semibold text-burgundy-700">Most Common Rules</h3>
                        <span className="text-xs bg-burgundy-100 text-burgundy-600 px-2 py-0.5 rounded-full font-bold">
                          {mostCommonRules.length}
                        </span>
                      </div>
                      {expandedCategories['Most Common'] ? (
                        <ChevronDown className="h-5 w-5 text-burgundy-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-burgundy-400" />
                      )}
                    </button>
                    {expandedCategories['Most Common'] && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-cream-100">
                        {mostCommonRules.map((rule) => (
                          <ScoringRuleRow
                            key={rule.id}
                            rule={rule}
                            currentCount={scores[rule.id] || 0}
                            onChange={(value: number) => updateScore(rule.id, value)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Scoring Rules by Category (Accordion) */}
                {Object.entries(groupedRules).map(([category, rules]) => {
                  const isExpanded = expandedCategories[category] ?? false;
                  const categoryTotal = rules.reduce((sum, rule) => {
                    const qty = scores[rule.id] || 0;
                    return sum + rule.points * qty;
                  }, 0);
                  const hasScores = rules.some((rule) => (scores[rule.id] || 0) > 0);

                  return (
                    <div
                      key={category}
                      className="bg-white rounded-2xl shadow-elevated overflow-hidden"
                    >
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full p-4 border-b border-cream-100 bg-cream-50 flex items-center justify-between hover:bg-cream-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-neutral-400" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-neutral-400" />
                          )}
                          <h3 className="font-semibold text-neutral-800">{category}</h3>
                          <span className="text-xs bg-cream-200 text-neutral-500 px-2 py-0.5 rounded-full font-bold">
                            {rules.length}
                          </span>
                        </div>
                        {hasScores && (
                          <span
                            className={`font-bold text-sm ${categoryTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {categoryTotal >= 0 ? '+' : ''}
                            {categoryTotal}
                          </span>
                        )}
                      </button>
                      {isExpanded && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-cream-100">
                          {rules.map((rule) => (
                            <ScoringRuleRow
                              key={rule.id}
                              rule={rule}
                              currentCount={scores[rule.id] || 0}
                              onChange={(value: number) => updateScore(rule.id, value)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Finalize Confirmation Modal */}
        <FinalizeModal
          isOpen={showFinalizeModal}
          onClose={() => setShowFinalizeModal(false)}
          onConfirm={() => finalizeMutation.mutate()}
          isPending={finalizeMutation.isPending}
          scoringStatus={scoringStatus || {
            is_complete: false,
            total_castaways: 0,
            scored_castaways: 0,
            unscored_castaway_ids: [],
            unscored_castaway_names: [],
            is_finalized: false
          }}
        />

        {/* Success/Error Result Modal */}
        {finalizeResult && (
          <FinalizeResultModal
            isOpen={!!finalizeResult}
            onClose={() => setFinalizeResult(null)}
            result={{
              success: finalizeResult.success,
              eliminated: finalizeResult.eliminated.map(id => castaways?.find(c => c.id === id)?.name || id)
            }}
          />
        )}
      </main>
    </div>
  );
}
