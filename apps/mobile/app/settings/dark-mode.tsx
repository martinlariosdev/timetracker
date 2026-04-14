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
          Appearance
        </Text>
      </View>
    </View>
  );
}

function ThemeOption({
  title,
  description,
  isSelected,
  onPress,
  showDivider,
}: {
  title: string;
  description: string;
  isSelected: boolean;
  onPress: () => void;
  showDivider: boolean;
}) {
  const { colors } = useTheme();
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
        borderBottomColor: colors.border,
      }}
      accessibilityLabel={`${title}, ${description}${isSelected ? ', selected' : ''}`}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
    >
      <View className="flex-1">
        <Text className="text-body font-semibold" style={{ color: colors.text }}>{title}</Text>
        <Text className="text-body-small mt-1" style={{ color: colors.textSecondary }}>{description}</Text>
      </View>
      <View
        className="items-center justify-center"
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: isSelected ? colors.primary : colors.borderSecondary,
          backgroundColor: isSelected ? colors.primary : colors.surface,
        }}
      >
        {isSelected && (
          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function DarkModeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { themeMode, isDark, colors, setThemeMode } = useTheme();

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
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <TopBar topInset={insets.top} onBack={handleBack} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          className="text-caption font-bold uppercase"
          style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8, color: colors.textSecondary }}
        >
          Theme
        </Text>
        <View className="mx-md" style={{ borderRadius: 12, backgroundColor: colors.surface }}>
          <ThemeOption
            title="Light"
            description="Always use light theme"
            isSelected={themeMode === 'light'}
            onPress={() => handleSelectTheme('light')}
            showDivider
          />
          <ThemeOption
            title="Dark"
            description="Always use dark theme"
            isSelected={themeMode === 'dark'}
            onPress={() => handleSelectTheme('dark')}
            showDivider
          />
          <ThemeOption
            title="System"
            description="Follow your device settings"
            isSelected={themeMode === 'system'}
            onPress={() => handleSelectTheme('system')}
            showDivider={false}
          />
        </View>

        <Text
          className="text-caption font-bold uppercase"
          style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8, color: colors.textSecondary }}
        >
          Preview
        </Text>
        <View className="mx-md" style={{ borderRadius: 12, backgroundColor: colors.surface, padding: 16 }}>
          <Text className="text-body-small mb-3" style={{ color: colors.textSecondary }}>
            Changes apply immediately across the app.
          </Text>
          <View
            className="p-3 rounded-lg"
            style={{ backgroundColor: colors.backgroundTertiary }}
          >
            <Text className="text-body font-semibold" style={{ color: colors.text }}>
              Sample text in current theme
            </Text>
            <Text className="text-body-small mt-1" style={{ color: colors.textSecondary }}>
              Secondary text preview
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
