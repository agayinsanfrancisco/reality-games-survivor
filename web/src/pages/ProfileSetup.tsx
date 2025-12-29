/**
 * Profile Setup Page
 *
 * First-time profile setup for new users after magic link signup.
 * Collects display name and redirects to dashboard.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { LoadingTorch } from '@/components/LoadingTorch';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user already has a display name
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('users')
        .select('display_name')
        .eq('id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });

  const updateProfile = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase
        .from('users')
        .update({ display_name: name })
        .eq('id', user!.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      navigate('/dashboard');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!displayName.trim()) {
      setError('Please enter a display name');
      return;
    }

    if (displayName.trim().length < 2) {
      setError('Display name must be at least 2 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile.mutateAsync(displayName.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      setIsSubmitting(false);
    }
  };

  // Show loading torch while checking profile
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-200">
        <LoadingTorch />
      </div>
    );
  }

  // If user already has a display name, redirect to dashboard
  if (profile?.display_name) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cream-100 to-cream-200 px-4 py-12">
      <div className="bg-white rounded-2xl shadow-float max-w-md w-full p-8 animate-slide-up">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="RGFL" className="h-16 w-auto" />
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-burgundy-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-burgundy-600" />
          </div>
          <h1 className="font-display text-3xl text-neutral-800 mb-2">Complete Your Profile</h1>
          <p className="text-neutral-500">Choose a display name to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-xl border border-cream-300 focus:border-burgundy-500 focus:ring-2 focus:ring-burgundy-500/20 outline-none transition-all"
              autoFocus
              disabled={isSubmitting}
            />
            <p className="text-xs text-neutral-500 mt-1">This is how other players will see you</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !displayName.trim()}
            className="w-full bg-burgundy-500 hover:bg-burgundy-600 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Setting up...
              </>
            ) : (
              'Continue to Dashboard'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
