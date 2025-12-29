/**
 * Trivia Question Card Component
 * Displays the question and answer options
 */
import { Calendar } from 'lucide-react';
import { TriviaAnswerOption } from './TriviaAnswerOption';

interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  castaway_name: string | null;
}

interface TriviaQuestionCardProps {
  question: TriviaQuestion | null;
  selectedIndex: number | null;
  showResult: boolean;
  isCorrect: boolean;
  funFact: string | null;
  alreadyAnswered: boolean;
  userAnswer: {
    selectedIndex: number;
    isCorrect: boolean;
    answeredAt: string;
  } | null;
  correctIndex: number;
  isSubmitting: boolean;
  onAnswer: (index: number) => void;
}

export function TriviaQuestionCard({
  question,
  selectedIndex,
  showResult,
  isCorrect,
  funFact,
  alreadyAnswered,
  userAnswer,
  correctIndex,
  isSubmitting,
  onAnswer,
}: TriviaQuestionCardProps) {
  if (!question) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-12 border border-cream-200 text-center">
        <Calendar className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-neutral-800 mb-2">No Question Today</h3>
        <p className="text-neutral-500">
          Check back tomorrow for a new trivia question!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-8 border border-cream-200">
      {question.castaway_name && (
        <div className="text-sm text-burgundy-600 font-medium mb-2">
          About: {question.castaway_name}
        </div>
      )}
      
      <h2 className="text-2xl font-display font-bold text-neutral-800 mb-6">
        {question.question}
      </h2>

      {/* Answer Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => {
          const isSelected = selectedIndex === index || userAnswer?.selectedIndex === index;
          const isRightAnswer = (showResult || alreadyAnswered) && index === correctIndex;
          const isUserCorrect = userAnswer?.isCorrect ?? isCorrect;

          return (
            <TriviaAnswerOption
              key={index}
              option={option}
              index={index}
              isSelected={isSelected}
              isCorrect={isUserCorrect && isSelected}
              isRightAnswer={isRightAnswer}
              showResult={showResult}
              alreadyAnswered={alreadyAnswered}
              disabled={alreadyAnswered || showResult || isSubmitting}
              onClick={() => onAnswer(index)}
            />
          );
        })}
      </div>

      {/* Result Message */}
      {(showResult || alreadyAnswered) && funFact && (
        <div className={`p-4 rounded-xl mb-6 ${
          (userAnswer?.isCorrect || isCorrect) 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <p className="text-sm font-medium mb-2">
            {(userAnswer?.isCorrect || isCorrect) ? '✅ Correct!' : '❌ Incorrect'}
          </p>
          <p className="text-sm text-neutral-700">{funFact}</p>
        </div>
      )}

      {/* Already Answered Message */}
      {alreadyAnswered && (
        <div className="text-center p-4 bg-cream-50 rounded-xl border border-cream-200">
          <p className="text-neutral-600">
            You've already answered today's question. Come back tomorrow for a new one!
          </p>
        </div>
      )}
    </div>
  );
}
