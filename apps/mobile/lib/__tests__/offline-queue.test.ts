/**
 * Offline Queue Tests
 *
 * These tests verify the queue operations work correctly.
 * Run with: pnpm test
 */

import { OfflineQueue, QueueItem } from '../offline-queue';

describe('OfflineQueue', () => {
  beforeEach(async () => {
    // Clear queue before each test
    await OfflineQueue.clear();
  });

  afterAll(async () => {
    // Cleanup after all tests
    await OfflineQueue.clear();
  });

  describe('enqueue', () => {
    it('should add item to queue', async () => {
      const item = await OfflineQueue.enqueue({
        type: 'TimeEntry',
        operation: 'CREATE',
        data: { hours: 8, date: '2024-01-01' },
      });

      expect(item).toBeDefined();
      expect(item.id).toBeDefined();
      expect(item.type).toBe('TimeEntry');
      expect(item.operation).toBe('CREATE');
      expect(item.timestamp).toBeDefined();
      expect(item.retryCount).toBe(0);
    });

    it('should generate unique IDs', async () => {
      const item1 = await OfflineQueue.enqueue({
        type: 'TimeEntry',
        operation: 'CREATE',
        data: {},
      });

      const item2 = await OfflineQueue.enqueue({
        type: 'TimeEntry',
        operation: 'CREATE',
        data: {},
      });

      expect(item1.id).not.toBe(item2.id);
    });
  });

  describe('dequeue', () => {
    it('should remove and return first item', async () => {
      const enqueued = await OfflineQueue.enqueue({
        type: 'TimeEntry',
        operation: 'CREATE',
        data: { hours: 8 },
      });

      const dequeued = await OfflineQueue.dequeue();

      expect(dequeued).toBeDefined();
      expect(dequeued?.id).toBe(enqueued.id);
      expect(await OfflineQueue.isEmpty()).toBe(true);
    });

    it('should return null for empty queue', async () => {
      const item = await OfflineQueue.dequeue();
      expect(item).toBeNull();
    });

    it('should maintain FIFO order', async () => {
      const item1 = await OfflineQueue.enqueue({
        type: 'TimeEntry',
        operation: 'CREATE',
        data: { id: 1 },
      });

      const item2 = await OfflineQueue.enqueue({
        type: 'TimeEntry',
        operation: 'CREATE',
        data: { id: 2 },
      });

      const dequeued1 = await OfflineQueue.dequeue();
      const dequeued2 = await OfflineQueue.dequeue();

      expect(dequeued1?.id).toBe(item1.id);
      expect(dequeued2?.id).toBe(item2.id);
    });
  });

  describe('peek', () => {
    it('should return first item without removing', async () => {
      const enqueued = await OfflineQueue.enqueue({
        type: 'TimeEntry',
        operation: 'CREATE',
        data: {},
      });

      const peeked = await OfflineQueue.peek();

      expect(peeked?.id).toBe(enqueued.id);
      expect(await OfflineQueue.size()).toBe(1);
    });

    it('should return null for empty queue', async () => {
      const item = await OfflineQueue.peek();
      expect(item).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should return all items', async () => {
      await OfflineQueue.enqueue({
        type: 'TimeEntry',
        operation: 'CREATE',
        data: {},
      });

      await OfflineQueue.enqueue({
        type: 'ETOTransaction',
        operation: 'UPDATE',
        data: {},
      });

      const items = await OfflineQueue.getAll();

      expect(items).toHaveLength(2);
      expect(items[0].type).toBe('TimeEntry');
      expect(items[1].type).toBe('ETOTransaction');
    });

    it('should return empty array for empty queue', async () => {
      const items = await OfflineQueue.getAll();
      expect(items).toEqual([]);
    });
  });

  describe('clear', () => {
    it('should remove all items', async () => {
      await OfflineQueue.enqueue({
        type: 'TimeEntry',
        operation: 'CREATE',
        data: {},
      });

      await OfflineQueue.enqueue({
        type: 'TimeEntry',
        operation: 'CREATE',
        data: {},
      });

      await OfflineQueue.clear();

      expect(await OfflineQueue.isEmpty()).toBe(true);
      expect(await OfflineQueue.size()).toBe(0);
    });
  });

  describe('size and isEmpty', () => {
    it('should return correct size', async () => {
      expect(await OfflineQueue.size()).toBe(0);

      await OfflineQueue.enqueue({
        type: 'TimeEntry',
        operation: 'CREATE',
        data: {},
      });

      expect(await OfflineQueue.size()).toBe(1);

      await OfflineQueue.enqueue({
        type: 'TimeEntry',
        operation: 'CREATE',
        data: {},
      });

      expect(await OfflineQueue.size()).toBe(2);
    });

    it('should report isEmpty correctly', async () => {
      expect(await OfflineQueue.isEmpty()).toBe(true);

      await OfflineQueue.enqueue({
        type: 'TimeEntry',
        operation: 'CREATE',
        data: {},
      });

      expect(await OfflineQueue.isEmpty()).toBe(false);

      await OfflineQueue.clear();

      expect(await OfflineQueue.isEmpty()).toBe(true);
    });
  });

  describe('removeById', () => {
    it('should remove specific item', async () => {
      const item1 = await OfflineQueue.enqueue({
        type: 'TimeEntry',
        operation: 'CREATE',
        data: {},
      });

      const item2 = await OfflineQueue.enqueue({
        type: 'TimeEntry',
        operation: 'CREATE',
        data: {},
      });

      const removed = await OfflineQueue.removeById(item1.id);

      expect(removed).toBe(true);
      expect(await OfflineQueue.size()).toBe(1);

      const remaining = await OfflineQueue.getAll();
      expect(remaining[0].id).toBe(item2.id);
    });

    it('should return false for non-existent ID', async () => {
      const removed = await OfflineQueue.removeById('non-existent');
      expect(removed).toBe(false);
    });
  });

  describe('incrementRetryCount', () => {
    it('should increment retry count', async () => {
      const item = await OfflineQueue.enqueue({
        type: 'TimeEntry',
        operation: 'CREATE',
        data: {},
      });

      await OfflineQueue.incrementRetryCount(item.id);

      const queue = await OfflineQueue.getAll();
      expect(queue[0].retryCount).toBe(1);
    });

    it('should remove item after max retries', async () => {
      const item = await OfflineQueue.enqueue({
        type: 'TimeEntry',
        operation: 'CREATE',
        data: {},
      });

      // Increment 4 times (max is 3)
      await OfflineQueue.incrementRetryCount(item.id);
      await OfflineQueue.incrementRetryCount(item.id);
      await OfflineQueue.incrementRetryCount(item.id);
      const result = await OfflineQueue.incrementRetryCount(item.id);

      expect(result).toBe(false);
      expect(await OfflineQueue.isEmpty()).toBe(true);
    });
  });

  describe('getByType', () => {
    it('should filter items by type', async () => {
      await OfflineQueue.enqueue({
        type: 'TimeEntry',
        operation: 'CREATE',
        data: {},
      });

      await OfflineQueue.enqueue({
        type: 'ETOTransaction',
        operation: 'CREATE',
        data: {},
      });

      await OfflineQueue.enqueue({
        type: 'TimeEntry',
        operation: 'UPDATE',
        data: {},
      });

      const timeEntries = await OfflineQueue.getByType('TimeEntry');
      const etoTransactions = await OfflineQueue.getByType('ETOTransaction');

      expect(timeEntries).toHaveLength(2);
      expect(etoTransactions).toHaveLength(1);
    });
  });

  describe('getByOperation', () => {
    it('should filter items by operation', async () => {
      await OfflineQueue.enqueue({
        type: 'TimeEntry',
        operation: 'CREATE',
        data: {},
      });

      await OfflineQueue.enqueue({
        type: 'TimeEntry',
        operation: 'UPDATE',
        data: {},
      });

      await OfflineQueue.enqueue({
        type: 'TimeEntry',
        operation: 'CREATE',
        data: {},
      });

      const creates = await OfflineQueue.getByOperation('CREATE');
      const updates = await OfflineQueue.getByOperation('UPDATE');

      expect(creates).toHaveLength(2);
      expect(updates).toHaveLength(1);
    });
  });

  describe('persistence', () => {
    it('should persist data across instances', async () => {
      const item = await OfflineQueue.enqueue({
        type: 'TimeEntry',
        operation: 'CREATE',
        data: { test: 'data' },
      });

      // Simulate app restart by getting queue again
      const queue = await OfflineQueue.getAll();

      expect(queue).toHaveLength(1);
      expect(queue[0].id).toBe(item.id);
      expect(queue[0].data).toEqual({ test: 'data' });
    });
  });
});
