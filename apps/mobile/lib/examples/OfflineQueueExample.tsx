import React, { useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { useOfflineQueue } from '../../hooks/useOfflineQueue';

/**
 * Example component demonstrating offline queue usage
 *
 * This shows how to:
 * - Display pending items in the queue
 * - Add new items to the queue
 * - Process items from the queue
 * - Clear the queue
 * - Handle errors
 */
export function OfflineQueueExample() {
  const {
    queue,
    size,
    isEmpty,
    isLoading,
    error,
    enqueue,
    dequeue,
    clear,
    removeById,
    refresh,
  } = useOfflineQueue();

  useEffect(() => {
    // Refresh queue on mount
    refresh();
  }, [refresh]);

  const handleAddTimeEntry = async () => {
    const result = await enqueue({
      type: 'TimeEntry',
      operation: 'CREATE',
      data: {
        employeeId: '123',
        hours: 8,
        date: new Date().toISOString().split('T')[0],
        description: 'Development work',
      },
    });

    if (result) {
      Alert.alert('Success', 'Time entry added to queue');
    } else {
      Alert.alert('Error', 'Failed to add time entry');
    }
  };

  const handleAddETOTransaction = async () => {
    const result = await enqueue({
      type: 'ETOTransaction',
      operation: 'CREATE',
      data: {
        employeeId: '123',
        hours: 2,
        date: new Date().toISOString().split('T')[0],
        etoType: 'VACATION',
      },
    });

    if (result) {
      Alert.alert('Success', 'ETO transaction added to queue');
    } else {
      Alert.alert('Error', 'Failed to add ETO transaction');
    }
  };

  const handleSyncNext = async () => {
    const item = await dequeue();

    if (!item) {
      Alert.alert('Info', 'Queue is empty');
      return;
    }

    // Simulate syncing with backend
    Alert.alert(
      'Syncing',
      `Would sync ${item.type} ${item.operation}\n\nData: ${JSON.stringify(
        item.data,
        null,
        2
      )}`
    );

    // In a real app, you would call your GraphQL mutation here
    // try {
    //   if (item.type === 'TimeEntry') {
    //     await syncTimeEntries({ variables: item.data });
    //   }
    // } catch (error) {
    //   // Re-add to queue or increment retry count
    //   await incrementRetryCount(item.id);
    // }
  };

  const handleClearQueue = async () => {
    Alert.alert('Clear Queue', 'Are you sure you want to clear all items?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clear();
          Alert.alert('Success', 'Queue cleared');
        },
      },
    ]);
  };

  const handleRemoveItem = async (id: string) => {
    const removed = await removeById(id);
    if (removed) {
      Alert.alert('Success', 'Item removed from queue');
    } else {
      Alert.alert('Error', 'Failed to remove item');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading queue...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
        <Button title="Retry" onPress={refresh} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Offline Queue Demo</Text>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {size} {size === 1 ? 'item' : 'items'} in queue
        </Text>
        {isEmpty && <Text style={styles.emptyText}>Queue is empty</Text>}
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Add Time Entry" onPress={handleAddTimeEntry} />
        <Button title="Add ETO Transaction" onPress={handleAddETOTransaction} />
        <Button
          title="Sync Next"
          onPress={handleSyncNext}
          disabled={isEmpty}
        />
        <Button
          title="Clear Queue"
          onPress={handleClearQueue}
          color="red"
          disabled={isEmpty}
        />
      </View>

      <FlatList
        data={queue}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.queueItem}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemType}>
                {item.type} - {item.operation}
              </Text>
              <Text style={styles.itemRetry}>Retries: {item.retryCount}</Text>
            </View>
            <Text style={styles.itemData}>
              {JSON.stringify(item.data, null, 2)}
            </Text>
            <Text style={styles.itemTimestamp}>
              {new Date(item.timestamp).toLocaleString()}
            </Text>
            <Button
              title="Remove"
              onPress={() => handleRemoveItem(item.id)}
              color="red"
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No items in queue. Add some entries to get started!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  statsText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  buttonContainer: {
    gap: 8,
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 8,
  },
  queueItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemRetry: {
    fontSize: 14,
    color: '#666',
  },
  itemData: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  itemTimestamp: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
});
