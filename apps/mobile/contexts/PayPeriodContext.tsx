import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { FETCH_PAY_PERIODS_QUERY } from '@/lib/graphql/queries';
import { PayPeriod, PayPeriodContextState, PayPeriodCache } from '@/types/pay-period';

const CACHE_KEY = 'pay_periods_cache';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const DEFAULT_LIMIT = 20; // ~10 months of semi-monthly periods

const PayPeriodContext = createContext<PayPeriodContextState | undefined>(undefined);

interface PayPeriodProviderProps {
  children: ReactNode;
}

export function PayPeriodProvider({ children }: PayPeriodProviderProps) {
  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>([]);
  const [currentPayPeriod, setCurrentPayPeriod] = useState<PayPeriod | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch pay periods from backend
  const { data, refetch, error: queryError } = useAuthenticatedQuery(
    FETCH_PAY_PERIODS_QUERY,
    {
      variables: { limit: DEFAULT_LIMIT },
      fetchPolicy: 'network-only',
    },
  );

  // Load cached periods from AsyncStorage
  const loadCache = useCallback(async (): Promise<PayPeriodCache | null> => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const cache: PayPeriodCache = JSON.parse(cached);
      const age = Date.now() - new Date(cache.fetchedAt).getTime();

      // Return cache regardless of age if offline, otherwise respect expiry
      return cache;
    } catch (err) {
      console.error('[PayPeriodContext] Failed to load cache:', err);
      return null;
    }
  }, []);

  // Save periods to cache
  const saveCache = useCallback(async (periods: PayPeriod[]) => {
    try {
      const cache: PayPeriodCache = {
        periods,
        fetchedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (err) {
      console.error('[PayPeriodContext] Failed to save cache:', err);
    }
  }, []);

  // Update state from periods list
  const updateState = useCallback((periods: PayPeriod[]) => {
    setPayPeriods(periods);
    const current = periods.find(p => p.isCurrent) || null;
    setCurrentPayPeriod(current);
  }, []);

  // Fetch fresh data
  const fetchPeriods = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to refetch from backend
      const result = await refetch();

      if (result.data?.payPeriods) {
        const periods = result.data.payPeriods as PayPeriod[];
        updateState(periods);
        await saveCache(periods);
      }
    } catch (err) {
      console.error('[PayPeriodContext] Fetch failed:', err);
      setError('Failed to fetch pay periods');

      // Fall back to cache on error
      const cache = await loadCache();
      if (cache) {
        console.log('[PayPeriodContext] Using cached periods (offline)');
        updateState(cache.periods);
      }
    } finally {
      setLoading(false);
    }
  }, [refetch, updateState, saveCache, loadCache]);

  // Refresh method for pull-to-refresh
  const refresh = useCallback(async () => {
    await fetchPeriods();
  }, [fetchPeriods]);

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      // Try cache first for instant load
      const cache = await loadCache();
      if (cache) {
        const age = Date.now() - new Date(cache.fetchedAt).getTime();
        if (age < CACHE_DURATION_MS) {
          console.log('[PayPeriodContext] Using fresh cache');
          updateState(cache.periods);
          setLoading(false);
        }
      }

      // Always fetch fresh data in background
      await fetchPeriods();
    };

    initialize();
  }, []);

  // Update when query data changes
  useEffect(() => {
    if (data?.payPeriods) {
      const periods = data.payPeriods as PayPeriod[];
      updateState(periods);
      saveCache(periods);
      setLoading(false);
    }
  }, [data, updateState, saveCache]);

  // Update error state from query
  useEffect(() => {
    if (queryError) {
      setError('Network error - using cached data');
    }
  }, [queryError]);

  const value: PayPeriodContextState = {
    payPeriods,
    currentPayPeriod,
    loading,
    error,
    refresh,
  };

  return (
    <PayPeriodContext.Provider value={value}>
      {children}
    </PayPeriodContext.Provider>
  );
}

/**
 * Hook to access pay period context
 */
export function usePayPeriodContext(): PayPeriodContextState {
  const context = useContext(PayPeriodContext);
  if (!context) {
    throw new Error('usePayPeriodContext must be used within PayPeriodProvider');
  }
  return context;
}
