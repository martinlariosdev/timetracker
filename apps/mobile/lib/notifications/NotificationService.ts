import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

/**
 * NotificationService
 *
 * Handles push notification setup, permission requests, and notification handling
 * for iOS and Android platforms using expo-notifications.
 */

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Registers the device for push notifications and returns an Expo push token
 *
 * @returns Promise resolving to push token string or null if registration fails
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    // Only physical devices can receive push notifications
    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices');
      return null;
    }

    // Check existing permission status
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permission if not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Return null if permission denied
    if (finalStatus !== 'granted') {
      console.log('Push notification permission denied');
      return null;
    }

    // Get Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });

    // Configure Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563EB',
      });
    }

    return tokenData.data;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

/**
 * Sets up notification event listeners for received and interaction events
 *
 * @returns Cleanup function to remove listeners
 */
export function setupNotificationHandlers(): () => void {
  // Listener for notifications received while app is in foreground
  const notificationListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('Notification received in foreground:', notification);
      // Handle foreground notification (e.g., update UI, show custom alert)
    }
  );

  // Listener for user interactions with notifications
  const responseListener = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log('Notification response received:', response);
      // Handle notification tap (e.g., navigate to specific screen)
      const data = response.notification.request.content.data;

      // TODO: Add navigation logic based on notification data
      // Example: router.push(`/screen/${data.id}`);
    }
  );

  // Return cleanup function
  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}

/**
 * Schedules a local notification (useful for testing)
 *
 * @param title Notification title
 * @param body Notification body text
 * @param data Optional data payload
 * @param seconds Delay in seconds before showing notification
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
  seconds: number = 0
): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
    },
    trigger:
      seconds > 0
        ? {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds,
            repeats: false,
          }
        : null,
  });
}

/**
 * Cancels all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Gets the current notification permission status
 */
export async function getNotificationPermissionStatus(): Promise<Notifications.PermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}
