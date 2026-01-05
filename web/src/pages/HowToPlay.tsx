import { Link } from 'react-router-dom';
import {
  Trophy,
  Users,
  Calendar,
  Star,
  Award,
  BookOpen,
  ArrowRight,
  Target,
  Zap,
  Shield,
  Clock,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useSiteCopy } from '@/lib/hooks/useSiteCopy';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

// Map icon names to components (exported for potential dynamic use)
const _iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Trophy,
  Target,
  Calendar,
  Star,
  Award,
  Zap,
  Shield,
  Flame,
  Clock,
};

export default function HowToPlay() {
  const { user } = useAuth();
  const { getCopy } = useSiteCopy();

  // Parse JSON details from CMS or use fallback
  const parseDetails = (key: string, fallback: string[]): string[] => {
    try {
      const content = getCopy(key, JSON.stringify(fallback));
      return JSON.parse(content);
    } catch {
      return fallback;
    }
  };

  const steps = [
    {
      icon: Users,
      title: getCopy('how-to-play.step1.title', 'Join or Create a League'),
      description: getCopy(
        'how-to-play.step1.description',
        'Play with friends in a private league or join a public one. Each league has its own leaderboard and bragging rights.'
      ),
      details: parseDetails('how-to-play.step1.details', [
        'Create a private league and invite friends with a code',
        'Join public leagues to compete with the community',
        'Play in multiple leagues with the same roster',
        'Everyone is automatically in the Global League',
      ]),
    },
    {
      icon: Trophy,
      title: getCopy('how-to-play.step2.title', 'Rank Your Castaways'),
      description: getCopy(
        'how-to-play.step2.description',
        'After the first episode, participants rank all castaways 1-24. This determines who you get in the snake draft.'
      ),
      details: parseDetails('how-to-play.step2.details', [
        'Rankings apply to ALL your leagues for the season',
        'Picks are made in reverse order of prior season fantasy rankings (or random for new leagues)',
        'The picking order reverses each round (snake draft style)',
        'Special selection rules apply if there are more participants than castaways',
      ]),
    },
    {
      icon: Target,
      title: getCopy('how-to-play.step3.title', 'Get Your Team'),
      description: getCopy(
        'how-to-play.step3.description',
        'After the deadline, the system runs a snake draft. You get 2 castaways based on your draft position and rankings.'
      ),
      details: parseDetails('how-to-play.step3.details', [
        'Draft positions are randomly assigned for new leagues',
        'Snake draft means pick order reverses each round',
        "You'll get your highest-ranked available castaway each pick",
        'Your 2 castaways are your team for the entire season',
      ]),
    },
    {
      icon: Calendar,
      title: getCopy('how-to-play.step4.title', 'Make Weekly Picks (Starting/Benched)'),
      description: getCopy(
        'how-to-play.step4.description',
        'Each week, choose which of your 2 castaways to "start" for that episode. Only your starting castaway earns points - the other is benched.'
      ),
      details: parseDetails('how-to-play.step4.details', [
        'Picks lock Wednesday at 8pm ET / 5pm PT when the episode airs',
        'A random number generator is used if no pick is made',
        'Prior week designations do NOT impact the current week',
        'When only one castaway remains, they must be your starter',
      ]),
    },
    {
      icon: Star,
      title: getCopy('how-to-play.step5.title', 'Earn Points'),
      description: getCopy(
        'how-to-play.step5.description',
        "Points are based on your STARTING castaway's performance that week. Your benched castaway does not score."
      ),
      details: parseDetails('how-to-play.step5.details', [
        'If a team has no remaining castaways, they can no longer score points',
        'Their Total Points are set at that point',
      ]),
      linkTo: '/scoring',
      linkText: 'View Full Scoring Rules →',
    },
    {
      icon: Award,
      title: getCopy('how-to-play.step6.title', 'Win Your League'),
      description: getCopy(
        'how-to-play.step6.description',
        'The player with the most total points at the end of the season wins! Track your progress on the leaderboard.'
      ),
      details: parseDetails('how-to-play.step6.details', [
        'Points accumulate across all episodes',
        'Leaderboard updates after each episode is scored',
        'Compete for glory in multiple leagues',
        'Bragging rights last until next season!',
      ]),
    },
  ];

  const strategies = [
    {
      icon: Zap,
      title: getCopy('how-to-play.strategy1.title', 'Study the Edit'),
      description: getCopy(
        'how-to-play.strategy1.description',
        'Castaways with more screen time and confessionals tend to score more points. Pay attention to who the editors are focusing on.'
      ),
    },
    {
      icon: Shield,
      title: getCopy('how-to-play.strategy2.title', 'Balance Risk'),
      description: getCopy(
        'how-to-play.strategy2.description',
        "Sometimes the safe pick isn't the best pick. A castaway in danger might score big if they survive or play an idol."
      ),
    },
    {
      icon: Flame,
      title: getCopy('how-to-play.strategy3.title', 'Know the Meta'),
      description: getCopy(
        'how-to-play.strategy3.description',
        'Challenge beasts score consistently. Strategic players score in bursts. Social players accumulate over time.'
      ),
    },
    {
      icon: Clock,
      title: getCopy('how-to-play.strategy4.title', 'Think Long-Term'),
      description: getCopy(
        'how-to-play.strategy4.description',
        "Don't just think about this week. Consider who will make the merge, who has idol-finding potential, who might win."
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-100 to-cream-200 flex flex-col">
      <Navigation />

      {/* Hero Header */}
      <div className="px-6 py-10 text-center bg-gradient-to-b from-burgundy-50 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-3">
            <BookOpen className="h-9 w-9 text-burgundy-500" />
            <h1 className="text-3xl md:text-4xl font-display font-bold text-neutral-800">
              {getCopy('how-to-play.header.title', 'How to Play')}
            </h1>
          </div>
          <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
            {getCopy(
              'how-to-play.header.subtitle',
              'Everything you need to know to dominate your league'
            )}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Steps Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-display font-bold text-neutral-800 mb-8 text-center">
            {getCopy('how-to-play.steps.section-title', 'The Game in 6 Steps')}
          </h2>
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden"
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-start gap-4 md:gap-6">
                    <div className="flex-shrink-0 w-14 h-14 bg-burgundy-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <step.icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-burgundy-500 font-bold text-sm">
                          Step {index + 1}
                        </span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-display font-bold text-neutral-800 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-neutral-600 mb-4">{step.description}</p>
                      {step.details.length > 0 ? (
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {step.details.map((detail, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {'linkTo' in step && step.linkTo && (
                        <Link
                          to={step.linkTo}
                          className="inline-flex items-center gap-2 mt-2 text-burgundy-600 hover:text-burgundy-700 font-medium"
                        >
                          {step.linkText || 'Learn more'}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Strategy Tips */}
        <section className="mb-16">
          <h2 className="text-2xl font-display font-bold text-neutral-800 mb-8 text-center">
            {getCopy('how-to-play.strategies.section-title', 'Strategy Tips')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategies.map((strategy, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-card border border-cream-200 p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <strategy.icon className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-neutral-800 mb-1">
                      {strategy.title}
                    </h3>
                    <p className="text-neutral-600 text-sm">{strategy.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section className="mb-16">
          <h2 className="text-2xl font-display font-bold text-neutral-800 mb-8 text-center">
            {getCopy('how-to-play.links.section-title', 'Learn More')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/scoring"
              className="bg-white rounded-2xl shadow-card border border-cream-200 p-6 hover:shadow-card-hover transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-burgundy-100 rounded-xl flex items-center justify-center">
                    <Star className="h-6 w-6 text-burgundy-600" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-neutral-800">Scoring Rules</h3>
                    <p className="text-neutral-500 text-sm">100+ ways to earn points</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-neutral-400 group-hover:text-burgundy-500 transition-colors" />
              </div>
            </Link>
            <Link
              to="/timeline"
              className="bg-white rounded-2xl shadow-card border border-cream-200 p-6 hover:shadow-card-hover transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-neutral-800">Weekly Timeline</h3>
                    <p className="text-neutral-500 text-sm">Know every deadline</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-neutral-400 group-hover:text-amber-500 transition-colors" />
              </div>
            </Link>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center pb-16">
          <div className="bg-gradient-to-r from-burgundy-500 to-burgundy-600 rounded-2xl p-8 md:p-12 text-white shadow-lg">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
              {getCopy('how-to-play.cta.title', 'Ready to Play?')}
            </h2>
            <p className="text-burgundy-100 mb-8 max-w-lg mx-auto text-lg">
              {getCopy(
                'how-to-play.cta.description',
                'Join Season 50: In the Hands of the Fans and prove you know more about Survivor strategy than your friends.'
              )}
            </p>
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-white text-burgundy-600 font-bold px-8 py-4 rounded-xl hover:bg-cream-100 transition-colors text-lg"
              >
                {getCopy('how-to-play.cta.button-logged-in', 'Go to Dashboard')}
                <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-white text-burgundy-600 font-bold px-8 py-4 rounded-xl hover:bg-cream-100 transition-colors text-lg"
              >
                {getCopy('how-to-play.cta.button-logged-out', "Join Now - It's Free")}
                <ArrowRight className="h-5 w-5" />
              </Link>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
