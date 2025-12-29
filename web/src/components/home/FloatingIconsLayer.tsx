/**
 * FloatingIconsLayer Component
 *
 * Layer of floating icons that animate and morph into torches.
 * Used as decorative background for the home page.
 */

import { useMemo } from 'react';
import { FloatingIcon } from './FloatingIcon';

interface FloatingIconsLayerProps {
  startMorphing: boolean;
}

export function FloatingIconsLayer({ startMorphing }: FloatingIconsLayerProps) {
  // Define floating icons with positions - spread around edges
  const floatingIcons = useMemo(
    () => [
      { icon: 'rose' as const, position: { x: 5, y: 8 }, floatClass: 'animate-float-1' },
      { icon: 'key' as const, position: { x: 92, y: 6 }, floatClass: 'animate-float-2' },
      { icon: 'ticket' as const, position: { x: 3, y: 25 }, floatClass: 'animate-float-3' },
      { icon: 'rose' as const, position: { x: 95, y: 18 }, floatClass: 'animate-float-4' },
      { icon: 'key' as const, position: { x: 4, y: 45 }, floatClass: 'animate-float-5' },
      { icon: 'ticket' as const, position: { x: 96, y: 40 }, floatClass: 'animate-float-6' },
      { icon: 'torch' as const, position: { x: 5, y: 62 }, floatClass: 'animate-float-1' },
      { icon: 'rose' as const, position: { x: 94, y: 58 }, floatClass: 'animate-float-2' },
      { icon: 'key' as const, position: { x: 8, y: 78 }, floatClass: 'animate-float-3' },
      { icon: 'ticket' as const, position: { x: 95, y: 75 }, floatClass: 'animate-float-4' },
      { icon: 'rose' as const, position: { x: 15, y: 88 }, floatClass: 'animate-float-5' },
      { icon: 'key' as const, position: { x: 88, y: 90 }, floatClass: 'animate-float-6' },
      { icon: 'torch' as const, position: { x: 8, y: 35 }, floatClass: 'animate-float-2' },
      { icon: 'ticket' as const, position: { x: 92, y: 52 }, floatClass: 'animate-float-3' },
    ],
    []
  );

  let morphIndex = 0;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {floatingIcons.map((item, index) => {
        const isTorch = item.icon === 'torch';
        const currentMorphIndex = isTorch ? -1 : morphIndex++;
        return (
          <FloatingIcon
            key={index}
            icon={item.icon}
            position={item.position}
            entryDelay={200 + index * 120}
            floatClass={item.floatClass}
            shouldMorph={startMorphing}
            morphDelay={currentMorphIndex * 500}
          />
        );
      })}
    </div>
  );
}
