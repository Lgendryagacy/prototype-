/**
 * QUICK START GUIDE: Scroll-to-Top Navigation
 * 
 * This file shows you the easiest ways to add scroll-to-top functionality
 * to your navigation links throughout the application.
 */

import React from 'react';
import { ScrollingLink, ScrollingButton } from '../components/ui/ScrollingLink';
import { useScrollingNavigate, navigateAndScrollToTop } from '../utils/navigationUtils';

// Method 1: Using ScrollingLink Component (Easiest)
const Example1 = ({ navigate }) => (
  <div>
    {/* Replace regular buttons with ScrollingLink */}
    <ScrollingLink route="about" navigate={navigate}>About Us</ScrollingLink>
    <ScrollingLink route="pricing" navigate={navigate}>Pricing</ScrollingLink>
    <ScrollingLink route="contact" navigate={navigate}>Contact</ScrollingLink>
  </div>
);

// Method 2: Using the Hook (For existing components)
const Example2 = ({ navigate }) => {
  const navigateWithScroll = useScrollingNavigate(navigate);
  
  return (
    <div>
      <button onClick={() => navigateWithScroll('home')}>Go Home</button>
      <button onClick={() => navigateWithScroll('dashboard')}>Dashboard</button>
    </div>
  );
};

// Method 3: Using Direct Function (One-off usage)
const Example3 = ({ navigate }) => {
  const handleSpecialNavigation = () => {
    // Do some custom logic first
    console.log('Preparing to navigate...');
    
    // Then navigate with scroll
    navigateAndScrollToTop(navigate, 'profile', true); // true = smooth scroll
  };

  return (
    <button onClick={handleSpecialNavigation}>
      Go to Profile
    </button>
  );
};

// Method 4: Custom Navigation with ScrollingButton
const Example4 = ({ navigate, userId }) => (
  <ScrollingButton
    onNavigate={() => {
      // Your custom logic here
      localStorage.setItem('lastVisited', 'settings');
      navigate('settings');
    }}
  >
    Go to Settings
  </ScrollingButton>
);

// Method 5: In a real component (like the updated Footer)
const FooterExample = ({ navigate }) => {
  const FooterLink = ({ route, children }) => (
    <ScrollingLink 
      route={route} 
      navigate={navigate}
      className="text-gray-600 hover:text-blue-600 transition-colors"
    >
      {children}
    </ScrollingLink>
  );

  return (
    <footer>
      <FooterLink route="about">About</FooterLink>
      <FooterLink route="careers">Careers</FooterLink>
      <FooterLink route="help-center">Help</FooterLink>
    </footer>
  );
};

export { Example1, Example2, Example3, Example4, FooterExample };
