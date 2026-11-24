import { getFogCoinSettings } from '../firebase/services/fogCoinSettingsService';
import { FogCoinSettings, DEFAULT_FOG_COIN_SETTINGS } from '../firebase/types/fogCoinSettings';

let cachedSettings: FogCoinSettings | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export const getFogCoinSettingsWithCache = async (): Promise<FogCoinSettings> => {
  const now = Date.now();
  if (cachedSettings && cacheExpiry > now) {
    return cachedSettings;
  }

  try {
    const settings = await getFogCoinSettings();
    cachedSettings = settings;
    cacheExpiry = now + CACHE_DURATION_MS;
    return settings;
  } catch (error) {
    console.error('Error in getFogCoinSettingsWithCache:', error);
    return {
      id: 'default',
      ...DEFAULT_FOG_COIN_SETTINGS,
      lastUpdatedBy: 'system',
      lastUpdatedAt: new Date(),
      effectiveFrom: new Date()
    };
  }
};

export const clearFogCoinSettingsCache = (): void => {
  cachedSettings = null;
  cacheExpiry = 0;
};

export const formatFog = (amount: number = 0): string => {
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `${num.toLocaleString(undefined, { maximumFractionDigits: 2 })} FOG`;
};

export const formatUsd = (amount: number = 0): string => {
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `$${num.toFixed(2)}`;
};

export const fogToUsdSync = (fogAmount: number = 0, rate: number = 0.1): number => {
  const num = typeof fogAmount === 'number' && !isNaN(fogAmount) ? fogAmount : 0;
  return Number((num * rate).toFixed(2));
};

export const formatFogWithUsdSync = (fogAmount: number = 0, rate: number = 0.1): string => {
  const num = typeof fogAmount === 'number' && !isNaN(fogAmount) ? fogAmount : 0;
  const usd = fogToUsdSync(num, rate);
  return `${formatFog(num)} (≈ ${formatUsd(usd)})`;
};
