import { Tv, Target, Users, AlertTriangle, Calendar, Loader2 } from 'lucide-react';

interface ActiveWindowProps {
  window?: {
    mode: 'normal' | 'episode' | 'scoring' | 'draft' | 'incident' | 'off-cycle';
    title: string;
    subtitle: string;
    data: Record<string, any>;
  };
  isLoading: boolean;
}

const modeIcons = {
  normal: Calendar,
  episode: Tv,
  scoring: Target,
  draft: Users,
  incident: AlertTriangle,
  'off-cycle': Calendar,
};

const modeColors = {
  normal: 'bg-blue-900/50 border-blue-700',
  episode: 'bg-purple-900/50 border-purple-700',
  scoring: 'bg-green-900/50 border-green-700',
  draft: 'bg-amber-900/50 border-amber-700',
  incident: 'bg-red-900/50 border-red-700',
  'off-cycle': 'bg-neutral-800 border-neutral-700',
};

const modeTitleColors = {
  normal: 'text-blue-300',
  episode: 'text-purple-300',
  scoring: 'text-green-300',
  draft: 'text-amber-300',
  incident: 'text-red-300',
  'off-cycle': 'text-neutral-400',
};

export function ActiveWindowPanel({ window, isLoading }: ActiveWindowProps) {
  if (isLoading) {
    return (
      <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
        <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">
          Active Window
        </h3>
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 text-neutral-500 animate-spin" />
        </div>
      </div>
    );
  }

  const mode = window?.mode || 'normal';
  const Icon = modeIcons[mode] || Calendar;

  return (
    <div className={`rounded-xl p-5 border ${modeColors[mode]}`}>
      <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">
        Active Window
      </h3>

      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-lg ${
            mode === 'incident'
              ? 'bg-red-800/50'
              : mode === 'episode'
                ? 'bg-purple-800/50'
                : mode === 'scoring'
                  ? 'bg-green-800/50'
                  : mode === 'draft'
                    ? 'bg-amber-800/50'
                    : 'bg-neutral-700/50'
          }`}
        >
          <Icon className={`h-6 w-6 ${modeTitleColors[mode]}`} />
        </div>

        <div className="flex-1">
          <h4 className={`text-lg font-semibold ${modeTitleColors[mode]}`}>
            {window?.title || 'Loading...'}
          </h4>
          <p className="text-sm text-neutral-400 mt-1">{window?.subtitle || ''}</p>

          {/* Mode-specific data */}
          {mode === 'episode' && window?.data && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {window.data.pickStats && (
                <>
                  <div className="text-neutral-500">Picks submitted:</div>
                  <div className="text-white font-medium">
                    {window.data.pickStats.submitted}/{window.data.pickStats.total}
                    <span className="text-neutral-500 ml-1">
                      ({window.data.pickStats.percentage}%)
                    </span>
                  </div>
                </>
              )}
              {window.data.picksLocked && (
                <div className="col-span-2 text-amber-400 font-medium">Picks are locked</div>
              )}
            </div>
          )}

          {mode === 'draft' && window?.data && (
            <div className="mt-3 text-sm">
              <span className="text-neutral-500">Active drafts: </span>
              <span className="text-amber-300 font-medium">{window.data.activeDrafts}</span>
            </div>
          )}

          {mode === 'scoring' && window?.data && (
            <div className="mt-3 text-sm">
              <span className="text-neutral-500">Pending events: </span>
              <span className="text-green-300 font-medium">{window.data.pendingEvents}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
