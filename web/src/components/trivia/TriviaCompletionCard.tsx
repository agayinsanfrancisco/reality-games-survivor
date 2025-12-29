/**
 * Trivia Completion Card Component
 *
 * Shows when user has completed all 24 questions.
 */

import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';

interface TriviaCompletionCardProps {
  daysToComplete: number;
}

export function TriviaCompletionCard({ daysToComplete }: TriviaCompletionCardProps) {
  return (
    <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-8 mb-8 text-center">
      <Trophy className="h-12 w-12 text-green-600 mx-auto mb-4" />
      <h3 className="text-2xl font-display font-bold text-green-800 mb-2">
        Congratulations! You Completed All 24 Questions!
      </h3>
      <p className="text-green-700 text-lg mb-4">
        You finished in{' '}
        <strong>
          {daysToComplete} day{daysToComplete !== 1 ? 's' : ''}
        </strong>
      </p>
      <Link
        to="/dashboard"
        className="inline-block bg-green-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-green-700 transition-colors"
      >
        Join a League Now
      </Link>
    </div>
  );
}
