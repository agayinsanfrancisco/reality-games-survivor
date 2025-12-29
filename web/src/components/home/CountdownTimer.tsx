/**
 * CountdownTimer Component
 *
 * Displays countdown to Season 50 premiere.
 * Updates every second with days, hours, and minutes remaining.
 */

import { useState, useEffect, useCallback } from 'react';

export function CountdownTimer() {
  const calculateTimeLeft = useCallback(() => {
    const target = new Date('2026-02-25T15:00:00-08:00').getTime(); // Feb 25, 2026 3pm PST
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0 };
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    };
  }, []);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  return (
    <div className="flex items-center gap-3 sm:gap-5">
      <div className="text-center">
        <div className="font-display text-5xl sm:text-6xl lg:text-7xl font-medium text-burgundy-500 tabular-nums leading-none tracking-tight">
          {timeLeft.days}
        </div>
        <div className="text-[10px] sm:text-xs tracking-[0.15em] uppercase text-neutral-400 mt-2">
          Days
        </div>
      </div>
      <span className="text-3xl sm:text-4xl text-burgundy-500/25 font-light mb-4">|</span>
      <div className="text-center">
        <div className="font-display text-5xl sm:text-6xl lg:text-7xl font-medium text-burgundy-500 tabular-nums leading-none tracking-tight">
          {String(timeLeft.hours).padStart(2, '0')}
        </div>
        <div className="text-[10px] sm:text-xs tracking-[0.15em] uppercase text-neutral-400 mt-2">
          Hours
        </div>
      </div>
      <span className="text-3xl sm:text-4xl text-burgundy-500/25 font-light mb-4">|</span>
      <div className="text-center">
        <div className="font-display text-5xl sm:text-6xl lg:text-7xl font-medium text-burgundy-500 tabular-nums leading-none tracking-tight">
          {String(timeLeft.minutes).padStart(2, '0')}
        </div>
        <div className="text-[10px] sm:text-xs tracking-[0.15em] uppercase text-neutral-400 mt-2">
          Minutes
        </div>
      </div>
    </div>
  );
}
