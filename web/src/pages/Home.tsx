/**
 * Home Page
 *
 * Landing page for Survivor Fantasy League with animated background,
 * countdown timer, and call-to-action buttons.
 *
 * Refactored from 451 lines to use extracted sub-components.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import {
  FloatingIconsLayer,
  HomeHeader,
  HeroContent,
  HomeAnimations,
} from '@/components/home';

export function Home() {
  const { user } = useAuth();
  const [startMorphing, setStartMorphing] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const contentTimer = setTimeout(() => setContentVisible(true), 500);
    const morphTimer = setTimeout(() => setStartMorphing(true), 2000);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(morphTimer);
    };
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-cream-50 relative">
      {/* Floating icons layer */}
      <FloatingIconsLayer startMorphing={startMorphing} />

      {/* Fixed Header */}
      <HomeHeader isAuthenticated={!!user} />

      {/* Main Content */}
      <main className="h-full flex flex-col items-center justify-center px-6 pt-20 pb-12 relative z-20">
        <HeroContent isAuthenticated={!!user} isVisible={contentVisible} />
      </main>

      {/* Animation styles */}
      <HomeAnimations />
    </div>
  );
}

export default Home;
