import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MONTH_NAMES, FULL_DAY_NAMES } from '@/constants/add-entry';

export function DateSelectorCard({
  date,
  onPress,
}: {
  date: Date;
  onPress: () => void;
}) {
  const formattedDate = `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  const dayOfWeek = FULL_DAY_NAMES[date.getDay()];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityLabel={`Date selector, currently ${formattedDate}, ${dayOfWeek}`}
      accessibilityRole="button"
      accessibilityHint="Tap to change date"
    >
      <LinearGradient
        colors={['#2563EB', '#3B82F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="mx-md mt-md shadow-level-2"
        style={{ height: 96, borderRadius: 16, padding: 20, justifyContent: 'center', alignItems: 'center' }}
      >
        <Text className="text-h2 font-bold" style={{ color: '#FFFFFF' }}>
          {formattedDate}
        </Text>
        <Text className="text-body mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {dayOfWeek}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}
