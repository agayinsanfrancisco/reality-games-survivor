import { Users, Shuffle, Target, Loader2 } from 'lucide-react';

interface OperationsData {
  usersOnline: number;
  activeDrafts: number;
  draftsInProgress: Array<{ id: string; name: string; draft_started_at: string }>;
  picks: { submitted: number; total: number };
  timestamp: string;
}

interface OperationsPanelProps {
  data?: OperationsData;
  isLoading: boolean;
}

export function OperationsPanel({ data, isLoading }: OperationsPanelProps) {
  if (isLoading) {
    return (
      <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
        <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">
          Active Operations
        </h3>
        <div className="flex items-center justify-center h-24">
          <Loader2 className="h-6 w-6 text-neutral-500 animate-spin" />
        </div>
      </div>
    );
  }

  const pickPercentage = data?.picks?.total
    ? Math.round((data.picks.submitted / data.picks.total) * 100)
    : 0;

  return (
    <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
      <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">
        Active Operations
      </h3>

      <div className="space-y-4">
        {/* Users Online */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-neutral-300">Users Online</span>
          </div>
          <span className="text-lg font-bold text-white">{data?.usersOnline || 0}</span>
        </div>

        {/* Active Drafts */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shuffle className="h-4 w-4 text-amber-400" />
            <span className="text-sm text-neutral-300">Active Drafts</span>
          </div>
          <span
            className={`text-lg font-bold ${
              (data?.activeDrafts || 0) > 0 ? 'text-amber-400' : 'text-white'
            }`}
          >
            {data?.activeDrafts || 0}
          </span>
        </div>

        {/* Picks Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-400" />
              <span className="text-sm text-neutral-300">Picks Submitted</span>
            </div>
            <span className="text-sm text-neutral-400">
              {data?.picks?.submitted || 0}/{data?.picks?.total || 0}
            </span>
          </div>
          <div className="w-full bg-neutral-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${pickPercentage}%` }}
            />
          </div>
          <div className="text-right mt-1">
            <span className="text-xs text-neutral-500">{pickPercentage}%</span>
          </div>
        </div>

        {/* Active Draft List */}
        {data?.draftsInProgress && data.draftsInProgress.length > 0 && (
          <div className="pt-2 border-t border-neutral-700">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">In Progress:</span>
            <div className="mt-2 space-y-1">
              {data.draftsInProgress.slice(0, 3).map((draft) => (
                <div key={draft.id} className="text-xs text-neutral-400 truncate">
                  • {draft.name}
                </div>
              ))}
              {data.draftsInProgress.length > 3 && (
                <div className="text-xs text-neutral-500">
                  +{data.draftsInProgress.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {data?.timestamp && (
        <div className="mt-4 pt-3 border-t border-neutral-700">
          <span className="text-xs text-neutral-500">
            Updated: {new Date(data.timestamp).toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
}
