import * as SecureStore from 'expo-secure-store';

const DEVICE_ID_KEY = 'device_id';

/**
 * Get or create a persistent device ID for sync operations.
 * Stored in expo-secure-store so it persists across app installs.
 */
export async function getDeviceId(): Promise<string> {
  let deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}
