import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { WeekStartDay } from '@/contexts/PreferencesContext';

interface WeekStartDayPickerProps {
  visible: boolean;
  currentDay: WeekStartDay;
  onSelect: (day: WeekStartDay) => Promise<void>;
  onClose: () => void;
}

const DAYS: { label: string; value: WeekStartDay }[] = [
  { label: 'Sunday', value: 'sunday' },
  { label: 'Monday', value: 'monday' },
];

export function WeekStartDayPicker({
  visible,
  currentDay,
  onSelect,
  onClose,
}: WeekStartDayPickerProps) {
  const [selectedDay, setSelectedDay] = useState<WeekStartDay>(currentDay);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelect = async () => {
    if (selectedDay === currentDay) {
      onClose();
      return;
    }

    setIsSaving(true);
    try {
      await onSelect(selectedDay);
      onClose();
    } catch (error) {
      console.error('Failed to save week start day:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType={Platform.OS === 'ios' ? 'slide' : 'fade'}
      onRequestClose={onClose}
    >
      <View
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="Close modal"
        />
        <View
          className="bg-white"
          style={{
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: Platform.OS === 'ios' ? 40 : 24,
          }}
        >
          {/* Handle */}
          <View
            className="self-center rounded-full mb-6"
            style={{ width: 40, height: 4, backgroundColor: '#D1D5DB' }}
          />

          {/* Header */}
          <Text
            className="font-bold text-gray-900 text-center"
            style={{ fontSize: 20, lineHeight: 28, marginBottom: 24 }}
          >
            Week Start Day
          </Text>

          {/* Day Selection */}
          <View style={{ gap: 12, marginBottom: 24 }}>
            {DAYS.map((day) => (
              <TouchableOpacity
                key={day.value}
                onPress={() => setSelectedDay(day.value)}
                activeOpacity={0.7}
                className={`py-3 px-4 rounded-lg flex-row items-center justify-between ${
                  selectedDay === day.value ? 'bg-primary/10' : 'bg-gray-50'
                }`}
                accessibilityLabel={`${day.label}`}
                accessibilityRole="radio"
                accessibilityState={{ selected: selectedDay === day.value }}
              >
                <Text
                  className={`text-body font-semibold ${
                    selectedDay === day.value ? 'text-primary' : 'text-gray-800'
                  }`}
                >
                  {day.label}
                </Text>
                {selectedDay === day.value && (
                  <Ionicons name="checkmark" size={20} color="#2563EB" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Info Text */}
          <Text
            className="text-body-small text-gray-500 text-center mb-6"
            style={{ lineHeight: 20 }}
          >
            This affects how your weekly calendar displays and your statistics calculations.
          </Text>

          {/* Action Buttons */}
          <View className="flex-row" style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={onClose}
              disabled={isSaving}
              className="flex-1 items-center justify-center rounded-xl"
              style={{
                height: 52,
                borderWidth: 1.5,
                borderColor: '#D1D5DB',
                backgroundColor: '#FFFFFF',
              }}
              accessibilityLabel="Cancel"
              accessibilityRole="button"
            >
              <Text
                className="font-semibold"
                style={{ fontSize: 16, color: '#4B5563' }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSelect}
              disabled={isSaving}
              className="flex-1 items-center justify-center rounded-xl"
              style={{
                height: 52,
                backgroundColor: isSaving ? '#D1D5DB' : '#2563EB',
              }}
              accessibilityLabel="Save week start day"
              accessibilityRole="button"
              accessibilityState={{ disabled: isSaving }}
            >
              <Text
                className="font-semibold"
                style={{ fontSize: 16, color: '#FFFFFF' }}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
