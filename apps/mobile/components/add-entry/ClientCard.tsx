import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function ClientCard({
  clientName,
  subtext,
  onPress,
  isExpanded,
}: {
  clientName: string;
  subtext: string;
  onPress: () => void;
  isExpanded: boolean;
}) {
  if (isExpanded) {
    return (
      <View className="mx-md mt-3">
        <Text className="text-body-small text-gray-700 mb-2">Client</Text>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.8}
          className="bg-white flex-row items-center"
          style={{
            height: 56,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#D1D5DB',
            paddingHorizontal: 16,
          }}
          accessibilityLabel={`Client, ${clientName}`}
          accessibilityRole="button"
        >
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <Text className="text-body text-gray-800 font-semibold flex-1 ml-3">
            {clientName}
          </Text>
          <Ionicons name="checkmark" size={20} color="#2563EB" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="mx-md mt-3 bg-gray-50 flex-row items-center"
      style={{
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 16,
      }}
      accessibilityLabel={`Client, ${clientName}, ${subtext}`}
      accessibilityRole="button"
    >
      <Ionicons name="bookmark" size={20} color="#2563EB" />
      <View className="ml-3 flex-1">
        <Text className="text-body-large text-gray-800 font-semibold">
          {clientName}
        </Text>
        <Text className="text-caption text-gray-500">{subtext}</Text>
      </View>
      <Ionicons name="checkmark-circle" size={20} color="#2563EB" />
    </TouchableOpacity>
  );
}
