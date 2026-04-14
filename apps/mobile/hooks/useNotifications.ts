import { useEffect, useState } from 'react';
import {
  registerForPushNotifications,
  setupNotificationHandlers,
  getNotificationPermissionStatus,
} from '@/lib/notifications/NotificationService';
import type { PermissionStatus } from 'expo-notifications';

interface NotificationState {
  pushToken: string | null;
  permissionStatus: PermissionStatus | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for managing push notification registration and handlers
 *
 * Automatically registers for push notifications on mount and sets up
 * notification event handlers. Returns current state including push token
 * and permission status.
 *
 * @returns Notification state object
 */
export function useNotifications(): NotificationState {
  const [state, setState] = useState<NotificationState>({
    pushToken: null,
    permissionStatus: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    async function initialize() {
      try {
        // Set up notification handlers first
        cleanup = setupNotificationHandlers();

        // Get current permission status
        const permissionStatus = await getNotificationPermissionStatus();

        // Register for push notifications
        const token = await registerForPushNotifications();

        setState({
          pushToken: token,
          permissionStatus,
          isLoading: false,
          error: null,
        });

        if (token) {
          console.log('Push token registered:', token);
          // TODO: Send token to backend API for storage
          // await sendTokenToBackend(token);
        } else if (permissionStatus !== 'granted') {
          console.log('Push notification permission not granted');
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Unknown error'),
        }));
      }
    }

    initialize();

    // Cleanup notification listeners on unmount
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, []); // Run once on mount

  return state;
}
