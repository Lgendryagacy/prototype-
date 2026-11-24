# Scroll-to-Top Navigation

This package provides utilities and components to automatically scroll to the top of the page when navigating between routes.

## Components

### ScrollingLink
A drop-in replacement for navigation buttons/links that automatically scrolls to top.

```tsx
import { ScrollingLink } from './ui/ScrollingLink';

// Basic usage
<ScrollingLink route="about" navigate={navigate}>About Us</ScrollingLink>

// With custom styling
<ScrollingLink 
  route="contact" 
  navigate={navigate}
  className="btn btn-primary"
  smooth={true}
>
  Contact
</ScrollingLink>
```

### ScrollingButton
For custom navigation logic with scroll-to-top.

```tsx
import { ScrollingButton } from './ui/ScrollingLink';

<ScrollingButton 
  onNavigate={() => {
    // Your custom navigation logic
    navigate('custom-route');
    // Do other things...
  }}
  className="btn btn-secondary"
>
  Custom Navigation
</ScrollingButton>
```

## Utilities

### useScrollingNavigate Hook
For components that need an enhanced navigate function.

```tsx
import { useScrollingNavigate } from '../utils/navigationUtils';

const MyComponent = ({ navigate }) => {
  const navigateWithScroll = useScrollingNavigate(navigate);
  
  return (
    <button onClick={() => navigateWithScroll('home')}>
      Go Home
    </button>
  );
};
```

### Direct Functions
For one-off usage or custom implementations.

```tsx
import { navigateAndScrollToTop, scrollToTop } from '../utils/navigationUtils';

// Navigate and scroll in one function
const handleClick = () => {
  navigateAndScrollToTop(navigate, 'pricing', true); // true = smooth scroll
};

// Just scroll to top
const scrollUp = () => {
  scrollToTop(); // smooth scroll
  // or scrollToTopInstant(); for instant scroll
};
```

## Examples

### Header Navigation
```tsx
import { ScrollingLink } from './ui/ScrollingLink';

const Header = ({ navigate }) => (
  <nav>
    <ScrollingLink route="home" navigate={navigate}>Home</ScrollingLink>
    <ScrollingLink route="about" navigate={navigate}>About</ScrollingLink>
    <ScrollingLink route="pricing" navigate={navigate}>Pricing</ScrollingLink>
  </nav>
);
```

### Button with Custom Logic
```tsx
import { ScrollingButton } from './ui/ScrollingLink';

const MyButton = ({ navigate, userId }) => (
  <ScrollingButton
    onNavigate={() => {
      // Custom logic before navigation
      saveUserPreferences(userId);
      navigate('dashboard');
    }}
  >
    Go to Dashboard
  </ScrollingButton>
);
```

### Multiple Navigation Options
```tsx
import { navigateAndScrollToTop } from '../utils/navigationUtils';

const QuickActions = ({ navigate }) => {
  const goToPage = (route, smooth = true) => {
    navigateAndScrollToTop(navigate, route, smooth);
  };

  return (
    <div>
      <button onClick={() => goToPage('profile')}>Profile (Smooth)</button>
      <button onClick={() => goToPage('settings', false)}>Settings (Instant)</button>
    </div>
  );
};
```

## Props

### ScrollingLink Props
- `route`: Route to navigate to
- `navigate`: Navigation function
- `children`: Link content
- `className?`: CSS classes
- `smooth?`: Use smooth scrolling (default: true)
- `onClick?`: Additional click handler

### ScrollingButton Props
- `onNavigate`: Custom navigation function
- `children`: Button content
- `className?`: CSS classes
- `smooth?`: Use smooth scrolling (default: true)

All components are fully typed with TypeScript for better development experience.
