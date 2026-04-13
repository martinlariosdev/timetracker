import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Heading, BodyText, Button } from '@/components/BentoBox';

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
  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log('Logout');
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <StatusBar style="auto" />

      <View className="bg-white p-lg items-center mb-lg">
        <View className="w-20 h-20 rounded-full bg-primary items-center justify-center mb-3">
          <Ionicons name="person" size={40} color="#fff" />
        </View>
        <Heading level={3} className="mb-1">
          John Doe
        </Heading>
        <BodyText className="text-gray-600">john.doe@example.com</BodyText>
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
