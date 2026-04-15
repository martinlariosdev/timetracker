import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { ApolloProvider } from '../lib/apollo-provider';
import { ThemeProvider } from '../contexts/ThemeContext';
import { PreferencesProvider } from '../contexts/PreferencesContext';
import { PayPeriodProvider } from '../contexts/PayPeriodContext';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';
import '../global.css';

/**
 * Navigation and Auth Guard Component
 * Handles authentication routing logic
 * MUST be inside ApolloProvider to use useAuth hook
 */
function NavigationGuard() {
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
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return <Slot />;
}

/**
 * Root Layout Component
 * Wraps app with all necessary providers
 * Order matters: ApolloProvider must be outermost
 */
export default function RootLayout() {
  return (
    <ApolloProvider>
      <ThemeProvider>
        <PreferencesProvider>
          <PayPeriodProvider>
            <NavigationGuard />
          </PayPeriodProvider>
        </PreferencesProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}
