/**
 * Mock Login Button Component
 *
 * Development-only button that bypasses Okta authentication
 * using mock tokens. Only visible in __DEV__ mode.
 *
 * Usage:
 * ```tsx
 * import { MockLoginButton } from '@/components/MockLoginButton';
 *
 * <MockLoginButton onSuccess={() => router.replace('/(tabs)')} />
 * ```
 */

import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useMutation } from '@apollo/client/react';
import { MOCK_LOGIN_MUTATION } from '../lib/graphql/mutations';
import { Storage } from '../lib/storage';
import { MOCK_USERS, type MockUser } from '../scripts/setup-mock-auth';
import { useAuth } from '../hooks/useAuth';

interface MockLoginButtonProps {
  onSuccess?: () => void;
  user?: MockUser;
}

export function MockLoginButton({ onSuccess, user }: MockLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { refreshAuth } = useAuth();
  const [mockLogin] = useMutation(MOCK_LOGIN_MUTATION);

  // Only show in development mode
  if (!__DEV__) {
    return null;
  }

  const handleMockLogin = async () => {
    try {
      setIsLoading(true);
      const mockUser = user || MOCK_USERS.john;

      console.log('[Mock Login] Calling backend mockLogin mutation for:', mockUser.email);

      // Call backend mockLogin mutation to get real JWT token
      const { data } = await mockLogin({
        variables: {
          input: {
            email: mockUser.email,
          },
        },
      });

      if (!data?.mockLogin) {
        throw new Error('No response from mockLogin mutation');
      }

      // Parse expiresIn (e.g., "7d" -> milliseconds)
      const parseExpiresIn = (expiresIn: string): number => {
        if (expiresIn.endsWith('d')) {
          return parseInt(expiresIn) * 24 * 60 * 60 * 1000;
        }
        if (expiresIn.endsWith('h')) {
          return parseInt(expiresIn) * 60 * 60 * 1000;
        }
        return parseInt(expiresIn) * 1000; // seconds
      };

      const expiresInMs = parseExpiresIn(data.mockLogin.expiresIn);
      const jwtExpiresAt = Date.now() + expiresInMs;

      // Store real JWT token from backend
      await Storage.setItem('auth_tokens', {
        jwtToken: data.mockLogin.accessToken,
        jwtExpiresAt,
        oktaIdToken: 'mock-okta-id-token',
        oktaRefreshToken: 'mock-okta-refresh-token',
        user: data.mockLogin.user,
      });

      console.log('[Mock Login] ✅ Token stored');

      // Refresh auth state to pick up new tokens
      await refreshAuth();

      Alert.alert(
        '✅ Mock Login Success',
        `Logged in as ${data.mockLogin.user.name}`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (onSuccess) {
                onSuccess();
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('[Mock Login] Error:', error);
      Alert.alert('Error', 'Failed to setup mock authentication. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="mt-4">
      <Pressable
        onPress={handleMockLogin}
        disabled={isLoading}
        className="bg-gray-700 rounded-lg px-4 py-2 items-center"
        style={{ opacity: isLoading ? 0.6 : 1 }}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text className="text-white text-sm font-semibold">
            🔧 DEV: Mock Login
          </Text>
        )}
      </Pressable>
      <Text className="text-xs text-gray-600 text-center mt-1">
        Development only - bypasses Okta
      </Text>
    </View>
  );
}

/**
 * Mock Login Button with User Selector
 * Shows multiple user options
 */
export function MockLoginButtonWithSelector({ onSuccess }: MockLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<keyof typeof MOCK_USERS>('john');
  const { refreshAuth } = useAuth();
  const [mockLogin] = useMutation(MOCK_LOGIN_MUTATION);

  // Only show in development mode
  if (!__DEV__) {
    return null;
  }

  const handleMockLogin = async (userKey: keyof typeof MOCK_USERS) => {
    try {
      setIsLoading(true);
      const user = MOCK_USERS[userKey];

      console.log('[Mock Login] Calling backend mockLogin mutation for:', user.email);

      // Call backend mockLogin mutation to get real JWT token
      const { data } = await mockLogin({
        variables: {
          input: {
            email: user.email,
          },
        },
      });

      console.log('[Mock Login] Response:', data);

      if (!data?.mockLogin) {
        throw new Error('No response from mockLogin mutation');
      }

      // Parse expiresIn (e.g., "7d" -> milliseconds)
      const parseExpiresIn = (expiresIn: string): number => {
        if (expiresIn.endsWith('d')) {
          return parseInt(expiresIn) * 24 * 60 * 60 * 1000;
        }
        if (expiresIn.endsWith('h')) {
          return parseInt(expiresIn) * 60 * 60 * 1000;
        }
        return parseInt(expiresIn) * 1000; // seconds
      };

      const expiresInMs = parseExpiresIn(data.mockLogin.expiresIn);
      const jwtExpiresAt = Date.now() + expiresInMs;

      // Store real JWT token from backend
      await Storage.setItem('auth_tokens', {
        jwtToken: data.mockLogin.accessToken,
        jwtExpiresAt,
        oktaIdToken: 'mock-okta-id-token',
        oktaRefreshToken: 'mock-okta-refresh-token',
        user: data.mockLogin.user,
      });

      console.log('[Mock Login] ✅ Token stored, expires at:', new Date(jwtExpiresAt).toISOString());

      // Refresh auth state to pick up new tokens
      await refreshAuth();

      Alert.alert(
        '✅ Mock Login Success',
        `Logged in as ${data.mockLogin.user.name}`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (onSuccess) {
                onSuccess();
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('[Mock Login] Error:', error);
      Alert.alert('Error', 'Failed to setup mock authentication. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="mt-4 bg-gray-100 rounded-lg p-3">
      <Text className="text-xs font-semibold text-gray-700 mb-2 text-center">
        🔧 DEV MODE - Mock Login
      </Text>

      <View className="flex-row gap-2 justify-center">
        {Object.entries(MOCK_USERS).map(([key, user]) => (
          <Pressable
            key={key}
            onPress={() => handleMockLogin(key as keyof typeof MOCK_USERS)}
            disabled={isLoading}
            className="bg-gray-700 rounded px-3 py-2"
            style={{ opacity: isLoading ? 0.6 : 1 }}
          >
            <Text className="text-white text-xs font-semibold">
              {user.name.split(' ')[0]}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text className="text-xs text-gray-500 text-center mt-2">
        Bypasses Okta - Development only
      </Text>
    </View>
  );
}
