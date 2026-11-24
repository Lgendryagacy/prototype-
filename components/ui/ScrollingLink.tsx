import React from 'react';
import { useScrollingNavigate, navigateAndScrollToTop } from '../../utils/navigationUtils';
import { type Route } from '../../types';

interface ScrollingLinkProps {
  route: Route | string;
  navigate: (route: Route | string, authMode?: 'login' | 'signup') => void;
  children: React.ReactNode;
  className?: string;
  smooth?: boolean;
  onClick?: () => void;
  authMode?: 'login' | 'signup';
}

/**
 * A link component that automatically scrolls to top when navigating
 * Usage: <ScrollingLink route="about" navigate={navigate}>About Us</ScrollingLink>
 */
export const ScrollingLink: React.FC<ScrollingLinkProps> = ({
  route,
  navigate,
  children,
  className = '',
  smooth = true,
  onClick,
  authMode
}) => {
  const handleClick = () => {
    navigateAndScrollToTop(navigate, route, authMode, smooth);
    onClick?.();
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
};

interface ScrollingButtonProps {
  onNavigate: () => void;
  children: React.ReactNode;
  className?: string;
  smooth?: boolean;
}

/**
 * A button component that scrolls to top after executing custom navigation logic
 * Usage: <ScrollingButton onNavigate={() => navigate('route')}>Click me</ScrollingButton>
 */
export const ScrollingButton: React.FC<ScrollingButtonProps> = ({
  onNavigate,
  children,
  className = '',
  smooth = true
}) => {
  const handleClick = () => {
    onNavigate();
    setTimeout(() => {
      if (smooth) {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      } else {
        window.scrollTo(0, 0);
      }
    }, 100);
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
};

export default ScrollingLink;
