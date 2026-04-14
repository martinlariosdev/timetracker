import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  RefreshControl,
  Modal,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useTheme, type ThemeMode } from '@/contexts/ThemeContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { WorkHoursPicker } from '@/components/WorkHoursPicker';
import { WeekStartDayPicker } from '@/components/WeekStartDayPicker';
import { useAuthenticatedMutation } from '@/hooks/useAuthenticatedMutation';
import { UPDATE_USER_PROFILE_MUTATION } from '@/lib/graphql/mutations';
import {
  loadNotificationPreferences,
  saveNotificationPreferences,
} from '@/lib/notificationPreferences';

// --- Types ---

interface SettingItem {
  id: string;
  title: string;
  keywords: string[];
  category: string;
  categoryIcon: string;
  type: 'toggle' | 'navigation';
  icon: keyof typeof Ionicons.glyphMap;
  value?: string;
}

interface CategoryInfo {
  label: string;
  icon: string;
  ionicon: keyof typeof Ionicons.glyphMap;
  count: number;
}

// --- Search Index ---

const ALL_SETTINGS: SettingItem[] = [
  // Preferences
  {
    id: 'notifications',
    title: 'Notifications',
    keywords: ['notifications', 'alerts', 'push', 'notify'],
    category: 'Preferences',
    categoryIcon: '⚙️',
    type: 'toggle',
    icon: 'notifications-outline',
  },
  {
    id: 'work-hours',
    title: 'Work Hours',
    keywords: ['work', 'hours', 'schedule', 'time'],
    category: 'Preferences',
    categoryIcon: '⚙️',
    type: 'navigation',
    icon: 'time-outline',
    value: '', // Will be set dynamically
  },
  {
    id: 'week-start',
    title: 'Week Start Day',
    keywords: ['week', 'start', 'day', 'monday', 'sunday'],
    category: 'Preferences',
    categoryIcon: '⚙️',
    type: 'navigation',
    icon: 'calendar-outline',
    value: '', // Will be set dynamically
  },
  // Appearance
  {
    id: 'dark-mode',
    title: 'Theme',
    keywords: ['dark', 'mode', 'theme', 'appearance', 'night', 'light', 'system'],
    category: 'Appearance',
    categoryIcon: '🎨',
    type: 'navigation',
    icon: 'moon-outline',
    value: '', // Will be set dynamically
  },
  // ETO Reminders
  {
    id: 'eto-alerts',
    title: 'ETO Alerts',
    keywords: ['eto', 'alerts', 'reminders', 'balance', 'notification'],
    category: 'ETO Reminders',
    categoryIcon: '💰',
    type: 'toggle',
    icon: 'cash-outline',
  },
  {
    id: 'eto-usage-summary',
    title: 'Usage Summary',
    keywords: ['eto', 'usage', 'summary', 'report', 'monthly'],
    category: 'ETO Reminders',
    categoryIcon: '💰',
    type: 'toggle',
    icon: 'bar-chart-outline',
  },
  // Account & Security
  {
    id: 'biometric',
    title: 'Biometric Authentication',
    keywords: ['biometric', 'fingerprint', 'face', 'id', 'touch', 'security'],
    category: 'Account & Security',
    categoryIcon: '🔒',
    type: 'toggle',
    icon: 'finger-print-outline',
  },
];

const FREQUENTLY_USED_IDS = ['notifications', 'dark-mode', 'work-hours', 'eto-alerts'];

const CATEGORIES: CategoryInfo[] = [
  { label: 'Preferences', icon: '⚙️', ionicon: 'settings-outline', count: 3 },
  { label: 'Appearance', icon: '🎨', ionicon: 'color-palette-outline', count: 1 },
  { label: 'ETO Reminders', icon: '💰', ionicon: 'cash-outline', count: 2 },
  { label: 'Account & Security', icon: '🔒', ionicon: 'lock-closed-outline', count: 1 },
];

// --- Simple fuzzy search ---

