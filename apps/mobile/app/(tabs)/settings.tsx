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
import { useTheme } from '@/contexts/ThemeContext';
import { usePreferences } from '@/contexts/PreferencesContext';
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
    id: 'eto-low-balance',
    title: 'Low Balance Alert',
    keywords: ['eto', 'low', 'balance', 'alert', 'threshold'],
    category: 'ETO Reminders',
    categoryIcon: '💰',
    type: 'navigation',
    icon: 'alert-circle-outline',
    value: '8 hrs',
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
  { label: 'ETO Reminders', icon: '💰', ionicon: 'cash-outline', count: 3 },
  { label: 'Account & Security', icon: '🔒', ionicon: 'lock-closed-outline', count: 1 },
];

// --- Simple fuzzy search ---

function matchesSearch(query: string, setting: SettingItem): boolean {
  const q = query.toLowerCase();
  if (setting.title.toLowerCase().includes(q)) return true;
  if (setting.category.toLowerCase().includes(q)) return true;
  return setting.keywords.some((kw) => kw.includes(q));
}

// --- Sub-Components ---

function TopBar({ topInset }: { topInset: number }) {
  return (
    <View className="bg-white shadow-level-1" style={{ paddingTop: topInset }}>
      <View
        className="flex-row items-center justify-center"
        style={{ height: 56 }}
      >
        <Text
          className="text-h3 font-semibold text-gray-800"
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
      className="bg-white shadow-level-1 mx-md mt-md"
      style={{
        borderRadius: 12,
        height: 72,
        paddingHorizontal: 16,
      }}
      accessibilityLabel={`Profile: ${name}, ${email}. Tap to edit.`}
      accessibilityRole="button"
    >
      <View className="flex-row items-center flex-1" style={{ height: 72 }}>
        {/* Avatar */}
        <View
          className="bg-primary items-center justify-center"
          style={{ width: 40, height: 40, borderRadius: 20 }}
        >
          <Text className="text-white font-semibold" style={{ fontSize: 14 }}>
            {initials}
          </Text>
        </View>

        {/* Name + Email */}
        <View className="flex-1 ml-3">
          <Text className="text-body font-semibold text-gray-800" numberOfLines={1}>
            {name}
          </Text>
          <Text className="text-caption text-gray-500" numberOfLines={1}>
            {email}
          </Text>
        </View>

        {/* Chevron */}
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
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
  return (
    <View
      className="mx-md mt-md"
      style={{
        height: 48,
        borderRadius: 12,
        backgroundColor: isFocused ? '#FFFFFF' : '#F3F4F6',
        borderWidth: isFocused ? 2 : 1,
        borderColor: isFocused ? '#2563EB' : '#E5E7EB',
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
      <Ionicons name="search" size={20} color="#9CA3AF" />
      <TextInput
        className="flex-1 text-body text-gray-800 ml-2"
        placeholder="Search settings..."
        placeholderTextColor="#9CA3AF"
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
          <Ionicons name="close-circle" size={18} color="#9CA3AF" />
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
  return (
    <View
      className="flex-row items-center justify-between"
      style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 56,
        borderBottomWidth: showDivider ? 1 : 0,
        borderBottomColor: '#E5E7EB',
      }}
    >
      <View className="flex-row items-center flex-1 mr-3">
        <Ionicons name={setting.icon} size={20} color="#2563EB" />
        <Text className="text-body text-gray-800 ml-3">{setting.title}</Text>
      </View>
      <Switch
        value={isOn}
        onValueChange={onToggle}
        trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
        thumbColor={isOn ? '#2563EB' : '#F3F4F6'}
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
        borderBottomColor: '#E5E7EB',
      }}
      accessibilityLabel={`${setting.title}${setting.value ? `, current value: ${setting.value}` : ''}`}
      accessibilityRole="button"
    >
      <View className="flex-row items-center flex-1 mr-3">
        <Ionicons name={setting.icon} size={20} color="#2563EB" />
        <Text className="text-body text-gray-800 ml-3">{setting.title}</Text>
      </View>
      <View className="flex-row items-center">
        {setting.value && (
          <Text className="text-body-small text-gray-500 mr-2">{setting.value}</Text>
        )}
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
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
        borderBottomColor: '#E5E7EB',
      }}
      accessibilityLabel={`${category.label}, ${category.count} items`}
      accessibilityRole="button"
    >
      <View className="flex-row items-center flex-1">
        <Ionicons name={category.ionicon} size={20} color="#2563EB" />
        <Text className="text-body font-semibold text-gray-800 ml-3">
          {category.label}
        </Text>
      </View>
      <View className="flex-row items-center">
        {/* Badge */}
        <View
          style={{
            backgroundColor: '#F3F4F6',
            borderRadius: 12,
            paddingHorizontal: 8,
            paddingVertical: 2,
            minWidth: 24,
            alignItems: 'center',
            marginRight: 8,
          }}
        >
          <Text className="text-caption font-semibold" style={{ color: '#6B7280' }}>
            {category.count}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
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

