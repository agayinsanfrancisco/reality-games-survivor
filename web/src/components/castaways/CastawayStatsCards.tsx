import { Users, Flame, Skull } from 'lucide-react';

interface CastawayStatsCardsProps {
  totalCount: number;
  activeCount: number;
  eliminatedCount: number;
}

export function CastawayStatsCards({
  totalCount,
  activeCount,
  eliminatedCount
}: CastawayStatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-2xl shadow-card p-4 border border-cream-200 text-center">
        <div className="w-10 h-10 bg-cream-100 rounded-full mx-auto mb-2 flex items-center justify-center">
          <Users className="h-5 w-5 text-burgundy-500" />
        </div>
        <p className="text-3xl font-bold text-neutral-800">{totalCount}</p>
        <p className="text-neutral-500 text-sm">Total Castaways</p>
      </div>
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-card p-4 border border-green-200 text-center">
        <div className="w-10 h-10 bg-green-100 rounded-full mx-auto mb-2 flex items-center justify-center">
          <Flame className="h-5 w-5 text-green-600" />
        </div>
        <p className="text-3xl font-bold text-green-600">{activeCount}</p>
        <p className="text-neutral-500 text-sm">Still in the Game</p>
      </div>
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl shadow-card p-4 border border-red-200 text-center">
        <div className="w-10 h-10 bg-red-100 rounded-full mx-auto mb-2 flex items-center justify-center">
          <Skull className="h-5 w-5 text-red-600" />
        </div>
        <p className="text-3xl font-bold text-red-600">{eliminatedCount}</p>
        <p className="text-neutral-500 text-sm">Voted Out</p>
      </div>
    </div>
  );
}
