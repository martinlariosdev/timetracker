/**
 * Offline Storage and Queue Management
 *
 * This module provides persistent storage for offline sync operations.
 */

export {
  Storage,
  StorageError,
  StorageQuotaExceededError,
  StorageCorruptedDataError,
} from './storage';

export {
  OfflineQueue,
  type QueueItem,
  type QueueItemType,
  type QueueOperation,
} from './offline-queue';

/**
 * Authentication
 */
export {
  OktaService,
  OktaAuthError,
  type OktaAuthResult,
  type OktaUserProfile,
} from './auth/okta-service';

export {
  getOktaConfig,
  validateOktaConfig,
  isOktaConfigured,
  type OktaConfig,
} from './auth/okta-config';
