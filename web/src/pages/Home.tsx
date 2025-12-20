import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

// Torch SVG component - extracted/inspired from Survivor torch imagery
function TorchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Flame */}
      <path
        d="M32 0C32 0 18 20 18 35C18 45 24 52 32 55C40 52 46 45 46 35C46 20 32 0 32 0Z"
        fill="url(#flame-gradient)"
      />
      <path
        d="M32 8C32 8 24 22 24 32C24 38 27 43 32 45C37 43 40 38 40 32C40 22 32 8 32 8Z"
        fill="#FFD700"
        opacity="0.8"
      />
      {/* Torch handle */}
      <rect x="28" y="50" width="8" height="140" fill="url(#wood-gradient)" rx="2" />
      {/* Wrap details */}
      <rect x="26" y="55" width="12" height="4" fill="#5C3317" rx="1" />
      <rect x="26" y="62" width="12" height="4" fill="#5C3317" rx="1" />
      <rect x="26" y="69" width="12" height="4" fill="#5C3317" rx="1" />
      <defs>
        <linearGradient id="flame-gradient" x1="32" y1="0" x2="32" y2="55" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF6B00" />
          <stop offset="0.5" stopColor="#FF4500" />
          <stop offset="1" stopColor="#A52A2A" />
        </linearGradient>
        <linearGradient id="wood-gradient" x1="28" y1="50" x2="36" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B4513" />
          <stop offset="0.5" stopColor="#A0522D" />
          <stop offset="1" stopColor="#8B4513" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Home() {
  const { user } = useAuth();

  return (
    <div className="h-screen flex flex-col bg-cream-200 overflow-hidden">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-cream-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="RGFL" className="h-10 w-auto" />
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="nav-link-active">Home</Link>
              <Link to="/how-to-play" className="nav-link">How to Play</Link>
              <Link to="/rules" className="nav-link">Scoring Rules</Link>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <Link to="/dashboard" className="btn btn-primary">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="nav-link">Login</Link>
                  <Link to="/signup" className="btn btn-primary">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero - fills remaining viewport */}
      <div className="flex-1 flex items-center justify-center relative px-4">
        {/* Decorative torches on sides */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 opacity-20 hidden lg:block">
          <TorchIcon className="h-64" />
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 hidden lg:block">
          <TorchIcon className="h-64" />
        </div>

        <div className="max-w-3xl text-center relative z-10">
          {/* Main torch accent */}
          <div className="flex justify-center mb-6">
            <TorchIcon className="h-20 drop-shadow-lg" />
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-neutral-800 leading-tight">
            SURVIVOR FANTASY LEAGUE
          </h1>

          <p className="mt-6 text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Bored of the same old fantasy leagues where you pick one Survivor and pray for luck?
            Get ready for something completely different.
          </p>

          <p className="mt-4 text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            We've created a scoring system with{' '}
            <span className="font-semibold text-burgundy-500">100+ game-tested rules</span>{' '}
            that reward real strategy, not just luck.
          </p>

          <div className="mt-8">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary text-lg px-10 py-4">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/signup" className="btn btn-primary text-lg px-10 py-4">
                JOIN NOW
              </Link>
            )}
          </div>

          <p className="mt-6 text-sm text-neutral-500">
            Season 50 registration opens December 19, 2025
          </p>
        </div>
      </div>

      {/* Minimal footer */}
      <footer className="py-4 text-center text-neutral-500 text-sm">
        © 2025 Reality Games Fantasy League · Not affiliated with CBS or Survivor
      </footer>
    </div>
  );
}
