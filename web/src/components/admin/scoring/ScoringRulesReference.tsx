/**
 * Scoring Rules Reference Card
 *
 * Displays the core scoring rules at the top of the admin scoring page
 */

import { ChevronDown, ChevronUp, Star } from 'lucide-react';
import { useState } from 'react';

export function ScoringRulesReference() {
  const [isExpanded, setIsExpanded] = useState(true);

  // Most Scored Rules - displayed prominently at the top
  const mostScoredRules = [
    { points: '+0.5', description: 'Your player is shown in a confessional' },
    {
      points: '+1',
      description: "Your player's team wins a reward challenge (if 3 teams, get 1st or 2nd)",
    },
    {
      points: '+1',
      description: "Your player's team wins an immunity challenge (if 3 teams, get 1st or 2nd)",
    },
    {
      points: '+1',
      description:
        "Your player's team wins a combined reward/immunity challenge (no double points; if 3 teams, get 1st or 2nd)",
    },
    {
      points: '-1',
      description:
        "Your player's team gets last place in an immunity, reward, or combined immunity/reward challenge",
    },
    { points: '+5', description: "Your player doesn't go to tribal council" },
    { points: '-2', description: 'Your player goes to tribal council' },
    {
      points: '+5',
      description: 'Your player goes to tribal council but does not get snuffed',
    },
    {
      points: '-1',
      description: 'For each vote your player receives to vote them out (does count)',
    },
    { points: '+3', description: 'Your player wins an individual reward challenge' },
    {
      points: '+1',
      description: 'Your player participates in a team reward challenge and wins',
    },
    {
      points: '+7',
      description:
        'Your player wins individual immunity (includes the Final Four fire-making challenge)',
    },
    {
      points: '+7',
      description:
        'Your player wins a combined reward/individual immunity challenge (no double points)',
    },
    { points: '-5', description: 'Your player is snuffed at tribal council' },
  ];

  return (
    <div className="bg-gradient-to-r from-burgundy-50 to-amber-50 rounded-2xl shadow-card border-2 border-burgundy-200 mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-burgundy-50/50 transition-colors rounded-2xl"
      >
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-burgundy-500" />
          <span className="font-bold text-burgundy-800 text-lg">Most Scored Rules</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-burgundy-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-burgundy-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {mostScoredRules.map((rule, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  rule.points.startsWith('+')
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <span
                  className={`font-mono font-bold text-base min-w-[50px] ${
                    rule.points.startsWith('+') ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {rule.points}
                </span>
                <span className="text-sm text-neutral-700">{rule.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
