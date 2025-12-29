/**
 * Castaway List Component for Scoring
 */
import { getAvatarUrl } from '@/lib/avatar';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface Castaway {
  id: string;
  name: string;
  photo_url: string | null;
  status: string;
}

interface CastawayListProps {
  castaways: Castaway[];
  selectedCastawayId: string | null;
  onSelect: (id: string) => void;
  existingScores: any[];
}

export function CastawayList({ 
  castaways, 
  selectedCastawayId, 
  onSelect, 
  existingScores 
}: CastawayListProps) {
  // Check if a castaway has any scores recorded
  const hasScores = (castawayId: string) => {
    return existingScores?.some(s => s.castaway_id === castawayId);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
      {castaways.map((castaway) => {
        const isSelected = selectedCastawayId === castaway.id;
        const scored = hasScores(castaway.id);
        
        return (
          <button
            key={castaway.id}
            onClick={() => onSelect(castaway.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${
              isSelected
                ? 'bg-burgundy-600 border-burgundy-600 text-white shadow-lg shadow-burgundy-500/20'
                : 'bg-white border-cream-200 text-neutral-700 hover:border-burgundy-200 hover:bg-burgundy-50/30'
            }`}
          >
            <img
              src={getAvatarUrl(castaway.name, castaway.photo_url)}
              alt={castaway.name}
              className={`w-10 h-10 rounded-lg object-cover border-2 ${
                isSelected ? 'border-white/30' : 'border-cream-100 group-hover:border-burgundy-100'
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm truncate ${isSelected ? 'text-white' : 'text-neutral-800'}`}>
                {castaway.name}
              </p>
              <p className={`text-[10px] uppercase font-bold tracking-tighter ${
                isSelected ? 'text-burgundy-100' : 'text-neutral-400'
              }`}>
                {castaway.status}
              </p>
            </div>
            {scored ? (
              <CheckCircle className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-green-500'}`} />
            ) : (
              <AlertTriangle className={`h-4 w-4 ${isSelected ? 'text-burgundy-300' : 'text-amber-400 opacity-0 group-hover:opacity-100'}`} />
            )}
          </button>
        );
      })}
    </div>
  );
}
