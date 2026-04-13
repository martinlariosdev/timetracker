# Authentication Usage Examples

This document provides code examples for implementing authentication in the TimeTrack mobile app.

## Table of Contents

- [Basic Login Screen](#basic-login-screen)
- [Protected Routes](#protected-routes)
- [Authentication Context Provider](#authentication-context-provider)
- [Auto-Login on App Start](#auto-login-on-app-start)
- [Manual Token Refresh](#manual-token-refresh)
- [Error Handling](#error-handling)
- [Logout with Confirmation](#logout-with-confirmation)

## Basic Login Screen

Simple login screen with Okta authentication:

```typescript
import React from 'react';
import { View, Button, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const { login, isLoading, error } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await login();
      // Navigate to home screen after successful login
      router.replace('/home');
    } catch (error) {
      console.error('Login failed:', error);
      // Error is already set in auth state
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to TimeTrack</Text>
      <Text style={styles.subtitle}>Track your time, manage your ETO</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Button
        title={isLoading ? 'Logging in...' : 'Login with Okta'}
        onPress={handleLogin}
        disabled={isLoading}
      />

      {isLoading && <ActivityIndicator style={styles.loader} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  errorText: {
    color: '#c62828',
  },
  loader: {
    marginTop: 20,
  },
});
```

## Protected Routes

App layout with authentication check:

```typescript
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  // Show authenticated routes
  return (
    <Stack>
      <Stack.Screen name="home" options={{ title: 'Home' }} />
      <Stack.Screen name="timesheet" options={{ title: 'Timesheet' }} />
      <Stack.Screen name="eto" options={{ title: 'ETO Requests' }} />
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
    </Stack>
  );
}
```

## Authentication Context Provider

Global auth context for the app:

```typescript
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth as useAuthHook, AuthState, UserProfile } from '../hooks/useAuth';

interface AuthContextType extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
  checkAuth: () => Promise<boolean>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthHook();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}

// Usage in app root:
// import { AuthProvider } from './contexts/AuthContext';
//
// export default function App() {
//   return (
//     <AuthProvider>
//       <YourApp />
//     </AuthProvider>
//   );
// }
```

## Auto-Login on App Start

Check authentication on app start:

```typescript
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const { checkAuth, isLoading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkAuthentication() {
      try {
        const isAuthenticated = await checkAuth();
        
        if (isAuthenticated) {
          router.replace('/home');
        } else {
          router.replace('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.replace('/login');
      } finally {
        setIsChecking(false);
      }
    }

    checkAuthentication();
  }, []);

  if (isChecking || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}
```

## Manual Token Refresh

Force token refresh before critical operations:

```typescript
import { useAuth } from '../hooks/useAuth';

function CriticalOperation() {
  const { getToken, refreshAuth } = useAuth();

  const performCriticalOperation = async () => {
    try {
      // Force refresh authentication state
      await refreshAuth();

      // Get fresh token
      const token = await getToken();

      if (!token) {
        throw new Error('Not authenticated');
      }

      // Perform operation with fresh token
      await performApiCall(token);
    } catch (error) {
      console.error('Operation failed:', error);
    }
  };

  return (
    <Button title="Perform Operation" onPress={performCriticalOperation} />
  );
}
```

## Error Handling

Comprehensive error handling:

```typescript
import { useAuth } from '../hooks/useAuth';
import { OktaAuthError } from '../lib/auth/okta-service';
import { Alert } from 'react-native';

function LoginWithErrorHandling() {
  const { login, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      let errorMessage = 'An unexpected error occurred';
      let errorTitle = 'Login Failed';

      if (error instanceof OktaAuthError) {
        // Handle Okta-specific errors
        switch (error.code) {
          case 'DISCOVERY_FAILED':
            errorMessage = 'Could not connect to authentication server';
            break;
          case 'USER_CANCELLED':
            errorMessage = 'Login was cancelled';
            errorTitle = 'Cancelled';
            break;
          case 'TOKEN_EXCHANGE_FAILED':
            errorMessage = 'Failed to complete authentication';
            break;
          case 'MISSING_OKTA_ISSUER':
          case 'MISSING_OKTA_CLIENT_ID':
          case 'INVALID_CONFIGURATION':
            errorMessage = 'Authentication is not configured. Please contact support.';
            break;
          default:
            errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      Alert.alert(errorTitle, errorMessage, [{ text: 'OK' }]);
    }
  };

  return <Button title="Login" onPress={handleLogin} />;
}
```

## Logout with Confirmation

Logout with user confirmation:

```typescript
import React from 'react';
import { Button, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { logout, user } = useAuth();
  const router = useRouter();

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
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              console.error('Logout failed:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Welcome, {user?.name}!</Text>
      <Text>Email: {user?.email}</Text>
      
      <Button
        title="Logout"
        onPress={handleLogout}
        color="#d32f2f"
      />
    </View>
  );
}
```

## Making Authenticated API Calls

Using the token with Apollo Client:

```typescript
import { useQuery } from '@apollo/client';
import { ME_QUERY } from '../lib/graphql/queries';

function UserProfile() {
  // Apollo Client automatically includes auth token via authLink
  const { data, loading, error } = useQuery(ME_QUERY);

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View>
      <Text>Name: {data.me.name}</Text>
      <Text>Email: {data.me.email}</Text>
      <Text>ETO Balance: {data.me.etoBalance} hours</Text>
    </View>
  );
}
```

## Handling Token Expiration

Automatic token refresh is built-in, but you can also handle it manually:

```typescript
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';
import { AppState } from 'react-native';

function TokenRefreshHandler() {
  const { refreshAuth } = useAuth();

  useEffect(() => {
    // Refresh auth when app comes to foreground
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        refreshAuth().catch(console.error);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refreshAuth]);

  return null;
}
```

## Testing Without Okta

Mock authentication for testing:

```typescript
import { Storage } from '../lib/storage';

// FOR TESTING ONLY - DO NOT USE IN PRODUCTION
async function mockLogin() {
  const mockUser = {
    id: '1',
    externalId: 'test-user-123',
    name: 'Test User',
    email: 'test@example.com',
    etoBalance: 80,
    workingHoursPerPeriod: 40,
    paymentType: 'contract',
  };

  const mockTokens = {
    jwtToken: 'mock-jwt-token-for-testing',
    jwtExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    oktaIdToken: 'mock-id-token',
    user: mockUser,
  };

  await Storage.setItem('auth_tokens', mockTokens);
  
  console.log('Mock authentication set');
}

// Use in development:
// import { mockLogin } from './auth-helpers';
// await mockLogin();
```

## Best Practices

1. **Always handle errors**: Authentication can fail for many reasons
2. **Show loading states**: Give users feedback during async operations
3. **Auto-refresh tokens**: Let the hook handle token lifecycle
4. **Clear error states**: Reset error messages after successful operations
5. **Secure token storage**: Never log tokens or store in insecure locations
6. **Handle app state changes**: Refresh auth when app comes to foreground
7. **Provide logout**: Always give users a way to logout
8. **Test offline scenarios**: Handle network errors gracefully
