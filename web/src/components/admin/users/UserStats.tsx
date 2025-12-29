interface UserStatsProps {
  stats: {
    total: number;
    players: number;
    commissioners: number;
    admins: number;
    verified: number;
  };
}

export function UserStats({ stats }: UserStatsProps) {
  return (
    <div className="grid grid-cols-5 gap-2 mb-6">
      <div className="bg-white rounded-2xl shadow-card p-3 border border-cream-200 text-center">
        <p className="text-xl font-bold text-neutral-800">{stats.total}</p>
        <p className="text-neutral-500 text-xs">Total</p>
      </div>
      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-3 text-center">
        <p className="text-xl font-bold text-neutral-600">{stats.players}</p>
        <p className="text-neutral-500 text-xs">Players</p>
      </div>
      <div className="bg-burgundy-50 border border-burgundy-200 rounded-2xl p-3 text-center">
        <p className="text-xl font-bold text-burgundy-600">{stats.commissioners}</p>
        <p className="text-neutral-500 text-xs">League Creators</p>
      </div>
      <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-center">
        <p className="text-xl font-bold text-red-600">{stats.admins}</p>
        <p className="text-neutral-500 text-xs">Admins</p>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-2xl p-3 text-center">
        <p className="text-xl font-bold text-green-600">{stats.verified}</p>
        <p className="text-neutral-500 text-xs">Verified</p>
      </div>
    </div>
  );
}
