import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  type NotificationPreferences,
  DEFAULT_PREFERENCES,
  loadNotificationPreferences,
  saveNotificationPreferences,
} from '@/lib/notificationPreferences';

// --- Sub-Components ---

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
          Notification Preferences
        </Text>
      </View>
    </View>
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

function ToggleRow({
  label,
  description,
  value,
  onValueChange,
  disabled,
  showDivider,
}: {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled: boolean;
  showDivider: boolean;
}) {
  return (
    <View
      className="flex-row items-center justify-between"
      style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 64,
        borderBottomWidth: showDivider ? 1 : 0,
        borderBottomColor: '#E5E7EB',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <View className="flex-1 mr-3">
        <Text className="text-body text-gray-800">{label}</Text>
        {description && (
          <Text className="text-caption text-gray-500" style={{ marginTop: 2 }}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
        thumbColor={value ? '#2563EB' : '#F3F4F6'}
        accessibilityLabel={`${label} toggle`}
      />
    </View>
  );
}

// --- Main Screen ---

export default function NotificationPreferencesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [refreshing, setRefreshing] = useState(false);

  const loadPrefs = useCallback(async () => {
    const loaded = await loadNotificationPreferences();
    setPrefs(loaded);
  }, []);

  useEffect(() => {
    loadPrefs();
  }, [loadPrefs]);

  const updatePrefs = useCallback(
    async (updater: (prev: NotificationPreferences) => NotificationPreferences) => {
      // TODO: When notification system is implemented, use these preferences to filter
      let nextPrefs: NotificationPreferences;
      setPrefs((prev) => {
        nextPrefs = updater(prev);
        return nextPrefs;
      });
      try {
        await saveNotificationPreferences(nextPrefs!);
      } catch (err) {
        console.error('[NotificationPreferences] Failed to save:', err);
      }
    },
    [],
  );

  const handleMasterToggle = useCallback(
    (value: boolean) => {
      updatePrefs((prev) => ({ ...prev, masterEnabled: value }));
    },
    [updatePrefs],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPrefs();
    setRefreshing(false);
  }, [loadPrefs]);

  const disabled = !prefs.masterEnabled;

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      <TopBar topInset={insets.top} onBack={() => router.back()} />

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
      >
        {/* Master Toggle */}
        <View
          className="bg-white shadow-level-1 mx-md mt-md"
          style={{ borderRadius: 12 }}
        >
          <View
            className="flex-row items-center justify-between"
            style={{ paddingHorizontal: 16, paddingVertical: 16, minHeight: 64 }}
          >
            <View className="flex-row items-center flex-1 mr-3">
              <Ionicons name="notifications-outline" size={24} color="#2563EB" />
              <Text className="text-body font-semibold text-gray-800 ml-3">
                Enable All Notifications
              </Text>
            </View>
            <Switch
              value={prefs.masterEnabled}
              onValueChange={handleMasterToggle}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={prefs.masterEnabled ? '#2563EB' : '#F3F4F6'}
              accessibilityLabel="Enable all notifications toggle"
            />
          </View>
        </View>

        {/* Timesheet Reminders */}
        <SectionHeader title="TIMESHEET REMINDERS" />
        <View
          className="bg-white shadow-level-1 mx-md"
          style={{ borderRadius: 12 }}
        >
          <ToggleRow
            label="Remind me 2 days before deadline"
            description="Deadlines: 7th and 22nd of each month"
            value={prefs.timesheetReminders.twoDaysBefore}
            onValueChange={(val) =>
              updatePrefs((p) => ({
                ...p,
                timesheetReminders: { ...p.timesheetReminders, twoDaysBefore: val },
              }))
            }
            disabled={disabled}
            showDivider
          />
          <ToggleRow
            label="Remind me on deadline day"
            description="Deadlines: 7th and 22nd of each month"
            value={prefs.timesheetReminders.onDeadlineDay}
            onValueChange={(val) =>
              updatePrefs((p) => ({
                ...p,
                timesheetReminders: { ...p.timesheetReminders, onDeadlineDay: val },
              }))
            }
            disabled={disabled}
            showDivider={false}
          />
        </View>

        {/* ETO Reminders */}
        <SectionHeader title="ETO REMINDERS" />
        <View
          className="bg-white shadow-level-1 mx-md"
          style={{ borderRadius: 12 }}
        >
          <ToggleRow
            label="Low balance alert (under 8 hours)"
            value={prefs.etoReminders.lowBalanceAlert}
            onValueChange={(val) =>
              updatePrefs((p) => ({
                ...p,
                etoReminders: { ...p.etoReminders, lowBalanceAlert: val },
              }))
            }
            disabled={disabled}
            showDivider
          />
          <ToggleRow
            label="Expiring ETO warning (30 days)"
            value={prefs.etoReminders.expiringWarning}
            onValueChange={(val) =>
              updatePrefs((p) => ({
                ...p,
                etoReminders: { ...p.etoReminders, expiringWarning: val },
              }))
            }
            disabled={disabled}
            showDivider
          />
          <ToggleRow
            label="Monthly balance summary"
            value={prefs.etoReminders.monthlySummary}
            onValueChange={(val) =>
              updatePrefs((p) => ({
                ...p,
                etoReminders: { ...p.etoReminders, monthlySummary: val },
              }))
            }
            disabled={disabled}
            showDivider={false}
          />
        </View>

        {/* Approval Notifications */}
        <SectionHeader title="APPROVAL NOTIFICATIONS" />
        <View
          className="bg-white shadow-level-1 mx-md"
          style={{ borderRadius: 12 }}
        >
          <ToggleRow
            label="Timesheet approved"
            value={prefs.approvalNotifications.timesheetApproved}
            onValueChange={(val) =>
              updatePrefs((p) => ({
                ...p,
                approvalNotifications: { ...p.approvalNotifications, timesheetApproved: val },
              }))
            }
            disabled={disabled}
            showDivider
          />
          <ToggleRow
            label="Timesheet rejected"
            value={prefs.approvalNotifications.timesheetRejected}
            onValueChange={(val) =>
              updatePrefs((p) => ({
                ...p,
                approvalNotifications: { ...p.approvalNotifications, timesheetRejected: val },
              }))
            }
            disabled={disabled}
            showDivider
          />
          <ToggleRow
            label="ETO request approved"
            value={prefs.approvalNotifications.etoRequestApproved}
            onValueChange={(val) =>
              updatePrefs((p) => ({
                ...p,
                approvalNotifications: { ...p.approvalNotifications, etoRequestApproved: val },
              }))
            }
            disabled={disabled}
            showDivider
          />
          <ToggleRow
            label="ETO request rejected"
            value={prefs.approvalNotifications.etoRequestRejected}
            onValueChange={(val) =>
              updatePrefs((p) => ({
                ...p,
                approvalNotifications: { ...p.approvalNotifications, etoRequestRejected: val },
              }))
            }
            disabled={disabled}
            showDivider={false}
          />
        </View>
      </ScrollView>
    </View>
  );
}
