import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatHours } from '@/utils/add-entry';

export function TotalHoursDisplay({ hours }: { hours: number }) {
  const hoursColor =
    hours <= 0
      ? '#EF4444'
      : hours < 4
        ? '#F59E0B'
        : hours > 12
          ? '#F59E0B'
          : '#2563EB';

  return (
    <View
      className="mx-md mt-md items-center justify-center"
      style={{
        height: 64,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: hoursColor,
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 16,
      }}
      accessibilityLabel={`Total ${formatHours(hours)} hours`}
      accessibilityRole="text"
    >
      <View className="flex-row items-center">
        <Ionicons name="time" size={20} color={hoursColor} />
        <Text
          className="text-h2 font-bold ml-2"
          style={{ color: hoursColor }}
        >
          {formatHours(hours)}
        </Text>
      </View>
      <Text className="text-body-small text-gray-600">hours</Text>
    </View>
  );
}
