import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Loader2,
  Trophy,
  Users,
  Flame,
  MessageCircle,
  Target,
  Gem,
  Star,
  Award,
  Search
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '@/lib/auth';
import { Navigation } from '@/components/Navigation';

interface ScoringRule {
  id: string;
  code: string;
  name: string;
  description: string | null;
  points: number;
  category: string | null;
  is_negative: boolean;
  is_active: boolean;
}

// Category display order and metadata
const CATEGORY_CONFIG: Record<string, { icon: typeof Trophy; color: string; examples?: string[] }> = {
  'Survival': {
    icon: Flame,
    color: 'orange',
    examples: [
      'Player survives the episode without being voted out',
      'Player makes it to the merge',
      'Player reaches the Final Tribal Council',
    ],
  },
  'Tribal Council': {
    icon: Users,
    color: 'blue',
    examples: [
      'Player votes for the person who gets eliminated',
      'Player receives votes but survives',
      'Player is blindsided (didn\'t play an idol when they had one)',
    ],
  },
  'Pre-Merge Challenges': {
    icon: Trophy,
    color: 'green',
    examples: [
      'Player\'s tribe wins immunity challenge',
      'Player\'s tribe wins reward challenge',
      'Player sits out of a challenge',
    ],
  },
  'Post-Merge Challenges': {
    icon: Award,
    color: 'purple',
    examples: [
      'Player wins individual immunity',
      'Player wins individual reward',
      'Player wins the final immunity challenge',
    ],
  },
  'Strategic Play': {
    icon: Target,
    color: 'red',
    examples: [
      'Player orchestrates a blindside',
      'Player flips on their alliance',
      'Player successfully manipulates another player',
    ],
  },
  'Social Game': {
    icon: MessageCircle,
    color: 'teal',
    examples: [
      'Player is shown building strong relationships',
      'Player mediates conflict between others',
      'Player receives votes at Final Tribal Council',
    ],
  },
  'Idols & Advantages': {
    icon: Gem,
    color: 'yellow',
    examples: [
      'Player finds a hidden immunity idol',
      'Player successfully plays an idol to save themselves',
      'Player plays an idol for another player',
    ],
  },
  'Confessionals': {
    icon: MessageCircle,
    color: 'indigo',
    examples: [
      'Player has a confessional during the episode',
      'Player has a memorable/viral confessional moment',
    ],
  },
  'Bonus': {
    icon: Star,
    color: 'gold',
    examples: [
      'Player wins fan favorite',
      'Player makes a big move that changes the game',
    ],
  },
  'Penalties': {
    icon: Target,
    color: 'red',
    examples: [
      'Player is eliminated',
      'Player quits the game',
      'Player is medically evacuated',
    ],
  },
};

const CATEGORY_ORDER = [
  'Survival',
  'Tribal Council',
  'Pre-Merge Challenges',
  'Post-Merge Challenges',
  'Strategic Play',
  'Social Game',
  'Idols & Advantages',
  'Confessionals',
  'Bonus',
  'Penalties',
];

