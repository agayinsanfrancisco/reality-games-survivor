import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  display_name: string;
  role: 'player' | 'commissioner' | 'admin';
}

export function Navigation() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('users')
        .select('id, display_name, role')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data as UserProfile;
    },
    enabled: !!user?.id,
  });

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isAdmin = profile?.role === 'admin';

  // Admin navigation
  if (user && isAdmin) {
    return (
      <nav className="bg-white/70 backdrop-blur-md border-b border-cream-200/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/admin" className="flex items-center gap-2">
              <img src="/logo.png" alt="RGFL" className="h-10 w-auto" />
              <span className="text-xs font-semibold text-burgundy-500 bg-burgundy-100 px-2 py-0.5 rounded">ADMIN</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link to="/admin/seasons" className={isActive('/admin/seasons') ? 'nav-link-active' : 'nav-link'}>
                Seasons
              </Link>
              <Link to="/admin/leagues" className={isActive('/admin/leagues') ? 'nav-link-active' : 'nav-link'}>
                Leagues
              </Link>
              <Link to="/admin/users" className={isActive('/admin/users') ? 'nav-link-active' : 'nav-link'}>
                Users
              </Link>
              <Link to="/admin/payments" className={isActive('/admin/payments') ? 'nav-link-active' : 'nav-link'}>
                Payments
              </Link>
              <Link to="/admin/scoring-rules" className={isActive('/admin/scoring-rules') ? 'nav-link-active' : 'nav-link'}>
                Scoring Rules
              </Link>
              <Link to="/admin/jobs" className={isActive('/admin/jobs') ? 'nav-link-active' : 'nav-link'}>
                Jobs
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="nav-link text-sm">
                Player View
              </Link>
              <div className="relative group">
                <button className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-cream-100 rounded-xl transition-all">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-float border border-cream-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="p-3 border-b border-cream-100">
                    <p className="font-medium text-neutral-800 text-sm">{profile?.display_name}</p>
                    <p className="text-xs text-burgundy-500">Admin</p>
                  </div>
                  <div className="p-2">
                    <Link to="/profile" className="block px-3 py-2 text-sm text-neutral-600 hover:bg-cream-50 rounded-lg">
                      Profile
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-3 py-2 text-sm text-neutral-600 hover:bg-cream-50 rounded-lg"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Authenticated player navigation
  if (user) {
    return (
      <nav className="bg-white/70 backdrop-blur-md border-b border-cream-200/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="RGFL" className="h-10 w-auto" />
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className={isActive('/') && location.pathname === '/' ? 'nav-link-active' : 'nav-link'}>
                Home
              </Link>
              <Link to="/how-to-play" className={isActive('/how-to-play') ? 'nav-link-active' : 'nav-link'}>
                How to Play
              </Link>
              <Link to="/dashboard" className={isActive('/dashboard') ? 'nav-link-active' : 'nav-link'}>
                Dashboard
              </Link>
              <Link to="/leagues/create" className={isActive('/leagues/create') ? 'nav-link-active' : 'nav-link'}>
                Create League
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <Link
                to="/profile/notifications"
                className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-cream-100 rounded-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </Link>

              {/* User Menu */}
              <div className="relative group">
                <button className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-cream-100 rounded-xl transition-all">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-float border border-cream-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="p-3 border-b border-cream-100">
                    <p className="font-medium text-neutral-800 text-sm">{profile?.display_name || 'Survivor'}</p>
                    <p className="text-xs text-neutral-400">Player</p>
                  </div>
                  <div className="p-2">
                    <Link to="/profile" className="block px-3 py-2 text-sm text-neutral-600 hover:bg-cream-50 rounded-lg">
                      Profile Settings
                    </Link>
                    <Link to="/profile/payments" className="block px-3 py-2 text-sm text-neutral-600 hover:bg-cream-50 rounded-lg">
                      Payment History
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-3 py-2 text-sm text-neutral-600 hover:bg-cream-50 rounded-lg"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Public/unauthenticated navigation
  return (
    <nav className="bg-white/70 backdrop-blur-md border-b border-cream-200/50 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="RGFL" className="h-10 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={location.pathname === '/' ? 'nav-link-active' : 'nav-link'}>
              Home
            </Link>
            <Link to="/how-to-play" className={isActive('/how-to-play') ? 'nav-link-active' : 'nav-link'}>
              How to Play
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="btn btn-primary shadow-elevated">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
