import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

/**
 * Network connectivity status returned by useOfflineStatus
 */
export interface OfflineStatus {
  /** Whether the device currently has internet connectivity */
  isOnline: boolean;
  /** Whether a connectivity check is in progress */
  isChecking: boolean;
  /** Timestamp of the last connectivity status update */
  lastChecked: Date | null;
  /** Connection type: 'wifi', 'cellular', 'none', 'unknown', etc. */
  connectionType: string | null;
  /** Manually trigger a connectivity recheck */
  recheck: () => Promise<void>;
}

/**
 * Hook for monitoring network connectivity status.
 *
 * Subscribes to NetInfo state changes and provides real-time
 * online/offline status, connection type, and a manual recheck function.
 *
 * @returns {OfflineStatus} Current network connectivity status
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isOnline, connectionType, recheck } = useOfflineStatus();
 *
 *   return (
 *     <View>
 *       <Text>{isOnline ? 'Online' : 'Offline'}</Text>
 *       <Text>Connection: {connectionType}</Text>
 *       <Button onPress={recheck} title="Refresh" />
 *     </View>
 *   );
 * }
 * ```
 */
export function useOfflineStatus(): OfflineStatus {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [connectionType, setConnectionType] = useState<string | null>(null);

  const handleNetInfoState = useCallback((state: NetInfoState) => {
    // Use isInternetReachable when available for more accurate detection,
    // fall back to isConnected for initial state before reachability is determined
    const online = state.isInternetReachable ?? state.isConnected ?? false;
    setIsOnline(online);
    setConnectionType(state.type);
    setLastChecked(new Date());
    setIsChecking(false);
  }, []);

  const recheck = useCallback(async () => {
    setIsChecking(true);
    const state = await NetInfo.fetch();
    handleNetInfoState(state);
  }, [handleNetInfoState]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(handleNetInfoState);
    return () => {
      unsubscribe();
    };
  }, [handleNetInfoState]);

  return {
    isOnline,
    isChecking,
    lastChecked,
    connectionType,
    recheck,
  };
}
