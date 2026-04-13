import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Heading, BodyText, Button } from '@/components/BentoBox';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

const SETTINGS_SECTIONS = [
  {
    title: 'Account',
    items: [
      { label: 'Profile', icon: 'person-outline', onPress: () => console.log('Profile') },
      { label: 'Change Password', icon: 'key-outline', onPress: () => console.log('Password') },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { label: 'Notifications', icon: 'notifications-outline', onPress: () => console.log('Notifications') },
      { label: 'Offline Mode', icon: 'cloud-offline-outline', onPress: () => console.log('Offline') },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'Help', icon: 'help-circle-outline', onPress: () => console.log('Help') },
      { label: 'About', icon: 'information-circle-outline', onPress: () => console.log('About') },
    ],
  },
];

export default function SettingsScreen() {
  const {
    logout,
    user,
    biometricEnabled,
    biometricSupported,
    enableBiometric,
    disableBiometric,
  } = useAuth();
  const [biometricToggling, setBiometricToggling] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleBiometricToggle = async (value: boolean) => {
    setBiometricToggling(true);
    try {
      if (value) {
        await enableBiometric();
      } else {
        await disableBiometric();
      }
    } catch (error) {
      console.error('Biometric toggle error:', error);
    } finally {
      setBiometricToggling(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <StatusBar style="auto" />

      <View className="bg-white p-lg items-center mb-lg">
        <View className="w-20 h-20 rounded-full bg-primary items-center justify-center mb-3">
          <Ionicons name="person" size={40} color="#fff" />
        </View>
        <Heading level={3} className="mb-1">
          {user?.name ?? 'User'}
        </Heading>
        <BodyText className="text-gray-600">{user?.email ?? ''}</BodyText>
      </View>

      {/* Biometric Authentication Section */}
      <View className="mb-lg">
        <Text className="text-caption font-semibold text-gray-600 uppercase mb-2 ml-md">
          Security
        </Text>
        <View className="bg-white">
          <View className="flex-row items-center justify-between p-md">
            <View className="flex-row items-center gap-3 flex-1 mr-md">
              <Ionicons name="finger-print-outline" size={24} color="#2563EB" />
              <View className="flex-1">
                <BodyText>Biometric Authentication</BodyText>
                <Text className="text-caption text-gray-500 mt-0.5">
                  {biometricSupported
                    ? biometricEnabled
                      ? 'Enabled'
                      : 'Use biometrics for quick unlock'
                    : 'Not available on this device'}
                </Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              disabled={!biometricSupported || biometricToggling}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={biometricEnabled ? '#2563EB' : '#F3F4F6'}
            />
          </View>
        </View>
      </View>

      {SETTINGS_SECTIONS.map((section, index) => (
        <View key={index} className="mb-lg">
          <Text className="text-caption font-semibold text-gray-600 uppercase mb-2 ml-md">
            {section.title}
          </Text>
          <View className="bg-white">
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                className={`flex-row items-center justify-between p-md ${
                  itemIndex < section.items.length - 1 ? 'border-b border-gray-200' : ''
                }`}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons name={item.icon as any} size={24} color="#2563EB" />
                  <BodyText>{item.label}</BodyText>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <View className="px-md pb-xl">
        <TouchableOpacity
          className="bg-white p-md items-center rounded-md active:bg-gray-50"
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text className="text-error text-body font-semibold">Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
