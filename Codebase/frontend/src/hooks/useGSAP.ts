import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Set global defaults
gsap.defaults({
  ease: 'power3.out',
  duration: 0.8,
});

ScrollTrigger.defaults({
  toggleActions: 'play none none reverse',
  markers: false,
});

export const useGSAPContext = () => {
  const contextRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    contextRef.current = gsap.context(() => {});

    return () => {
      contextRef.current?.revert();
    };
  }, []);

  return contextRef;
};

// Hook for creating scroll-triggered animations
export const useScrollAnimation = (
  triggerRef: React.RefObject<HTMLElement>,
  animationCallback: (tl: gsap.core.Timeline) => void,
  options?: ScrollTrigger.Vars
) => {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const triggerElement = triggerRef.current;
    if (!triggerElement) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        start: 'top 80%',
        end: 'bottom 20%',
        ...options,
      },
    });

    timelineRef.current = tl;
    animationCallback(tl);

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === triggerElement) {
          st.kill();
        }
      });
    };
  }, [triggerRef, animationCallback, options]);

  return timelineRef;
};

export default useGSAPContext;