function matchesSearch(query: string, setting: SettingItem): boolean {
  const q = query.toLowerCase();
  if (setting.title.toLowerCase().includes(q)) return true;
  if (setting.category.toLowerCase().includes(q)) return true;
  return setting.keywords.some((kw) => kw.includes(q));
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  const parts = text.split(regex);

  if (parts.length === 1) return text;

  const queryLower = query.toLowerCase();
  return (
    <Text>
      {parts.map((part, i) =>
        part.toLowerCase() === queryLower ? (
          <Text key={i} style={{ backgroundColor: '#FEF3C7', fontWeight: '600' }}>{part}</Text>
        ) : (
          <Text key={i}>{part}</Text>
        )
      )}
    </Text>
  );
}

function getMatchReason(setting: SettingItem, query: string): string | null {
  const queryLower = query.toLowerCase().trim();
  if (!queryLower) return null;

  if (setting.title.toLowerCase().includes(queryLower)) return null;

  const matchedKeyword = setting.keywords?.find((kw) =>
    kw.toLowerCase().includes(queryLower)
  );

  return matchedKeyword ? `Matches "${matchedKeyword}"` : null;
}

// --- Sub-Components ---

function TopBar({ topInset }: { topInset: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ paddingTop: topInset, backgroundColor: colors.surface }}>
      <View
        className="flex-row items-center justify-center"
        style={{ height: 56 }}
      >
        <Text
          className="text-h3 font-semibold"
          style={{ color: colors.text }}
          accessibilityRole="header"
        >
          Settings
        </Text>
      </View>
    </View>
  );
}

function ProfileCard({
  name,
  email,
  onPress,
}: {
  name: string;
  email: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="shadow-level-1 mx-md mt-md"
      style={{
        borderRadius: 12,
        height: 72,
        paddingHorizontal: 16,
        backgroundColor: colors.surface,
      }}
      accessibilityLabel={`Profile: ${name}, ${email}. Tap to edit.`}
      accessibilityRole="button"
    >
      <View className="flex-row items-center flex-1" style={{ height: 72 }}>
        {/* Avatar */}
        <View
          className="items-center justify-center"
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary }}
        >
          <Text className="text-white font-semibold" style={{ fontSize: 14 }}>
            {initials}
          </Text>
        </View>

        {/* Name + Email */}
        <View className="flex-1 ml-3">
          <Text className="text-body font-semibold" style={{ color: colors.text }} numberOfLines={1}>
            {name}
          </Text>
          <Text className="text-caption" style={{ color: colors.textSecondary }} numberOfLines={1}>
            {email}
          </Text>
        </View>

        {/* Chevron */}
        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

