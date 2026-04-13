# Offline Queue Storage

This module provides persistent storage for offline sync operations using AsyncStorage in React Native.

## Overview

The offline queue system consists of three main components:

1. **Storage** (`storage.ts`) - Low-level AsyncStorage wrapper with error handling
2. **OfflineQueue** (`offline-queue.ts`) - Queue management with FIFO operations
3. **useOfflineQueue** (`../hooks/useOfflineQueue.ts`) - React hook for queue operations

## Installation

AsyncStorage is already installed:

```bash
pnpm add @react-native-async-storage/async-storage
```

## Usage

### Basic Queue Operations

```typescript
import { OfflineQueue } from './lib/offline-queue';

// Add item to queue
const item = await OfflineQueue.enqueue({
  type: 'TimeEntry',
  operation: 'CREATE',
  data: {
    employeeId: '123',
    hours: 8,
    date: '2024-01-01',
  },
});

// Get first item without removing
const nextItem = await OfflineQueue.peek();

// Remove and return first item
const item = await OfflineQueue.dequeue();

// Get all items
const allItems = await OfflineQueue.getAll();

// Clear queue
await OfflineQueue.clear();

// Get queue size
const size = await OfflineQueue.size();

// Check if empty
const isEmpty = await OfflineQueue.isEmpty();
```

### Using the React Hook

```tsx
import { useOfflineQueue } from './hooks/useOfflineQueue';

function SyncScreen() {
  const {
    queue,
    size,
    isEmpty,
    isLoading,
    error,
    enqueue,
    dequeue,
    clear,
    refresh,
  } = useOfflineQueue();

  const handleCreateTimeEntry = async () => {
    await enqueue({
      type: 'TimeEntry',
      operation: 'CREATE',
      data: {
        employeeId: '123',
        hours: 8,
        date: '2024-01-01',
      },
    });
  };

  const handleSync = async () => {
    const item = await dequeue();
    if (item) {
      // Sync with backend
      console.log('Syncing:', item);
    }
  };

  if (isLoading) {
    return <Text>Loading queue...</Text>;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  return (
    <View>
      <Text>Pending items: {size}</Text>
      {queue.map((item) => (
        <Text key={item.id}>
          {item.type} - {item.operation}
        </Text>
      ))}
      <Button onPress={handleCreateTimeEntry} title="Add Entry" />
      <Button onPress={handleSync} title="Sync Next" />
      <Button onPress={clear} title="Clear Queue" />
    </View>
  );
}
```

### Advanced Queue Operations

```typescript
// Remove specific item
const removed = await OfflineQueue.removeById('item-id');

// Update item
const updated = await OfflineQueue.updateById('item-id', {
  retryCount: 1,
});

// Increment retry count
const success = await OfflineQueue.incrementRetryCount('item-id');

// Get items by type
const timeEntries = await OfflineQueue.getByType('TimeEntry');

// Get items by operation
const createOps = await OfflineQueue.getByOperation('CREATE');
```

### Storage Operations

```typescript
import { Storage } from './lib/storage';

// Store data
await Storage.setItem('user', { id: '123', name: 'John' });

// Retrieve data
const user = await Storage.getItem<User>('user');

// Remove data
await Storage.removeItem('user');

// Clear all storage
await Storage.clear();

// Get all keys
const keys = await Storage.getAllKeys();

// Get multiple items
const items = await Storage.multiGet<User>(['user1', 'user2']);
```

## Data Structure

### QueueItem

```typescript
interface QueueItem {
  id: string; // Auto-generated unique ID
  type: 'TimeEntry' | 'ETOTransaction' | 'TimesheetSubmission';
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  data: any; // Operation-specific data
  timestamp: number; // Unix timestamp (ms)
  retryCount: number; // Number of retry attempts
}
```

## Error Handling

The storage system handles three types of errors:

### 1. Storage Quota Exceeded

```typescript
try {
  await OfflineQueue.enqueue(item);
} catch (error) {
  if (error instanceof StorageQuotaExceededError) {
    // Storage is full
    // Queue automatically attempts cleanup and retry
    console.error('Storage quota exceeded');
  }
}
```

### 2. Corrupted Data

