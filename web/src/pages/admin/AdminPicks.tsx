import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { AdminNavBar } from '@/components/AdminNavBar';
import { supabase } from '@/lib/supabase';
import {
  Target,
  Clock,
  Users,
  Send,
  AlertTriangle,
  Check,
  ChevronDown,
  Loader2,
  RefreshCw,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://rgfl-api-production.up.railway.app';

interface CurrentPicksData {
  episode: {
    id: string;
    number: number;
    title: string;
    air_date: string;
    picks_lock_at: string;
    is_locked: boolean;
    time_until_lock: {
      hours: number;
      minutes: number;
    };
  } | null;
  stats: {
    submitted: number;
    total: number;
    percentage: number;
    missingCount: number;
  } | null;
  missingUsers: Array<{
    id: string;
    display_name: string;
    email: string;
    last_sign_in_at: string;
  }>;
  leagueStats: Array<{
    id: string;
    name: string;
    submitted: number;
    total: number;
    percentage: number;
  }>;
}

async function apiWithAuth(endpoint: string, options?: RequestInit) {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export function AdminPicks() {
  const queryClient = useQueryClient();
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showAllMissing, setShowAllMissing] = useState(false);

  // Fetch current picks data
  const {
    data: picksData,
    isLoading,
    refetch,
  } = useQuery<CurrentPicksData>({
    queryKey: ['admin', 'picks', 'current'],
    queryFn: () => apiWithAuth('/api/admin/picks/current'),
    refetchInterval: 30000, // Every 30 seconds
  });

  // Fetch picks history
  const { data: historyData } = useQuery({
    queryKey: ['admin', 'picks', 'history'],
    queryFn: () => apiWithAuth('/api/admin/picks/history'),
  });

  // Send reminders mutation
  const sendReminders = useMutation({
    mutationFn: (userIds: string[] | undefined = undefined) =>
      apiWithAuth('/api/admin/picks/send-reminders', {
        method: 'POST',
        body: JSON.stringify({
          episodeId: picksData?.episode?.id,
          userIds: userIds && userIds.length > 0 ? userIds : undefined,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'picks'] });
      setSelectedUsers(new Set());
    },
  });

  const toggleUserSelection = (userId: string) => {
    const newSet = new Set(selectedUsers);
    if (newSet.has(userId)) {
      newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    setSelectedUsers(newSet);
  };

  const selectAllMissing = () => {
    const allIds = new Set(picksData?.missingUsers.map((u) => u.id) || []);
    setSelectedUsers(allIds);
  };

  const clearSelection = () => {
    setSelectedUsers(new Set());
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      <Navigation />
      <AdminNavBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display text-white">Pick Monitoring</h1>
            <p className="text-neutral-400 text-sm mt-1">
              Track weekly pick submissions and send reminders
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 text-neutral-500 animate-spin" />
          </div>
        ) : !picksData?.episode ? (
          <div className="bg-neutral-800 rounded-xl p-12 text-center">
            <Target className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-white mb-2">No Active Episode</h2>
            <p className="text-neutral-400">There's no upcoming episode with a pick deadline.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Episode Info & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Episode Card */}
              <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-neutral-400">Current Episode</span>
                </div>
                <div className="text-xl font-bold text-white">
                  Episode {picksData.episode.number}
                </div>
                {picksData.episode.title && (
                  <div className="text-sm text-neutral-500 mt-1">{picksData.episode.title}</div>
                )}
              </div>

              {/* Time Until Lock */}
              <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <span className="text-sm text-neutral-400">Time Until Lock</span>
                </div>
                {picksData.episode.is_locked ? (
                  <div className="text-xl font-bold text-red-400">LOCKED</div>
                ) : (
                  <div className="text-xl font-bold text-white">
                    {picksData.episode.time_until_lock.hours}h{' '}
                    {picksData.episode.time_until_lock.minutes}m
                  </div>
                )}
              </div>

              {/* Submitted */}
              <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-neutral-400">Picks Submitted</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {picksData.stats?.submitted || 0}
                  <span className="text-sm font-normal text-neutral-500 ml-1">
                    / {picksData.stats?.total || 0}
                  </span>
                </div>
                <div className="w-full bg-neutral-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${picksData.stats?.percentage || 0}%` }}
                  />
                </div>
              </div>

              {/* Missing */}
              <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span className="text-sm text-neutral-400">Missing Picks</span>
                </div>
                <div className="text-xl font-bold text-red-400">
                  {picksData.stats?.missingCount || 0}
                </div>
                <button
                  onClick={() => sendReminders.mutate(undefined)}
                  disabled={sendReminders.isPending || !picksData.stats?.missingCount}
                  className="mt-2 text-xs text-red-400 hover:text-red-300 disabled:text-neutral-600"
                >
                  Send reminder to all →
                </button>
              </div>
            </div>

            {/* League Breakdown */}
            <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
              <h2 className="text-lg font-semibold text-white mb-4">By League</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-neutral-500 uppercase tracking-wider">
                      <th className="pb-3">League</th>
                      <th className="pb-3">Submitted</th>
                      <th className="pb-3">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-700">
                    {picksData.leagueStats.map((league) => (
                      <tr key={league.id}>
                        <td className="py-3 text-sm text-white">{league.name}</td>
                        <td className="py-3 text-sm text-neutral-400">
                          {league.submitted} / {league.total}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-neutral-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  league.percentage === 100
                                    ? 'bg-green-500'
                                    : league.percentage >= 50
                                      ? 'bg-amber-500'
                                      : 'bg-red-500'
                                }`}
                                style={{ width: `${league.percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-neutral-500 w-10">
                              {league.percentage}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Users Without Picks */}
            <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-neutral-400" />
                  Users Without Picks
                  <span className="text-sm font-normal text-neutral-500">
                    ({picksData.missingUsers.length})
                  </span>
                </h2>
                <div className="flex items-center gap-2">
                  {selectedUsers.size > 0 && (
                    <>
                      <span className="text-sm text-neutral-400">
                        {selectedUsers.size} selected
                      </span>
                      <button
                        onClick={clearSelection}
                        className="text-xs text-neutral-400 hover:text-white"
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => sendReminders.mutate(Array.from(selectedUsers))}
                        disabled={sendReminders.isPending}
                        className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg disabled:bg-neutral-600"
                      >
                        {sendReminders.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        Send Reminder
                      </button>
                    </>
                  )}
                  {selectedUsers.size === 0 && picksData.missingUsers.length > 0 && (
                    <button
                      onClick={selectAllMissing}
                      className="text-xs text-orange-400 hover:text-orange-300"
                    >
                      Select all
                    </button>
                  )}
                </div>
              </div>

              {picksData.missingUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Check className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-neutral-400">All users have submitted their picks!</p>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-neutral-700">
                    {(showAllMissing
                      ? picksData.missingUsers
                      : picksData.missingUsers.slice(0, 10)
                    ).map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 py-3 hover:bg-neutral-700/50 px-2 rounded cursor-pointer"
                        onClick={() => toggleUserSelection(user.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="rounded border-neutral-600 text-orange-500 focus:ring-orange-500 bg-neutral-700"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{user.display_name}</p>
                          <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                        </div>
                        {user.last_sign_in_at && (
                          <span className="text-xs text-neutral-500">
                            Last seen: {new Date(user.last_sign_in_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {picksData.missingUsers.length > 10 && (
                    <button
                      onClick={() => setShowAllMissing(!showAllMissing)}
                      className="w-full mt-4 py-2 text-sm text-neutral-400 hover:text-white flex items-center justify-center gap-1"
                    >
                      {showAllMissing ? 'Show less' : `Show all ${picksData.missingUsers.length}`}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${showAllMissing ? 'rotate-180' : ''}`}
                      />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Pick History */}
            {historyData?.episodes && historyData.episodes.length > 0 && (
              <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
                <h2 className="text-lg font-semibold text-white mb-4">Pick History</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-neutral-500 uppercase tracking-wider">
                        <th className="pb-3">Episode</th>
                        <th className="pb-3">Air Date</th>
                        <th className="pb-3">Total Picks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-700">
                      {historyData.episodes.map((ep: any) => (
                        <tr key={ep.id}>
                          <td className="py-3 text-sm text-white">Episode {ep.number}</td>
                          <td className="py-3 text-sm text-neutral-400">
                            {new Date(ep.air_date).toLocaleDateString()}
                          </td>
                          <td className="py-3 text-sm text-neutral-400">{ep.pick_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
