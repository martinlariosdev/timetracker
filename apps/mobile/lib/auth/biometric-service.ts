import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { BiometricType, BiometricStatus, BiometricAuthResult } from './types';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

/**
 * Map expo-local-authentication types to our BiometricType enum
 */
function mapAuthenticationType(
  type: LocalAuthentication.AuthenticationType,
): BiometricType {
  switch (type) {
    case LocalAuthentication.AuthenticationType.FINGERPRINT:
      return BiometricType.FINGERPRINT;
    case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
      return BiometricType.FACIAL_RECOGNITION;
    case LocalAuthentication.AuthenticationType.IRIS:
      return BiometricType.IRIS;
    default:
      return BiometricType.FINGERPRINT;
  }
}

/**
 * BiometricService - Handles biometric authentication for quick unlock
 *
 * Uses expo-local-authentication for biometric prompts and
 * expo-secure-store for persisting the biometric preference flag.
 *
 * Security: Only stores a boolean preference flag in SecureStore.
 * Actual tokens remain in the existing Storage (AsyncStorage) layer.
 * Biometric is only a gate to resume an existing valid session.
 */
export class BiometricService {
  /**
   * Check biometric hardware and enrollment status
   */
  static async getBiometricStatus(): Promise<BiometricStatus> {
    const isSupported = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes =
      await LocalAuthentication.supportedAuthenticationTypesAsync();

    return {
      isSupported,
      isEnrolled,
      availableTypes: supportedTypes.map(mapAuthenticationType),
    };
  }

  /**
   * Check if device supports biometric authentication
   * (has hardware AND user has enrolled biometrics)
   */
  static async isBiometricSupported(): Promise<boolean> {
    const status = await this.getBiometricStatus();
    return status.isSupported && status.isEnrolled;
  }

  /**
   * Prompt biometric authentication
   *
   * @param promptMessage - Message shown in the biometric prompt
   * @returns Result indicating success or failure
   */
  static async authenticateWithBiometric(
    promptMessage: string = 'Unlock TimeTrack',
  ): Promise<BiometricAuthResult> {
    const supported = await this.isBiometricSupported();
    if (!supported) {
      return {
        success: false,
        error: 'Biometric authentication is not available on this device',
      };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Use Okta',
      disableDeviceFallback: true,
      fallbackLabel: '',
    });

    return {
      success: result.success,
      error: result.success ? undefined : result.error,
    };
  }

  /**
   * Save biometric enabled preference to SecureStore
   */
  static async setBiometricEnabled(enabled: boolean): Promise<void> {
    await SecureStore.setItemAsync(
      BIOMETRIC_ENABLED_KEY,
      enabled ? 'true' : 'false',
    );
  }

  /**
   * Check if biometric is enabled by the user
   */
  static async isBiometricEnabled(): Promise<boolean> {
    const value = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    return value === 'true';
  }

  /**
   * Remove biometric preference (used during logout/disable)
   */
  static async clearBiometricPreference(): Promise<void> {
    await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
  }

  /**
   * Get a human-readable label for the primary biometric type
   * (e.g., "Face ID" on iOS, "Fingerprint" on Android)
   */
  static async getBiometricLabel(): Promise<string> {
    const status = await this.getBiometricStatus();

    if (status.availableTypes.includes(BiometricType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    }
    if (status.availableTypes.includes(BiometricType.IRIS)) {
      return 'Iris';
    }
    return 'Fingerprint';
  }

  /**
   * Get the icon name to display for the primary biometric type
   * Returns Ionicons-compatible icon names
   */
  static async getBiometricIconName(): Promise<string> {
    const status = await this.getBiometricStatus();

    if (status.availableTypes.includes(BiometricType.FACIAL_RECOGNITION)) {
      return 'scan-outline';
    }
    return 'finger-print-outline';
  }
}
