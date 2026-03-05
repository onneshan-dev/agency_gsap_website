import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

const HOVER_SELECTOR = 'a, button, [role="button"], input, textarea, select, [data-cursor]';

const CustomCursor: React.FC = () => {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    gsap.set([ring, dot], { xPercent: -50, yPercent: -50, x: -100, y: -100, opacity: 0 });

    // quickTo — far faster than gsap.to() for mousemove
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.55, ease: 'power3.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.55, ease: 'power3.out' });
    const dotX  = gsap.quickTo(dot,  'x', { duration: 0.06 });
    const dotY  = gsap.quickTo(dot,  'y', { duration: 0.06 });

    let visible = false;

    const onMove = (e: MouseEvent) => {
      if (!visible) {
        visible = true;
        gsap.to([ring, dot], { opacity: 1, duration: 0.35 });
      }
      ringX(e.clientX);
      ringY(e.clientY);
      dotX(e.clientX);
      dotY(e.clientY);
    };

    // Event delegation — no DOM re-queries, works with dynamic content
    const onOver = (e: MouseEvent) => {
      if ((e.target as Element).closest(HOVER_SELECTOR)) {
        gsap.to(ring, {
          scale: 2.0,
          borderColor: 'rgba(0,212,170,0.9)',
          boxShadow: '0 0 20px rgba(0,212,170,0.35), inset 0 0 12px rgba(0,212,170,0.08)',
          duration: 0.3,
          ease: 'power2.out',
        });
        gsap.to(dot, { scale: 0, duration: 0.15 });
      }
    };

    const onOut = (e: MouseEvent) => {
      const target = (e.target as Element).closest(HOVER_SELECTOR);
      if (target && !target.contains(e.relatedTarget as Node)) {
        gsap.to(ring, {
          scale: 1,
          borderColor: 'rgba(0,212,170,0.55)',
          boxShadow: '0 0 10px rgba(0,212,170,0.15)',
          duration: 0.5,
          ease: 'elastic.out(1, 0.45)',
        });
        gsap.to(dot, { scale: 1, duration: 0.35, ease: 'elastic.out(1, 0.45)' });
      }
    };

    const onDown = () => {
      gsap.to(ring, { scale: 0.75, duration: 0.1 });
      gsap.to(dot,  { scale: 1.8, duration: 0.1 });
    };

    const onUp = () => {
      gsap.to(ring, { scale: 1, duration: 0.3, ease: 'back.out(3)' });
      gsap.to(dot,  { scale: 1, duration: 0.3, ease: 'back.out(3)' });
    };

    const onLeave = () => {
      gsap.to([ring, dot], { opacity: 0, duration: 0.3 });
      visible = false;
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover',   onOver);
    document.addEventListener('mouseout',    onOut);
    document.addEventListener('mousedown',   onDown);
    document.addEventListener('mouseup',     onUp);
    document.addEventListener('mouseleave',  onLeave);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover',  onOver);
      document.removeEventListener('mouseout',   onOut);
      document.removeEventListener('mousedown',  onDown);
      document.removeEventListener('mouseup',    onUp);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <>
      {/* Outer ring — emerald accent, lags for trailing feel */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
        style={{
          width: 36,
          height: 36,
          border: '1.5px solid rgba(0,212,170,0.55)',
          boxShadow: '0 0 10px rgba(0,212,170,0.15)',
          willChange: 'transform',
        }}
      />

      {/* Inner dot — white, tracks instantly for precision */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
        style={{
          width: 5,
          height: 5,
          backgroundColor: '#ffffff',
          boxShadow: '0 0 6px rgba(0,212,170,0.6)',
          willChange: 'transform',
        }}
      />
    </>
  );
};

export default CustomCursor;
