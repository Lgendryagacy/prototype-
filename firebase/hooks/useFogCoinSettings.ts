import { useState, useEffect } from 'react';
import { getFogCoinSettings } from '../services/fogCoinSettingsService';
import type { FogCoinSettings } from '../types/fogCoinSettings';

/**
 * Custom hook to fetch and auto-refresh FOG coin settings
 * @param refreshInterval - Refresh interval in milliseconds (default: 30000ms = 30 seconds)
 * @returns Object containing settings, loading state, and manual refresh function
 */
export const useFogCoinSettings = (refreshInterval: number = 30000) => {
  const [settings, setSettings] = useState<FogCoinSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await getFogCoinSettings();
      setSettings(data);
      setError(null);
    } catch (err) {
      console.error('Error loading FOG coin settings:', err);
      setError(err instanceof Error ? err : new Error('Failed to load settings'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    loadSettings();

    // Set up auto-refresh if interval is provided
    if (refreshInterval > 0) {
      const intervalId = setInterval(loadSettings, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [refreshInterval]);

  return {
    settings,
    isLoading,
    error,
    refresh: loadSettings,
    // Convenience values
    fogUsdRate: settings?.fogToUsdRate || 0.10,
    usdToPkrRate: settings?.usdToPkrRate || 284.67,
    fogToPkrRate: settings?.fogToPkrRate || 28.467,
  };
};
