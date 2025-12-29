/**
 * Trivia Question Card Component
 *
 * Displays a trivia question with answer options.
 */

import { Clock, Check, X } from 'lucide-react';

interface TriviaQuestion {
  id: string;
  questionNumber: number;
  question: string;
  options: string[];
}

interface TriviaQuestionCardProps {
  question: TriviaQuestion;
  totalQuestions: number;
  timeRemaining: number;
  selectedIndex: number | null;
  showResult: boolean;
  isCorrect: boolean;
  isTimedOut: boolean;
  alreadyAnswered: boolean;
  userAnswer: {
    selectedIndex: number;
    isCorrect: boolean;
    correctIndex: number;
  } | null;
  correctIndex: number;
  funFact: string | null;
  wrongMessage: string;
  isPending: boolean;
  onAnswer: (index: number) => void;
}

export function TriviaQuestionCard({
  question,
  totalQuestions,
  timeRemaining,
  selectedIndex,
  showResult,
  isCorrect,
  isTimedOut,
  alreadyAnswered,
  userAnswer,
  correctIndex,
  funFact,
  wrongMessage,
  isPending,
  onAnswer,
}: TriviaQuestionCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-8 border-2 border-burgundy-200">
      {/* Question Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-display font-bold text-neutral-800">
            Question {question.questionNumber} of {totalQuestions}
          </h2>
        </div>
        {!alreadyAnswered && !showResult && (
          <div className="flex items-center gap-2 bg-red-50 border-2 border-red-300 rounded-xl px-4 py-2">
            <Clock className="h-5 w-5 text-red-600" />
            <span className="font-bold text-red-700 text-lg">{timeRemaining}s</span>
          </div>
        )}
      </div>

      <p className="text-2xl font-display font-bold text-neutral-800 mb-6">{question.question}</p>

      {/* Answer Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => {
          const isSelected = selectedIndex === index || userAnswer?.selectedIndex === index;
          const showCorrect = showResult || alreadyAnswered;
          const isUserAnswer = isSelected;
          const isRightAnswer = showCorrect && index === correctIndex;

          let buttonClass = 'w-full text-left p-4 rounded-xl border-2 transition-all ';
          if (alreadyAnswered) {
            if (isUserAnswer) {
              buttonClass += userAnswer?.isCorrect
                ? 'bg-green-50 border-green-300 text-green-800'
                : 'bg-red-50 border-red-300 text-red-800';
            } else if (isRightAnswer) {
              buttonClass += 'bg-green-50 border-green-300 text-green-800';
            } else {
              buttonClass += 'bg-neutral-50 border-cream-200 text-neutral-600';
            }
          } else if (showResult) {
            if (isSelected) {
              buttonClass += isCorrect
                ? 'bg-green-50 border-green-300 text-green-800'
                : 'bg-red-50 border-red-300 text-red-800';
            } else if (isRightAnswer) {
              buttonClass += 'bg-green-50 border-green-300 text-green-800';
            } else {
              buttonClass += 'bg-neutral-50 border-cream-200 text-neutral-600';
            }
          } else {
            buttonClass +=
              'bg-neutral-50 border-cream-200 text-neutral-700 hover:border-burgundy-300 hover:bg-cream-50 cursor-pointer';
          }

          return (
            <button
              key={index}
              onClick={() => onAnswer(index)}
              disabled={alreadyAnswered || showResult || isTimedOut || isPending}
              className={buttonClass}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {showResult || alreadyAnswered ? (
                  <>
                    {isUserAnswer && (
                      <span className="ml-2">
                        {userAnswer?.isCorrect || isCorrect ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <X className="h-5 w-5 text-red-600" />
                        )}
                      </span>
                    )}
                    {!isUserAnswer && isRightAnswer && (
                      <Check className="h-5 w-5 text-green-600 ml-2" />
                    )}
                  </>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {/* Result Message */}
      {(showResult || alreadyAnswered) && funFact && (
        <div
          className={`p-6 rounded-xl mb-6 ${
            userAnswer?.isCorrect || isCorrect
              ? 'bg-green-50 border-2 border-green-300'
              : 'bg-red-50 border-2 border-red-300'
          }`}
        >
          {isCorrect ? (
            <>
              <p className="text-lg font-bold text-green-800 mb-2 flex items-center gap-2">
                <span className="text-2xl">🔥</span> Correct!
              </p>
              <p className="text-sm text-neutral-700">{funFact}</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-red-800 mb-3 text-center">💀 {wrongMessage}</p>
              <p className="text-sm text-red-700 text-center mb-2">
                Correct answer:{' '}
                <span className="font-semibold">{question.options[correctIndex]}</span>
              </p>
              <p className="text-sm text-neutral-700 mb-3">{funFact}</p>
              <div className="bg-red-100 border border-red-300 rounded-lg p-3 mt-3">
                <p className="text-sm font-semibold text-red-800 text-center">
                  ⏰ You're locked out for 24 hours. Come back tomorrow to continue.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Timeout Message */}
      {isTimedOut && !showResult && (
        <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl mb-6">
          <p className="text-sm font-medium text-yellow-800 text-center">
            ⏰ Time's up! {wrongMessage}
          </p>
        </div>
      )}
    </div>
  );
}
