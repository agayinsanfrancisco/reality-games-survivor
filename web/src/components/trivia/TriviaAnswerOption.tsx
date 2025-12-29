/**
 * Trivia Answer Option Component
 * Individual answer button with state handling
 */
import { Check, X } from 'lucide-react';

interface TriviaAnswerOptionProps {
  option: string;
  index: number;
  isSelected: boolean;
  isCorrect: boolean;
  isRightAnswer: boolean;
  showResult: boolean;
  alreadyAnswered: boolean;
  disabled: boolean;
  onClick: () => void;
}

export function TriviaAnswerOption({
  option,
  index: _index,
  isSelected,
  isCorrect,
  isRightAnswer,
  showResult,
  alreadyAnswered,
  disabled,
  onClick,
}: TriviaAnswerOptionProps) {
  const showCorrect = showResult || alreadyAnswered;

  let buttonClass = 'w-full text-left p-4 rounded-xl border-2 transition-all ';
  
  if (alreadyAnswered) {
    if (isSelected) {
      buttonClass += isCorrect
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
      buttonClass += 'bg-neutral-50 border-cream-200 text-neutral-600 hover:border-burgundy-300';
    }
  } else {
    buttonClass += 'bg-neutral-50 border-cream-200 text-neutral-700 hover:border-burgundy-300 hover:bg-cream-50 cursor-pointer';
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={buttonClass}
    >
      <div className="flex items-center justify-between">
        <span>{option}</span>
        {showCorrect && (
          <>
            {isSelected && (
              <span className="ml-2">
                {isCorrect ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <X className="h-5 w-5 text-red-600" />
                )}
              </span>
            )}
            {!isSelected && isRightAnswer && (
              <Check className="h-5 w-5 text-green-600 ml-2" />
            )}
          </>
        )}
      </div>
    </button>
  );
}
