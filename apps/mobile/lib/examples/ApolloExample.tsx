import React from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthenticatedQuery } from '../../hooks/useAuthenticatedQuery';
import { useAuthenticatedMutation } from '../../hooks/useAuthenticatedMutation';
import { HEALTH_QUERY, TIME_ENTRIES_QUERY } from '../graphql';
import { CREATE_TIME_ENTRY_MUTATION } from '../graphql';

/**
 * Example component demonstrating Apollo Client usage
 * This shows how to use the custom hooks for queries and mutations
 */

/**
 * Example 1: Simple query with loading and error states
 */
export function HealthCheckExample() {
  const { data, loading, error, refetch } = useAuthenticatedQuery(HEALTH_QUERY);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Checking health...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error: {error.message}</Text>
        <Button title="Retry" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.success}>Status: {data?.health?.status}</Text>
      <Text>Timestamp: {data?.health?.timestamp}</Text>
      <Button title="Refresh" onPress={() => refetch()} />
    </View>
  );
}

/**
 * Example 2: Query with variables and filters
 */
export function TimeEntriesExample() {
  const { data, loading, error, refetch } = useAuthenticatedQuery(
    TIME_ENTRIES_QUERY,
    {
      variables: {
        filters: {
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        },
      },
    },
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Loading time entries...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error: {error.message}</Text>
        <Button title="Retry" onPress={() => refetch()} />
      </View>
    );
  }

  const entries = data?.timeEntries || [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Time Entries ({entries.length})</Text>
      {entries.map((entry: any) => (
        <View key={entry.id} style={styles.entry}>
          <Text>{entry.date}</Text>
          <Text>{entry.totalHours} hours - {entry.description}</Text>
        </View>
      ))}
      <Button title="Refresh" onPress={() => refetch()} />
    </View>
  );
}

/**
 * Example 3: Mutation with optimistic updates
 */
export function CreateTimeEntryExample() {
  const [createEntry, { loading, error, isOfflineQueued }] = useAuthenticatedMutation(
    CREATE_TIME_ENTRY_MUTATION,
    {
      // Refetch time entries after creating a new one
      refetchQueries: ['TimeEntries'],
      // Optimistic response for immediate UI update
      optimisticResponse: (variables: any) => ({
        createTimeEntry: {
          __typename: 'TimeEntryType',
          id: 'temp-id',
          ...variables.input,
          consultantId: 'current-user-id',
          payPeriodId: 'temp-pp-id',
          synced: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
    },
  );

  const handleCreate = async () => {
    try {
      const { data } = await createEntry({
        variables: {
          input: {
            date: new Date().toISOString().split('T')[0],
            totalHours: 8,
            description: 'Example time entry',
            projectTaskNumber: 'TASK-001',
            clientName: 'Example Client',
          },
        },
      });

      console.log('Created time entry:', data?.createTimeEntry);
    } catch (err) {
      console.error('Failed to create time entry:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Time Entry</Text>

      {isOfflineQueued && (
        <Text style={styles.warning}>
          Queued for offline sync
        </Text>
      )}

      {error && (
        <Text style={styles.error}>Error: {error.message}</Text>
      )}

      <Button
        title={loading ? 'Creating...' : 'Create Entry'}
        onPress={handleCreate}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  entry: {
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    marginBottom: 4,
  },
  success: {
    color: 'green',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontWeight: 'bold',
  },
  warning: {
    color: 'orange',
    fontWeight: 'bold',
  },
});
