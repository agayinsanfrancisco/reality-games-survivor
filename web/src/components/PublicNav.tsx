import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

export function PublicNav() {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/70 backdrop-blur-md border-b border-cream-200/50 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="RGFL" className="h-10 w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={isActive('/') ? 'nav-link-active' : 'nav-link'}>
              Home
            </Link>
            <Link to="/how-to-play" className={isActive('/how-to-play') ? 'nav-link-active' : 'nav-link'}>
              How to Play
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary shadow-elevated">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/signup" className="btn btn-primary shadow-elevated">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
