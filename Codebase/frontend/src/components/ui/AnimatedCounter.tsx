import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface AnimatedCounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  label?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  end,
  suffix = '',
  prefix = '',
  duration = 2,
  className = '',
  label,
}) => {
  const counterRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const counter = counterRef.current;
    const container = containerRef.current;
    if (!counter || !container) return;

    const obj = { value: 0 };

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top 70%',
      onEnter: () => {
        if (hasAnimated) return;
        setHasAnimated(true);

        gsap.to(obj, {
          value: end,
          duration,
          ease: 'power2.out',
          onUpdate: () => {
            counter.textContent = prefix + Math.round(obj.value) + suffix;
          },
          onComplete: () => {
            // Scale punch animation
            gsap.fromTo(
              counter,
              { scale: 1.2 },
              { scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
            );
          },
        });
      },
    });

    return () => {
      trigger.kill();
    };
  }, [end, prefix, suffix, duration, hasAnimated]);

  return (
    <div ref={containerRef} className="flex flex-col items-center">
      <span
        ref={counterRef}
        className={`font-bold tabular-nums ${className}`}
      >
        {prefix}0{suffix}
      </span>
      {label && (
        <span className="text-onneshan-text-secondary text-sm mt-2">{label}</span>
      )}
    </div>
  );
};

export default AnimatedCounter;
