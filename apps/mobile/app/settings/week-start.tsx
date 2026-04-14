import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePreferences, type WeekStartDay } from '@/contexts/PreferencesContext';

function TopBar({
  topInset,
  onBack,
}: {
  topInset: number;
  onBack: () => void;
}) {
  return (
    <View className="bg-white shadow-level-1" style={{ paddingTop: topInset }}>
      <View
        className="flex-row items-center"
        style={{ height: 56, paddingHorizontal: 16 }}
      >
        <TouchableOpacity
          onPress={onBack}
          className="items-center justify-center"
          style={{ width: 44, height: 44 }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text
          className="text-h3 font-semibold text-gray-800 flex-1 text-center"
          style={{ marginRight: 44 }}
          accessibilityRole="header"
        >
          Week Start Day
        </Text>
      </View>
    </View>
  );
}

function DayOption({
  day,
  label,
  selected,
  onPress,
}: {
  day: WeekStartDay;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center justify-between mx-md mt-2 px-4 py-3 rounded-lg ${
        selected ? 'bg-blue-50 border-2 border-primary' : 'bg-white border border-gray-200'
      }`}
      style={{
        borderRadius: 12,
      }}
      accessibilityLabel={`Week starts on ${label}`}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <View className="flex-row items-center flex-1">
        <View
          className={`w-5 h-5 rounded-full border-2 ${
            selected ? 'bg-primary border-primary' : 'border-gray-400'
          }`}
          style={{ width: 20, height: 20, borderRadius: 10 }}
        />
        <Text className={`text-body ml-3 ${selected ? 'text-primary font-semibold' : 'text-gray-800'}`}>
          {label}
        </Text>
      </View>
      {selected && (
        <Ionicons name="checkmark" size={20} color="#2563EB" />
      )}
    </TouchableOpacity>
  );
}

export default function WeekStartScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { weekStartDay, setWeekStartDay } = usePreferences();
  const [selectedDay, setSelectedDay] = useState<WeekStartDay>(weekStartDay);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (selectedDay === weekStartDay) {
      router.back();
      return;
    }

    setIsSaving(true);
    try {
      await setWeekStartDay(selectedDay);
      const dayLabel = selectedDay === 'monday' ? 'Monday' : 'Sunday';
      Alert.alert('Success', `Week now starts on ${dayLabel}`);
      router.back();
    } catch (error) {
      console.error('Failed to update week start day:', error);
      Alert.alert('Error', 'Failed to update week start day. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [selectedDay, weekStartDay, setWeekStartDay, router]);

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      <TopBar topInset={insets.top} onBack={() => router.back()} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        <View className="mx-md mt-md p-4 bg-blue-50 rounded-lg">
          <Text className="text-body text-gray-800">
            Choose which day your work week starts. This affects the calendar view and week calculations.
          </Text>
        </View>

        {/* Day Options */}
        <Text
          className="text-caption font-bold text-gray-500 uppercase mt-6 mx-md"
        >
          Select Day
        </Text>

        <DayOption
          day="monday"
          label="Monday"
          selected={selectedDay === 'monday'}
          onPress={() => setSelectedDay('monday')}
        />
        <DayOption
          day="sunday"
          label="Sunday"
          selected={selectedDay === 'sunday'}
          onPress={() => setSelectedDay('sunday')}
        />

        {/* Info Box */}
        <View className="mx-md mt-6 p-4 bg-gray-100 rounded-lg">
          <Text className="text-body-small text-gray-700 font-semibold mb-2">
            What this affects:
          </Text>
          <Text className="text-body-small text-gray-600">
            • Calendar view in the home screen{'\n'}
            • Week boundaries for timesheets{'\n'}
            • Week calculations in metrics
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.8}
          className="mx-md mt-6 flex-row items-center justify-center bg-green-500 rounded-lg"
          style={{ height: 48 }}
          accessibilityLabel="Save week start day"
          accessibilityRole="button"
          accessibilityState={{ disabled: isSaving }}
        >
          {isSaving ? (
            <Text className="text-body font-semibold text-white">Saving...</Text>
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              <Text className="text-body font-semibold text-white ml-2">Save</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Info Text */}
        <Text className="text-caption text-gray-500 text-center mt-4 mx-md">
          Current selection: {selectedDay === 'monday' ? 'Monday' : 'Sunday'}
        </Text>
      </ScrollView>
    </View>
  );
}
