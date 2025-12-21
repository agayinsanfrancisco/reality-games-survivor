import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { AppNav } from '@/components/AppNav';
import { CastawayCard } from '@/components/CastawayCard';

interface Castaway {
  id: string;
  name: string;
  photo_url?: string;
  hometown?: string;
  age?: number;
  tribe_original?: string;
  status: string;
}

interface DraftPick {
  id: string;
  user_id: string;
  castaway_id: string;
  draft_round: number;
  draft_pick: number;
  users: { display_name: string };
  castaways: { name: string; photo_url?: string };
}

interface League {
  id: string;
  name: string;
  code: string;
  draft_status: string;
  draft_order: string[] | null;
  season_id: string;
}

// Mock data for demo
const mockCastaways: Castaway[] = [
  { id: '1', name: 'Boston Rob', hometown: 'Boston, MA', tribe_original: 'Tuku', status: 'active' },
  { id: '2', name: 'Parvati', hometown: 'Los Angeles, CA', tribe_original: 'Gata', status: 'active' },
  { id: '3', name: 'Sandra', hometown: 'Stamford, CT', tribe_original: 'Lavo', status: 'active' },
  { id: '4', name: 'Tony', hometown: 'Jersey City, NJ', tribe_original: 'Tuku', status: 'active' },
  { id: '5', name: 'Kim', hometown: 'San Antonio, TX', tribe_original: 'Gata', status: 'active' },
  { id: '6', name: 'Jeremy', hometown: 'Foxboro, MA', tribe_original: 'Lavo', status: 'active' },
  { id: '7', name: 'Michele', hometown: 'Freehold, NJ', tribe_original: 'Tuku', status: 'active' },
  { id: '8', name: 'Tyson', hometown: 'Lindon, UT', tribe_original: 'Gata', status: 'active' },
];

const mockDraftOrder = [
  { position: 1, name: 'You', isCurrentUser: true, picks: [] as string[] },
  { position: 2, name: 'Sarah', isCurrentUser: false, picks: [] as string[] },
  { position: 3, name: 'Mike', isCurrentUser: false, picks: [] as string[] },
  { position: 4, name: 'Emily', isCurrentUser: false, picks: [] as string[] },
];

