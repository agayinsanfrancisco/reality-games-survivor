import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-200">
        <Loader2 className="h-12 w-12 text-burgundy-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    // Preserve the intended destination so user can be redirected after login
    const redirectTo = location.pathname + location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectTo)}`} replace />;
  }

  // Force users through profile setup until explicitly marked complete
  if (!profile?.profile_setup_complete && location.pathname !== '/profile/setup') {
    const redirectTo = location.pathname + location.search;
    return <Navigate to={`/profile/setup?redirect=${encodeURIComponent(redirectTo)}`} replace />;
  }

  return <Outlet />;
}
