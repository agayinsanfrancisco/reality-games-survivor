/**
 * Castaway Grid Component
 *
 * Grid display for active or eliminated castaways.
 */

import { CastawayCard } from './CastawayCard';
import type { CastawayGridProps } from './types';

export function CastawayGrid({
  castaways,
  isLoading = false,
  variant,
  onEdit,
  onEliminate,
  onReactivate,
  isReactivating = false,
}: CastawayGridProps) {
  const isEliminated = variant === 'eliminated';

  const headerBgClass = isEliminated ? 'bg-neutral-50' : 'bg-green-50';
  const headerTextClass = isEliminated ? 'text-neutral-600' : 'text-green-800';
  const title = isEliminated
    ? `Eliminated (${castaways.length})`
    : `Active Castaways (${castaways.length})`;

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-elevated overflow-hidden animate-slide-up">
        <div className={`p-6 border-b border-cream-100 ${headerBgClass}`}>
          <h2 className={`font-semibold ${headerTextClass}`}>{title}</h2>
        </div>
        <div className="p-12 text-center">
          <div className="w-8 h-8 mx-auto border-2 border-burgundy-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (castaways.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-elevated overflow-hidden animate-slide-up">
      <div className={`p-6 border-b border-cream-100 ${headerBgClass}`}>
        <h2 className={`font-semibold ${headerTextClass}`}>{title}</h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
        {castaways.map((castaway) => (
          <CastawayCard
            key={castaway.id}
            castaway={castaway}
            isEliminated={isEliminated}
            onEdit={() => onEdit(castaway)}
            onEliminate={onEliminate ? () => onEliminate(castaway.id) : undefined}
            onReactivate={onReactivate ? () => onReactivate(castaway.id) : undefined}
            isReactivating={isReactivating}
          />
        ))}
      </div>
    </div>
  );
}
