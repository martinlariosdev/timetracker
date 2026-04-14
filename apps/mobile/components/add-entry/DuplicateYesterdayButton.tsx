import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function DuplicateYesterdayButton({
  onPress,
  isAvailable,
  isLoading = false,
}: {
  onPress: () => void;
  isAvailable: boolean;
  isLoading?: boolean;
}) {
  const disabled = !isAvailable || isLoading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      className={`mx-md mt-3 flex-row items-center justify-center shadow-level-1 ${
        disabled ? 'opacity-50' : ''
      }`}
      style={{
        height: 48,
        borderRadius: 12,
        backgroundColor: disabled ? '#D1D5DB' : '#0EA5E9',
      }}
      accessibilityLabel="Duplicate yesterday's entry"
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Ionicons
          name="clipboard"
          size={20}
          color={disabled ? '#6B7280' : '#FFFFFF'}
        />
      )}
      <Text
        className="text-body font-semibold ml-2"
        style={{ color: disabled ? '#6B7280' : '#FFFFFF' }}
      >
        {isLoading ? 'Loading...' : 'Duplicate Yesterday'}
      </Text>
    </TouchableOpacity>
  );
}
