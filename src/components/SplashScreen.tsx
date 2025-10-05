import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { LogoReveal } from './LogoReveal';

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const starsRef = useRef<Array<{ x: number; y: number; z: number; r: number; s: number }>>([]);

  useEffect(() => {
    const hideTimer = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(hideTimer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth * window.devicePixelRatio);
    let height = (canvas.height = window.innerHeight * window.devicePixelRatio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const STAR_COUNT = Math.min(250, Math.floor((window.innerWidth * window.innerHeight) / 8000));

    const initStars = () => {
      starsRef.current = Array.from({ length: STAR_COUNT }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 1 + 0.5, // depth (0.5 - 1.5)
        r: Math.random() * 1.5 + 0.3, // radius
        s: Math.random() * 0.6 + 0.2, // speed
      }));
    };

    initStars();

    const onResize = () => {
      width = canvas.width = window.innerWidth * window.devicePixelRatio;
      height = canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      initStars();
    };

    window.addEventListener('resize', onResize);

    const draw = () => {
      // Space background
      ctx.fillStyle = '#020617'; // slate-950
      ctx.fillRect(0, 0, width, height);

      // Stars
      for (const star of starsRef.current) {
        const brightness = 0.8 + star.z * 0.4; // 0.8 - 1.4
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r * star.z, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = `rgba(255,255,255,${Math.min(brightness, 1)})`;
        ctx.fill();

        // subtle glow
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.r * 4 * star.z);
        gradient.addColorStop(0, `rgba(255,255,255,${0.04 * star.z})`);
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r * 4 * star.z, 0, Math.PI * 2);
        ctx.fill();

        // motion
        star.x += star.s * star.z * 0.8; // drift right
        star.y += star.s * 0.15; // slight downward drift

        // wrap around
        if (star.x > width + 2) star.x = -2;
        if (star.y > height + 2) star.y = -2;
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />

      {/* Subtle cloud overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="splash-clouds w-[200%] h-full opacity-35 will-change-transform" />
      </div>

      {/* Centered brand */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center px-6">
          <LogoReveal />
          <button
            onClick={() => setVisible(false)}
            className="mt-6 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/20"
            aria-label="Enter app"
            title="Enter"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