```typescript
try {
  const data = await Storage.getItem('key');
} catch (error) {
  if (error instanceof StorageCorruptedDataError) {
    // Data is corrupted or invalid JSON
    console.error('Corrupted data detected');
  }
}
```

### 3. General Storage Errors

```typescript
try {
  await Storage.setItem('key', data);
} catch (error) {
  if (error instanceof StorageError) {
    console.error('Storage error:', error.message);
    console.error('Cause:', error.cause);
  }
}
```

## Queue Features

### Automatic Cleanup

- Items older than 7 days are removed
- Items exceeding max retry count (3) are removed
- Cleanup runs automatically when storage quota is exceeded

### Retry Logic

```typescript
// Max retry count is 3
const MAX_RETRY_COUNT = 3;

// Increment retry count
const success = await OfflineQueue.incrementRetryCount(itemId);

// If retry count > MAX_RETRY_COUNT, item is automatically removed
```

### Queue Persistence

- Queue persists across app restarts
- Data is stored in AsyncStorage with key: `@timetrack:offline_queue`
- All operations are atomic

## Testing

### Test Queue Operations

```typescript
describe('OfflineQueue', () => {
  beforeEach(async () => {
    await OfflineQueue.clear();
  });

  it('should enqueue and dequeue items', async () => {
    const item = await OfflineQueue.enqueue({
      type: 'TimeEntry',
      operation: 'CREATE',
      data: { hours: 8 },
    });

    expect(item).toBeDefined();
    expect(await OfflineQueue.size()).toBe(1);

    const dequeued = await OfflineQueue.dequeue();
    expect(dequeued?.id).toBe(item.id);
    expect(await OfflineQueue.isEmpty()).toBe(true);
  });

  it('should handle retry count', async () => {
    const item = await OfflineQueue.enqueue({
      type: 'TimeEntry',
      operation: 'CREATE',
      data: {},
    });

    await OfflineQueue.incrementRetryCount(item.id);
    const queue = await OfflineQueue.getAll();
    expect(queue[0].retryCount).toBe(1);
  });
});
```

### Test with Hook

```tsx
import { renderHook, act } from '@testing-library/react-hooks';
import { useOfflineQueue } from './hooks/useOfflineQueue';

describe('useOfflineQueue', () => {
  it('should enqueue items', async () => {
    const { result } = renderHook(() => useOfflineQueue());

    await act(async () => {
      await result.current.enqueue({
        type: 'TimeEntry',
        operation: 'CREATE',
        data: { hours: 8 },
      });
    });

    expect(result.current.size).toBe(1);
    expect(result.current.isEmpty).toBe(false);
  });
});
```

## Integration with Backend

The queue is designed to work with backend sync mutations:

```typescript
import { useMutation } from '@apollo/client';
import { SYNC_TIME_ENTRIES } from './graphql/mutations';

function useOfflineSync() {
  const { queue, dequeue, incrementRetryCount } = useOfflineQueue();
  const [syncTimeEntries] = useMutation(SYNC_TIME_ENTRIES);

  const syncNext = async () => {
    const item = await dequeue();
    if (!item) return;

    try {
      if (item.type === 'TimeEntry') {
        await syncTimeEntries({ variables: item.data });
      }
      // Successfully synced, item already removed by dequeue
    } catch (error) {
      // Failed, increment retry count
      await incrementRetryCount(item.id);
    }
  };

  return { syncNext, pendingCount: queue.length };
}
```

## Best Practices

1. **Always handle errors** - Storage operations can fail
2. **Use the hook in React components** - Automatic state management
3. **Monitor queue size** - Alert users when queue is growing
4. **Sync regularly** - Process queue when network is available
5. **Handle retry limits** - Remove or alert on items that can't be synced
6. **Test persistence** - Verify queue survives app restarts
7. **Clean up old items** - Don't let queue grow indefinitely

## Storage Keys

- Queue: `@timetrack:offline_queue`
- Custom keys should follow the pattern: `@timetrack:<feature>:<key>`

## Limitations

- AsyncStorage is limited to ~6MB on Android, ~10MB on iOS
- Large queues may hit quota limits
- No concurrent access protection (single app instance assumed)
- Queue is FIFO only (no priority support)
