import { useSyncExternalStore } from 'react';

export const useMediaQuery = (query: string): boolean => {
  return useSyncExternalStore(
    (callback) => {
      if (typeof window === 'undefined') {
        return () => {};
      }

      const media = window.matchMedia(query);
      const handler = () => callback();

      media.addEventListener('change', handler);

      return () => {
        media.removeEventListener('change', handler);
      };
    },
    () => {
      if (typeof window === 'undefined') {
        return false;
      }
      return window.matchMedia(query).matches;
    },
    () => false,
  );
};

// Predefined breakpoints
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1024px)');
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');

export default useMediaQuery;
