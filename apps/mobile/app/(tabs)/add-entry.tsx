import { View, ScrollView, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Input, Button, BodyText } from '@/components/BentoBox';

export default function AddEntryScreen() {
  const [date, setDate] = useState('');
  const [hours, setHours] = useState('');
  const [taskCode, setTaskCode] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    // TODO: Implement save logic with Apollo Client
    console.log('Save entry', { date, hours, taskCode, notes });
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <StatusBar style="auto" />

      <View className="p-md gap-4">
        <Input
          label="Date"
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
        />

        <Input
          label="Hours"
          placeholder="8.0"
          value={hours}
          onChangeText={setHours}
          keyboardType="decimal-pad"
        />

        <Input
          label="Task Code"
          placeholder="Select task code"
          value={taskCode}
          onChangeText={setTaskCode}
        />

        <View className="mb-4">
          <BodyText className="text-gray-700 mb-2 text-body-small">
            Notes
          </BodyText>
          <TextInput
            className="h-24 px-3 rounded-md border border-gray-300 text-body text-gray-800 bg-white"
            placeholder="Add notes (optional)"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <Button variant="primary" onPress={handleSave} className="mt-2">
          Save Entry
        </Button>
      </View>
    </ScrollView>
  );
}
