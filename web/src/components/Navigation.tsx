import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { Flame, Shield, Users, Trophy, Mail, Home, BookOpen, UserCircle, Target, MoreHorizontal } from 'lucide-react';

interface UserProfile {
  id: string;
  display_name: string;
  role: 'player' | 'commissioner' | 'admin';
}

export function Navigation() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  // View mode toggle for admins - persisted in localStorage
  const [viewMode, setViewMode] = useState<'admin' | 'player'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('adminViewMode') as 'admin' | 'player') || 'admin';
    }
    return 'admin';
  });

  // Update localStorage when view mode changes
  useEffect(() => {
    localStorage.setItem('adminViewMode', viewMode);
  }, [viewMode]);

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
  const showAdminNav = isAdmin && viewMode === 'admin';

  // Admin navigation - dramatically different styling
  if (user && showAdminNav) {
    return (
      <>
        {/* Very prominent Admin Mode Banner */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 text-white py-3 px-4 sticky top-0 z-[60]">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <Shield className="h-4 w-4" />
                <span className="font-bold text-sm tracking-wide">ADMIN CONTROL PANEL</span>
              </div>
              <span className="text-white/80 text-sm hidden sm:inline">Full system access enabled</span>
            </div>
            <button
              onClick={() => setViewMode('player')}
              className="flex items-center gap-2 bg-white text-orange-600 px-4 py-1.5 rounded-full font-semibold text-sm hover:bg-orange-50 transition-colors"
            >
              <UserCircle className="h-4 w-4" />
              Switch to Player View
            </button>
          </div>
        </div>
        <nav className="bg-cream-50 border-b-4 border-orange-400 shadow-lg sticky top-[52px] z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <Link to="/admin" className="flex items-center gap-3">
                <img src="/logo.png" alt="RGFL" className="h-8 w-auto" />
                <div className="flex items-center gap-2">
                  <span className="text-neutral-800 font-bold">RGFL</span>
                  <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded">ADMIN</span>
                </div>
              </Link>

              <div className="hidden md:flex items-center gap-1">
                {[
                  { path: '/admin/seasons', label: 'Seasons' },
                  { path: '/admin/leagues', label: 'Leagues' },
                  { path: '/admin/users', label: 'Users' },
                  { path: '/admin/payments', label: 'Payments' },
                  { path: '/admin/scoring-rules', label: 'Scoring' },
                  { path: '/admin/jobs', label: 'Jobs' },
                ].map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-orange-500 text-white'
                        : 'text-neutral-600 hover:text-orange-600 hover:bg-orange-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-neutral-800 text-sm font-medium">{profile?.display_name}</p>
                  <p className="text-orange-600 text-xs font-semibold">Administrator</p>
                </div>
                <button
                  onClick={() => signOut()}
                  className="text-neutral-500 hover:text-neutral-800 text-sm"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </nav>
      </>
    );
  }

  // Authenticated player navigation - warm, inviting styling
  if (user) {
    return (
      <nav className="bg-gradient-to-r from-cream-50 to-white border-b border-cream-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-2">
              <img src="/logo.png" alt="RGFL" className="h-10 w-auto" />
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive('/dashboard')
                    ? 'bg-burgundy-500 text-white shadow-md'
                    : 'text-neutral-600 hover:bg-cream-100'
                }`}
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                to="/leagues"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive('/leagues') && !location.pathname.includes('/create')
                    ? 'bg-burgundy-500 text-white shadow-md'
                    : 'text-neutral-600 hover:bg-cream-100'
                }`}
              >
                <Users className="h-4 w-4" />
                Leagues
              </Link>
              <Link
                to="/leaderboard"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive('/leaderboard')
                    ? 'bg-burgundy-500 text-white shadow-md'
                    : 'text-neutral-600 hover:bg-cream-100'
                }`}
              >
                <Trophy className="h-4 w-4" />
                Leaderboard
              </Link>
              <Link
                to="/castaways"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive('/castaways')
                    ? 'bg-burgundy-500 text-white shadow-md'
                    : 'text-neutral-600 hover:bg-cream-100'
                }`}
              >
                <Flame className="h-4 w-4" />
                Castaways
              </Link>

              {/* More dropdown */}
              <div className="relative group">
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive('/scoring') || isActive('/how-to-play') || isActive('/contact')
                      ? 'bg-burgundy-500 text-white shadow-md'
                      : 'text-neutral-600 hover:bg-cream-100'
                  }`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  More
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-float border border-cream-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="p-2">
                    <Link
                      to="/scoring"
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive('/scoring') ? 'bg-burgundy-50 text-burgundy-600' : 'text-neutral-600 hover:bg-cream-50'
                      }`}
                    >
                      <Target className="h-4 w-4" />
                      Scoring Rules
                    </Link>
                    <Link
                      to="/how-to-play"
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive('/how-to-play') ? 'bg-burgundy-50 text-burgundy-600' : 'text-neutral-600 hover:bg-cream-50'
                      }`}
                    >
                      <BookOpen className="h-4 w-4" />
                      How to Play
                    </Link>
                    <Link
                      to="/contact"
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive('/contact') ? 'bg-burgundy-50 text-burgundy-600' : 'text-neutral-600 hover:bg-cream-50'
                      }`}
                    >
                      <Mail className="h-4 w-4" />
                      Contact
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Admin View Toggle (only for admins) */}
              {isAdmin && (
                <button
                  onClick={() => setViewMode('admin')}
                  className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Shield className="h-3 w-3" />
                  Admin
                </button>
              )}

              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 text-neutral-600 hover:text-neutral-800 hover:bg-cream-100 rounded-xl transition-all">
                  <div className="w-8 h-8 bg-burgundy-100 rounded-full flex items-center justify-center">
                    <span className="text-burgundy-600 font-semibold text-sm">
                      {profile?.display_name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </button>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-float border border-cream-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="p-4 border-b border-cream-100">
                    <p className="font-semibold text-neutral-800">{profile?.display_name || 'Survivor'}</p>
                    <p className="text-sm text-neutral-400">Fantasy Player</p>
                  </div>
                  <div className="p-2">
                    <Link to="/profile" className="block px-3 py-2 text-sm text-neutral-600 hover:bg-cream-50 rounded-lg">
                      Profile Settings
                    </Link>
                    <Link to="/profile/notifications" className="block px-3 py-2 text-sm text-neutral-600 hover:bg-cream-50 rounded-lg">
                      Notifications
                    </Link>
                    <Link to="/profile/payments" className="block px-3 py-2 text-sm text-neutral-600 hover:bg-cream-50 rounded-lg">
                      Payment History
                    </Link>
                    <hr className="my-2 border-cream-100" />
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
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
    <nav className="bg-white/80 backdrop-blur-md border-b border-cream-200/50 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="RGFL" className="h-10 w-auto" />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === '/'
                  ? 'text-burgundy-600'
                  : 'text-neutral-600 hover:text-burgundy-500'
              }`}
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link
              to="/how-to-play"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/how-to-play')
                  ? 'text-burgundy-600'
                  : 'text-neutral-600 hover:text-burgundy-500'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              How to Play
            </Link>
            <Link
              to="/scoring"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/scoring')
                  ? 'text-burgundy-600'
                  : 'text-neutral-600 hover:text-burgundy-500'
              }`}
            >
              <Target className="h-4 w-4" />
              Scoring
            </Link>
            <Link
              to="/contact"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/contact')
                  ? 'text-burgundy-600'
                  : 'text-neutral-600 hover:text-burgundy-500'
              }`}
            >
              <Mail className="h-4 w-4" />
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="text-neutral-600 hover:text-burgundy-600 font-medium text-sm">
              Login
            </Link>
            <Link to="/signup" className="btn btn-primary shadow-elevated">
              Sign Up Free
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
