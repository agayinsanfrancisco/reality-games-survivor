/**
 * Progress Tracker Component
 */
import { MiniTorchIcon } from './AnimatedTorch';

export function ProgressTracker({
  answers,
  currentQuestion,
}: {
  answers: (boolean | null)[];
  currentQuestion: number;
}) {
  return (
    <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
      {answers.map((answer, index) => (
        <MiniTorchIcon
          key={index}
          lit={answer === true || (answer === null && index <= currentQuestion)}
          snuffed={answer === false}
          pulsing={index === currentQuestion && answer === null}
        />
      ))}
    </div>
  );
}
