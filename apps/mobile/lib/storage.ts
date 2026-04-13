import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage wrapper for AsyncStorage with error handling and type safety
 */
export class Storage {
  /**
   * Store a value with the given key
   */
  static async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      if (this.isQuotaExceededError(error)) {
        throw new StorageQuotaExceededError(
          `Storage quota exceeded while storing key: ${key}`
        );
      }
      throw new StorageError(
        `Failed to store item with key: ${key}`,
        error as Error
      );
    }
  }

  /**
   * Retrieve a value by key
   */
  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue === null) {
        return null;
      }
      return JSON.parse(jsonValue) as T;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new StorageCorruptedDataError(
          `Corrupted data found for key: ${key}`
        );
      }
      throw new StorageError(
        `Failed to retrieve item with key: ${key}`,
        error as Error
      );
    }
  }

  /**
   * Remove a value by key
   */
  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      throw new StorageError(
        `Failed to remove item with key: ${key}`,
        error as Error
      );
    }
  }

  /**
   * Clear all storage
   */
  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      throw new StorageError('Failed to clear storage', error as Error);
    }
  }

  /**
   * Get all keys in storage
   */
  static async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      throw new StorageError('Failed to get all keys', error as Error);
    }
  }

  /**
   * Get multiple items at once
   */
  static async multiGet<T>(keys: string[]): Promise<Record<string, T | null>> {
    try {
      const results = await AsyncStorage.getMany(keys);
      const parsed: Record<string, T | null> = {};

      for (const [key, value] of Object.entries(results)) {
        if (value !== null) {
          try {
            parsed[key] = JSON.parse(value) as T;
          } catch {
            parsed[key] = null;
          }
        } else {
          parsed[key] = null;
        }
      }

      return parsed;
    } catch (error) {
      throw new StorageError('Failed to get multiple items', error as Error);
    }
  }

  /**
   * Check if quota exceeded error
   */
  private static isQuotaExceededError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    return (
      error.message.includes('quota') ||
      error.message.includes('QuotaExceededError') ||
      error.message.includes('storage is full')
    );
  }
}

/**
 * Base storage error
 */
export class StorageError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Storage quota exceeded error
 */
export class StorageQuotaExceededError extends StorageError {
  constructor(message: string) {
    super(message);
    this.name = 'StorageQuotaExceededError';
  }
}

/**
 * Storage corrupted data error
 */
export class StorageCorruptedDataError extends StorageError {
  constructor(message: string) {
    super(message);
    this.name = 'StorageCorruptedDataError';
  }
}
