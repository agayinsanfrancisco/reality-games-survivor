/**
 * Trivia Progress Bar Component
 *
 * Shows progress through the 24 questions.
 */

interface TriviaProgressBarProps {
  questionsAnswered: number;
  totalQuestions: number;
  questionsCorrect: number;
}

export function TriviaProgressBar({
  questionsAnswered,
  totalQuestions,
  questionsCorrect,
}: TriviaProgressBarProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-neutral-600">
          Progress: {questionsAnswered} / {totalQuestions} questions
        </span>
        <span className="text-sm font-medium text-burgundy-600">Correct: {questionsCorrect}</span>
      </div>
      <div className="w-full bg-cream-200 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-burgundy-500 to-red-600 h-3 rounded-full transition-all duration-300"
          style={{ width: `${(questionsAnswered / totalQuestions) * 100}%` }}
        />
      </div>
    </div>
  );
}
