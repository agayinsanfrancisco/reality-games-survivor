import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  role: string;
}

interface Season {
  id: string;
  number: number;
  name: string;
  is_active: boolean;
}

interface League {
  id: string;
  name: string;
  code: string;
  status: string;
  is_global: boolean;
}

export function Dashboard() {
  const { user, signOut } = useAuth();

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

  const { data: activeSeason } = useQuery({
    queryKey: ['active-season'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .eq('is_active', true)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as Season | null;
    },
  });

  const { data: myLeagues } = useQuery({
    queryKey: ['my-leagues', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('league_members')
        .select(`
          league:leagues (
            id,
            name,
            code,
            status,
            is_global
          )
        `)
        .eq('user_id', user!.id);
      if (error) throw error;
      type LeagueResult = { league: League | null };
      const results = data as unknown as LeagueResult[];
      return results.map((r) => r.league).filter((l): l is League => l !== null);
    },
    enabled: !!user?.id,
  });

  return (
    <div className="min-h-screen bg-cream-200">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-cream-300 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="RGFL" className="h-10 w-auto" />
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/dashboard" className="nav-link-active">Dashboard</Link>
              <Link to="/how-to-play" className="nav-link">How to Play</Link>
              <Link to="/rules" className="nav-link">Scoring Rules</Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-burgundy-500 flex items-center justify-center text-white font-medium text-sm">
                {profile?.display_name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <button
                onClick={() => signOut()}
                className="text-neutral-500 hover:text-neutral-700 text-sm"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl text-neutral-800">
            Welcome back, {profile?.display_name ?? 'Survivor'}
          </h1>
          {activeSeason ? (
            <p className="text-neutral-500 mt-1">
              Season {activeSeason.number}: {activeSeason.name}
            </p>
          ) : (
            <p className="text-neutral-500 mt-1">No active season — check back soon!</p>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          <div className="card-elevated">
            <p className="text-neutral-500 text-sm font-medium uppercase tracking-wide">My Leagues</p>
            <p className="text-4xl font-display text-burgundy-500 mt-2">{myLeagues?.length ?? 0}</p>
          </div>
          <div className="card-elevated">
            <p className="text-neutral-500 text-sm font-medium uppercase tracking-wide">Total Points</p>
            <p className="text-4xl font-display text-burgundy-500 mt-2">—</p>
          </div>
          <div className="card-elevated">
            <p className="text-neutral-500 text-sm font-medium uppercase tracking-wide">Best Rank</p>
            <p className="text-4xl font-display text-burgundy-500 mt-2">—</p>
          </div>
        </div>

        {/* My Leagues Section */}
        <div className="card-elevated">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl text-neutral-800">My Leagues</h2>
            <button className="btn btn-primary">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Join League
            </button>
          </div>

          {myLeagues && myLeagues.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-cream-300">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="px-6 py-3 text-left text-sm font-semibold">League</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Code</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  {myLeagues.map((league) => (
                    <tr key={league.id} className="bg-white hover:bg-cream-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-neutral-800">{league.name}</span>
                          {league.is_global && (
                            <span className="px-2 py-0.5 bg-burgundy-500/10 text-burgundy-500 text-xs rounded-full font-medium">
                              Global
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-neutral-500 font-mono text-sm">{league.code}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          league.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : league.status === 'drafting'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          {league.status.charAt(0).toUpperCase() + league.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-burgundy-500 hover:text-burgundy-600 font-medium text-sm">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-cream-50 rounded-xl border border-cream-200">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cream-200 flex items-center justify-center">
                <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-neutral-600 mb-4">You haven't joined any leagues yet</p>
              <button className="btn btn-primary">Create or Join a League</button>
            </div>
          )}
        </div>

        {/* Season Timeline */}
        {activeSeason && (
          <div className="card-elevated mt-8">
            <h2 className="font-display text-xl text-neutral-800 mb-6">Season 50 Timeline</h2>
            <div className="space-y-4">
              <TimelineItem
                label="Registration Opens"
                date="Dec 19, 2025"
                status="upcoming"
              />
              <TimelineItem
                label="Draft Order Deadline"
                date="Jan 5, 2026"
                status="upcoming"
              />
              <TimelineItem
                label="Premiere"
                date="Feb 25, 2026"
                status="upcoming"
              />
              <TimelineItem
                label="Draft Deadline"
                date="Mar 2, 2026"
                status="upcoming"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function TimelineItem({ label, date, status }: { label: string; date: string; status: 'completed' | 'current' | 'upcoming' }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
        status === 'completed' ? 'bg-green-500' :
        status === 'current' ? 'bg-burgundy-500' :
        'bg-cream-400'
      }`} />
      <div className="flex-1 flex items-center justify-between py-2 border-b border-cream-200">
        <span className="text-neutral-700">{label}</span>
        <span className="text-neutral-500 text-sm">{date}</span>
      </div>
    </div>
  );
}
