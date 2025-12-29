/**
 * Scoring Category Accordion Component
 *
 * Collapsible section for a category of scoring rules.
 */

import { ChevronDown, ChevronRight, Star } from 'lucide-react';
import { ScoringRuleRow } from './ScoringRuleRow';
import type { ScoringRule } from '@/types';

interface ScoringCategoryAccordionProps {
  category: string;
  rules: ScoringRule[];
  scores: Record<string, number>;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdateScore: (ruleId: string, value: number) => void;
  isFeatured?: boolean;
}

export function ScoringCategoryAccordion({
  category,
  rules,
  scores,
  isExpanded,
  onToggle,
  onUpdateScore,
  isFeatured = false,
}: ScoringCategoryAccordionProps) {
  const categoryTotal = rules.reduce((sum, rule) => {
    const qty = scores[rule.id] || 0;
    return sum + rule.points * qty;
  }, 0);
  const hasScores = rules.some((rule) => (scores[rule.id] || 0) > 0);

  if (isFeatured) {
    return (
      <div className="bg-white rounded-2xl shadow-elevated overflow-hidden border-2 border-burgundy-200">
        <button
          onClick={onToggle}
          className="w-full p-4 border-b border-cream-100 bg-gradient-to-r from-burgundy-50 to-cream-50 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-burgundy-500 fill-burgundy-500" />
            <h3 className="font-semibold text-burgundy-700">{category}</h3>
            <span className="text-xs bg-burgundy-100 text-burgundy-600 px-2 py-0.5 rounded-full font-bold">
              {rules.length}
            </span>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-burgundy-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-burgundy-400" />
          )}
        </button>
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-cream-100">
            {rules.map((rule) => (
              <ScoringRuleRow
                key={rule.id}
                rule={rule}
                currentCount={scores[rule.id] || 0}
                onChange={(value: number) => onUpdateScore(rule.id, value)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-elevated overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 border-b border-cream-100 bg-cream-50 flex items-center justify-between hover:bg-cream-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-neutral-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-neutral-400" />
          )}
          <h3 className="font-semibold text-neutral-800">{category}</h3>
          <span className="text-xs bg-cream-200 text-neutral-500 px-2 py-0.5 rounded-full font-bold">
            {rules.length}
          </span>
        </div>
        {hasScores && (
          <span
            className={`font-bold text-sm ${categoryTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {categoryTotal >= 0 ? '+' : ''}
            {categoryTotal}
          </span>
        )}
      </button>
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-cream-100">
          {rules.map((rule) => (
            <ScoringRuleRow
              key={rule.id}
              rule={rule}
              currentCount={scores[rule.id] || 0}
              onChange={(value: number) => onUpdateScore(rule.id, value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