function SearchResultRow({
  setting,
  isToggle,
  isOn,
  onToggle,
  onPress,
}: {
  setting: SettingItem;
  isToggle: boolean;
  isOn: boolean;
  onToggle: (value: boolean) => void;
  onPress: () => void;
}) {
  return (
    <View
      className="bg-white shadow-level-1 mx-md mb-2"
      style={{ borderRadius: 12 }}
    >
      {isToggle ? (
        <View
          className="flex-row items-center justify-between"
          style={{ paddingHorizontal: 16, paddingVertical: 12, minHeight: 56 }}
        >
          <View className="flex-row items-center flex-1 mr-3">
            <Ionicons name={setting.icon} size={20} color="#2563EB" />
            <View className="ml-3">
              <Text className="text-body text-gray-800">{setting.title}</Text>
              <Text className="text-caption text-gray-500">{setting.category}</Text>
            </View>
          </View>
          <Switch
            value={isOn}
            onValueChange={onToggle}
            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
            thumbColor={isOn ? '#2563EB' : '#F3F4F6'}
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
            <Ionicons name={setting.icon} size={20} color="#2563EB" />
            <View className="ml-3">
              <Text className="text-body text-gray-800">{setting.title}</Text>
              <Text className="text-caption text-gray-500">{setting.category}</Text>
            </View>
          </View>
          <View className="flex-row items-center">
            {setting.value && (
              <Text className="text-body-small text-gray-500 mr-2">{setting.value}</Text>
            )}
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

function DeleteAccountModal({
  visible,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType={Platform.OS === 'ios' ? 'slide' : 'fade'}
      onRequestClose={onCancel}
    >
      <View
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onCancel}
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
            className="self-center rounded-full mb-4"
            style={{ width: 40, height: 4, backgroundColor: '#D1D5DB' }}
          />

          {/* Warning Icon */}
          <View className="items-center mb-4">
            <View
              className="items-center justify-center"
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: '#FEF2F2',
              }}
            >
              <Ionicons name="warning" size={32} color="#EF4444" />
            </View>
          </View>

          {/* Title */}
          <Text
            className="font-bold text-gray-900 text-center"
            style={{ fontSize: 24, lineHeight: 32 }}
          >
            Delete Account?
          </Text>

          {/* Description */}
          <Text
            className="text-body text-gray-600 text-center mt-3"
            style={{ lineHeight: 22 }}
          >
            This action is permanent and cannot be undone. All your data, time
            entries, and ETO history will be permanently deleted.
          </Text>

          {/* Actions */}
          <View className="flex-row mt-6" style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 items-center justify-center rounded-xl"
              style={{
                height: 52,
                borderWidth: 1.5,
                borderColor: '#D1D5DB',
                backgroundColor: '#FFFFFF',
              }}
              accessibilityLabel="Cancel deletion"
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
              onPress={onConfirm}
              className="flex-1 items-center justify-center rounded-xl"
              style={{ height: 52, backgroundColor: '#EF4444' }}
              accessibilityLabel="Confirm delete account"
              accessibilityRole="button"
            >
              <Text
                className="font-semibold"
                style={{ fontSize: 16, color: '#FFFFFF' }}
              >
                Delete
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
  const { themeMode, isDark, setThemeMode } = useTheme();
  const { workHours, weekStartDay, setWorkHours, setWeekStartDay } = usePreferences();

  // --- State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // Toggle states (mock for demo)
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({
    notifications: true,
    'dark-mode': themeMode === 'dark',
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
      if (settingId === 'dark-mode') {
        setToggleStates((prev) => ({ ...prev, 'dark-mode': value }));
        await setThemeMode(value ? 'dark' : 'light');
        return;
      }
      setToggleStates((prev) => ({ ...prev, [settingId]: value }));
    },
    [enableBiometric, disableBiometric, setThemeMode],
  );

  const handleNavSetting = useCallback((settingId: string) => {
    if (settingId === 'notifications') {
      router.push('/settings/notifications');
      return;
    }
    if (settingId === 'dark-mode') {
      router.push('/settings/theme');
      return;
    }
    if (settingId === 'work-hours') {
      router.push('/settings/work-hours');
      return;
    }
    if (settingId === 'week-start') {
      router.push('/settings/week-start');
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
      router.push('/settings/theme');
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

  const handleDeleteAccount = useCallback(() => {
    setDeleteModalVisible(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    setDeleteModalVisible(false);
    Alert.alert('Coming Soon', 'Account deletion will be available in a future update.');
  }, []);

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
    <View className="flex-1 bg-gray-50">
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
            tintColor="#2563EB"
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
                  />
                ))}
              </>
            ) : (
              /* Empty Search State */
              <View className="items-center" style={{ paddingTop: 48 }}>
                <Ionicons name="search" size={48} color="#D1D5DB" />
                <Text className="text-body font-semibold text-gray-800 mt-4">
                  No results found
                </Text>
                <Text className="text-body-small text-gray-500 mt-2 text-center px-8">
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
                        <Text className="text-body-small text-primary mt-1">
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
              className="bg-white shadow-level-1 mx-md"
              style={{ borderRadius: 12 }}
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
                        borderBottomColor: '#E5E7EB',
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => handleNavSetting('notifications')}
                        activeOpacity={0.7}
                        className="flex-row items-center flex-1 mr-3"
                        accessibilityLabel="Notifications. Tap for detailed preferences."
                        accessibilityRole="button"
                      >
                        <Ionicons name={setting.icon} size={20} color="#2563EB" />
                        <Text className="text-body text-gray-800 ml-3">{setting.title}</Text>
                        <Ionicons name="chevron-forward" size={14} color="#9CA3AF" style={{ marginLeft: 4 }} />
                      </TouchableOpacity>
                      <Switch
                        value={toggleStates[setting.id] ?? false}
                        onValueChange={(value) => handleToggle(setting.id, value)}
                        trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                        thumbColor={(toggleStates[setting.id] ?? false) ? '#2563EB' : '#F3F4F6'}
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
              className="bg-white shadow-level-1 mx-md"
              style={{ borderRadius: 12 }}
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
              className="bg-white shadow-level-1 mx-md"
              style={{
                borderRadius: 12,
                height: 56,
                paddingHorizontal: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              accessibilityLabel="Log out of your account"
              accessibilityRole="button"
            >
              <Ionicons name="log-out-outline" size={20} color="#4B5563" />
              <Text className="text-body font-semibold text-gray-700 ml-2">
                Logout
              </Text>
            </TouchableOpacity>

            {/* App Info */}
            <Text
              className="text-caption text-gray-500 text-center"
              style={{ paddingTop: 20, paddingBottom: 12 }}
            >
              Version 1.0.0 (Build 42)
            </Text>

            {/* Delete Account */}
            <TouchableOpacity
              onPress={handleDeleteAccount}
              activeOpacity={0.7}
              className="mx-md"
              style={{
                borderRadius: 12,
                height: 56,
                backgroundColor: '#FEF2F2',
                borderWidth: 1,
                borderColor: '#FECACA',
                paddingHorizontal: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              accessibilityLabel="Delete your account"
              accessibilityRole="button"
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text
                className="font-semibold ml-2"
                style={{ fontSize: 16, color: '#EF4444' }}
              >
                Delete Account
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        visible={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
      />
    </View>
  );
}
