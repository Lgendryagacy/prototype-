import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeColors {
  navBlue: string;
  lightBlue: string;
}

export const THEME_COLORS: ThemeColors = {
  navBlue: '#081440',
  lightBlue: '#489fff',
};

export interface ThemeContextType {
  theme: Theme;
  currentTheme: Theme; // Alias for backward compatibility
  setTheme: (theme: Theme) => void;
  setCurrentTheme: (theme: Theme) => void; // Alias for backward compatibility
  toggleTheme: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'fogsly-theme';
const VALID_THEMES: Theme[] = ['light', 'dark'];

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'dark',
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme;
    try {
      const stored = (localStorage.getItem(STORAGE_KEY) || localStorage.getItem('theme')) as Theme | null;
      if (stored && VALID_THEMES.includes(stored)) {
        return stored;
      }
    } catch (e) {
      console.warn('Failed to read theme preference from localStorage:', e);
    }
    return defaultTheme;
  });

  // Apply theme class and theme color properties to root HTML element
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    
    // Remove all previous theme classes including legacy desert
    ['light', 'dark', 'desert'].forEach((t) => {
      root.classList.remove(t);
    });

    // Add current theme class
    root.classList.add(theme);

    // Update className directly to keep external scripts in sync
    const otherClasses = Array.from(root.classList).filter(
      (cls) => !['light', 'dark', 'desert'].includes(cls)
    );
    root.className = [...otherClasses, theme].join(' ').trim();

    // Set root CSS custom properties for the 2-color theme: nav blue & light blue
    root.style.setProperty('--color-nav-blue', THEME_COLORS.navBlue);
    root.style.setProperty('--color-light-blue', THEME_COLORS.lightBlue);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    if (!VALID_THEMES.includes(newTheme)) return;
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
      localStorage.setItem('theme', newTheme);
    } catch (e) {
      console.warn('Failed to persist theme preference to localStorage:', e);
    }
  };

  const toggleTheme = () => {
    const currentIndex = VALID_THEMES.indexOf(theme);
    const nextTheme = VALID_THEMES[(currentIndex + 1) % VALID_THEMES.length];
    setTheme(nextTheme);
  };

  const value = useMemo<ThemeContextType>(
    () => ({
      theme,
      currentTheme: theme,
      setTheme,
      setCurrentTheme: setTheme,
      toggleTheme,
      colors: THEME_COLORS,
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
