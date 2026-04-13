import { View, Text, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Card, Heading, BodyText, Caption } from '@/components/BentoBox';

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
    <View className="flex-1 bg-gray-50">
      <StatusBar style="auto" />

      <View className="bg-primary p-lg m-md rounded-lg items-center">
        <Text className="text-body text-white opacity-90 mb-2">
          Current Balance
        </Text>
        <Text className="text-[40px] font-bold text-white mb-2">
          {MOCK_ETO_DATA.balance} hours
        </Text>
        <Caption className="text-white opacity-80">
          Accrual rate: {MOCK_ETO_DATA.accrualRate} hours/month
        </Caption>
      </View>

      <View className="p-md">
        <Heading level={3} className="mb-3">
          Recent Transactions
        </Heading>
        <FlatList
          data={MOCK_TRANSACTIONS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card shadow="level-1" className="mb-2 flex-row justify-between items-center">
              <View className="gap-1">
                <Caption className="text-gray-600">{item.date}</Caption>
                <BodyText className="font-medium">{item.type}</BodyText>
              </View>
              <Text
                className={`text-body font-semibold ${
                  item.hours < 0 ? 'text-error' : 'text-success'
                }`}
              >
                {item.hours > 0 ? '+' : ''}
                {item.hours} hrs
              </Text>
            </Card>
          )}
          scrollEnabled={false}
        />
      </View>
    </View>
  );
}
