/**
 * Trivia Stats Card Component
 * Displays user's trivia statistics
 */
interface TriviaStats {
  total_answered: number;
  total_correct: number;
  current_streak: number;
  longest_streak: number;
  perfect_days: number;
}

interface TriviaStatsCardProps {
  stats: TriviaStats;
}

export function TriviaStatsCard({ stats }: TriviaStatsCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-6 border border-cream-200">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-burgundy-600">{stats.total_answered}</div>
          <div className="text-sm text-neutral-500">Total</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">{stats.total_correct}</div>
          <div className="text-sm text-neutral-500">Correct</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-orange-600">{stats.current_streak}</div>
          <div className="text-sm text-neutral-500">Streak</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-600">{stats.longest_streak}</div>
          <div className="text-sm text-neutral-500">Best Streak</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-yellow-600">{stats.perfect_days}</div>
          <div className="text-sm text-neutral-500">Perfect</div>
        </div>
      </div>
    </div>
  );
}
