/**
 * Scoring Rule Row Component
 */
import { Minus, Plus, Star } from 'lucide-react';

import type { ScoringRule } from '@/types';

interface ScoringRuleRowProps {
  rule: ScoringRule;
  currentCount: number;
  onChange: (newQty: number) => void;
  isCommon?: boolean;
}

export function ScoringRuleRow({ rule, currentCount, onChange, isCommon }: ScoringRuleRowProps) {
  return (
    <div
      className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
        currentCount > 0
          ? 'bg-burgundy-50 border-burgundy-200'
          : 'bg-white border-cream-200 hover:border-cream-300'
      }`}
    >
      <div className="flex-1 min-w-0 mr-4">
        <div className="flex items-center gap-2">
          {isCommon && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
          <h4 className={`font-medium truncate ${currentCount > 0 ? 'text-burgundy-900' : 'text-neutral-800'}`}>
            {rule.name}
          </h4>
          <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${
            rule.points > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {rule.points > 0 ? '+' : ''}{rule.points}
          </span>
        </div>
        {rule.description && (
          <p className="text-xs text-neutral-500 truncate mt-0.5 group-hover:whitespace-normal group-hover:overflow-visible">
            {rule.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(0, currentCount - 1))}
          disabled={currentCount === 0}
          className={`p-1.5 rounded-lg transition-colors ${
            currentCount > 0
              ? 'bg-burgundy-200 text-burgundy-700 hover:bg-burgundy-300'
              : 'bg-cream-100 text-neutral-400 cursor-not-allowed'
          }`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className={`w-6 text-center font-bold text-lg ${
          currentCount > 0 ? 'text-burgundy-600' : 'text-neutral-400'
        }`}>
          {currentCount}
        </span>
        <button
          onClick={() => onChange(currentCount + 1)}
          className="p-1.5 bg-burgundy-500 text-white rounded-lg hover:bg-burgundy-600 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
