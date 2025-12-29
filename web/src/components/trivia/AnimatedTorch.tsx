/**
 * Animated Torch Components
 */

export function AnimatedTorch({
  size = 'large',
  lit = true,
}: {
  size?: 'small' | 'large';
  lit?: boolean;
}) {
  const dimensions = size === 'large' ? { width: 80, height: 180 } : { width: 32, height: 72 };
  const scale = size === 'large' ? 1 : 0.4;

  return (
    <div className="relative flex flex-col items-center">
      {/* Glow effect */}
      {lit && (
        <div
          className="absolute -top-8 w-32 h-40 rounded-full blur-2xl"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(255, 147, 41, 0.6) 0%, rgba(255, 87, 34, 0.3) 40%, transparent 70%)',
            animation: 'glowPulse 2s ease-in-out infinite alternate',
            transform: `scale(${scale})`,
          }}
        />
      )}

      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 80 180"
        className="relative z-10"
      >
        <defs>
          <linearGradient id="torchHandleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5D4037" />
            <stop offset="30%" stopColor="#8D6E63" />
            <stop offset="70%" stopColor="#6D4C41" />
            <stop offset="100%" stopColor="#4E342E" />
          </linearGradient>
          <linearGradient id="torchBowlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD54F" />
            <stop offset="50%" stopColor="#C9A050" />
            <stop offset="100%" stopColor="#8D6E63" />
          </linearGradient>
          <filter id="flameGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Torch handle */}
        <rect x="35" y="90" width="10" height="85" rx="2" fill="url(#torchHandleGrad)" />

        {/* Torch bowl/cup */}
        <ellipse cx="40" cy="90" rx="18" ry="8" fill="url(#torchBowlGrad)" />
        <path d="M22 90 Q22 75 40 75 Q58 75 58 90" fill="url(#torchBowlGrad)" />

        {/* Flame layers - only show if lit */}
        {lit && (
          <g filter="url(#flameGlow)" style={{ transformOrigin: '40px 75px' }}>
            {/* Outer flame - deep red */}
            <path
              d="M40 10 C55 25, 65 45, 60 65 C55 80, 48 88, 40 90 C32 88, 25 80, 20 65 C15 45, 25 25, 40 10"
              fill="#B22222"
              style={{ animation: 'flameOuter 0.6s ease-in-out infinite alternate' }}
            />
            {/* Middle flame - orange */}
            <path
              d="M40 18 C52 30, 58 48, 54 65 C50 78, 45 85, 40 87 C35 85, 30 78, 26 65 C22 48, 28 30, 40 18"
              fill="#ED8936"
              style={{ animation: 'flameMid 0.5s ease-in-out infinite alternate' }}
            />
            {/* Inner flame - yellow */}
            <path
              d="M40 28 C48 38, 52 52, 48 67 C45 77, 42 83, 40 84 C38 83, 35 77, 32 67 C28 52, 32 38, 40 28"
              fill="#F6E05E"
              style={{ animation: 'flameInner 0.45s ease-in-out infinite alternate' }}
            />
            {/* Core - white/light yellow */}
            <path
              d="M40 40 C45 48, 47 58, 45 70 C43 78, 41 82, 40 82 C39 82, 37 78, 35 70 C33 58, 35 48, 40 40"
              fill="#FFFACD"
              style={{ animation: 'flameCore 0.4s ease-in-out infinite alternate' }}
            />
          </g>
        )}

        {/* Smoke for unlit torch */}
        {!lit && (
          <g className="animate-pulse opacity-30">
            <path d="M40 70 Q42 60 40 50 Q38 40 42 30" stroke="#666" strokeWidth="2" fill="none" />
          </g>
        )}
      </svg>
    </div>
  );
}

export function MiniTorchIcon({
  lit,
  snuffed,
  pulsing,
}: {
  lit: boolean;
  snuffed?: boolean;
  pulsing?: boolean;
}) {
  return (
    <div className={`relative transition-all duration-500 ${pulsing ? 'animate-pulse' : ''}`}>
      <svg width="28" height="48" viewBox="0 0 28 48" className="relative">
        {/* Handle */}
        <rect x="11" y="28" width="6" height="18" rx="1" fill={snuffed ? '#444' : '#6D4C41'} />

        {/* Bowl */}
        <ellipse cx="14" cy="28" rx="8" ry="3" fill={snuffed ? '#555' : '#C9A050'} />

        {/* Flame or smoke */}
        {lit && !snuffed && (
          <g style={{ transformOrigin: '14px 28px' }}>
            <path
              d="M14 4 C20 10, 24 16, 22 24 C20 28, 17 30, 14 30 C11 30, 8 28, 6 24 C4 16, 8 10, 14 4"
              fill="#ED8936"
              style={{ animation: 'flameOuter 0.5s ease-in-out infinite alternate' }}
            />
            <path
              d="M14 10 C18 14, 20 20, 18 26 C17 28, 15 29, 14 29 C13 29, 11 28, 10 26 C8 20, 10 14, 14 10"
              fill="#F6E05E"
              style={{ animation: 'flameInner 0.4s ease-in-out infinite alternate' }}
            />
          </g>
        )}

        {/* Snuffed smoke */}
        {snuffed && (
          <g className="animate-pulse">
            <path
              d="M14 24 Q16 18 14 12 Q12 6 16 2"
              stroke="#666"
              strokeWidth="1.5"
              fill="none"
              opacity="0.5"
            />
          </g>
        )}
      </svg>

      {/* Glow for lit torch */}
      {lit && !snuffed && (
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full blur-md"
          style={{
            background: 'radial-gradient(circle, rgba(255,147,41,0.5) 0%, transparent 70%)',
          }}
        />
      )}
    </div>
  );
}
