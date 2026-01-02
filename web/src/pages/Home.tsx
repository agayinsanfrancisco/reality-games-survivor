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
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-cream-50 via-cream-100 to-amber-50">
      {/* Navigation */}
      <Navigation />

      {/* MAIN CONTENT - Fills remaining space */}
      <main className="flex-1 flex items-center justify-center px-4 py-4 overflow-hidden">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Hero Text */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1.5 rounded-full text-sm font-semibold mb-4">
                <Flame className="h-4 w-4" />
                Season 50 Now Open
              </div>

              <h1
                className="text-4xl sm:text-5xl lg:text-6xl text-gray-900 leading-[1.1] mb-4"
                style={{ fontFamily: 'Georgia, Times New Roman, serif', fontWeight: 400 }}
              >
                Fantasy Survivor
                <br />
                for People Who
                <br />
                <span className="italic text-red-800">Actually</span> Watch
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 mb-6 max-w-lg mx-auto lg:mx-0">
                Draft castaways. Set weekly lineups. Earn points for every confessional, idol play,
                and blindside. Prove you know the game.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6">
                <Link
                  to="/signup"
                  className="bg-red-800 hover:bg-red-900 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
                >
                  <Flame className="h-5 w-5" />
                  Join Free
                </Link>
                <Link
                  to="/how-to-play"
                  className="bg-white hover:bg-gray-50 text-gray-800 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 transition-all inline-flex items-center justify-center"
                >
                  How It Works
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-6 justify-center lg:justify-start text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <strong className="text-gray-700">100+</strong> scoring rules
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-blue-500" />
                  <strong className="text-gray-700">18</strong> castaways
                </span>
              </div>
            </div>

            {/* Right Side - Feature Cards */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                {/* Card 1 */}
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mb-3">
                    <Target className="h-5 w-5 text-red-700" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">100+ Rules</h3>
                  <p className="text-gray-600 text-sm">
                    Confessionals, idols, challenges, blindsides - we track it all.
                  </p>
                </div>

                {/* Card 2 */}
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
                    <Users className="h-5 w-5 text-amber-700" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">Draft & Play</h3>
                  <p className="text-gray-600 text-sm">
                    Pick 5 castaways, start 3 each week. Strategy matters.
                  </p>
                </div>

                {/* Card 3 */}
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                    <Trophy className="h-5 w-5 text-green-700" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">Compete</h3>
                  <p className="text-gray-600 text-sm">
                    Private leagues with friends or global competitions.
                  </p>
                </div>

                {/* Card 4 - Season Info */}
                <div className="bg-gradient-to-br from-red-800 to-red-900 rounded-2xl p-5 shadow-lg text-white hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                    <Flame className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold mb-1">Season 50</h3>
                  <p className="text-red-100 text-sm">Premieres Feb 26, 2026. Draft now!</p>
                </div>
              </div>
            </div>

            {/* Mobile Feature Pills (shown on smaller screens) */}
            <div className="lg:hidden flex flex-wrap gap-2 justify-center">
              <span className="bg-white px-4 py-2 rounded-full text-sm font-medium text-gray-700 shadow-sm border border-gray-100">
                <Target className="h-4 w-4 inline mr-1 text-red-600" />
                100+ Rules
              </span>
              <span className="bg-white px-4 py-2 rounded-full text-sm font-medium text-gray-700 shadow-sm border border-gray-100">
                <Users className="h-4 w-4 inline mr-1 text-amber-600" />
                Draft 5 Players
              </span>
              <span className="bg-white px-4 py-2 rounded-full text-sm font-medium text-gray-700 shadow-sm border border-gray-100">
                <Trophy className="h-4 w-4 inline mr-1 text-green-600" />
                Win Glory
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-3 px-4 text-center text-gray-400 text-xs">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/how-to-play" className="hover:text-gray-600 transition-colors">
            How to Play
          </Link>
          <span>•</span>
          <Link to="/scoring-rules" className="hover:text-gray-600 transition-colors">
            Scoring Rules
          </Link>
          <span>•</span>
          <Link to="/trivia" className="hover:text-gray-600 transition-colors">
            Free Trivia
          </Link>
          <span>•</span>
          <Link to="/contact" className="hover:text-gray-600 transition-colors">
            Contact
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default Home;
