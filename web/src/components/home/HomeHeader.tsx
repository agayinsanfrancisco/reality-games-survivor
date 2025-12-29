/**
 * HomeHeader Component
 *
 * Fixed navigation header for the home page.
 * Shows Home/Contact links and dashboard/signup CTA.
 */

import { Link } from 'react-router-dom';

interface HomeHeaderProps {
  isAuthenticated: boolean;
}

export function HomeHeader({ isAuthenticated }: HomeHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-5 sm:px-10 py-5 bg-gradient-to-b from-cream-50 to-transparent">
      <nav className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6 sm:gap-9">
          <Link
            to="/"
            className="text-neutral-500 hover:text-burgundy-500 font-display text-sm sm:text-base font-medium transition-colors"
          >
            Home
          </Link>
          <Link
            to="/contact"
            className="text-neutral-500 hover:text-burgundy-500 font-display text-sm sm:text-base font-medium transition-colors"
          >
            Contact
          </Link>
        </div>

        <Link
          to={isAuthenticated ? '/dashboard' : '/signup'}
          className="px-5 sm:px-7 py-2.5 sm:py-3 bg-burgundy-500 text-white font-display text-xs sm:text-sm font-semibold rounded hover:bg-burgundy-600 transition-all shadow-lg shadow-burgundy-500/25"
        >
          {isAuthenticated ? 'Dashboard' : 'Join Survivor Season 50'}
        </Link>
      </nav>
    </header>
  );
}
