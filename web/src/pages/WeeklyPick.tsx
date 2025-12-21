import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { AppNav } from '@/components/AppNav';

interface RosterCastaway {
  id: string;
  name: string;
  photo_url?: string;
  tribe_original?: string;
  status: string;
  totalPoints?: number;
  lastWeekPoints?: number;
}

// Mock roster data
const mockRoster: RosterCastaway[] = [
  { id: '1', name: 'Boston Rob', tribe_original: 'Tuku', status: 'active', totalPoints: 45, lastWeekPoints: 12 },
  { id: '2', name: 'Parvati', tribe_original: 'Gata', status: 'active', totalPoints: 38, lastWeekPoints: 8 },
];

export function WeeklyPick() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const { user } = useAuth();
  const [selectedCastaway, setSelectedCastaway] = useState<string | null>(null);
  const [pickSubmitted, setPickSubmitted] = useState(false);

  interface UserProfile {
    id: string;
    display_name: string;
  }

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user!.id)
        .single();
      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!user?.id,
  });

  const handleSubmitPick = () => {
    if (!selectedCastaway) return;
    setPickSubmitted(true);
  };

  // Calculate time until lock (Wed 3pm PST)
  const getTimeUntilLock = () => {
    const now = new Date();
    const nextWednesday = new Date();
    nextWednesday.setDate(now.getDate() + ((3 - now.getDay() + 7) % 7 || 7));
    nextWednesday.setHours(15, 0, 0, 0);

    const diff = nextWednesday.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return { days, hours };
  };

  const timeLeft = getTimeUntilLock();

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-100 to-cream-200">
      <AppNav
        userName={profile?.display_name}
        userInitial={profile?.display_name?.charAt(0).toUpperCase()}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                to="/dashboard"
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-display text-neutral-800">
                Weekly Pick
              </h1>
            </div>
            <p className="text-neutral-500">Episode 3 • Select your castaway</p>
          </div>
        </div>

        {pickSubmitted ? (
          /* Pick Confirmed State */
          <div className="bg-white rounded-2xl shadow-elevated p-12 text-center animate-slide-up">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-display text-neutral-800 mb-3">Pick Submitted!</h2>
            <p className="text-neutral-500 mb-2">
              You selected <span className="font-semibold text-burgundy-600">
                {mockRoster.find(c => c.id === selectedCastaway)?.name}
              </span> for Episode 3.
            </p>
            <p className="text-sm text-neutral-400 mb-8">
              Picks lock Wednesday at 3:00 PM PST
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setPickSubmitted(false)}
                className="btn bg-cream-100 text-neutral-700 hover:bg-cream-200"
              >
                Change Pick
              </button>
              <Link to="/dashboard" className="btn btn-primary shadow-card">
                Back to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Countdown Banner */}
            <div className="bg-gradient-to-r from-burgundy-500 to-burgundy-600 rounded-2xl p-6 text-white shadow-elevated animate-slide-up">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-burgundy-100 text-sm font-medium">Picks Lock In</p>
                  <div className="flex items-baseline gap-3 mt-2">
                    <div className="text-center">
                      <span className="text-4xl font-display">{timeLeft.days}</span>
                      <p className="text-xs text-burgundy-200 mt-1">days</p>
                    </div>
                    <span className="text-2xl text-burgundy-200">:</span>
                    <div className="text-center">
                      <span className="text-4xl font-display">{timeLeft.hours}</span>
                      <p className="text-xs text-burgundy-200 mt-1">hours</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-burgundy-100">Episode airs</p>
                  <p className="font-semibold text-lg">Wednesday 8 PM</p>
                </div>
              </div>
            </div>

            {/* Pick Selection */}
            <div className="bg-white rounded-2xl shadow-elevated overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="p-6 border-b border-cream-100">
                <h2 className="font-semibold text-neutral-800">Select Your Castaway</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Choose which player from your roster to play this week
                </p>
              </div>

              <div className="p-6 space-y-4">
                {mockRoster.map((castaway) => (
                  <button
                    key={castaway.id}
                    onClick={() => setSelectedCastaway(castaway.id)}
                    className={`w-full p-5 rounded-xl border-2 transition-all text-left flex items-center gap-5 ${
                      selectedCastaway === castaway.id
                        ? 'border-burgundy-500 bg-burgundy-50 shadow-card'
                        : 'border-cream-200 bg-cream-50 hover:border-cream-300 hover:shadow-sm'
                    }`}
                  >
                    {/* Photo placeholder */}
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                      selectedCastaway === castaway.id ? 'bg-burgundy-100' : 'bg-cream-200'
                    }`}>
                      <svg className={`w-8 h-8 ${
                        selectedCastaway === castaway.id ? 'text-burgundy-400' : 'text-neutral-300'
                      }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className={`font-semibold text-lg ${
                          selectedCastaway === castaway.id ? 'text-burgundy-700' : 'text-neutral-800'
                        }`}>
                          {castaway.name}
                        </h3>
                        <span className={`badge text-xs ${
                          castaway.status === 'active' ? 'badge-success' : 'bg-neutral-100 text-neutral-500'
                        }`}>
                          {castaway.tribe_original}
                        </span>
                      </div>
                      <div className="flex gap-6 mt-2 text-sm">
                        <div>
                          <span className="text-neutral-400">Total</span>
                          <span className="ml-2 font-semibold text-neutral-700">{castaway.totalPoints} pts</span>
                        </div>
                        <div>
                          <span className="text-neutral-400">Last Week</span>
                          <span className="ml-2 font-semibold text-green-600">+{castaway.lastWeekPoints}</span>
                        </div>
                      </div>
                    </div>

                    {/* Selection indicator */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedCastaway === castaway.id
                        ? 'border-burgundy-500 bg-burgundy-500'
                        : 'border-cream-300'
                    }`}>
                      {selectedCastaway === castaway.id && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Submit */}
              <div className="p-6 border-t border-cream-100 bg-cream-50/50">
                <button
                  onClick={handleSubmitPick}
                  disabled={!selectedCastaway}
                  className={`w-full btn ${
                    selectedCastaway
                      ? 'btn-primary shadow-card'
                      : 'bg-cream-200 text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  {selectedCastaway ? 'Confirm Pick' : 'Select a Castaway'}
                </button>
              </div>
            </div>

            {/* Previous Picks */}
            <div className="bg-white rounded-2xl shadow-elevated p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h3 className="font-semibold text-neutral-800 mb-4">Previous Picks</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-cream-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-neutral-500">Ep 2</span>
                    <span className="font-medium text-neutral-800">Boston Rob</span>
                  </div>
                  <span className="badge badge-success">+12 pts</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-cream-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-neutral-500">Ep 1</span>
                    <span className="font-medium text-neutral-800">Parvati</span>
                  </div>
                  <span className="badge badge-success">+8 pts</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
