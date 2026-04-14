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
      accessibilityLabel={`Week starts on ${label}`}
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
          {label}
        </Text>
      </View>
      {selected && (
        <Ionicons name="checkmark" size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  );
}

export default function WeekStartScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { weekStartDay, setWeekStartDay } = usePreferences();
  const { isDark, colors } = useTheme();
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
            Choose which day your work week starts. This affects the calendar view and week calculations.
          </Text>
        </View>

        {/* Day Options */}
        <Text
          className="text-caption font-bold uppercase mt-6 mx-md"
          style={{ color: colors.textSecondary }}
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
        <View className="mx-md mt-6 p-4 rounded-lg" style={{ backgroundColor: colors.backgroundTertiary }}>
          <Text className="text-body-small font-semibold mb-2" style={{ color: colors.text }}>
            What this affects:
          </Text>
          <Text className="text-body-small" style={{ color: colors.textSecondary }}>
            {'\u2022'} Calendar view in the home screen{'\n'}
            {'\u2022'} Week boundaries for timesheets{'\n'}
            {'\u2022'} Week calculations in metrics
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.8}
          className="mx-md mt-6 flex-row items-center justify-center rounded-lg"
          style={{ height: 48, backgroundColor: isSaving ? colors.textTertiary : colors.primary }}
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
        <Text className="text-caption text-center mt-4 mx-md" style={{ color: colors.textSecondary }}>
          Current selection: {selectedDay === 'monday' ? 'Monday' : 'Sunday'}
        </Text>
      </ScrollView>
    </View>
  );
}
