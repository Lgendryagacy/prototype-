import { useCallback } from 'react';

export const scrollToTop = (smooth = true): void => {
  if (typeof window === 'undefined') return;
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: smooth ? 'smooth' : 'auto'
  });
};

export const scrollToTopInstant = (): void => {
  scrollToTop(false);
};

export const navigateAndScrollToTop = (
  navigate: (route: any, ...args: any[]) => void,
  route: any,
  smooth = true,
  ...args: any[]
): void => {
  if (typeof navigate === 'function') {
    navigate(route, ...args);
  }
  scrollToTop(smooth);
};

export const useScrollingNavigate = (
  navigate: (route: any, ...args: any[]) => void,
  smooth = true
) => {
  return useCallback(
    (route: any, ...args: any[]) => {
      if (typeof navigate === 'function') {
        navigate(route, ...args);
      }
      scrollToTop(smooth);
    },
    [navigate, smooth]
  );
};
