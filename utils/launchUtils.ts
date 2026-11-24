// Launch utility functions

// Launch date
const LAUNCH_DATE = new Date('2025-01-01T00:00:00Z');

export const getLaunchDate = (): Date => {
  return LAUNCH_DATE;
};

export const isLaunched = (): boolean => {
  return true; // The platform is live
};

export const isRouteAllowedDuringCountdown = (route: string): boolean => {
  return true; // All routes are allowed
};

// Expose emergency launch functions for admin debugging if needed
if (typeof window !== 'undefined') {
  (window as any).__fogsly_launch = {
    isLaunched,
    getLaunchDate,
  };
}
