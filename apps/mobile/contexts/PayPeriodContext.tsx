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

      // Return cache regardless of age (expiry is checked by caller)
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
  }, [loadCache, updateState, fetchPeriods]);

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

/**
 * Hook to get current pay period
 */
export function useCurrentPayPeriod(): PayPeriod | null {
  const { currentPayPeriod } = usePayPeriodContext();
  return currentPayPeriod;
}

/**
 * Hook to get pay period for a specific date
 */
export function usePayPeriodForDate(date: Date): PayPeriod | null {
  const { payPeriods } = usePayPeriodContext();

  return React.useMemo(() => {
    const dateTime = date.getTime();

    return payPeriods.find(period => {
      const start = new Date(period.startDate).getTime();
      const end = new Date(period.endDate).getTime();
      return dateTime >= start && dateTime <= end;
    }) || null;
  }, [payPeriods, date]);
}

/**
 * Hook to get all pay periods for a week
 * Returns unique periods (handles weeks spanning multiple periods)
 */
export function usePayPeriodsForWeek(dates: Date[]): PayPeriod[] {
  const { payPeriods } = usePayPeriodContext();

  return React.useMemo(() => {
    const periodIds = new Set<string>();
    const result: PayPeriod[] = [];

    dates.forEach(date => {
      const period = payPeriods.find(p => {
        const start = new Date(p.startDate).getTime();
        const end = new Date(p.endDate).getTime();
        const dateTime = date.getTime();
        return dateTime >= start && dateTime <= end;
      });

      if (period && !periodIds.has(period.id)) {
        periodIds.add(period.id);
        result.push(period);
      }
    });

    // Sort by startDate
    return result.sort((a, b) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }, [payPeriods, dates]);
}
