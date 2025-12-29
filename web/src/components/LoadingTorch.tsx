/**
 * LoadingTorch Component
 *
 * Animated torch that twirls/spins for loading states.
 * Used in ProtectedRoute and other loading screens.
 */

export function LoadingTorch() {
  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Glow effect */}
      <div
        className="absolute -top-2 w-16 h-20 rounded-full blur-xl"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(237, 137, 54, 0.5) 0%, rgba(178, 34, 34, 0.3) 40%, transparent 70%)',
          animation: 'glowPulse 1.5s ease-in-out infinite alternate',
        }}
      />
      
      {/* Torch SVG with twirl animation */}
      <svg
        width="48"
        height="96"
        viewBox="0 0 32 65"
        className="relative z-10"
        style={{
          animation: 'torchTwirl 2s ease-in-out infinite',
        }}
      >
        <defs>
          <linearGradient id="loadingHandleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6B4423" />
            <stop offset="50%" stopColor="#A67C52" />
            <stop offset="100%" stopColor="#654321" />
          </linearGradient>
        </defs>
        
        {/* Handle */}
        <rect x="13" y="38" width="6" height="24" rx="1" fill="url(#loadingHandleGrad)" />
        <ellipse cx="16" cy="38" rx="5" ry="2" fill="#C9A050" />
        
        {/* Flame layers with flicker */}
        <g style={{ transformOrigin: '16px 38px' }}>
          <path
            d="M16 4 C24 12, 28 20, 25 30 C22 36, 19 39, 16 40 C13 39, 10 36, 7 30 C4 20, 8 12, 16 4"
            fill="#B22222"
            style={{ animation: 'flameOuter 0.5s ease-in-out infinite alternate' }}
          />
          <path
            d="M16 9 C22 15, 24 22, 22 30 C20 35, 18 38, 16 39 C14 38, 12 35, 10 30 C8 22, 10 15, 16 9"
            fill="#ED8936"
            style={{ animation: 'flameMid 0.45s ease-in-out infinite alternate' }}
          />
          <path
            d="M16 14 C20 19, 21 25, 19 32 C18 36, 17 38, 16 38 C15 38, 14 36, 13 32 C11 25, 12 19, 16 14"
            fill="#F6E05E"
            style={{ animation: 'flameInner 0.4s ease-in-out infinite alternate' }}
          />
          <path
            d="M16 19 C18 23, 19 27, 18 33 C17 35, 16 37, 16 37 C16 37, 15 35, 14 33 C13 27, 14 23, 16 19"
            fill="#FFFACD"
            style={{ animation: 'flameCore 0.35s ease-in-out infinite alternate' }}
          />
        </g>
      </svg>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes torchTwirl {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          25% {
            transform: rotate(90deg) scale(1.05);
          }
          50% {
            transform: rotate(180deg) scale(1);
          }
          75% {
            transform: rotate(270deg) scale(1.05);
          }
        }
        
        @keyframes glowPulse {
          0% {
            opacity: 0.5;
            transform: scale(1);
          }
          100% {
            opacity: 0.9;
            transform: scale(1.1);
          }
        }
        
        @keyframes flameOuter {
          0% {
            transform: scaleY(1) scaleX(1);
            opacity: 1;
          }
          100% {
            transform: scaleY(1.06) scaleX(0.96);
            opacity: 0.9;
          }
        }
        
        @keyframes flameMid {
          0% {
            transform: scaleY(1);
          }
          100% {
            transform: scaleY(1.08) translateY(-1px);
          }
        }
        
        @keyframes flameInner {
          0% {
            transform: scaleY(1);
          }
          100% {
            transform: scaleY(1.1);
          }
        }
        
        @keyframes flameCore {
          0% {
            transform: scaleY(1) scaleX(1);
          }
          100% {
            transform: scaleY(1.12) scaleX(0.95);
          }
        }
      `}</style>
    </div>
  );
}
