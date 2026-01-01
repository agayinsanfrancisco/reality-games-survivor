import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Pause, Play, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://rgfl-api-production.up.railway.app';

interface ActivityItem {
  type: string;
  message: string;
  user?: {
    id: string;
    display_name: string;
  };
  timestamp: string;
  icon: string;
  metadata?: Record<string, any>;
}

const typeColors: Record<string, string> = {
  user_signup: 'bg-blue-500/20 text-blue-400',
  league_created: 'bg-purple-500/20 text-purple-400',
  draft_completed: 'bg-green-500/20 text-green-400',
  pick_submitted: 'bg-amber-500/20 text-amber-400',
  payment_received: 'bg-emerald-500/20 text-emerald-400',
  admin_action: 'bg-red-500/20 text-red-400',
  quick_action: 'bg-orange-500/20 text-orange-400',
  incident_declared: 'bg-red-500/20 text-red-400',
  incident_resolved: 'bg-green-500/20 text-green-400',
};

function formatTimeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);

  if (diffSecs < 5) return 'just now';
  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isTestAccount(displayName: string | undefined): boolean {
  if (!displayName) return false;
  const lower = displayName.toLowerCase();
  return (
    lower.includes('test') ||
    lower.startsWith('user ') ||
    /^test\d+$/.test(lower) ||
    /^user\d+$/.test(lower)
  );
}

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [hideTestAccounts, setHideTestAccounts] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch initial activity
  const { data: initialActivity, isLoading } = useQuery<{ activity: ActivityItem[] }>({
    queryKey: ['command-center', 'activity'],
    queryFn: async () => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const res = await fetch(`${API_URL}/api/admin/dashboard/activity?limit=30`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch activity');
      return res.json();
    },
  });

  // Set initial activities
  useEffect(() => {
    if (initialActivity?.activity) {
      setActivities(initialActivity.activity);
    }
  }, [initialActivity]);

  // Connect to SSE for live updates
  useEffect(() => {
    if (isPaused) return;

    // Fallback: Poll every 10 seconds
    const pollInterval = setInterval(async () => {
      if (isPaused) return;
      try {
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;
        const res = await fetch(`${API_URL}/api/admin/dashboard/activity?limit=30`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setActivities(data.activity || []);
        }
      } catch (err) {
        console.error('Failed to poll activity:', err);
      }
    }, 10000);

    // Store ref in local variable for cleanup
    const currentEventSource = eventSourceRef.current;

    return () => {
      clearInterval(pollInterval);
      if (currentEventSource) {
        currentEventSource.close();
      }
    };
  }, [isPaused]);

  const filteredActivities = hideTestAccounts
    ? activities.filter((activity) => !isTestAccount(activity.user?.display_name))
    : activities;

  const testAccountCount = activities.length - filteredActivities.length;

  return (
    <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700 h-[400px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
            Live Activity Feed
          </h3>
          <div
            className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-green-400 animate-pulse'}`}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHideTestAccounts(!hideTestAccounts)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              hideTestAccounts
                ? 'bg-neutral-700 text-neutral-300'
                : 'bg-orange-900/50 text-orange-300'
            }`}
            title={hideTestAccounts ? 'Show test accounts' : 'Hide test accounts'}
          >
            {hideTestAccounts ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {hideTestAccounts ? `Hide ${testAccountCount}` : 'Show all'}
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`p-1.5 rounded transition-colors ${
              isPaused ? 'bg-green-900/50 text-green-400' : 'bg-neutral-700 text-neutral-300'
            }`}
            title={isPaused ? 'Resume feed' : 'Pause feed'}
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Feed Content */}
      <div
        ref={feedRef}
        className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 text-neutral-500 animate-spin" />
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-500">
            <p className="text-sm">No recent activity</p>
            {hideTestAccounts && testAccountCount > 0 && (
              <button
                onClick={() => setHideTestAccounts(false)}
                className="text-xs text-orange-400 hover:underline mt-2"
              >
                Show {testAccountCount} test account activities
              </button>
            )}
          </div>
        ) : (
          filteredActivities.map((activity, index) => (
            <div
              key={`${activity.timestamp}-${index}`}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-neutral-700/50 transition-colors"
            >
              {/* Icon */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  typeColors[activity.type] || 'bg-neutral-700 text-neutral-400'
                }`}
              >
                {activity.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-200 line-clamp-2">{activity.message}</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {formatTimeAgo(activity.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paused indicator */}
      {isPaused && (
        <div className="mt-2 pt-2 border-t border-neutral-700 text-center">
          <span className="text-xs text-amber-400">Feed paused</span>
        </div>
      )}
    </div>
  );
}