export function Draft() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const { user } = useAuth();
  const [selectedCastaway, setSelectedCastaway] = useState<string | null>(null);
  const [draftedIds, setDraftedIds] = useState<string[]>([]);
  const [myPicks, setMyPicks] = useState<string[]>([]);
  const [currentPick, setCurrentPick] = useState(1);
  const [currentRound, setCurrentRound] = useState(1);

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

  const { data: league } = useQuery({
    queryKey: ['league', leagueId],
    queryFn: async () => {
      if (!leagueId) throw new Error('No league ID');
      const { data, error } = await supabase
        .from('leagues')
        .select('*')
        .eq('id', leagueId)
        .single();
      if (error) throw error;
      return data as League;
    },
    enabled: !!leagueId,
  });

  const handleDraftPick = () => {
    if (!selectedCastaway) return;

    // Add to drafted list
    setDraftedIds([...draftedIds, selectedCastaway]);
    setMyPicks([...myPicks, selectedCastaway]);
    setSelectedCastaway(null);

    // Advance pick
    if (currentPick < 4) {
      setCurrentPick(currentPick + 1);
    } else if (currentRound === 1) {
      setCurrentRound(2);
      setCurrentPick(4); // Snake draft - reverse order
    }
  };

  const availableCastaways = mockCastaways.filter(c => !draftedIds.includes(c.id));
  const isMyTurn = currentPick === 1; // Demo: always user's turn at position 1
  const draftComplete = myPicks.length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-100 to-cream-200">
      <AppNav
        userName={profile?.display_name}
        userInitial={profile?.display_name?.charAt(0).toUpperCase()}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                Draft Room
              </h1>
            </div>
            <p className="text-neutral-500">
              {league?.name || 'Loading...'} • Round {currentRound} of 2
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-neutral-500">Draft Deadline</p>
              <p className="font-semibold text-burgundy-500">Mar 2, 8:00 PM PST</p>
            </div>
          </div>
        </div>

        {draftComplete ? (
          /* Draft Complete State */
          <div className="bg-white rounded-2xl shadow-elevated p-12 text-center animate-slide-up">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-display text-neutral-800 mb-3">Draft Complete!</h2>
            <p className="text-neutral-500 mb-8 max-w-md mx-auto">
              You've successfully drafted your team. Make your weekly picks when episodes air.
            </p>

            <div className="flex justify-center gap-4 mb-8">
              {myPicks.map((pickId) => {
                const castaway = mockCastaways.find(c => c.id === pickId);
                return castaway ? (
                  <div key={pickId} className="bg-cream-50 rounded-xl p-4 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-cream-200 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-neutral-800">{castaway.name}</p>
                    <p className="text-xs text-neutral-500">{castaway.tribe_original}</p>
                  </div>
                ) : null;
              })}
            </div>

            <Link to="/dashboard" className="btn btn-primary shadow-card">
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Draft Order Sidebar */}
            <div className="lg:col-span-1 animate-slide-up">
              <div className="bg-white rounded-2xl shadow-elevated overflow-hidden sticky top-24">
                <div className="p-5 border-b border-cream-100">
                  <h2 className="font-semibold text-neutral-800">Draft Order</h2>
                  <p className="text-sm text-neutral-500 mt-1">Snake format</p>
                </div>

                <div className="p-4 space-y-2">
                  {mockDraftOrder.map((player, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl flex items-center justify-between transition-all ${
                        currentPick === player.position
                          ? 'bg-burgundy-50 border-2 border-burgundy-200'
                          : 'bg-cream-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                          currentPick === player.position
                            ? 'bg-burgundy-500 text-white'
                            : 'bg-cream-200 text-neutral-600'
                        }`}>
                          {player.position}
                        </span>
                        <div>
                          <p className={`font-medium text-sm ${
                            player.isCurrentUser ? 'text-burgundy-600' : 'text-neutral-800'
                          }`}>
                            {player.name}
                          </p>
                          {player.picks.length > 0 && (
                            <p className="text-xs text-neutral-400">
                              Picked: {player.picks.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      {currentPick === player.position && (
                        <span className="badge badge-burgundy text-xs animate-pulse">
                          Picking
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Your Team */}
                <div className="p-4 border-t border-cream-100 bg-cream-50/50">
                  <h3 className="font-semibold text-neutral-800 mb-3">Your Team</h3>
                  {myPicks.length === 0 ? (
                    <p className="text-sm text-neutral-400">No picks yet</p>
                  ) : (
                    <div className="space-y-2">
                      {myPicks.map((pickId) => {
                        const castaway = mockCastaways.find(c => c.id === pickId);
                        return castaway ? (
                          <div key={pickId} className="flex items-center gap-2 text-sm">
                            <div className="w-6 h-6 bg-burgundy-100 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-burgundy-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="font-medium text-neutral-800">{castaway.name}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                  <p className="text-xs text-neutral-400 mt-3">
                    {2 - myPicks.length} pick{2 - myPicks.length !== 1 ? 's' : ''} remaining
                  </p>
                </div>
              </div>
            </div>

            {/* Main Draft Area */}
            <div className="lg:col-span-3 space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {/* Current Pick Banner */}
              {isMyTurn && (
                <div className="bg-gradient-to-r from-burgundy-500 to-burgundy-600 rounded-2xl p-6 text-white shadow-elevated">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-burgundy-100 text-sm font-medium">Round {currentRound}, Pick {currentPick}</p>
                      <h2 className="text-2xl font-display mt-1">It's Your Turn!</h2>
                      <p className="text-burgundy-100 mt-2">Select a castaway below to add to your team.</p>
                    </div>
                    {selectedCastaway && (
                      <button
                        onClick={handleDraftPick}
                        className="btn bg-white text-burgundy-600 hover:bg-cream-50 shadow-lg"
                      >
                        Confirm Pick
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Filter Tabs */}
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-burgundy-500 text-white rounded-xl text-sm font-medium shadow-sm">
                  All
                </button>
                <button className="px-4 py-2 bg-white text-neutral-600 rounded-xl text-sm font-medium shadow-card hover:shadow-card-hover transition-shadow">
                  Tuku
                </button>
                <button className="px-4 py-2 bg-white text-neutral-600 rounded-xl text-sm font-medium shadow-card hover:shadow-card-hover transition-shadow">
                  Gata
                </button>
                <button className="px-4 py-2 bg-white text-neutral-600 rounded-xl text-sm font-medium shadow-card hover:shadow-card-hover transition-shadow">
                  Lavo
                </button>
              </div>

              {/* Castaway Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {availableCastaways.map((castaway) => (
                  <CastawayCard
                    key={castaway.id}
                    id={castaway.id}
                    name={castaway.name}
                    photoUrl={castaway.photo_url}
                    hometown={castaway.hometown}
                    tribe={castaway.tribe_original}
                    selected={selectedCastaway === castaway.id}
                    disabled={!isMyTurn}
                    showButton={isMyTurn}
                    buttonText="Select"
                    onSelect={(id) => setSelectedCastaway(id === selectedCastaway ? null : id)}
                  />
                ))}
              </div>

              {availableCastaways.length === 0 && (
                <div className="bg-white rounded-2xl shadow-elevated p-12 text-center">
                  <p className="text-neutral-500">All castaways have been drafted!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
