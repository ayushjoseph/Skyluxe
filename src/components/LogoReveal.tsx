import { memo, useLayoutEffect, useRef } from 'react';

// Lightweight logo reveal: star mark is path-drawn; wordmark letters fade/slide in with a shimmer
export const LogoReveal = memo(function LogoReveal() {
  const title = 'Skyluxe';
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wordmarkRef = useRef<HTMLHeadingElement | null>(null);
  const yRef = useRef<HTMLSpanElement | null>(null);
  const yIndex = title.toLowerCase().indexOf('y');

  useLayoutEffect(() => {
    const compute = () => {
      const container = containerRef.current;
      const word = wordmarkRef.current;
      const y = yRef.current;
      if (!container || !word || !y) return;
      const wordRect = word.getBoundingClientRect();
      const yRect = y.getBoundingClientRect();
      const offset = Math.max(0, Math.round(yRect.left - wordRect.left));
      container.style.setProperty('--tagline-x', `${offset}px`);
    };

    compute();
    const onResize = () => compute();
    window.addEventListener('resize', onResize);
    window.addEventListener('load', compute);
    const id = window.setTimeout(compute, 250);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('load', compute);
      window.clearTimeout(id);
    };
  }, []);

  return (
    <div ref={containerRef} className="logo-reveal select-none">
      <div className="logo-mark" aria-hidden>
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Stylized star/flare */}
          <path
            className="logo-mark-stroke"
            d="M36 6 L40 24 L60 28 L40 32 L36 50 L32 32 L12 28 L32 24 Z"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            className="logo-mark-fill"
            d="M36 6 L40 24 L60 28 L40 32 L36 50 L32 32 L12 28 L32 24 Z"
            fill="url(#glo)"
            opacity="0.0"
          />
          <defs>
            <radialGradient id="glo" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(36 30) rotate(90) scale(28)">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <h1 ref={wordmarkRef} className="logo-wordmark" aria-label="Skyluxe">
        {Array.from(title).map((ch, i) => {
          const isY = i === yIndex;
          return (
            <span
              ref={isY ? yRef : undefined}
              className="logo-letter"
              style={{ ['--i' as any]: i }}
              key={i}
            >
              {ch}
            </span>
          );
        })}
      </h1>
      <p className="logo-tagline">Climate Analyzer</p>
      <div className="logo-shimmer" aria-hidden />
    </div>
  );
});
