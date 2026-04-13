import { View, Text, StyleSheet, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Placeholder data
const MOCK_ETO_DATA = {
  balance: 120.5,
  accrualRate: 8.0,
};

const MOCK_TRANSACTIONS = [
  { id: '1', date: '2026-04-01', type: 'Accrual', hours: 8.0 },
  { id: '2', date: '2026-03-25', type: 'Used', hours: -8.0 },
  { id: '3', date: '2026-03-01', type: 'Accrual', hours: 8.0 },
];

export default function ETOScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceValue}>{MOCK_ETO_DATA.balance} hours</Text>
        <Text style={styles.accrualRate}>
          Accrual rate: {MOCK_ETO_DATA.accrualRate} hours/month
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <FlatList
          data={MOCK_TRANSACTIONS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.transactionItem}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDate}>{item.date}</Text>
                <Text style={styles.transactionType}>{item.type}</Text>
              </View>
              <Text
                style={[
                  styles.transactionHours,
                  item.hours < 0 ? styles.negative : styles.positive,
                ]}
              >
                {item.hours > 0 ? '+' : ''}
                {item.hours} hrs
              </Text>
            </View>
          )}
          scrollEnabled={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  balanceCard: {
    backgroundColor: '#007AFF',
    padding: 24,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  accrualRate: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  transactionInfo: {
    gap: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionHours: {
    fontSize: 16,
    fontWeight: '600',
  },
  positive: {
    color: '#34C759',
  },
  negative: {
    color: '#FF3B30',
  },
});
