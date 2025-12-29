/**
 * HomeAnimations Component
 *
 * CSS keyframe animations for the home page.
 * Includes floating icons, flame effects, and fade-in animations.
 */

export function HomeAnimations() {
  return (
    <style>{`
      @keyframes float-1 {
        0%, 100% { transform: translate(0, 0) rotate(-3deg); }
        25% { transform: translate(15px, -20px) rotate(2deg); }
        50% { transform: translate(-10px, 10px) rotate(-2deg); }
        75% { transform: translate(-15px, -15px) rotate(3deg); }
      }
      @keyframes float-2 {
        0%, 100% { transform: translate(0, 0) rotate(2deg); }
        33% { transform: translate(-20px, -25px) rotate(-3deg); }
        66% { transform: translate(10px, 15px) rotate(2deg); }
      }
      @keyframes float-3 {
        0%, 100% { transform: translate(0, 0) rotate(-2deg); }
        50% { transform: translate(20px, -15px) rotate(3deg); }
      }
      @keyframes float-4 {
        0%, 100% { transform: translate(0, 0) rotate(3deg); }
        25% { transform: translate(-15px, 20px) rotate(-2deg); }
        75% { transform: translate(15px, -10px) rotate(2deg); }
      }
      @keyframes float-5 {
        0%, 100% { transform: translate(0, 0) rotate(-1deg); }
        40% { transform: translate(-10px, -20px) rotate(2deg); }
        80% { transform: translate(20px, 10px) rotate(-3deg); }
      }
      @keyframes float-6 {
        0%, 100% { transform: translate(0, 0) rotate(1deg); }
        30% { transform: translate(18px, -12px) rotate(-2deg); }
        60% { transform: translate(-12px, 18px) rotate(3deg); }
      }

      .animate-float-1 { animation: float-1 12s ease-in-out infinite; }
      .animate-float-2 { animation: float-2 14s ease-in-out infinite; }
      .animate-float-3 { animation: float-3 11s ease-in-out infinite; }
      .animate-float-4 { animation: float-4 13s ease-in-out infinite; }
      .animate-float-5 { animation: float-5 15s ease-in-out infinite; }
      .animate-float-6 { animation: float-6 16s ease-in-out infinite; }

      @keyframes flameOuter {
        0% { transform: scaleY(1) scaleX(1); }
        100% { transform: scaleY(1.06) scaleX(0.96); }
      }
      @keyframes flameMid {
        0% { transform: scaleY(1); }
        100% { transform: scaleY(1.08) translateY(-1px); }
      }
      @keyframes flameInner {
        0% { transform: scaleY(1); }
        100% { transform: scaleY(1.1); }
      }
      @keyframes flameCore {
        0% { transform: scaleY(1) scaleX(1); }
        100% { transform: scaleY(1.12) scaleX(0.95); }
      }

      @keyframes glowPulse {
        0% { opacity: 0.5; }
        100% { opacity: 0.9; }
      }

      .duration-400 { transition-duration: 400ms; }
      .duration-600 { transition-duration: 600ms; }
      .duration-800 { transition-duration: 800ms; }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .animate-fade-in-up {
        animation: fadeInUp 0.8s ease-out forwards;
        opacity: 0;
      }
    `}</style>
  );
}
