import React, { useCallback } from 'react';
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
          Dark Mode
        </Text>
      </View>
    </View>
  );
}

function ThemeOption({
  title,
  description,
  mode,
  isSelected,
  onPress,
  showDivider,
}: {
  title: string;
  description: string;
  mode: ThemeMode;
  isSelected: boolean;
  onPress: () => void;
  showDivider: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center justify-between"
      style={{
        paddingHorizontal: 16,
        paddingVertical: 16,
        minHeight: 72,
        borderBottomWidth: showDivider ? 1 : 0,
        borderBottomColor: '#E5E7EB',
      }}
      accessibilityLabel={`${title}, ${description}${isSelected ? ', selected' : ''}`}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
    >
      <View className="flex-1">
        <Text className="text-body font-semibold text-gray-800">{title}</Text>
        <Text className="text-body-small text-gray-500 mt-1">{description}</Text>
      </View>
      <View
        className="items-center justify-center"
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: isSelected ? '#2563EB' : '#D1D5DB',
          backgroundColor: isSelected ? '#2563EB' : '#FFFFFF',
        }}
      >
        {isSelected && (
          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
        )}
      </View>
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text
      className="text-caption font-bold text-gray-500 uppercase"
      style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 }}
    >
      {title}
    </Text>
  );
}

export default function ThemeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { themeMode: mode, setThemeMode } = useTheme();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSelectTheme = useCallback(
    async (newMode: ThemeMode) => {
      try {
        await setThemeMode(newMode);
      } catch (error) {
        console.error('Failed to set theme:', error);
      }
    },
    [setThemeMode],
  );

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      <TopBar topInset={insets.top} onBack={handleBack} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title="Appearance" />
        <View className="bg-white shadow-level-1 mx-md" style={{ borderRadius: 12 }}>
          <ThemeOption
            title="Light"
            description="Always use light theme"
            mode="light"
            isSelected={mode === 'light'}
            onPress={() => handleSelectTheme('light')}
            showDivider={true}
          />
          <ThemeOption
            title="Dark"
            description="Always use dark theme"
            mode="dark"
            isSelected={mode === 'dark'}
            onPress={() => handleSelectTheme('dark')}
            showDivider={true}
          />
          <ThemeOption
            title="System"
            description="Follow device settings"
            mode="system"
            isSelected={mode === 'system'}
            onPress={() => handleSelectTheme('system')}
            showDivider={false}
          />
        </View>

        <SectionHeader title="Preview" />
        <View className="mx-md bg-white shadow-level-1" style={{ borderRadius: 12, padding: 16 }}>
          <Text className="text-body-small text-gray-500 mb-3">
            Theme will update across the app immediately
          </Text>
          <View
            className="p-3 rounded-lg"
            style={{
              backgroundColor: mode === 'light' || (mode === 'system') ? '#F9FAFB' : '#1E293B',
            }}
          >
            <Text
              className="text-body font-semibold"
              style={{
                color: mode === 'light' || (mode === 'system') ? '#1F2937' : '#F8FAFC',
              }}
            >
              Sample text
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