function SearchBar({
  query,
  onChangeQuery,
  onClear,
  isFocused,
  onFocus,
  onBlur,
}: {
  query: string;
  onChangeQuery: (text: string) => void;
  onClear: () => void;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View
      className="mx-md mt-md"
      style={{
        height: 48,
        borderRadius: 12,
        backgroundColor: isFocused ? colors.surface : colors.backgroundTertiary,
        borderWidth: isFocused ? 2 : 1,
        borderColor: isFocused ? colors.primary : colors.border,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        ...(isFocused
          ? {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 2,
            }
          : {}),
      }}
    >
      <Ionicons name="search" size={20} color={colors.textTertiary} />
      <TextInput
        className="flex-1 text-body ml-2"
        style={{ color: colors.text }}
        placeholder="Search settings..."
        placeholderTextColor={colors.textTertiary}
        value={query}
        onChangeText={onChangeQuery}
        onFocus={onFocus}
        onBlur={onBlur}
        returnKeyType="search"
        autoCorrect={false}
        accessibilityLabel="Search settings"
      />
      {query.length > 0 && (
        <TouchableOpacity
          onPress={onClear}
          style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}
          accessibilityLabel="Clear search"
          accessibilityRole="button"
        >
          <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function SettingToggleRow({
  setting,
  isOn,
  onToggle,
  showDivider,
}: {
  setting: SettingItem;
  isOn: boolean;
  onToggle: (value: boolean) => void;
  showDivider: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View
      className="flex-row items-center justify-between"
      style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 56,
        borderBottomWidth: showDivider ? 1 : 0,
        borderBottomColor: colors.border,
      }}
    >
      <View className="flex-row items-center flex-1 mr-3">
        <Ionicons name={setting.icon} size={20} color={colors.primary} />
        <Text className="text-body ml-3" style={{ color: colors.text }}>{setting.title}</Text>
      </View>
      <Switch
        value={isOn}
        onValueChange={onToggle}
        trackColor={{ false: colors.borderSecondary, true: colors.primaryLight }}
        thumbColor={isOn ? colors.primary : colors.backgroundTertiary}
        accessibilityLabel={`${setting.title} toggle`}
      />
    </View>
  );
}

function SettingNavRow({
  setting,
  onPress,
  showDivider,
}: {
  setting: SettingItem;
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
        paddingVertical: 12,
        minHeight: 56,
        borderBottomWidth: showDivider ? 1 : 0,
        borderBottomColor: colors.border,
      }}
      accessibilityLabel={`${setting.title}${setting.value ? `, current value: ${setting.value}` : ''}`}
      accessibilityRole="button"
    >
      <View className="flex-row items-center flex-1 mr-3">
        <Ionicons name={setting.icon} size={20} color={colors.primary} />
        <Text className="text-body ml-3" style={{ color: colors.text }}>{setting.title}</Text>
      </View>
      <View className="flex-row items-center">
        {setting.value && (
          <Text className="text-body-small mr-2" style={{ color: colors.textSecondary }}>{setting.value}</Text>
        )}
        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

function CategoryRow({
  category,
  onPress,
  showDivider,
}: {
  category: CategoryInfo;
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
        paddingVertical: 12,
        minHeight: 56,
        borderBottomWidth: showDivider ? 1 : 0,
        borderBottomColor: colors.border,
      }}
      accessibilityLabel={`${category.label}, ${category.count} items`}
      accessibilityRole="button"
    >
      <View className="flex-row items-center flex-1">
        <Ionicons name={category.ionicon} size={20} color={colors.primary} />
        <Text className="text-body font-semibold ml-3" style={{ color: colors.text }}>
          {category.label}
        </Text>
      </View>
      <View className="flex-row items-center">
        {/* Badge */}
        <View
          style={{
            backgroundColor: colors.backgroundTertiary,
            borderRadius: 12,
            paddingHorizontal: 8,
            paddingVertical: 2,
            minWidth: 24,
            alignItems: 'center',
            marginRight: 8,
          }}
        >
          <Text className="text-caption font-semibold" style={{ color: colors.textSecondary }}>
            {category.count}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <Text
      className="text-caption font-bold uppercase"
      style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8, color: colors.textSecondary }}
    >
      {title}
    </Text>
  );
}

