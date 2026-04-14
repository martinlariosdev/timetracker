import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function DuplicateYesterdayButton({
  onPress,
  isAvailable,
}: {
  onPress: () => void;
  isAvailable: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!isAvailable}
      activeOpacity={0.8}
      className={`mx-md mt-3 flex-row items-center justify-center shadow-level-1 ${
        isAvailable ? '' : 'opacity-50'
      }`}
      style={{
        height: 48,
        borderRadius: 12,
        backgroundColor: isAvailable ? '#0EA5E9' : '#D1D5DB',
      }}
      accessibilityLabel="Duplicate yesterday's entry"
      accessibilityRole="button"
      accessibilityState={{ disabled: !isAvailable }}
    >
      <Ionicons
        name="clipboard"
        size={20}
        color={isAvailable ? '#FFFFFF' : '#6B7280'}
      />
      <Text
        className="text-body font-semibold ml-2"
        style={{ color: isAvailable ? '#FFFFFF' : '#6B7280' }}
      >
        Duplicate Yesterday
      </Text>
    </TouchableOpacity>
  );
}
