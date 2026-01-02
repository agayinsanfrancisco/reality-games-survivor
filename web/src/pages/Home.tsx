/**
 * Home Page - Main landing page for survivor.realitygamesfantasyleague.com
 *
 * Single-screen, no-scroll landing page for Season 50.
 * Redirects logged-in users to the dashboard.
 */

import { Link, Navigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Flame, Trophy, Users, Target } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export function Home() {
  const { user, loading } = useAuth();

  // Redirect logged-in users to dashboard
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-cream-50">
      {/* Navigation */}
      <Navigation />

      {/* MAIN CONTENT - Fills remaining space */}
      <main className="flex-1 flex items-center justify-center px-4 py-4 overflow-hidden">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Hero Text */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-burgundy-100 text-burgundy-700 px-3 py-1.5 rounded-full text-sm font-semibold mb-4">
                <Flame className="h-4 w-4" />
                Season 50 Now Open
              </div>

              <h1
                className="text-4xl sm:text-5xl lg:text-6xl text-neutral-800 leading-[1.1] mb-4"
                style={{ fontFamily: 'Georgia, Times New Roman, serif', fontWeight: 400 }}
              >
                Fantasy Survivor
                <br />
                for People Who
                <br />
                <span className="italic text-burgundy-600">Actually</span> Watch
              </h1>

              <p className="text-lg sm:text-xl text-neutral-600 mb-6 max-w-lg mx-auto lg:mx-0">
                Draft castaways. Set weekly lineups. Earn points for every confessional, idol play,
                and blindside. Prove you know the game.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6">
                <Link
                  to="/signup"
                  className="bg-burgundy-600 hover:bg-burgundy-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
                >
                  <Flame className="h-5 w-5" />
                  Join Free
                </Link>
                <Link
                  to="/how-to-play"
                  className="bg-white hover:bg-cream-100 text-neutral-800 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-cream-200 hover:border-cream-300 transition-all inline-flex items-center justify-center"
                >
                  How It Works
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-6 justify-center lg:justify-start text-sm text-neutral-500">
                <span className="flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-burgundy-500" />
                  <strong className="text-neutral-700">100+</strong> scoring rules
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-burgundy-500" />
                  <strong className="text-neutral-700">18</strong> castaways
                </span>
              </div>
            </div>

            {/* Right Side - Feature Cards */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                {/* Card 1 */}
                <div className="bg-white rounded-2xl p-5 shadow-card border border-cream-200 hover:shadow-elevated transition-all hover:-translate-y-1">
                  <div className="w-10 h-10 bg-burgundy-100 rounded-xl flex items-center justify-center mb-3">
                    <Target className="h-5 w-5 text-burgundy-600" />
                  </div>
                  <h3 className="font-bold text-neutral-800 mb-1">100+ Rules</h3>
                  <p className="text-neutral-600 text-sm">
                    Confessionals, idols, challenges, blindsides - we track it all.
                  </p>
                </div>

                {/* Card 2 */}
                <div className="bg-white rounded-2xl p-5 shadow-card border border-cream-200 hover:shadow-elevated transition-all hover:-translate-y-1">
                  <div className="w-10 h-10 bg-burgundy-100 rounded-xl flex items-center justify-center mb-3">
                    <Users className="h-5 w-5 text-burgundy-600" />
                  </div>
                  <h3 className="font-bold text-neutral-800 mb-1">Draft & Play</h3>
                  <p className="text-neutral-600 text-sm">
                    Pick 5 castaways, start 3 each week. Strategy matters.
                  </p>
                </div>

                {/* Card 3 */}
                <div className="bg-white rounded-2xl p-5 shadow-card border border-cream-200 hover:shadow-elevated transition-all hover:-translate-y-1">
                  <div className="w-10 h-10 bg-burgundy-100 rounded-xl flex items-center justify-center mb-3">
                    <Trophy className="h-5 w-5 text-burgundy-600" />
                  </div>
                  <h3 className="font-bold text-neutral-800 mb-1">Compete</h3>
                  <p className="text-neutral-600 text-sm">
                    Private leagues with friends or global competitions.
                  </p>
                </div>

                {/* Card 4 - Season Info */}
                <div className="bg-burgundy-600 rounded-2xl p-5 shadow-card text-white hover:shadow-elevated transition-all hover:-translate-y-1">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                    <Flame className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold mb-1">Season 50</h3>
                  <p className="text-burgundy-100 text-sm">Premieres Feb 26, 2026. Draft now!</p>
                </div>
              </div>
            </div>

            {/* Mobile Feature Pills (shown on smaller screens) */}
            <div className="lg:hidden flex flex-wrap gap-2 justify-center">
              <span className="bg-white px-4 py-2 rounded-full text-sm font-medium text-neutral-700 shadow-sm border border-cream-200">
                <Target className="h-4 w-4 inline mr-1 text-burgundy-600" />
                100+ Rules
              </span>
              <span className="bg-white px-4 py-2 rounded-full text-sm font-medium text-neutral-700 shadow-sm border border-cream-200">
                <Users className="h-4 w-4 inline mr-1 text-burgundy-600" />
                Draft 5 Players
              </span>
              <span className="bg-white px-4 py-2 rounded-full text-sm font-medium text-neutral-700 shadow-sm border border-cream-200">
                <Trophy className="h-4 w-4 inline mr-1 text-burgundy-600" />
                Win Glory
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-3 px-4 text-center text-neutral-400 text-xs">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/how-to-play" className="hover:text-neutral-600 transition-colors">
            How to Play
          </Link>
          <span>•</span>
          <Link to="/scoring-rules" className="hover:text-neutral-600 transition-colors">
            Scoring Rules
          </Link>
          <span>•</span>
          <Link to="/trivia" className="hover:text-neutral-600 transition-colors">
            Free Trivia
          </Link>
          <span>•</span>
          <Link to="/contact" className="hover:text-neutral-600 transition-colors">
            Contact
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default Home;
