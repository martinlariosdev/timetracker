import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTimePicker } from '@/components/TimePicker';
import { TimeEntryPairData } from '@/types/add-entry';
import {
  validateTimeEntry,
  formatTimeDisplay,
} from '@/utils/add-entry';

export function TimeEntryPairRow({
  entry,
  index,
  showLabel,
  onChangeInTime,
  onChangeOutTime,
  onRemove,
  canRemove,
  error,
}: {
  entry: TimeEntryPairData;
  index: number;
  showLabel: boolean;
  onChangeInTime: (time: string) => void;
  onChangeOutTime: (time: string) => void;
  onRemove: () => void;
  canRemove: boolean;
  error?: string;
}) {
  const validation = validateTimeEntry(entry);
  const borderColor = error ? '#EF4444' : '#D1D5DB';

  const inTimePicker = useTimePicker({
    value: entry.inTime,
    onChange: onChangeInTime,
    label: 'In Time',
  });

  const outTimePicker = useTimePicker({
    value: entry.outTime,
    onChange: onChangeOutTime,
    label: 'Out Time',
  });

  return (
    <View className="mx-md mt-3">
      {showLabel && (
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-body-small text-gray-700">
            Time Entry {index + 1}
          </Text>
          {canRemove && (
            <TouchableOpacity
              onPress={onRemove}
              style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}
              accessibilityLabel={`Remove time entry ${index + 1}`}
              accessibilityRole="button"
            >
              <Ionicons name="close-circle" size={20} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      )}
      <View
        className="bg-white shadow-level-1 flex-row"
        style={{
          borderRadius: 16,
          borderWidth: error ? 2 : 1,
          borderColor,
          padding: 16,
          gap: 12,
        }}
      >
        {/* In Time */}
        <TouchableOpacity
          className="flex-1 items-center"
          style={{ height: 56, justifyContent: 'center' }}
          onPress={inTimePicker.open}
          accessibilityLabel={`In time, ${formatTimeDisplay(entry.inTime)}`}
          accessibilityRole="button"
          accessibilityHint="Tap to change start time"
        >
          <Text className="text-h3 font-bold" style={{ color: '#2563EB' }}>
            {entry.inTime}
          </Text>
          <Text className="text-caption text-gray-500 mt-1">In Time</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View
          style={{
            width: 1,
            backgroundColor: '#E5E7EB',
            marginVertical: 4,
          }}
        />

        {/* Out Time */}
        <TouchableOpacity
          className="flex-1 items-center"
          style={{ height: 56, justifyContent: 'center' }}
          onPress={outTimePicker.open}
          accessibilityLabel={`Out time, ${formatTimeDisplay(entry.outTime)}`}
          accessibilityRole="button"
          accessibilityHint="Tap to change end time"
        >
          <Text className="text-h3 font-bold" style={{ color: '#2563EB' }}>
            {entry.outTime}
          </Text>
          <Text className="text-caption text-gray-500 mt-1">Out Time</Text>
        </TouchableOpacity>
      </View>
      {inTimePicker.modal}
      {outTimePicker.modal}
      {error && (
        <Text className="text-caption text-error mt-1 ml-1">{error}</Text>
      )}
      {!validation.valid && !error && entry.inTime && entry.outTime && (
        <Text className="text-caption text-error mt-1 ml-1">
          {validation.error}
        </Text>
      )}
      {validation.valid && validation.error && (
        <Text className="text-caption mt-1 ml-1" style={{ color: '#F59E0B' }}>
          {validation.error}
        </Text>
      )}
    </View>
  );
}
