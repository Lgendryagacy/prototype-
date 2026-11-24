import React, { useState, useEffect } from 'react';
import { type Theme, type Route } from './types';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import CommunityPage from './pages/CommunityPage';
import JobsExplorer from './components/jobs/JobsExplorer';
import EventsExplorer from './components/events/EventsExplorer';
import { onAuthStateChange, signOutUser } from './firebase/services/authService';
import { getUserData } from './firebase/services/userService';
import { User } from './firebase/types/user';
import { Toaster } from 'react-hot-toast';
import { useTheme } from './src/context/ThemeContext';

export default function App() {
  // Theme management provided by ThemeContext
  const { theme: currentTheme, setTheme: handleThemeChange } = useTheme();

  const [currentRoute, setCurrentRoute] = useState<Route>(() => {
    const hash = window.location.hash.replace('#', '').split('?')[0] || window.location.pathname.replace('/', '');
    if (hash === 'community') return 'community';
    if (hash === 'fog-jobs' || hash === 'jobs') return 'fog-jobs';
    if (hash === 'events') return 'events';
    return 'home';
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Sync hash routing if user uses browser navigation or bookmark
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').split('?')[0] || window.location.pathname.replace('/', '');
      if (hash === 'community') {
        setCurrentRoute('community');
      } else if (hash === 'fog-jobs' || hash === 'jobs') {
        setCurrentRoute('fog-jobs');
      } else if (hash === 'events') {
        setCurrentRoute('events');
      } else if (hash === 'home' || hash === '') {
        setCurrentRoute('home');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Auth listener for user profile in Header
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        setIsLoggedIn(true);
        try {
          const userData = await getUserData(user.uid);
          if (userData) {
            setCurrentUser(userData);
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOutUser();
      setIsLoggedIn(false);
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Safe navigation handler
  const navigate = (destination: Route | string) => {
    const targetId = typeof destination === 'string' ? destination.replace('/', '') : destination;
    
    if (targetId === 'community') {
      setCurrentRoute('community');
      window.location.hash = 'community';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (targetId === 'fog-jobs' || targetId === 'jobs') {
      setCurrentRoute('fog-jobs');
      window.location.hash = 'fog-jobs';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (targetId === 'events') {
      setCurrentRoute('events');
      window.location.hash = 'events';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (targetId === 'home') {
      setCurrentRoute('home');
      window.location.hash = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // If on a dedicated subpage (community, jobs, events) and navigating to a home section, switch route to home first
    if (currentRoute !== 'home') {
      setCurrentRoute('home');
      window.location.hash = '';
      setTimeout(() => {
        const element = document.getElementById(targetId) || document.querySelector(`[data-section="${targetId}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    const element = document.getElementById(targetId) || document.querySelector(`[data-section="${targetId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[--color-bg-primary] text-[--color-text-primary] transition-colors duration-300">
      <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} />
      <Header
        currentTheme={currentTheme}
        setCurrentTheme={handleThemeChange}
        navigate={navigate as any}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        currentUser={currentUser}
        currentRoute={currentRoute}
      />
      <div className="flex-1">
        {currentRoute === 'community' ? (
          <CommunityPage navigate={navigate} currentUser={currentUser} />
        ) : currentRoute === 'fog-jobs' || currentRoute === 'jobs' ? (
          <JobsExplorer navigate={navigate} currentUser={currentUser} />
        ) : currentRoute === 'events' ? (
          <EventsExplorer navigate={navigate} currentUser={currentUser} />
        ) : (
          <HomePage navigate={navigate} isLoggedIn={isLoggedIn} />
        )}
      </div>
    </div>
  );
}
