/**
 * FloatingIcon Component
 *
 * Floating background icon with morph-to-torch animation.
 * Creates decorative animated background elements.
 */

import { useState, useEffect } from 'react';
import { MiniTorch } from './MiniTorch';

export interface FloatingIconProps {
  icon: 'rose' | 'key' | 'ticket' | 'torch';
  position: { x: number; y: number };
  entryDelay: number;
  floatClass: string;
  shouldMorph: boolean;
  morphDelay: number;
}

export function FloatingIcon({
  icon,
  position,
  entryDelay,
  floatClass,
  shouldMorph,
  morphDelay,
}: FloatingIconProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasMorphed, setHasMorphed] = useState(icon === 'torch');

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), entryDelay);
    return () => clearTimeout(timer);
  }, [entryDelay]);

  useEffect(() => {
    if (shouldMorph && !hasMorphed && icon !== 'torch') {
      const timer = setTimeout(() => setHasMorphed(true), morphDelay);
      return () => clearTimeout(timer);
    }
  }, [shouldMorph, morphDelay, hasMorphed, icon]);

  const getEmoji = () => {
    switch (icon) {
      case 'rose':
        return '\u{1F339}';
      case 'key':
        return '\u{1F511}';
      case 'ticket':
        return '\u{1F3AB}';
      case 'torch':
        return null;
    }
  };

  return (
    <div
      className={`absolute transition-all duration-600 ${floatClass} ${
        isVisible ? 'opacity-75 scale-100' : 'opacity-0 scale-0'
      }`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
    >
      {/* Original emoji */}
      <span
        className={`text-4xl block transition-all duration-400 ${
          hasMorphed && icon !== 'torch' ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
        }`}
      >
        {icon === 'torch' ? null : getEmoji()}
      </span>

      {/* Torch replacement */}
      {icon !== 'torch' && (
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
            hasMorphed ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          }`}
        >
          <MiniTorch />
        </div>
      )}

      {/* If already a torch */}
      {icon === 'torch' && <MiniTorch />}
    </div>
  );
}
