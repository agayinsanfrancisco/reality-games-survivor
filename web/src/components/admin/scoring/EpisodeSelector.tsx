/**
 * Episode Selector Component
 *
 * Dropdown for selecting an episode to score.
 */

import type { Episode } from '@/types';

interface EpisodeSelectorProps {
  episodes: Episode[];
  selectedEpisodeId: string | null;
  onSelect: (id: string | null) => void;
}

export function EpisodeSelector({ episodes, selectedEpisodeId, onSelect }: EpisodeSelectorProps) {
  // Filter out episode 1 - no scoring in week 1 (premiere)
  const scorableEpisodes = episodes.filter((ep) => ep.number > 1);

  return (
    <div className="bg-white rounded-2xl shadow-elevated p-5">
      <h3 className="font-semibold text-neutral-800 mb-3">Select Episode</h3>
      <select
        value={selectedEpisodeId || ''}
        onChange={(e) => onSelect(e.target.value || null)}
        className="w-full p-3 border border-cream-200 rounded-xl focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"
        aria-label="Select episode to score"
      >
        <option value="">Choose episode...</option>
        {scorableEpisodes.map((ep) => (
          <option key={ep.id} value={ep.id}>
            Ep {ep.number}: {ep.title || 'TBD'} {ep.is_scored ? '✓' : ''}
          </option>
        ))}
      </select>
      {episodes.some((ep) => ep.number === 1) && (
        <p className="text-xs text-neutral-500 mt-2">
          Note: Episode 1 (premiere) is not available for scoring.
        </p>
      )}
    </div>
  );
}
