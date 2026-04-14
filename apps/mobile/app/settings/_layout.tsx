import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="notifications" />
      <Stack.Screen name="dark-mode" />
      <Stack.Screen name="theme" />
      <Stack.Screen name="work-hours" />
      <Stack.Screen name="week-start" />
    </Stack>
  );
}
