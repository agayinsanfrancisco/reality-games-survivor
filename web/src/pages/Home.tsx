/**
 * Home Page - Main landing page for survivor.realitygamesfantasyleague.com
 *
 * Fantasy Survivor landing with Season 50 signup CTAs and trivia email signup.
 * Redirects logged-in users to the dashboard.
 */

import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import {
  CheckCircle,
  Loader2,
  Trophy,
  Users,
  Zap,
  Target,
  Calendar,
  Star,
  Flame,
  Crown,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

export function Home() {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect logged-in users to dashboard
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Store email in localStorage for now (could be sent to backend later)
      const existingEmails = JSON.parse(localStorage.getItem('triviaEmails') || '[]');
      if (!existingEmails.includes(email)) {
        existingEmails.push(email);
        localStorage.setItem('triviaEmails', JSON.stringify(existingEmails));
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setIsSubscribed(true);
      setEmail('');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg, #F5F0E8 0%, #E8E0D5 50%, #DED4C4 100%)' }}
    >
      {/* Navigation */}
      <Navigation />

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full">
        <div className="text-center">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl text-gray-900 leading-[0.95] mb-8"
            style={{ fontFamily: 'Georgia, Times New Roman, serif', fontWeight: 400 }}
          >
            Fantasy Survivor
            <br />
            for People Who
            <br />
            <span className="italic text-red-800">Actually</span> Watch
          </h1>

          <p className="text-xl sm:text-2xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            100+ scoring rules. Real strategy. No luck required.
            <br />
            Draft your castaways and prove you know the game.
          </p>

          {/* Dual CTAs - Equal Weight */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
            <Link
              to="/signup"
              className="bg-red-800 hover:bg-red-900 text-white px-6 py-3 rounded-xl font-semibold text-base transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              Join Season 50 <span>→</span>
            </Link>
            <Link
              to="/how-to-play"
              className="bg-white hover:bg-gray-50 text-gray-800 px-6 py-3 rounded-xl font-semibold text-base border-2 border-gray-300 hover:border-gray-400 transition-all shadow-sm"
            >
              How It Works
            </Link>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 max-w-md mx-auto mb-8">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-400 text-sm font-medium">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Email Capture - Secondary */}
          <p className="text-gray-600 text-lg mb-4">
            Not ready yet? Get weekly trivia featuring the Season 50 cast.
          </p>
          {isSubscribed ? (
            <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 px-6 py-4 rounded-xl max-w-lg mx-auto">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">You're subscribed! Check your inbox soon.</span>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="max-w-lg mx-auto">
              <div className="flex gap-3 items-start">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter your email"
                  className={`flex-1 px-5 py-3 rounded-xl text-base border ${
                    error ? 'border-red-400' : 'border-gray-300'
                  } focus:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/20 transition-all`}
                  disabled={isSubmitting}
                  aria-label="Email address for trivia newsletter"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !email}
                  className="bg-black hover:bg-gray-900 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-semibold text-base transition-all shadow-md hover:shadow-lg whitespace-nowrap flex items-center gap-2 shrink-0"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Signing up...</span>
                    </>
                  ) : (
                    'Get Trivia'
                  )}
                </button>
              </div>
              {error && <p className="text-red-500 text-sm mt-2 text-left">{error}</p>}
            </form>
          )}
        </div>

        {/* MIDDLE SECTION - Why Play */}
        <div className="mt-20 mb-16">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Not Your Average Fantasy Game
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Forget luck-based predictions. This is strategy, knowledge, and knowing the game
              better than anyone else.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-red-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">100+ Scoring Rules</h3>
              <p className="text-gray-600">
                Every confessional, challenge win, idol play, and blindside counts. We track it all
                so you get rewarded for actually watching.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Draft Your Dream Team</h3>
              <p className="text-gray-600">
                Pick 5 castaways before the premiere. Make weekly lineup decisions. Manage your
                bench. Outplay your friends.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-green-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Compete & Climb</h3>
              <p className="text-gray-600">
                Create private leagues with friends or join public competitions. Watch your ranking
                rise as you prove your Survivor IQ.
              </p>
            </div>
          </div>

          {/* How It Works Timeline */}
          <div className="bg-gradient-to-r from-red-800 to-red-900 rounded-3xl p-8 md:p-10 text-white mb-16">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">
              <Flame className="inline-block h-8 w-8 mr-2 -mt-1" />
              How Season 50 Works
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="h-7 w-7" />
                </div>
                <div className="text-3xl font-bold mb-1">1</div>
                <h4 className="font-semibold mb-1">Sign Up Now</h4>
                <p className="text-red-100 text-sm">Create your free account and join leagues</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-7 w-7" />
                </div>
                <div className="text-3xl font-bold mb-1">2</div>
                <h4 className="font-semibold mb-1">Draft Castaways</h4>
                <p className="text-red-100 text-sm">Pick your 5 players before Feb 26</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-7 w-7" />
                </div>
                <div className="text-3xl font-bold mb-1">3</div>
                <h4 className="font-semibold mb-1">Set Your Lineup</h4>
                <p className="text-red-100 text-sm">Choose 3 starters each week</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Crown className="h-7 w-7" />
                </div>
                <div className="text-3xl font-bold mb-1">4</div>
                <h4 className="font-semibold mb-1">Win Glory</h4>
                <p className="text-red-100 text-sm">Outscore, outwit, outlast your competition</p>
              </div>
            </div>
          </div>

          {/* Social Proof / Stats */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Star className="h-4 w-4" />
              Season 50: The Biggest Season Yet
            </div>
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="text-4xl md:text-5xl font-bold text-gray-900">18</div>
                <div className="text-gray-600">New Castaways</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-red-800">100+</div>
                <div className="text-gray-600">Scoring Events</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-gray-900">13</div>
                <div className="text-gray-600">Episodes</div>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Ready to Prove You Know Survivor?
            </h3>
            <p className="text-gray-600 text-lg mb-6 max-w-xl mx-auto">
              Season 50 premieres February 26, 2026. Draft opens now. Don't get left on Exile
              Island.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-red-800 hover:bg-red-900 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2"
              >
                <Flame className="h-5 w-5" />
                Join Season 50 Free
              </Link>
              <Link
                to="/trivia"
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-4 rounded-xl font-semibold text-lg transition-all inline-flex items-center justify-center gap-2"
              >
                Try Free Trivia First
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Home;
