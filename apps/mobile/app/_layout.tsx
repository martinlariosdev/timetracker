import { Stack, Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { ApolloProvider } from '../lib/apollo-provider';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';
import '../global.css';

export default function RootLayout() {
  // Initialize push notifications on app startup
  useNotifications();

  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      // Still loading auth state
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main app if authenticated
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <ApolloProvider>
        <View className="flex-1 items-center justify-center bg-gray-50">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </ApolloProvider>
    );
  }

  return (
    <ApolloProvider>
      <Slot />
    </ApolloProvider>
  );
}
