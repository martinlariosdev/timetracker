import { Storage, StorageQuotaExceededError } from './storage';

const QUEUE_STORAGE_KEY = '@timetrack:offline_queue';
const MAX_RETRY_COUNT = 3;

/**
 * Queue item types
 */
export type QueueItemType =
  | 'TimeEntry'
  | 'ETOTransaction'
  | 'TimesheetSubmission';

/**
 * Queue operation types
 */
export type QueueOperation = 'CREATE' | 'UPDATE' | 'DELETE';

/**
 * Queue item structure
 */
export interface QueueItem {
  id: string;
  type: QueueItemType;
  operation: QueueOperation;
  /** ID of the entity (undefined for CREATE operations) */
  entityId?: string;
  data: any;
  timestamp: number;
  retryCount: number;
  /** Last error message if a sync attempt failed */
  lastError?: string;
}

/**
 * Offline queue manager for persistent storage of pending sync operations
 */
export class OfflineQueue {
  /**
   * Add an item to the queue
   */
  static async enqueue(
    item: Omit<QueueItem, 'id' | 'timestamp' | 'retryCount'>
  ): Promise<QueueItem> {
    try {
      const queue = await this.getAll();

      const queueItem: QueueItem = {
        ...item,
        id: this.generateId(),
        timestamp: Date.now(),
        retryCount: 0,
      };

      queue.push(queueItem);
      await this.saveQueue(queue);

      return queueItem;
    } catch (error) {
      if (error instanceof StorageQuotaExceededError) {
        // Try to make space by removing old completed items
        await this.cleanup();
        // Retry once
        const queue = await this.getAll();
        const queueItem: QueueItem = {
          ...item,
          id: this.generateId(),
          timestamp: Date.now(),
          retryCount: 0,
        };
        queue.push(queueItem);
        await this.saveQueue(queue);
        return queueItem;
      }
      throw error;
    }
  }

  /**
   * Remove and return the first item from the queue
   */
  static async dequeue(): Promise<QueueItem | null> {
    const queue = await this.getAll();

    if (queue.length === 0) {
      return null;
    }

    const item = queue.shift()!;
    await this.saveQueue(queue);

    return item;
  }

  /**
   * Get the first item without removing it
   */
  static async peek(): Promise<QueueItem | null> {
    const queue = await this.getAll();
    return queue.length > 0 ? queue[0] : null;
  }

  /**
   * Get all items in the queue
   */
  static async getAll(): Promise<QueueItem[]> {
    try {
      const queue = await Storage.getItem<QueueItem[]>(QUEUE_STORAGE_KEY);
      return queue || [];
    } catch (error) {
      console.error('Failed to get queue, returning empty array:', error);
      return [];
    }
  }

  /**
   * Clear all items from the queue
   */
  static async clear(): Promise<void> {
    await Storage.removeItem(QUEUE_STORAGE_KEY);
  }

  /**
   * Get queue size
   */
  static async size(): Promise<number> {
    const queue = await this.getAll();
    return queue.length;
  }

  /**
   * Remove a specific item by ID
   */
  static async removeById(id: string): Promise<boolean> {
    const queue = await this.getAll();
    const initialLength = queue.length;
    const filteredQueue = queue.filter((item) => item.id !== id);

    if (filteredQueue.length !== initialLength) {
      await this.saveQueue(filteredQueue);
      return true;
    }

    return false;
  }

  /**
   * Remove multiple items by their IDs in a single operation
   */
  static async removeByIds(ids: string[]): Promise<number> {
    const queue = await this.getAll();
    const idSet = new Set(ids);
    const filteredQueue = queue.filter((item) => !idSet.has(item.id));
    const removedCount = queue.length - filteredQueue.length;

    if (removedCount > 0) {
      await this.saveQueue(filteredQueue);
    }

    return removedCount;
  }

  /**
   * Update an existing item in the queue
   */
  static async updateById(
    id: string,
    updates: Partial<QueueItem>
  ): Promise<boolean> {
    const queue = await this.getAll();
    const itemIndex = queue.findIndex((item) => item.id === id);

    if (itemIndex === -1) {
      return false;
    }

    queue[itemIndex] = { ...queue[itemIndex], ...updates };
    await this.saveQueue(queue);

    return true;
  }

  /**
   * Increment retry count for an item
   */
  static async incrementRetryCount(id: string): Promise<boolean> {
    const queue = await this.getAll();
    const item = queue.find((item) => item.id === id);

    if (!item) {
      return false;
    }

    item.retryCount += 1;

    // Remove items that have exceeded max retry count
    if (item.retryCount > MAX_RETRY_COUNT) {
      await this.removeById(id);
      console.warn(
        `Item ${id} exceeded max retry count and was removed from queue`
      );
      return false;
    }

    await this.saveQueue(queue);
    return true;
  }

  /**
   * Get items by type
   */
  static async getByType(type: QueueItemType): Promise<QueueItem[]> {
    const queue = await this.getAll();
    return queue.filter((item) => item.type === type);
  }

  /**
   * Get items by operation
   */
  static async getByOperation(operation: QueueOperation): Promise<QueueItem[]> {
    const queue = await this.getAll();
    return queue.filter((item) => item.operation === operation);
  }

  /**
   * Check if queue is empty
   */
  static async isEmpty(): Promise<boolean> {
    const size = await this.size();
    return size === 0;
  }

  /**
   * Cleanup old or failed items
   */
  private static async cleanup(): Promise<void> {
    const queue = await this.getAll();
    // Remove items older than 7 days or with too many retries
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const cleanedQueue = queue.filter(
      (item) => item.timestamp > sevenDaysAgo && item.retryCount <= MAX_RETRY_COUNT
    );
    await this.saveQueue(cleanedQueue);
  }

  /**
   * Save the queue to storage
   */
  private static async saveQueue(queue: QueueItem[]): Promise<void> {
    await Storage.setItem(QUEUE_STORAGE_KEY, queue);
  }

  /**
   * Generate a unique ID for queue items
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
