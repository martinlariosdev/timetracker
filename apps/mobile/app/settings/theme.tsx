import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, type ThemeMode } from '@/contexts/ThemeContext';

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
          Appearance
        </Text>
      </View>
    </View>
  );
}

function ThemeModeOption({
  label,
  description,
  icon,
  selected,
  onPress,
}: {
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center mx-md mt-3 px-4 py-4 ${
        selected ? 'bg-blue-50 border-2 border-primary' : 'bg-white border border-gray-200'
      }`}
      style={{ borderRadius: 12 }}
      accessibilityLabel={`${label}: ${description}`}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <View className="mr-3">
        <Ionicons name={icon} size={24} color={selected ? '#2563EB' : '#9CA3AF'} />
      </View>
      <View className="flex-1">
        <Text className={`text-body font-semibold ${selected ? 'text-primary' : 'text-gray-800'}`}>
          {label}
        </Text>
        <Text className="text-body-small text-gray-500 mt-1">
          {description}
        </Text>
      </View>
      {selected && (
        <Ionicons name="checkmark-circle" size={24} color="#2563EB" />
      )}
    </TouchableOpacity>
  );
}

export default function ThemeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { themeMode, setThemeMode } = useTheme();
  const [selectedMode, setSelectedMode] = useState<ThemeMode>(themeMode);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (selectedMode === themeMode) {
      router.back();
      return;
    }

    setIsSaving(true);
    try {
      await setThemeMode(selectedMode);
      router.back();
    } catch (error) {
      console.error('Failed to update theme:', error);
    } finally {
      setIsSaving(false);
    }
  }, [selectedMode, themeMode, setThemeMode, router]);

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
            Choose your preferred appearance. System follows your device settings.
          </Text>
        </View>

        {/* Theme Mode Options */}
        <Text className="text-caption font-bold text-gray-500 uppercase mt-6 mx-md">
          Appearance
        </Text>

        <ThemeModeOption
          label="Light"
          description="Always use light theme"
          icon="sunny-outline"
          selected={selectedMode === 'light'}
          onPress={() => setSelectedMode('light')}
        />

        <ThemeModeOption
          label="Dark"
          description="Always use dark theme"
          icon="moon-outline"
          selected={selectedMode === 'dark'}
          onPress={() => setSelectedMode('dark')}
        />

        <ThemeModeOption
          label="System"
          description="Follow device settings"
          icon="phone-portrait-outline"
          selected={selectedMode === 'system'}
          onPress={() => setSelectedMode('system')}
        />

        {/* Info Box */}
        <View className="mx-md mt-6 p-4 bg-gray-100 rounded-lg">
          <Text className="text-body-small text-gray-600">
            Dark mode reduces eye strain in low-light environments and can save battery on OLED displays.
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.8}
          className="mx-md mt-6 flex-row items-center justify-center rounded-lg"
          style={{ height: 48, backgroundColor: isSaving ? '#93C5FD' : '#2563EB' }}
          accessibilityLabel="Save theme preference"
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

        {/* Current Status */}
        <Text className="text-caption text-gray-500 text-center mt-4 mx-md">
          Current: {selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)}
        </Text>
      </ScrollView>
    </View>
  );
}
