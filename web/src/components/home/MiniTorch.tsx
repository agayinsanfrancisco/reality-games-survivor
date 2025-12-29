/**
 * MiniTorch Component
 *
 * Animated torch SVG with flame effects for the home page.
 * Used in FloatingIcon and other decorative elements.
 */

export function MiniTorch() {
  return (
    <div className="relative flex flex-col items-center">
      {/* Glow */}
      <div
        className="absolute -top-2 w-10 h-12 rounded-full blur-lg"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(237, 137, 54, 0.45) 0%, rgba(178, 34, 34, 0.2) 40%, transparent 70%)',
          animation: 'glowPulse 1.5s ease-in-out infinite alternate',
        }}
      />
      {/* Torch SVG */}
      <svg width="32" height="65" viewBox="0 0 32 65" className="relative z-10">
        <defs>
          <linearGradient id="miniHandleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6B4423" />
            <stop offset="50%" stopColor="#A67C52" />
            <stop offset="100%" stopColor="#654321" />
          </linearGradient>
        </defs>
        {/* Handle */}
        <rect x="13" y="38" width="6" height="24" rx="1" fill="url(#miniHandleGrad)" />
        <ellipse cx="16" cy="38" rx="5" ry="2" fill="#C9A050" />
        {/* Flame layers */}
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
    </div>
  );
}