export default function ScoringRules() {
  const { user } = useAuth();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    // Start with all categories expanded
    return CATEGORY_ORDER.reduce((acc, cat) => ({ ...acc, [cat]: true }), {});
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all active scoring rules
  const { data: rules, isLoading } = useQuery({
    queryKey: ['public-scoring-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scoring_rules')
        .select('*')
        .eq('is_active', true)
        .order('category')
        .order('sort_order')
        .order('points', { ascending: false });
      if (error) throw error;
      return (data || []) as ScoringRule[];
    },
  });

  // Filter rules by search
  const filteredRules = useMemo(() => {
    if (!rules) return [];
    if (!searchQuery.trim()) return rules;

    const query = searchQuery.toLowerCase();
    return rules.filter(rule =>
      rule.name.toLowerCase().includes(query) ||
      rule.description?.toLowerCase().includes(query) ||
      rule.code.toLowerCase().includes(query)
    );
  }, [rules, searchQuery]);

  // Group rules by category
  const groupedRules = useMemo(() => {
    const groups: Record<string, ScoringRule[]> = {};

    // Initialize with ordered categories
    CATEGORY_ORDER.forEach(cat => {
      groups[cat] = [];
    });
    groups['Other'] = [];

    filteredRules.forEach(rule => {
      const category = rule.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(rule);
    });

    return groups;
  }, [filteredRules]);

  // Stats
  const stats = useMemo(() => {
    if (!rules) return { total: 0, positive: 0, negative: 0, maxPoints: 0, minPoints: 0 };

    const positive = rules.filter(r => !r.is_negative);
    const negative = rules.filter(r => r.is_negative);

    return {
      total: rules.length,
      positive: positive.length,
      negative: negative.length,
      maxPoints: Math.max(...positive.map(r => r.points)),
      minPoints: Math.min(...negative.map(r => r.points)),
    };
  }, [rules]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const expandAll = () => {
    setExpandedCategories(
      CATEGORY_ORDER.reduce((acc, cat) => ({ ...acc, [cat]: true }), { Other: true })
    );
  };

  const collapseAll = () => {
    setExpandedCategories(
      CATEGORY_ORDER.reduce((acc, cat) => ({ ...acc, [cat]: false }), { Other: false })
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream-100 to-cream-200">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-burgundy-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-100 to-cream-200">
      <Navigation />

      {/* Header */}
      <div className="px-6 py-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <BookOpen className="h-10 w-10 text-burgundy-500" />
          <h1 className="text-4xl font-display font-bold text-neutral-800">
            Scoring Rules
          </h1>
        </div>
        <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
          Every strategic move counts. Here's how points are earned (and lost) in Survivor Fantasy League.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="max-w-4xl mx-auto px-6 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-card p-4 border border-cream-200 text-center">
            <p className="text-3xl font-bold text-burgundy-500">{stats.total}</p>
            <p className="text-neutral-500 text-sm">Total Rules</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.positive}</p>
            <p className="text-neutral-500 text-sm">Ways to Earn Points</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-red-600">{stats.negative}</p>
            <p className="text-neutral-500 text-sm">Penalties</p>
          </div>
          <div className="bg-burgundy-50 border border-burgundy-200 rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-burgundy-600">+{stats.maxPoints}</p>
            <p className="text-neutral-500 text-sm">Max Single Action</p>
          </div>
        </div>
      </div>

      {/* How Scoring Works */}
      <div className="max-w-4xl mx-auto px-6 mb-8">
        <div className="bg-white rounded-2xl shadow-card p-6 border border-cream-200">
          <h2 className="text-xl font-display font-bold text-neutral-800 mb-4">
            How Scoring Works
          </h2>
          <div className="space-y-3 text-neutral-600">
            <p>
              <strong>1. Draft your team:</strong> You'll draft 2 castaways before the season premiere.
            </p>
            <p>
              <strong>2. Make weekly picks:</strong> Each week, choose which of your 2 castaways to "play" for that episode.
            </p>
            <p>
              <strong>3. Earn points:</strong> Your picked castaway earns (or loses) points based on what happens during the episode.
            </p>
            <p>
              <strong>4. Compete:</strong> The player with the most total points at the end of the season wins!
            </p>
          </div>
          <div className="mt-4 p-4 bg-burgundy-50 rounded-xl border border-burgundy-100">
            <p className="text-burgundy-700 text-sm">
              <strong>Pro tip:</strong> Study confessional counts, challenge performance, and edit visibility when making your weekly picks. A castaway with a lot of screen time often earns more points!
            </p>
          </div>
        </div>
      </div>

      {/* Search & Controls */}
      <div className="max-w-4xl mx-auto px-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rules..."
              className="input pl-10 w-full"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="btn btn-secondary text-sm"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="btn btn-secondary text-sm"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Rules by Category */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        <div className="space-y-4">
          {[...CATEGORY_ORDER, 'Other'].map((category) => {
            const categoryRules = groupedRules[category];
            if (!categoryRules || categoryRules.length === 0) return null;

            const config = CATEGORY_CONFIG[category] || { icon: Star, color: 'gray' };
            const Icon = config.icon;
            const isExpanded = expandedCategories[category];

            // Calculate category totals
            const totalPositive = categoryRules
              .filter(r => !r.is_negative)
              .reduce((sum, r) => sum + r.points, 0);
            const totalNegative = categoryRules
              .filter(r => r.is_negative)
              .reduce((sum, r) => sum + Math.abs(r.points), 0);

            return (
              <div
                key={category}
                className="bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-6 py-4 flex items-center gap-4 hover:bg-cream-50 transition-colors"
                >
                  <div className={`p-2 rounded-xl bg-${config.color}-100`}>
                    <Icon className={`h-5 w-5 text-${config.color}-600`} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-display font-bold text-neutral-800">
                      {category}
                    </h3>
                    <p className="text-neutral-500 text-sm">
                      {categoryRules.length} rule{categoryRules.length !== 1 ? 's' : ''}
                      {totalPositive > 0 && (
                        <span className="text-green-600 ml-2">
                          up to +{totalPositive} pts
                        </span>
                      )}
                      {totalNegative > 0 && (
                        <span className="text-red-500 ml-2">
                          -{totalNegative} pts possible
                        </span>
                      )}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-neutral-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-neutral-400" />
                  )}
                </button>

                {/* Rules List */}
                {isExpanded && (
                  <div className="border-t border-cream-200">
                    {/* Examples if available */}
                    {config.examples && config.examples.length > 0 && (
                      <div className="px-6 py-3 bg-cream-50 border-b border-cream-200">
                        <p className="text-neutral-500 text-sm font-medium mb-1">Examples:</p>
                        <ul className="text-neutral-600 text-sm space-y-1">
                          {config.examples.slice(0, 3).map((example, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-burgundy-400 mt-1">•</span>
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Rules */}
                    <div className="divide-y divide-cream-100">
                      {categoryRules.map((rule) => (
                        <div
                          key={rule.id}
                          className="px-6 py-4 flex items-start gap-4 hover:bg-cream-50 transition-colors"
                        >
                          <span
                            className={`font-mono text-sm font-bold px-3 py-1 rounded-lg flex-shrink-0 ${
                              rule.is_negative
                                ? 'bg-red-100 text-red-600'
                                : 'bg-green-100 text-green-600'
                            }`}
                          >
                            {rule.is_negative ? '' : '+'}{rule.points}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-neutral-800 font-medium">
                              {rule.name}
                            </p>
                            {rule.description && (
                              <p className="text-neutral-500 text-sm mt-1">
                                {rule.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-6 pb-16 text-center">
        <div className="bg-burgundy-500 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-display font-bold mb-4">
            Ready to Put Your Survivor Knowledge to the Test?
          </h2>
          <p className="text-burgundy-100 mb-6 max-w-lg mx-auto">
            Join Season 50 and prove you know more about Survivor strategy than your friends.
          </p>
          {user ? (
            <Link
              to="/dashboard"
              className="inline-block bg-white text-burgundy-600 font-bold px-8 py-3 rounded-xl hover:bg-cream-100 transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/signup"
              className="inline-block bg-white text-burgundy-600 font-bold px-8 py-3 rounded-xl hover:bg-cream-100 transition-colors"
            >
              Join Now - It's Free
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
