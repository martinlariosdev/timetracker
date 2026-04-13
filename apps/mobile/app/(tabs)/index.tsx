import { View, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Card, Heading, BodyText, Badge } from '@/components/BentoBox';

// Placeholder data
const MOCK_TIMESHEETS = [
  { id: '1', weekEnding: '2026-04-11', status: 'Draft', hours: 40 },
  { id: '2', weekEnding: '2026-04-04', status: 'Submitted', hours: 40 },
  { id: '3', weekEnding: '2026-03-28', status: 'Approved', hours: 40 },
];

type TimesheetStatus = 'Draft' | 'Submitted' | 'Approved';

const getStatusVariant = (status: TimesheetStatus): 'warning' | 'info' | 'success' => {
  switch (status) {
    case 'Draft':
      return 'warning';
    case 'Submitted':
      return 'info';
    case 'Approved':
      return 'success';
  }
};

export default function TimesheetListScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="auto" />

      <FlatList
        data={MOCK_TIMESHEETS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card shadow="level-2" className="mb-3">
            <View className="flex-row justify-between items-center mb-2">
              <Heading level={4} className="flex-1">
                Week ending {item.weekEnding}
              </Heading>
              <Badge variant={getStatusVariant(item.status as TimesheetStatus)}>
                {item.status}
              </Badge>
            </View>
            <BodyText className="text-gray-600">{item.hours} hours</BodyText>
          </Card>
        )}
        contentContainerClassName="p-md"
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-xl">
            <BodyText className="text-gray-600">No timesheets found</BodyText>
          </View>
        }
      />
    </View>
  );
}
