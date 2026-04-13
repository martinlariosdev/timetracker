import { useState, useCallback, useEffect } from 'react';
import {
  OfflineQueue,
  QueueItem,
  QueueItemType,
  QueueOperation,
} from '../lib/offline-queue';

export interface UseOfflineQueueResult {
  queue: QueueItem[];
  size: number;
  isEmpty: boolean;
  isLoading: boolean;
  error: Error | null;
  enqueue: (
    item: Omit<QueueItem, 'id' | 'timestamp' | 'retryCount'>
  ) => Promise<QueueItem | null>;
  dequeue: () => Promise<QueueItem | null>;
  peek: () => Promise<QueueItem | null>;
  clear: () => Promise<void>;
  removeById: (id: string) => Promise<boolean>;
  incrementRetryCount: (id: string) => Promise<boolean>;
  getByType: (type: QueueItemType) => Promise<QueueItem[]>;
  refresh: () => Promise<void>;
}

/**
 * Hook for managing the offline sync queue
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { queue, enqueue, dequeue, size } = useOfflineQueue();
 *
 *   const handleCreateEntry = async () => {
 *     await enqueue({
 *       type: 'TimeEntry',
 *       operation: 'CREATE',
 *       data: { hours: 8, date: '2024-01-01' }
 *     });
 *   };
 *
 *   return (
 *     <View>
 *       <Text>Pending items: {size}</Text>
 *       <Button onPress={handleCreateEntry} title="Add Entry" />
 *     </View>
 *   );
 * }
 * ```
 */
export function useOfflineQueue(): UseOfflineQueueResult {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load queue from storage
   */
  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const items = await OfflineQueue.getAll();
      setQueue(items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load queue'));
      console.error('Failed to refresh queue:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Initialize queue on mount
   */
  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * Add item to queue
   */
  const enqueue = useCallback(
    async (
      item: Omit<QueueItem, 'id' | 'timestamp' | 'retryCount'>
    ): Promise<QueueItem | null> => {
      try {
        setError(null);
        const queueItem = await OfflineQueue.enqueue(item);
        await refresh();
        return queueItem;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to enqueue item');
        setError(error);
        console.error('Failed to enqueue item:', err);
        return null;
      }
    },
    [refresh]
  );

  /**
   * Remove and return first item from queue
   */
  const dequeue = useCallback(async (): Promise<QueueItem | null> => {
    try {
      setError(null);
      const item = await OfflineQueue.dequeue();
      await refresh();
      return item;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to dequeue item');
      setError(error);
      console.error('Failed to dequeue item:', err);
      return null;
    }
  }, [refresh]);

  /**
   * Get first item without removing it
   */
  const peek = useCallback(async (): Promise<QueueItem | null> => {
    try {
      setError(null);
      return await OfflineQueue.peek();
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to peek queue');
      setError(error);
      console.error('Failed to peek queue:', err);
      return null;
    }
  }, []);

  /**
   * Clear all items from queue
   */
  const clear = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await OfflineQueue.clear();
      await refresh();
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to clear queue');
      setError(error);
      console.error('Failed to clear queue:', err);
    }
  }, [refresh]);

  /**
   * Remove specific item by ID
   */
  const removeById = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setError(null);
        const success = await OfflineQueue.removeById(id);
        await refresh();
        return success;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to remove item');
        setError(error);
        console.error('Failed to remove item:', err);
        return false;
      }
    },
    [refresh]
  );

  /**
   * Increment retry count for item
   */
  const incrementRetryCount = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setError(null);
        const success = await OfflineQueue.incrementRetryCount(id);
        await refresh();
        return success;
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('Failed to increment retry count');
        setError(error);
        console.error('Failed to increment retry count:', err);
        return false;
      }
    },
    [refresh]
  );

  /**
   * Get items by type
   */
  const getByType = useCallback(
    async (type: QueueItemType): Promise<QueueItem[]> => {
      try {
        setError(null);
        return await OfflineQueue.getByType(type);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to get items by type');
        setError(error);
        console.error('Failed to get items by type:', err);
        return [];
      }
    },
    []
  );

  return {
    queue,
    size: queue.length,
    isEmpty: queue.length === 0,
    isLoading,
    error,
    enqueue,
    dequeue,
    peek,
    clear,
    removeById,
    incrementRetryCount,
    getByType,
    refresh,
  };
}
