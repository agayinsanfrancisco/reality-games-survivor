/**
 * Scoring Rules Reference Card
 *
 * Displays the core scoring rules at the top of the admin scoring page
 */

import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useState } from 'react';

export function ScoringRulesReference() {
  const [isExpanded, setIsExpanded] = useState(false);

  const rules = [
    { points: '+0.5', description: 'Your player is shown in a confessional' },
    { points: '-5', description: 'Your player is snuffed at tribal council' },
    { points: '+5', description: 'Your player does not go to tribal council' },
    { points: '+5', description: "Your player goes to tribal council but doesn't get snuffed" },
    {
      points: '+7',
      description: 'Your player wins individual immunity (includes Final Four fire-making)',
    },
    {
      points: '+7',
      description:
        'Your player wins a combined reward/individual immunity challenge (no double points)',
    },
    { points: '+3', description: 'Your player wins an individual reward challenge' },
    { points: '+1', description: 'Your player participates in a team reward challenge and wins' },
    { points: '-2', description: 'Your player goes to tribal council' },
    { points: '-1', description: 'For each vote your player receives (does count)' },
    {
      points: '+1',
      description: "Your player's team wins a reward challenge (if 3 teams, 1st or 2nd)",
    },
    {
      points: '+1',
      description: "Your player's team wins an immunity challenge (if 3 teams, 1st or 2nd)",
    },
    {
      points: '+1',
      description:
        "Your player's team wins a combined reward/immunity challenge (no double points)",
    },
    { points: '-1', description: "Your player's team gets last place in any challenge" },
  ];

  const selectionRules = [
    'After the first episode, participants rank castaways. Picks are made in reverse order of prior season rankings (or random for new leagues).',
    'The picking order reverses each round (snake draft style).',
    'Each team picks one "starting" castaway per week to score points. The other is "benched" and does not score.',
    'A random number generator is used if no pick is made.',
    'When only one castaway remains on a team, they must be the "starting" player.',
    'If a team has no remaining castaways, they can no longer score points.',
  ];

  return (
    <div className="bg-white rounded-2xl shadow-card border border-cream-200 mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-cream-50 transition-colors rounded-2xl"
      >
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-burgundy-500" />
          <span className="font-semibold text-neutral-800">Scoring Rules Reference</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-neutral-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-neutral-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Selection & Mechanics */}
          <div className="bg-cream-50 rounded-xl p-4">
            <h4 className="font-semibold text-neutral-700 mb-2 text-sm">
              Team Selection & Mechanics
            </h4>
            <ul className="space-y-1 text-sm text-neutral-600">
              {selectionRules.map((rule, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-burgundy-500 mt-1">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Point Values */}
          <div>
            <h4 className="font-semibold text-neutral-700 mb-2 text-sm">Point Values</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {rules.map((rule, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-2 rounded-lg ${
                    rule.points.startsWith('+') ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <span
                    className={`font-mono font-bold text-sm min-w-[40px] ${
                      rule.points.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {rule.points}
                  </span>
                  <span className="text-xs text-neutral-600">{rule.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
