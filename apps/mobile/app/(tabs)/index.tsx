import { View, Text, StyleSheet, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Placeholder data
const MOCK_TIMESHEETS = [
  { id: '1', weekEnding: '2026-04-11', status: 'Draft', hours: 40 },
  { id: '2', weekEnding: '2026-04-04', status: 'Submitted', hours: 40 },
  { id: '3', weekEnding: '2026-03-28', status: 'Approved', hours: 40 },
];

export default function TimesheetListScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <FlatList
        data={MOCK_TIMESHEETS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.timesheetItem}>
            <View style={styles.timesheetHeader}>
              <Text style={styles.weekEnding}>Week ending {item.weekEnding}</Text>
              <Text
                style={[
                  styles.status,
                  item.status === 'Draft' && styles.statusDraft,
                  item.status === 'Submitted' && styles.statusSubmitted,
                  item.status === 'Approved' && styles.statusApproved,
                ]}
              >
                {item.status}
              </Text>
            </View>
            <Text style={styles.hours}>{item.hours} hours</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No timesheets found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  timesheetItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timesheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  weekEnding: {
    fontSize: 16,
    fontWeight: '600',
  },
  hours: {
    fontSize: 14,
    color: '#666',
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusDraft: {
    backgroundColor: '#FFF3CD',
    color: '#856404',
  },
  statusSubmitted: {
    backgroundColor: '#D1ECF1',
    color: '#0C5460',
  },
  statusApproved: {
    backgroundColor: '#D4EDDA',
    color: '#155724',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
