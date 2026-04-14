import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePreferences } from '@/contexts/PreferencesContext';

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
          Work Hours
        </Text>
      </View>
    </View>
  );
}

function HourOption({
  hours,
  selected,
  onPress,
}: {
  hours: number;
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
      accessibilityLabel={`${hours} hours per day`}
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
          {hours} hours per day
        </Text>
      </View>
      {selected && (
        <Ionicons name="checkmark" size={20} color="#2563EB" />
      )}
    </TouchableOpacity>
  );
}

export default function WorkHoursScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { workHours, setWorkHours } = usePreferences();
  const [selectedHours, setSelectedHours] = useState(workHours);
  const [isSaving, setIsSaving] = useState(false);

  const HOUR_OPTIONS = [4, 6, 7, 8, 9, 10, 12];

  const handleSave = useCallback(async () => {
    if (selectedHours === workHours) {
      router.back();
      return;
    }

    setIsSaving(true);
    try {
      await setWorkHours(selectedHours);
      Alert.alert('Success', `Work hours updated to ${selectedHours} hours per day`);
      router.back();
    } catch (error) {
      console.error('Failed to update work hours:', error);
      Alert.alert('Error', 'Failed to update work hours. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [selectedHours, workHours, setWorkHours, router]);

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
            Select your standard work hours per day. This is used to calculate your daily timesheet targets.
          </Text>
        </View>

        {/* Hour Options */}
        <Text
          className="text-caption font-bold text-gray-500 uppercase mt-6 mx-md"
        >
          Hours Per Day
        </Text>

        {HOUR_OPTIONS.map((hours) => (
          <HourOption
            key={hours}
            hours={hours}
            selected={selectedHours === hours}
            onPress={() => setSelectedHours(hours)}
          />
        ))}

        {/* Custom Option */}
        <Text
          className="text-caption font-bold text-gray-500 uppercase mt-6 mx-md"
        >
          Or Enter Custom Value
        </Text>
        <View className="mx-md mt-2">
          <TextInput
            className="bg-white text-body text-gray-800 rounded-lg border border-gray-200 px-4 py-3"
            placeholder="Enter hours (4-12)"
            placeholderTextColor="#9CA3AF"
            keyboardType="decimal-pad"
            value={selectedHours.toString()}
            onChangeText={(text) => {
              const num = parseFloat(text);
              if (!isNaN(num) && num >= 4 && num <= 12) {
                setSelectedHours(num);
              }
            }}
            accessibilityLabel="Custom work hours input"
          />
          <Text className="text-caption text-gray-500 mt-1">
            Valid range: 4 to 12 hours
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.8}
          className="mx-md mt-6 flex-row items-center justify-center bg-green-500 rounded-lg"
          style={{ height: 48 }}
          accessibilityLabel="Save work hours"
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
          Current selection: {selectedHours} hours per day
        </Text>
      </ScrollView>
    </View>
  );
}
