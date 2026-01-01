import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface ActivityItem {
  type:
    | 'user_signup'
    | 'league_created'
    | 'draft_completed'
    | 'pick_submitted'
    | 'payment_received'
    | 'admin_action';
  message: string;
  user?: {
    id: string;
    display_name: string;
  };
  timestamp: string;
  icon: string;
  metadata?: Record<string, unknown>;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const typeColors: Record<string, string> = {
  user_signup: 'bg-blue-100 text-blue-600',
  league_created: 'bg-purple-100 text-purple-600',
  draft_completed: 'bg-green-100 text-green-600',
  pick_submitted: 'bg-yellow-100 text-yellow-600',
  payment_received: 'bg-green-100 text-green-600',
  admin_action: 'bg-burgundy-100 text-burgundy-600',
};

function formatTimeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 1000 / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
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

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const [hideTestAccounts, setHideTestAccounts] = useState(true);

  const filteredActivities = hideTestAccounts
    ? activities.filter((activity) => !isTestAccount(activity.user?.display_name))
    : activities;

  const testAccountCount = activities.length - filteredActivities.length;

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-8 text-center">
        <p className="text-neutral-400">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-display text-neutral-800">Recent Activity</h2>
        <button
          onClick={() => setHideTestAccounts(!hideTestAccounts)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            hideTestAccounts
              ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
          }`}
          title={hideTestAccounts ? 'Show test accounts' : 'Hide test accounts'}
        >
          {hideTestAccounts ? (
            <>
              <EyeOff className="h-3.5 w-3.5" />
              <span>
                Hiding {testAccountCount} test{testAccountCount !== 1 ? 's' : ''}
              </span>
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" />
              <span>Showing all</span>
            </>
          )}
        </button>
      </div>

      {filteredActivities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-neutral-400 text-sm">
            No activity from real users yet.
            <button
              onClick={() => setHideTestAccounts(false)}
              className="ml-1 text-orange-500 hover:underline"
            >
              Show test accounts
            </button>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((activity, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-cream-50 transition-colors"
            >
              {/* Icon */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${typeColors[activity.type] || 'bg-neutral-100 text-neutral-600'}`}
              >
                {activity.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-700">{activity.message}</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {formatTimeAgo(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
