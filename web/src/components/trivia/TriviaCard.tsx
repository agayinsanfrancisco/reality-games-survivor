/**
 * Trivia Card Component
 */
import { useState, useEffect } from 'react';
import type { TriviaQuestion } from './TriviaData';
import { TRIVIA_QUESTIONS, WRONG_MESSAGES } from './TriviaData';

interface TriviaCardProps {
  question: TriviaQuestion;
  questionNumber: number;
  onAnswer: (correct: boolean) => void;
  showResult: 'correct' | 'wrong' | null;
  funFact?: string | null;
}

export function TriviaCard({
  question,
  questionNumber,
  onAnswer,
  showResult,
  funFact: _funFact,
}: TriviaCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [wrongMessage] = useState(
    () => WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)]
  );

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setIsSubmitted(true);
    const isCorrect = selectedAnswer === question.correctIndex;
    onAnswer(isCorrect);
  };

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setIsSubmitted(false);
  }, [question]);

  return (
    <div
      className={`relative transition-all duration-500 ${showResult === 'wrong' ? 'animate-burn' : ''}`}
    >
      {/* Card */}
      <div
        className={`
          relative max-w-xl mx-auto p-8 rounded-lg transform rotate-1
          transition-all duration-500
          ${showResult === 'correct' ? 'ring-4 ring-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)]' : ''}
          ${showResult === 'wrong' ? 'opacity-0 scale-95' : ''}
        `}
        style={{
          background: 'linear-gradient(135deg, #F4ECD8 0%, #E8DCC8 100%)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
        }}
      >
        {/* Burnt edge texture overlay */}
        <div
          className="absolute inset-0 rounded-lg pointer-events-none opacity-30"
          style={{
            background:
              'radial-gradient(ellipse at top left, transparent 85%, rgba(139,69,19,0.3) 100%), radial-gradient(ellipse at bottom right, transparent 85%, rgba(139,69,19,0.3) 100%)',
          }}
        />

        {/* Question number */}
        <div className="text-center mb-4">
          <span className="text-sm font-medium text-amber-800/60 tracking-widest uppercase">
            Question {questionNumber} of {TRIVIA_QUESTIONS.length}
          </span>
          <p className="text-xs text-amber-600 mt-1">Featuring: {question.castaway}</p>
        </div>

        {/* Question text */}
        <h3 className="font-display text-lg md:text-xl text-neutral-800 text-center mb-6 leading-relaxed">
          {question.question}
        </h3>

        {/* Answer options */}
        <div className="space-y-3 mb-8">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !isSubmitted && setSelectedAnswer(index)}
              disabled={isSubmitted}
              className={`
                w-full p-4 rounded-lg text-left transition-all duration-200
                flex items-center gap-4 group
                ${
                  selectedAnswer === index
                    ? 'bg-amber-800/20 border-2 border-amber-800'
                    : 'bg-white/50 border-2 border-transparent hover:bg-white/70 hover:border-amber-800/30'
                }
                ${isSubmitted && index === question.correctIndex ? 'bg-emerald-500/20 border-emerald-500' : ''}
                ${isSubmitted && selectedAnswer === index && index !== question.correctIndex ? 'bg-red-500/20 border-red-500' : ''}
                disabled:cursor-default
              `}
            >
              <span
                className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                transition-all duration-200
                ${
                  selectedAnswer === index
                    ? 'bg-amber-800 text-white'
                    : 'bg-amber-800/10 text-amber-800 group-hover:bg-amber-800/20'
                }
              `}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span className="text-neutral-700 font-medium">{option}</span>

              {/* Checkmark for correct */}
              {isSubmitted && index === question.correctIndex && (
                <span className="ml-auto text-emerald-600 text-xl">✓</span>
              )}

              {/* X for wrong */}
              {isSubmitted && selectedAnswer === index && index !== question.correctIndex && (
                <span className="ml-auto text-red-600 text-xl">✗</span>
              )}
            </button>
          ))}
        </div>

        {/* Submit button */}
        {!isSubmitted && (
          <button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className={`
              w-full py-4 rounded-lg font-display font-semibold text-lg
              transition-all duration-200
              ${
                selectedAnswer !== null
                  ? 'bg-amber-800 text-white hover:bg-amber-900 shadow-lg'
                  : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
              }
            `}
          >
            Submit Answer
          </button>
        )}

        {/* Correct answer confirmation */}
        {showResult === 'correct' && (
          <div className="mt-6 p-4 bg-green-100/50 rounded-lg border border-green-300/50">
            <p className="text-green-800 text-sm font-semibold text-center">
              🔥 Correct! Keep up the great work!
            </p>
          </div>
        )}
      </div>

      {/* Wrong answer overlay */}
      {showResult === 'wrong' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <p className="font-display text-3xl md:text-4xl text-orange-400 font-bold mb-2 text-shadow-fire">
              {wrongMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
