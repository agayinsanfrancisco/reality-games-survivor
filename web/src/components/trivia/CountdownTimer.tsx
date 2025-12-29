/**
 * Countdown Timer Component for Trivia
 */
import { useState, useEffect, useCallback } from 'react';

export function CountdownTimer() {
  const calculateTimeLeft = useCallback(() => {
    const target = new Date('2026-02-25T15:00:00-08:00').getTime();
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
    <div className="flex items-center justify-center gap-4">
      <div className="text-center">
        <div className="font-display text-4xl md:text-5xl font-bold text-burgundy-500 tabular-nums">
          {timeLeft.days}
        </div>
        <div className="text-xs tracking-widest uppercase text-neutral-500 mt-1">Days</div>
      </div>
      <span className="text-2xl text-burgundy-500/30">:</span>
      <div className="text-center">
        <div className="font-display text-4xl md:text-5xl font-bold text-burgundy-500 tabular-nums">
          {String(timeLeft.hours).padStart(2, '0')}
        </div>
        <div className="text-xs tracking-widest uppercase text-neutral-500 mt-1">Hours</div>
      </div>
      <span className="text-2xl text-burgundy-500/30">:</span>
      <div className="text-center">
        <div className="font-display text-4xl md:text-5xl font-bold text-burgundy-500 tabular-nums">
          {String(timeLeft.minutes).padStart(2, '0')}
        </div>
        <div className="text-xs tracking-widest uppercase text-neutral-500 mt-1">Minutes</div>
      </div>
    </div>
  );
}
