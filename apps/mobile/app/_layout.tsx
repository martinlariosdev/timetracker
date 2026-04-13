import { Stack, Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { ApolloProvider } from '../lib/apollo-provider';
import { useNotifications } from '../hooks/useNotifications';
import '../global.css';

// This is a placeholder for actual auth context
// TODO: Replace with proper auth context from Task 29
function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Simulate checking auth status
    // In real implementation, check AsyncStorage for auth token
    const checkAuth = async () => {
      // For now, default to not authenticated
      // TODO: Implement actual auth check
      setIsAuthenticated(false);
    };

    checkAuth();
  }, []);

  return { isAuthenticated };
}

export default function RootLayout() {
  // Initialize push notifications on app startup
  useNotifications();

  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === null) {
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
  }, [isAuthenticated, segments]);

  // Show loading screen while checking auth
  if (isAuthenticated === null) {
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