function SearchResultRow({
  setting,
  isToggle,
  isOn,
  onToggle,
  onPress,
  searchQuery = '',
}: {
  setting: SettingItem;
  isToggle: boolean;
  isOn: boolean;
  onToggle: (value: boolean) => void;
  onPress: () => void;
  searchQuery?: string;
}) {
  const { colors } = useTheme();
  const matchReason = getMatchReason(setting, searchQuery);
  return (
    <View
      className="shadow-level-1 mx-md mb-2"
      style={{ borderRadius: 12, backgroundColor: colors.surface }}
    >
      {isToggle ? (
        <View
          className="flex-row items-center justify-between"
          style={{ paddingHorizontal: 16, paddingVertical: 12, minHeight: 56 }}
        >
          <View className="flex-row items-center flex-1 mr-3">
            <Ionicons name={setting.icon} size={20} color={colors.primary} />
            <View className="ml-3">
              <Text className="text-body" style={{ color: colors.text }}>
                {highlightMatch(setting.title, searchQuery)}
              </Text>
              <Text className="text-caption" style={{ color: colors.textSecondary }}>
                {setting.category}
                {matchReason && <Text style={{ color: colors.textTertiary }}> · {matchReason}</Text>}
              </Text>
            </View>
          </View>
          <Switch
            value={isOn}
            onValueChange={onToggle}
            trackColor={{ false: colors.borderSecondary, true: colors.primaryLight }}
            thumbColor={isOn ? colors.primary : colors.backgroundTertiary}
            accessibilityLabel={`${setting.title} toggle`}
          />
        </View>
      ) : (
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.7}
          className="flex-row items-center justify-between"
          style={{ paddingHorizontal: 16, paddingVertical: 12, minHeight: 56 }}
          accessibilityLabel={`${setting.title}, ${setting.category}`}
          accessibilityRole="button"
        >
          <View className="flex-row items-center flex-1 mr-3">
            <Ionicons name={setting.icon} size={20} color={colors.primary} />
            <View className="ml-3">
              <Text className="text-body" style={{ color: colors.text }}>
                {highlightMatch(setting.title, searchQuery)}
              </Text>
              <Text className="text-caption" style={{ color: colors.textSecondary }}>
                {setting.category}
                {matchReason && <Text style={{ color: colors.textTertiary }}> · {matchReason}</Text>}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center">
            {setting.value && (
              <Text className="text-body-small mr-2" style={{ color: colors.textSecondary }}>{setting.value}</Text>
            )}
            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

function ThemeModePicker({
  visible,
  currentMode,
  onSelect,
  onClose,
}: {
  visible: boolean;
  currentMode: ThemeMode;
  onSelect: (mode: ThemeMode) => Promise<void>;
  onClose: () => void;
}) {
  const [selectedMode, setSelectedMode] = useState<ThemeMode>(currentMode);
  const [isSaving, setIsSaving] = useState(false);
  const { colors } = useTheme();

  const MODES: { label: string; value: ThemeMode; icon: keyof typeof Ionicons.glyphMap; description: string }[] = [
    { label: 'Light', value: 'light', icon: 'sunny-outline', description: 'Always use light theme' },
    { label: 'Dark', value: 'dark', icon: 'moon-outline', description: 'Always use dark theme' },
    { label: 'System', value: 'system', icon: 'phone-portrait-outline', description: 'Follow device setting' },
  ];

  const handleSelect = async () => {
    if (selectedMode === currentMode) {
      onClose();
      return;
    }
    setIsSaving(true);
    try {
      await onSelect(selectedMode);
      onClose();
    } catch (error) {
      console.error('Failed to save theme mode:', error);
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
        style={{ backgroundColor: colors.overlay }}
      >
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="Close modal"
        />
        <View
          style={{
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: Platform.OS === 'ios' ? 40 : 24,
            backgroundColor: colors.surface,
          }}
        >
          {/* Handle */}
          <View
            className="self-center rounded-full mb-6"
            style={{ width: 40, height: 4, backgroundColor: colors.borderSecondary }}
          />

          {/* Header */}
          <Text
            className="font-bold text-center"
            style={{ fontSize: 20, lineHeight: 28, marginBottom: 24, color: colors.text }}
          >
            Choose Theme
          </Text>

          {/* Mode Selection */}
          <View style={{ gap: 12, marginBottom: 24 }}>
            {MODES.map((mode) => (
              <TouchableOpacity
                key={mode.value}
                onPress={() => setSelectedMode(mode.value)}
                activeOpacity={0.7}
                className="flex-row items-center rounded-lg"
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  backgroundColor: selectedMode === mode.value
                    ? colors.primary + '15'
                    : colors.backgroundTertiary,
                }}
                accessibilityLabel={mode.label}
                accessibilityRole="radio"
                accessibilityState={{ selected: selectedMode === mode.value }}
              >
                <Ionicons
                  name={mode.icon}
                  size={22}
                  color={selectedMode === mode.value ? colors.primary : colors.textSecondary}
                />
                <View className="flex-1 ml-3">
                  <Text
                    className="font-semibold"
                    style={{
                      fontSize: 16,
                      color: selectedMode === mode.value ? colors.primary : colors.text,
                    }}
                  >
                    {mode.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    {mode.description}
                  </Text>
                </View>
                {selectedMode === mode.value && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Action Buttons */}
          <View className="flex-row" style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={onClose}
              disabled={isSaving}
              className="flex-1 items-center justify-center rounded-xl"
              style={{
                height: 52,
                borderWidth: 1.5,
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}
              accessibilityLabel="Cancel"
              accessibilityRole="button"
            >
              <Text
                className="font-semibold"
                style={{ fontSize: 16, color: colors.textSecondary }}
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
                backgroundColor: isSaving ? colors.borderSecondary : colors.primary,
              }}
              accessibilityLabel="Save theme"
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

// --- Main Screen ---

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    logout,
    user,
    biometricEnabled,
    enableBiometric,
    disableBiometric,
  } = useAuth();
  const { themeMode, isDark, colors, setThemeMode } = useTheme();
  const { workHours, weekStartDay, setWorkHours, setWeekStartDay } = usePreferences();

  // Backend mutation for syncing work hours
  const [updateUserProfile] = useAuthenticatedMutation(UPDATE_USER_PROFILE_MUTATION);

  // --- State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [themePickerVisible, setThemePickerVisible] = useState(false);
  const [workHoursModalVisible, setWorkHoursModalVisible] = useState(false);
  const [weekStartDayModalVisible, setWeekStartDayModalVisible] = useState(false);

  // Toggle states (mock for demo)
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({
    notifications: true,
    'eto-alerts': true,
    'eto-usage-summary': false,
    biometric: biometricEnabled,
  });

  // Keep biometric toggle in sync
  React.useEffect(() => {
    setToggleStates((prev) => ({ ...prev, biometric: biometricEnabled }));
  }, [biometricEnabled]);

  // Sync notifications toggle with stored preferences
  React.useEffect(() => {
    loadNotificationPreferences().then((prefs) => {
      setToggleStates((prev) => ({ ...prev, notifications: prefs.masterEnabled }));
    });
  }, []);

  // --- Derived ---
  const frequentlyUsed = useMemo(() => {
    return ALL_SETTINGS.filter((s) => FREQUENTLY_USED_IDS.includes(s.id)).map((s) => {
      if (s.id === 'work-hours') {
        return { ...s, value: `${workHours} hrs` };
      }
      if (s.id === 'week-start') {
        return { ...s, value: weekStartDay === 'monday' ? 'Monday' : 'Sunday' };
      }
      if (s.id === 'dark-mode') {
        const label = themeMode === 'light' ? 'Light' : themeMode === 'dark' ? 'Dark' : 'System';
        return { ...s, value: label };
      }
      return s;
    });
  }, [workHours, weekStartDay, themeMode]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return ALL_SETTINGS.filter((s) => matchesSearch(searchQuery.trim(), s));
  }, [searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  // --- Handlers ---

  const handleToggle = useCallback(
    async (settingId: string, value: boolean) => {
      if (settingId === 'biometric') {
        try {
          if (value) {
            await enableBiometric();
          } else {
            await disableBiometric();
          }
        } catch {
          // Biometric toggle failed, don't update UI
        }
        return; // Let the useEffect sync from biometricEnabled
      }
      if (settingId === 'notifications') {
        setToggleStates((prev) => ({ ...prev, notifications: value }));
        const prefs = await loadNotificationPreferences();
        await saveNotificationPreferences({ ...prefs, masterEnabled: value });
        return;
      }
      setToggleStates((prev) => ({ ...prev, [settingId]: value }));
    },
    [enableBiometric, disableBiometric],
  );

  const handleNavSetting = useCallback((settingId: string) => {
    if (settingId === 'notifications') {
      router.push('/settings/notifications');
      return;
    }
    if (settingId === 'dark-mode') {
      setThemePickerVisible(true);
      return;
    }
    if (settingId === 'work-hours') {
      setWorkHoursModalVisible(true);
      return;
    }
    if (settingId === 'week-start') {
      setWeekStartDayModalVisible(true);
      return;
    }
    if (settingId === 'about') {
      Alert.alert('About TimeTrack', 'Version 1.0.0 (Build 42)\n\nTimeTrack helps you manage timesheets and ETO hours.\n\nBuilt with React Native and Expo.');
      return;
    }
    if (settingId === 'report-bug') {
      Alert.alert('Report a Bug', 'Please send bug reports to:\nsupport@timetrack.app\n\nInclude a description of the issue and steps to reproduce it.');
      return;
    }
    Alert.alert('Coming Soon', `The "${settingId}" setting will be available in a future update.`);
  }, [router]);

  const handleCategoryPress = useCallback((categoryLabel: string) => {
    if (categoryLabel === 'Preferences') {
      router.push('/settings/notifications');
      return;
    }
    if (categoryLabel === 'Appearance') {
      setThemePickerVisible(true);
      return;
    }
    if (categoryLabel === 'Account & Security') {
      Alert.alert('Account & Security', 'Biometric authentication can be toggled from the Frequently Used section above.');
      return;
    }
    Alert.alert('Coming Soon', `The "${categoryLabel}" category will be available in a future update.`);
  }, [router]);

  const handleProfilePress = useCallback(() => {
    Alert.alert('Coming Soon', 'Profile editing will be available in a future update.');
  }, []);

  const handleLogout = useCallback(() => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
      },
    ]);
  }, [logout]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh delay for user data reload
    await new Promise((resolve) => setTimeout(resolve, 800));
    setRefreshing(false);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // --- Render ---

  const userName = user?.name ?? 'User';
  const userEmail = user?.email ?? '';

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Bar */}
      <TopBar topInset={insets.top} />

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Card */}
        <ProfileCard
          name={userName}
          email={userEmail}
          onPress={handleProfilePress}
        />

        {/* Search Bar */}
        <SearchBar
          query={searchQuery}
          onChangeQuery={setSearchQuery}
          onClear={handleClearSearch}
          isFocused={searchFocused}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />

        {isSearching ? (
          /* --- Search Results View --- */
          <>
            {searchResults.length > 0 ? (
              <>
                <SectionHeader title={`RESULTS (${searchResults.length})`} />
                {searchResults.map((setting) => (
                  <SearchResultRow
                    key={setting.id}
                    setting={setting}
                    isToggle={setting.type === 'toggle'}
                    isOn={toggleStates[setting.id] ?? false}
                    onToggle={(value) => handleToggle(setting.id, value)}
                    onPress={() => handleNavSetting(setting.id)}
                    searchQuery={searchQuery}
                  />
                ))}
              </>
            ) : (
              /* Empty Search State */
              <View className="items-center" style={{ paddingTop: 48 }}>
                <Ionicons name="search" size={48} color={colors.borderSecondary} />
                <Text className="text-body font-semibold mt-4" style={{ color: colors.text }}>
                  No results found
                </Text>
                <Text className="text-body-small mt-2 text-center px-8" style={{ color: colors.textSecondary }}>
                  Try searching for:
                </Text>
                <View className="mt-3 items-center">
                  {['notifications', 'dark mode', 'work hours', 'week start'].map(
                    (suggestion) => (
                      <TouchableOpacity
                        key={suggestion}
                        onPress={() => setSearchQuery(suggestion)}
                        accessibilityLabel={`Search for ${suggestion}`}
                        accessibilityRole="button"
                      >
                        <Text className="text-body-small mt-1" style={{ color: colors.primary }}>
                          {suggestion}
                        </Text>
                      </TouchableOpacity>
                    ),
                  )}
                </View>
              </View>
            )}
          </>
        ) : (
          /* --- Default View --- */
          <>
            {/* Frequently Used */}
            <SectionHeader title="FREQUENTLY USED" />
            <View
              className="shadow-level-1 mx-md"
              style={{ borderRadius: 12, backgroundColor: colors.surface }}
            >
              {frequentlyUsed.map((setting, index) => {
                if (setting.id === 'notifications') {
                  return (
                    <View
                      key={setting.id}
                      className="flex-row items-center justify-between"
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        minHeight: 56,
                        borderBottomWidth: index < frequentlyUsed.length - 1 ? 1 : 0,
                        borderBottomColor: colors.border,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => handleNavSetting('notifications')}
                        activeOpacity={0.7}
                        className="flex-row items-center flex-1 mr-3"
                        accessibilityLabel="Notifications. Tap for detailed preferences."
                        accessibilityRole="button"
                      >
                        <Ionicons name={setting.icon} size={20} color={colors.primary} />
                        <Text className="text-body ml-3" style={{ color: colors.text }}>{setting.title}</Text>
                        <Ionicons name="chevron-forward" size={14} color={colors.textTertiary} style={{ marginLeft: 4 }} />
                      </TouchableOpacity>
                      <Switch
                        value={toggleStates[setting.id] ?? false}
                        onValueChange={(value) => handleToggle(setting.id, value)}
                        trackColor={{ false: colors.borderSecondary, true: colors.primaryLight }}
                        thumbColor={(toggleStates[setting.id] ?? false) ? colors.primary : colors.backgroundTertiary}
                        accessibilityLabel="Notifications master toggle"
                      />
                    </View>
                  );
                }
                return setting.type === 'toggle' ? (
                  <SettingToggleRow
                    key={setting.id}
                    setting={setting}
                    isOn={toggleStates[setting.id] ?? false}
                    onToggle={(value) => handleToggle(setting.id, value)}
                    showDivider={index < frequentlyUsed.length - 1}
                  />
                ) : (
                  <SettingNavRow
                    key={setting.id}
                    setting={setting}
                    onPress={() => handleNavSetting(setting.id)}
                    showDivider={index < frequentlyUsed.length - 1}
                  />
                );
              })}
            </View>

            {/* All Settings */}
            <SectionHeader title="ALL SETTINGS" />
            <View
              className="shadow-level-1 mx-md"
              style={{ borderRadius: 12, backgroundColor: colors.surface }}
            >
              {CATEGORIES.map((category, index) => (
                <CategoryRow
                  key={category.label}
                  category={category}
                  onPress={() => handleCategoryPress(category.label)}
                  showDivider={index < CATEGORIES.length - 1}
                />
              ))}
            </View>

            {/* Account Actions */}
            <SectionHeader title="ACCOUNT ACTIONS" />
            <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.7}
              className="shadow-level-1 mx-md"
              style={{
                borderRadius: 12,
                height: 56,
                paddingHorizontal: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.surface,
              }}
              accessibilityLabel="Log out of your account"
              accessibilityRole="button"
            >
              <Ionicons name="log-out-outline" size={20} color={colors.textSecondary} />
              <Text className="text-body font-semibold ml-2" style={{ color: colors.textSecondary }}>
                Logout
              </Text>
            </TouchableOpacity>

            {/* App Info */}
            <Text
              className="text-caption text-center"
              style={{ paddingTop: 20, paddingBottom: 12, color: colors.textTertiary }}
            >
              Version 1.0.0 (Build 42)
            </Text>

          </>
        )}
      </ScrollView>

      {/* Theme Picker Modal */}
      <ThemeModePicker
        visible={themePickerVisible}
        currentMode={themeMode}
        onSelect={async (mode) => {
          await setThemeMode(mode);
        }}
        onClose={() => setThemePickerVisible(false)}
      />

      {/* Work Hours Picker Modal */}
      <WorkHoursPicker
        visible={workHoursModalVisible}
        currentHours={workHours}
        onSelect={async (hours) => {
          await setWorkHours(hours);
          // Sync to backend
          try {
            await updateUserProfile({
              variables: {
                input: { workingHoursPerPeriod: hours * 11 },
              },
            });
          } catch (err) {
            console.warn('Failed to sync work hours to backend:', err);
          }
        }}
        onClose={() => setWorkHoursModalVisible(false)}
      />

      {/* Week Start Day Picker Modal */}
      <WeekStartDayPicker
        visible={weekStartDayModalVisible}
        currentDay={weekStartDay}
        onSelect={async (day) => {
          await setWeekStartDay(day);
        }}
        onClose={() => setWeekStartDayModalVisible(false)}
      />
    </View>
  );
}
