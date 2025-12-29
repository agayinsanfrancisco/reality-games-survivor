/**
 * Trivia Header Component
 * Page header for trivia pages
 */
import { Flame } from 'lucide-react';

interface TriviaHeaderProps {
  title: string;
  subtitle: string;
}

export function TriviaHeader({ title, subtitle }: TriviaHeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-3 mb-4">
        <Flame className="h-10 w-10 text-orange-500" />
        <h1 className="text-4xl font-display font-bold text-neutral-800">{title}</h1>
      </div>
      <p className="text-neutral-600 text-lg">{subtitle}</p>
    </div>
  );
}
