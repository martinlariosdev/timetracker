import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
  Platform,
  StatusBar,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// Types
interface SettingsItem {
  id: string;
  label: string;
  value?: string;
  icon: string;
  type: 'navigation' | 'toggle' | 'checkbox';
  onPress?: () => void;
  enabled?: boolean;
}

interface Category {
  id: string;
  title: string;
  icon: string;
  items: SettingsItem[];
}

export default function SettingsScreen() {
  // State management
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [balanceAlertsEnabled, setBalanceAlertsEnabled] = useState(true);
  const [reminder1Day, setReminder1Day] = useState(true);
  const [reminder3Days, setReminder3Days] = useState(false);
  const [reminderEvery3Days, setReminderEvery3Days] = useState(false);

  // Mock user data - Replace with actual user context/API
  const user = {
    name: 'Martin Larios',
    email: 'martin@example.com',
    role: 'Software Engineer',
    avatar: '👤',
  };

  // App info
  const appVersion = '1.0.0';
  const buildNumber = '42';

  // Handlers
  const handleProfileEdit = () => {
    // TODO: Navigate to profile edit screen
    console.log('Edit profile');
  };

  const handleNotificationsToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    if (value) {
      // TODO: Request notification permissions if not granted
      console.log('Request notification permissions');
    }
    // TODO: Save to backend
  };

  const handleDarkModeToggle = (value: boolean) => {
    setDarkModeEnabled(value);
    // TODO: Apply theme change and save preference
    console.log('Toggle dark mode:', value);
  };

  const handleWorkHours = () => {
    // TODO: Navigate to work hours configuration screen
    console.log('Open work hours');
  };

  const handleTimeFormat = () => {
    // TODO: Navigate to time format selection screen
    console.log('Open time format');
  };

  const handleLanguage = () => {
    // TODO: Navigate to language selection screen
    console.log('Open language');
  };

  const handleBalanceAlertsToggle = (value: boolean) => {
    setBalanceAlertsEnabled(value);
    // TODO: Save to backend
  };

  const handleChangePassword = () => {
    // TODO: Navigate to change password screen
    console.log('Change password');
  };

  const handleConnectedDevices = () => {
    // TODO: Navigate to connected devices screen
    console.log('Connected devices');
  };

  const handleHelpCenter = () => {
    // TODO: Open help center (in-app browser or external)
    Linking.openURL('https://help.timetrack.com');
  };

  const handleContactSupport = () => {
    // TODO: Open email composer
    const email = 'support@timetrack.com';
    const subject = 'Support Request';
    const body = `\n\n---\nApp Version: ${appVersion} (Build ${buildNumber})\nPlatform: ${Platform.OS} ${Platform.Version}\n`;
    Linking.openURL(`mailto:${email}?subject=${subject}&body=${encodeURIComponent(body)}`);
  };

  const handleRateApp = () => {
    // TODO: Open platform-specific rating dialog
    if (Platform.OS === 'ios') {
      // iOS: StoreKit rating prompt
      Linking.openURL('https://apps.apple.com/app/timetrack/id123456789');
    } else {
      // Android: Google Play in-app review
      Linking.openURL('https://play.google.com/store/apps/details?id=com.timetrack');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // TODO: Clear auth token, navigate to login
            console.log('Logout confirmed');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you absolutely sure you want to permanently delete your account? This action cannot be undone and will delete all your data.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            // TODO: Send delete request to backend
            console.log('Delete account confirmed');
            Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50"
      style={{
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Top Bar */}
      <View className="bg-white h-14 justify-center items-center border-b border-gray-200">
        <Text className="text-xl font-semibold text-gray-800">Settings</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Card with Gradient */}
        <View className="mx-4 mt-4">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleProfileEdit}
          >
            <LinearGradient
              colors={['#2563EB', '#0EA5E9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-2xl p-6 shadow-lg"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <View className="flex-row items-center">
                {/* Avatar */}
                <View className="w-14 h-14 rounded-full bg-white/20 items-center justify-center border-2 border-white">
                  <Text className="text-3xl">{user.avatar}</Text>
                </View>

                {/* User Info */}
                <View className="flex-1 ml-4">
                  <Text className="text-xl font-semibold text-white">
                    {user.name}
                  </Text>
                  <Text className="text-sm text-white/85 mt-0.5">
                    {user.email}
                  </Text>
                  <Text className="text-xs text-white/75 mt-0.5">
                    {user.role}
                  </Text>
                </View>

                {/* Chevron */}
                <View className="w-5 h-5 items-center justify-center">
                  <Text className="text-white text-lg">›</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Toggle Cards (2-column grid) */}
        <View className="flex-row mx-2 mt-4">
          {/* Notifications Card */}
          <View className="flex-1 mx-2">
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleNotificationsToggle(!notificationsEnabled)}
              className="bg-white rounded-2xl p-5 shadow-md"
              style={{
                height: 120,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View className="items-center flex-1 justify-between">
                <Text className="text-3xl mb-2">🔔</Text>
                <Text className="text-base font-semibold text-gray-800 text-center">
                  Notifications
                </Text>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleNotificationsToggle}
                  trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#D1D5DB"
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Dark Mode Card */}
          <View className="flex-1 mx-2">
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleDarkModeToggle(!darkModeEnabled)}
              className="bg-white rounded-2xl p-5 shadow-md"
              style={{
                height: 120,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View className="items-center flex-1 justify-between">
                <Text className="text-3xl mb-2">🌙</Text>
                <Text className="text-base font-semibold text-gray-800 text-center">
                  Dark Mode
                </Text>
                <Switch
                  value={darkModeEnabled}
                  onValueChange={handleDarkModeToggle}
                  trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#D1D5DB"
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences Category Card */}
        <View className="mx-4 mt-4">
          <View
            className="bg-white rounded-2xl p-5 shadow-md"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            {/* Category Header */}
            <View className="flex-row items-center mb-4">
              <Text className="text-2xl mr-3">⚙️</Text>
              <Text className="text-lg font-semibold text-gray-800">
                Preferences
              </Text>
            </View>

            {/* Preferences Items */}
            <TouchableOpacity
              onPress={handleWorkHours}
              className="flex-row items-center py-2 border-t border-gray-100"
              style={{ minHeight: 44 }}
            >
              <Text className="flex-1 text-base text-gray-700">Work Hours</Text>
              <Text className="text-sm text-gray-500 mr-2">8 hrs/day</Text>
              <Text className="text-gray-400 text-base">›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleTimeFormat}
              className="flex-row items-center py-2 border-t border-gray-100"
              style={{ minHeight: 44 }}
            >
              <Text className="flex-1 text-base text-gray-700">Time Format</Text>
              <Text className="text-sm text-gray-500 mr-2">12-hour</Text>
              <Text className="text-gray-400 text-base">›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLanguage}
              className="flex-row items-center py-2 border-t border-gray-100"
              style={{ minHeight: 44 }}
            >
              <Text className="flex-1 text-base text-gray-700">Language</Text>
              <Text className="text-sm text-gray-500 mr-2">English</Text>
              <Text className="text-gray-400 text-base">›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ETO Reminders Category Card */}
        <View className="mx-4 mt-2">
          <View
            className="bg-white rounded-2xl p-5 shadow-md"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            {/* Category Header */}
            <View className="flex-row items-center mb-4">
              <Text className="text-2xl mr-3">💰</Text>
              <Text className="text-lg font-semibold text-gray-800">
                ETO Reminders
              </Text>
            </View>

            {/* Balance Alerts Toggle */}
            <View className="flex-row items-center py-2" style={{ minHeight: 44 }}>
              <Text className="flex-1 text-base text-gray-700">Balance Alerts</Text>
              <Switch
                value={balanceAlertsEnabled}
                onValueChange={handleBalanceAlertsToggle}
                trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#D1D5DB"
              />
            </View>

            {/* Time Off Reminders Section */}
            <View className="border-t border-gray-100 pt-3 mt-1">
              <Text className="text-base text-gray-700 mb-2">Time Off Reminders</Text>

              {/* Checkbox 1: 1 day before */}
              <TouchableOpacity
                onPress={() => setReminder1Day(!reminder1Day)}
                className="flex-row items-center py-2"
                style={{ minHeight: 44 }}
              >
                <View className="w-6 h-6 rounded-md border-2 items-center justify-center mr-3"
                  style={{
                    borderColor: reminder1Day ? '#2563EB' : '#D1D5DB',
                    backgroundColor: reminder1Day ? '#2563EB' : 'transparent',
                  }}
                >
                  {reminder1Day && (
                    <Text className="text-white text-xs font-bold">✓</Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-gray-600">• 1 day before</Text>
                </View>
              </TouchableOpacity>

              {/* Checkbox 2: 3 days before */}
              <TouchableOpacity
                onPress={() => setReminder3Days(!reminder3Days)}
                className="flex-row items-center py-2"
                style={{ minHeight: 44 }}
              >
                <View className="w-6 h-6 rounded-md border-2 items-center justify-center mr-3"
                  style={{
                    borderColor: reminder3Days ? '#2563EB' : '#D1D5DB',
                    backgroundColor: reminder3Days ? '#2563EB' : 'transparent',
                  }}
                >
                  {reminder3Days && (
                    <Text className="text-white text-xs font-bold">✓</Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-gray-600">• 3 days before</Text>
                </View>
              </TouchableOpacity>

              {/* Checkbox 3: Every 3 days */}
              <TouchableOpacity
                onPress={() => setReminderEvery3Days(!reminderEvery3Days)}
                className="flex-row items-center py-2"
                style={{ minHeight: 44 }}
              >
                <View className="w-6 h-6 rounded-md border-2 items-center justify-center mr-3"
                  style={{
                    borderColor: reminderEvery3Days ? '#2563EB' : '#D1D5DB',
                    backgroundColor: reminderEvery3Days ? '#2563EB' : 'transparent',
                  }}
                >
                  {reminderEvery3Days && (
                    <Text className="text-white text-xs font-bold">✓</Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-gray-600">• Every 3 days</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Account Actions Cards (2-column grid) */}
        <View className="flex-row mx-2 mt-4">
          {/* Change Password Card */}
          <View className="flex-1 mx-2">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleChangePassword}
              className="bg-white rounded-2xl p-5 shadow-md"
              style={{
                height: 100,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View className="items-center flex-1 justify-between">
                <Text className="text-3xl">🔒</Text>
                <Text className="text-base font-semibold text-gray-800 text-center">
                  Change{'\n'}Password
                </Text>
                <Text className="text-gray-400 text-base">›</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Connected Devices Card */}
          <View className="flex-1 mx-2">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleConnectedDevices}
              className="bg-white rounded-2xl p-5 shadow-md"
              style={{
                height: 100,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View className="items-center flex-1 justify-between">
                <Text className="text-3xl">📱</Text>
                <Text className="text-base font-semibold text-gray-800 text-center">
                  Connected{'\n'}Devices
                </Text>
                <Text className="text-gray-400 text-base">›</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Help & Support Category Card */}
        <View className="mx-4 mt-4">
          <View
            className="bg-white rounded-2xl p-5 shadow-md"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            {/* Category Header */}
            <View className="flex-row items-center mb-4">
              <Text className="text-2xl mr-3">❓</Text>
              <Text className="text-lg font-semibold text-gray-800">
                Help & Support
              </Text>
            </View>

            {/* Support Items */}
            <TouchableOpacity
              onPress={handleHelpCenter}
              className="flex-row items-center py-2 border-t border-gray-100"
              style={{ minHeight: 44 }}
            >
              <Text className="flex-1 text-base text-gray-700">Help Center</Text>
              <Text className="text-gray-400 text-base">›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleContactSupport}
              className="flex-row items-center py-2 border-t border-gray-100"
              style={{ minHeight: 44 }}
            >
              <Text className="flex-1 text-base text-gray-700">Contact Support</Text>
              <Text className="text-gray-400 text-base">›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRateApp}
              className="flex-row items-center py-2 border-t border-gray-100"
              style={{ minHeight: 44 }}
            >
              <Text className="flex-1 text-base text-gray-700">Rate App</Text>
              <Text className="text-gray-400 text-base">›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <View className="mx-4 mt-6">
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-blue-600 rounded-xl py-4 shadow-md flex-row items-center justify-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
            activeOpacity={0.8}
          >
            <Text className="text-xl mr-2">🚪</Text>
            <Text className="text-white text-base font-semibold">Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View className="items-center py-4 mt-4">
          <Text className="text-xs text-gray-400">
            Version {appVersion} (Build {buildNumber})
          </Text>
        </View>

        {/* Delete Account Link */}
        <View className="mx-4 mb-8">
          <TouchableOpacity
            onPress={handleDeleteAccount}
            className="rounded-xl py-4 flex-row items-center justify-center border-2 border-red-500"
            style={{
              backgroundColor: 'transparent',
            }}
            activeOpacity={0.7}
          >
            <Text className="text-xl mr-2">🗑️</Text>
            <Text className="text-red-500 text-base font-semibold">Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
