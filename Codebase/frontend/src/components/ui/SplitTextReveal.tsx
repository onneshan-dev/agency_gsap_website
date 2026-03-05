import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SplitTextRevealProps {
  children: string;
  className?: string;
  type?: 'chars' | 'words' | 'lines';
  stagger?: number;
  delay?: number;
  duration?: number;
  y?: number;
  rotateX?: number;
  ease?: string;
  triggerOnScroll?: boolean;
  triggerStart?: string;
}

const SplitTextReveal: React.FC<SplitTextRevealProps> = ({
  children,
  className = '',
  type = 'chars',
  stagger = 0.03,
  delay = 0,
  duration = 0.8,
  y = 100,
  rotateX = 90,
  ease = 'back.out(1.7)',
  triggerOnScroll = true,
  triggerStart = 'top 85%',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      gsap.set(elementsRef.current, { opacity: 1, y: 0, rotateX: 0 });
      return;
    }

    // Set initial state
    gsap.set(elementsRef.current, {
      opacity: 0,
      y: y,
      rotateX: rotateX,
      transformOrigin: 'center bottom',
    });

    const animationConfig = {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration,
      stagger,
      delay,
      ease,
    };

    if (triggerOnScroll) {
      ScrollTrigger.create({
        trigger: container,
        start: triggerStart,
        onEnter: () => {
          gsap.to(elementsRef.current, animationConfig);
        },
        once: true,
      });
    } else {
      gsap.to(elementsRef.current, animationConfig);
    }

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === container) {
          st.kill();
        }
      });
    };
  }, [type, stagger, delay, duration, y, rotateX, ease, triggerOnScroll, triggerStart]);

  const splitContent = () => {
    if (type === 'chars') {
      return children.split('').map((char, index) => (
        <span
          key={index}
          ref={(el) => {
            if (el) elementsRef.current[index] = el;
          }}
          className="inline-block"
          style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ));
    } else if (type === 'words') {
      return children.split(' ').map((word, index) => (
        <span
          key={index}
          ref={(el) => {
            if (el) elementsRef.current[index] = el;
          }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </span>
      ));
    }
    return children;
  };

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <div style={{ perspective: '1000px' }}>{splitContent()}</div>
    </div>
  );
};

export default SplitTextReveal;
