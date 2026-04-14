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
import { useTheme } from '@/contexts/ThemeContext';

function TopBar({
  topInset,
  onBack,
}: {
  topInset: number;
  onBack: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ paddingTop: topInset, backgroundColor: colors.surface }}>
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
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text
          className="text-h3 font-semibold flex-1 text-center"
          style={{ marginRight: 44, color: colors.text }}
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
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center justify-between mx-md mt-2 px-4 py-3 rounded-lg"
      style={{
        borderRadius: 12,
        backgroundColor: selected ? (colors.primary + '15') : colors.surface,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? colors.primary : colors.border,
      }}
      accessibilityLabel={`${hours} hours per day`}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <View className="flex-row items-center flex-1">
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: selected ? colors.primary : colors.textTertiary,
            backgroundColor: selected ? colors.primary : 'transparent',
          }}
        />
        <Text
          className="text-body ml-3"
          style={{ color: selected ? colors.primary : colors.text, fontWeight: selected ? '600' : '400' }}
        >
          {hours} hours per day
        </Text>
      </View>
      {selected && (
        <Ionicons name="checkmark" size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  );
}

export default function WorkHoursScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { workHours, setWorkHours } = usePreferences();
  const { isDark, colors } = useTheme();
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
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <TopBar topInset={insets.top} onBack={() => router.back()} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        <View className="mx-md mt-md p-4 rounded-lg" style={{ backgroundColor: colors.primary + '15' }}>
          <Text className="text-body" style={{ color: colors.text }}>
            Select your standard work hours per day. This is used to calculate your daily timesheet targets.
          </Text>
        </View>

        {/* Hour Options */}
        <Text
          className="text-caption font-bold uppercase mt-6 mx-md"
          style={{ color: colors.textSecondary }}
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
          className="text-caption font-bold uppercase mt-6 mx-md"
          style={{ color: colors.textSecondary }}
        >
          Or Enter Custom Value
        </Text>
        <View className="mx-md mt-2">
          <TextInput
            className="text-body rounded-lg px-4 py-3"
            style={{
              backgroundColor: colors.surface,
              color: colors.text,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            placeholder="Enter hours (4-12)"
            placeholderTextColor={colors.textTertiary}
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
          <Text className="text-caption mt-1" style={{ color: colors.textSecondary }}>
            Valid range: 4 to 12 hours
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.8}
          className="mx-md mt-6 flex-row items-center justify-center rounded-lg"
          style={{ height: 48, backgroundColor: isSaving ? colors.textTertiary : colors.primary }}
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
        <Text className="text-caption text-center mt-4 mx-md" style={{ color: colors.textSecondary }}>
          Current selection: {selectedHours} hours per day
        </Text>
      </ScrollView>
    </View>
  );
}
