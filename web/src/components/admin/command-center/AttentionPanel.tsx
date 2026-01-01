import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { AlertTriangle, Bell, Mail, Target, Cog, Users, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://rgfl-api-production.up.railway.app';

interface AttentionItem {
  id: string;
  category: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  actionLabel: string;
  actionEndpoint: string;
  actionType: 'link' | 'mutation';
  count?: number;
  createdAt: string;
}

interface AttentionPanelProps {
  items: AttentionItem[];
  totalCount: number;
  isLoading: boolean;
}

const categoryIcons = {
  picks: Target,
  payments: Bell,
  email: Mail,
  scoring: Target,
  system: Cog,
  drafts: Users,
};

const severityColors = {
  critical: 'border-red-700 bg-red-900/30',
  warning: 'border-amber-700 bg-amber-900/30',
  info: 'border-blue-700 bg-blue-900/30',
};

const severityBadgeColors = {
  critical: 'bg-red-600 text-white',
  warning: 'bg-amber-600 text-white',
  info: 'bg-blue-600 text-white',
};

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

export function AttentionPanel({ items, totalCount, isLoading }: AttentionPanelProps) {
  const queryClient = useQueryClient();

  const executeMutation = useMutation({
    mutationFn: (endpoint: string) => apiWithAuth(endpoint, { method: 'POST', body: '{}' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['command-center'] });
    },
  });

  if (isLoading) {
    return (
      <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
        <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">
          Attention Required
        </h3>
        <div className="flex items-center justify-center h-24">
          <Loader2 className="h-6 w-6 text-neutral-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-800 rounded-xl p-5 border border-neutral-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
          Attention Required
        </h3>
        {totalCount > 0 && (
          <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">
            {totalCount}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-900/30 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-green-500" />
          </div>
          <p className="text-sm text-neutral-400">No items need attention</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 5).map((item) => {
            const Icon =
              categoryIcons[item.category as keyof typeof categoryIcons] || AlertTriangle;

            return (
              <div
                key={item.id}
                className={`p-3 rounded-lg border ${severityColors[item.severity]}`}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                      item.severity === 'critical'
                        ? 'text-red-400'
                        : item.severity === 'warning'
                          ? 'text-amber-400'
                          : 'text-blue-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">{item.title}</span>
                      {item.count && item.count > 1 && (
                        <span
                          className={`px-1.5 py-0.5 text-xs font-bold rounded ${severityBadgeColors[item.severity]}`}
                        >
                          {item.count}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5 truncate">{item.description}</p>

                    {item.actionType === 'link' ? (
                      <Link
                        to={item.actionEndpoint}
                        className={`inline-block mt-2 text-xs font-medium ${
                          item.severity === 'critical'
                            ? 'text-red-400 hover:text-red-300'
                            : item.severity === 'warning'
                              ? 'text-amber-400 hover:text-amber-300'
                              : 'text-blue-400 hover:text-blue-300'
                        }`}
                      >
                        {item.actionLabel} →
                      </Link>
                    ) : (
                      <button
                        onClick={() => executeMutation.mutate(item.actionEndpoint)}
                        disabled={executeMutation.isPending}
                        className={`mt-2 text-xs font-medium ${
                          item.severity === 'critical'
                            ? 'text-red-400 hover:text-red-300'
                            : item.severity === 'warning'
                              ? 'text-amber-400 hover:text-amber-300'
                              : 'text-blue-400 hover:text-blue-300'
                        }`}
                      >
                        {executeMutation.isPending ? 'Processing...' : item.actionLabel}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {items.length > 5 && (
            <div className="text-center pt-2">
              <span className="text-xs text-neutral-500">+{items.length - 5} more items</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
