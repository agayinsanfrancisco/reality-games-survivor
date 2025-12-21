import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Users, Trophy, Skull, Search, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useState } from 'react';

export default function SeasonCastaways() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'eliminated'>('all');

  // Fetch season details
  const { data: season, isLoading: seasonLoading } = useQuery({
    queryKey: ['season', seasonId],
    queryFn: async () => {
      if (!seasonId) throw new Error('No season ID');
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .eq('id', seasonId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!seasonId,
  });

  // Fetch castaways for this season
  const { data: castaways, isLoading: castawaysLoading } = useQuery({
    queryKey: ['season-castaways', seasonId],
    queryFn: async () => {
      if (!seasonId) throw new Error('No season ID');
      const { data, error } = await supabase
        .from('castaways')
        .select('*, episodes:eliminated_episode_id(number)')
        .eq('season_id', seasonId)
        .order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!seasonId,
  });

  const filteredCastaways = castaways?.filter((c: any) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.tribe_original?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' ||
      (filter === 'active' && c.status === 'active') ||
      (filter === 'eliminated' && c.status === 'eliminated');
    return matchesSearch && matchesFilter;
  });

  const activeCount = castaways?.filter((c: any) => c.status === 'active').length || 0;
  const eliminatedCount = castaways?.filter((c: any) => c.status === 'eliminated').length || 0;

  if (seasonLoading || castawaysLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream-100 to-cream-200 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-burgundy-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-100 to-cream-200 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/dashboard"
          className="p-2 bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all border border-cream-200"
        >
          <ArrowLeft className="h-5 w-5 text-neutral-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-800 flex items-center gap-2">
            <Users className="h-6 w-6 text-burgundy-500" />
            Castaways
          </h1>
          <p className="text-neutral-500">Season {season?.number}: {season?.name}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl shadow-card p-3 border border-cream-200 text-center">
          <p className="text-2xl font-bold text-neutral-800">{castaways?.length || 0}</p>
          <p className="text-neutral-500 text-xs">Total</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          <p className="text-neutral-500 text-xs">Active</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{eliminatedCount}</p>
          <p className="text-neutral-500 text-xs">Eliminated</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search castaways..."
            className="input pl-10"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="input px-3 py-2 w-32"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="eliminated">Eliminated</option>
        </select>
      </div>

      {/* Castaways Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredCastaways?.map((castaway: any) => (
          <div
            key={castaway.id}
            className={`bg-white rounded-2xl shadow-card p-4 border ${
              castaway.status === 'eliminated'
                ? 'border-red-200 opacity-75'
                : castaway.status === 'winner'
                ? 'border-amber-400'
                : 'border-cream-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {castaway.photo_url ? (
                <img
                  src={castaway.photo_url}
                  alt={castaway.name}
                  className={`w-14 h-14 rounded-full object-cover ${
                    castaway.status === 'eliminated' ? 'grayscale' : ''
                  }`}
                />
              ) : (
                <div className="w-14 h-14 bg-cream-100 rounded-full flex items-center justify-center border border-cream-200">
                  <Users className="h-6 w-6 text-neutral-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  {castaway.status === 'winner' && (
                    <Trophy className="h-4 w-4 text-amber-500" />
                  )}
                  {castaway.status === 'eliminated' && (
                    <Skull className="h-4 w-4 text-red-500" />
                  )}
                  <h3 className="text-neutral-800 font-medium truncate">{castaway.name}</h3>
                </div>
                <p className="text-neutral-500 text-sm">{castaway.tribe_original}</p>
                {castaway.age && castaway.hometown && (
                  <p className="text-neutral-400 text-xs truncate">
                    {castaway.age}, {castaway.hometown}
                  </p>
                )}
              </div>
            </div>

            {castaway.status === 'eliminated' && castaway.episodes && (
              <div className="mt-2 pt-2 border-t border-cream-200">
                <p className="text-red-600 text-xs">
                  Eliminated: Episode {castaway.episodes.number}
                  {castaway.placement && ` • ${castaway.placement}${getOrdinal(castaway.placement)} place`}
                </p>
              </div>
            )}

            {castaway.status === 'winner' && (
              <div className="mt-2 pt-2 border-t border-amber-200">
                <p className="text-amber-600 text-xs font-medium">
                  Sole Survivor
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredCastaways?.length === 0 && (
        <div className="bg-white rounded-2xl shadow-card p-8 border border-cream-200 text-center">
          <Users className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-500">No castaways found.</p>
        </div>
      )}
    </div>
  );
}

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
