import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WorkHoursPickerProps {
  visible: boolean;
  currentHours: number;
  onSelect: (hours: number) => Promise<void>;
  onClose: () => void;
}

export function WorkHoursPicker({
  visible,
  currentHours,
  onSelect,
  onClose,
}: WorkHoursPickerProps) {
  const [selectedHours, setSelectedHours] = useState(currentHours);
  const [isSaving, setIsSaving] = useState(false);

  const hours = Array.from({ length: 9 }, (_, i) => i + 4); // 4-12 hours

  const handleSelect = async () => {
    if (selectedHours === currentHours) {
      onClose();
      return;
    }

    setIsSaving(true);
    try {
      await onSelect(selectedHours);
      onClose();
    } catch (error) {
      console.error('Failed to save work hours:', error);
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
            Set Work Hours
          </Text>

          {/* Hour Selection */}
          <ScrollView
            className="max-h-48"
            showsVerticalScrollIndicator={false}
          >
            {hours.map((hour) => (
              <TouchableOpacity
                key={hour}
                onPress={() => setSelectedHours(hour)}
                activeOpacity={0.7}
                className={`py-3 px-4 rounded-lg mb-2 flex-row items-center justify-between ${
                  selectedHours === hour ? 'bg-primary/10' : 'bg-gray-50'
                }`}
                accessibilityLabel={`${hour} hours`}
                accessibilityRole="radio"
                accessibilityState={{ selected: selectedHours === hour }}
              >
                <Text
                  className={`text-body font-semibold ${
                    selectedHours === hour ? 'text-primary' : 'text-gray-800'
                  }`}
                >
                  {hour} hours per day
                </Text>
                {selectedHours === hour && (
                  <Ionicons name="checkmark" size={20} color="#2563EB" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Info Text */}
          <Text
            className="text-body-small text-gray-500 text-center mt-6 mb-6"
            style={{ lineHeight: 20 }}
          >
            This helps us calculate your daily targets and track your hours accurately.
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
              accessibilityLabel="Save work hours"
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
