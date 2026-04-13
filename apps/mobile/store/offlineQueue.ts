import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_STORAGE_KEY = '@timetrack:offline-queue';

/**
 * Entity types that can be queued for offline sync
 */
export type EntityType = 'TimeEntry' | 'ETOTransaction' | 'TimesheetSubmission';

/**
 * Sync operation types matching the backend SyncOperation enum
 */
export type SyncOperation = 'CREATE' | 'UPDATE' | 'DELETE';

/**
 * A queued mutation operation waiting to be synced to the server
 */
export interface QueuedOperation {
  /** Unique ID for this queued operation */
  id: string;
  /** The type of entity being synced */
  entityType: EntityType;
  /** The sync operation to perform */
  operation: SyncOperation;
  /** ID of the entity (null for CREATE operations) */
  entityId?: string;
  /** The actual data payload to sync */
  entityData: any;
  /** Timestamp (ms) when the operation was queued */
  timestamp: number;
  /** Number of failed sync attempts */
  retryCount: number;
  /** Last error message if a sync attempt failed */
  lastError?: string;
}

/**
 * Generate a unique ID for a queue operation
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Read the current queue from AsyncStorage
 */
async function readQueue(): Promise<QueuedOperation[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
    if (raw === null) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('[offlineQueue] Failed to read queue:', error);
    return [];
  }
}

/**
 * Write the queue to AsyncStorage
 */
async function writeQueue(queue: QueuedOperation[]): Promise<void> {
  try {
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('[offlineQueue] Failed to write queue:', error);
    throw error;
  }
}

/**
 * Add an operation to the offline sync queue.
 *
 * Assigns a unique ID, timestamp, and initializes retryCount to 0.
 */
export async function enqueueOperation(
  operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retryCount'>
): Promise<void> {
  const queue = await readQueue();
  const item: QueuedOperation = {
    ...operation,
    id: generateId(),
    timestamp: Date.now(),
    retryCount: 0,
  };
  queue.push(item);
  await writeQueue(queue);
}

/**
 * Get all queued operations, ordered by timestamp (oldest first).
 */
export async function getQueuedOperations(): Promise<QueuedOperation[]> {
  return readQueue();
}

/**
 * Remove a single operation from the queue by its ID.
 */
export async function dequeueOperation(operationId: string): Promise<void> {
  const queue = await readQueue();
  const filtered = queue.filter((op) => op.id !== operationId);
  await writeQueue(filtered);
}

/**
 * Remove multiple operations from the queue by their IDs.
 */
export async function dequeueOperations(operationIds: string[]): Promise<void> {
  const idSet = new Set(operationIds);
  const queue = await readQueue();
  const filtered = queue.filter((op) => !idSet.has(op.id));
  await writeQueue(filtered);
}

/**
 * Clear the entire offline sync queue.
 */
export async function clearQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
  } catch (error) {
    console.error('[offlineQueue] Failed to clear queue:', error);
    throw error;
  }
}

/**
 * Update fields on a queued operation (e.g., increment retryCount or set lastError).
 */
export async function updateQueuedOperation(
  operationId: string,
  updates: Partial<QueuedOperation>
): Promise<void> {
  const queue = await readQueue();
  const index = queue.findIndex((op) => op.id === operationId);
  if (index === -1) {
    return;
  }
  queue[index] = { ...queue[index], ...updates };
  await writeQueue(queue);
}

/**
 * Get the number of operations currently in the queue.
 */
export async function getQueueSize(): Promise<number> {
  const queue = await readQueue();
  return queue.length;
}

/**
 * Get all queued operations for a specific entity type.
 */
export async function getOperationsByType(
  entityType: EntityType
): Promise<QueuedOperation[]> {
  const queue = await readQueue();
  return queue.filter((op) => op.entityType === entityType);
}
