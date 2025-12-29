/**
 * HeroContent Component
 *
 * Main hero section with logo, copy, countdown, and CTAs.
 */

import { Link } from 'react-router-dom';
import { CountdownTimer } from './CountdownTimer';

interface HeroContentProps {
  isAuthenticated: boolean;
  isVisible: boolean;
}

export function HeroContent({ isAuthenticated, isVisible }: HeroContentProps) {
  return (
    <div
      className={`text-center max-w-[680px] mx-auto transition-all duration-800 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
    >
      {/* Logo */}
      <div className="mb-10 sm:mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <img
          src="/logo.png"
          alt="Reality Games Fantasy League"
          className="w-72 sm:w-80 h-auto mx-auto"
        />
      </div>

      {/* Copy */}
      <div className="space-y-4 mb-11 sm:mb-12">
        <p className="font-display text-lg sm:text-xl text-neutral-600 leading-relaxed font-normal">
          Get ready for fantasy done differently. Built by superfans, for superfans—no corporate
          shortcuts, no afterthoughts, just games designed by people who actually care.
        </p>
        <p className="font-display text-lg sm:text-xl text-neutral-600 leading-relaxed font-normal">
          We're kicking off with the season fans have been waiting for—
          <span className="text-burgundy-500 font-medium">Survivor 50</span>.
          <br />
          <span className="italic text-neutral-400">Don't let your torch get snuffed.</span>
        </p>
      </div>

      {/* Countdown */}
      <div className="mb-3">
        <CountdownTimer />
      </div>

      {/* Subtext */}
      <p className="text-neutral-400 text-sm mb-9">
        League registration closes February 25, 2026 at 3p PST
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
        <Link
          to={isAuthenticated ? '/dashboard' : '/signup'}
          className="w-full sm:w-auto px-14 py-5 bg-burgundy-500 text-white font-display text-sm font-semibold tracking-wide uppercase rounded hover:bg-burgundy-600 transition-all shadow-xl shadow-burgundy-500/30"
        >
          {isAuthenticated ? 'Dashboard' : 'Sign Up'}
        </Link>

        <Link
          to="/how-to-play"
          className="w-full sm:w-auto px-10 py-5 bg-transparent border border-cream-400 text-neutral-500 font-display text-sm font-medium rounded hover:text-burgundy-500 hover:border-burgundy-500 hover:bg-burgundy-500/5 transition-all"
        >
          How it Works
        </Link>
      </div>

      {/* Login link */}
      {!isAuthenticated && (
        <p className="text-neutral-400 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-burgundy-500 hover:text-burgundy-600 underline">
            Log in
          </Link>
        </p>
      )}
    </div>
  );
}
