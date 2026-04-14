import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ApolloError } from '@apollo/client';

interface ErrorInfo {
  title: string;
  message: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  action?: 'retry' | 'logout' | 'none';
}

function getErrorInfo(error: ApolloError | Error | null): ErrorInfo {
  if (!error) {
    return {
      title: 'Something Went Wrong',
      message: 'Please try again',
      icon: 'alert-circle',
      color: '#EF4444',
      action: 'retry',
    };
  }

  // Network error (offline, timeout)
  if ('networkError' in error && error.networkError) {
    return {
      title: 'No Internet Connection',
      message: 'Check your connection and try again',
      icon: 'cloud-offline',
      color: '#F59E0B',
      action: 'retry',
    };
  }

  // Authentication error
  if ('graphQLErrors' in error && error.graphQLErrors?.some(e =>
    e.message.includes('Unauthorized') ||
    e.message.includes('Authentication') ||
    e.extensions?.code === 'UNAUTHENTICATED'
  )) {
    return {
      title: 'Session Expired',
      message: 'Please log in again',
      icon: 'lock-closed',
      color: '#EF4444',
      action: 'logout',
    };
  }

  // Server error (500)
  if ('graphQLErrors' in error && error.graphQLErrors?.some(e =>
    e.extensions?.code === 'INTERNAL_SERVER_ERROR'
  )) {
    return {
      title: 'Server Error',
      message: "We're working on it. Try again later.",
      icon: 'server',
      color: '#EF4444',
      action: 'none',
    };
  }

  // Permission error (403)
  if ('graphQLErrors' in error && error.graphQLErrors?.some(e =>
    e.message.includes('Forbidden') ||
    e.message.includes('permission') ||
    e.extensions?.code === 'FORBIDDEN'
  )) {
    return {
      title: 'Access Denied',
      message: "You don't have permission to view this",
      icon: 'shield-off',
      color: '#EF4444',
      action: 'none',
    };
  }

  // Generic error
  return {
    title: 'Something Went Wrong',
    message: error.message || 'Please try again',
    icon: 'alert-circle',
    color: '#EF4444',
    action: 'retry',
  };
}

interface ErrorViewProps {
  error: ApolloError | Error | null;
  onRetry?: () => void;
  onLogout?: () => void;
}

export function ErrorView({ error, onRetry, onLogout }: ErrorViewProps) {
  const info = getErrorInfo(error);

  const handleAction = () => {
    if (info.action === 'retry' && onRetry) {
      onRetry();
    } else if (info.action === 'logout' && onLogout) {
      onLogout();
    }
  };

  return (
    <View className="flex-1 items-center justify-center p-4">
      <Ionicons name={info.icon} size={48} color={info.color} />
      <Text className="text-base font-semibold text-gray-800 mt-3 text-center">
        {info.title}
      </Text>
      <Text className="text-sm text-gray-500 mt-1 text-center">
        {info.message}
      </Text>
      {info.action !== 'none' && (
        <TouchableOpacity
          onPress={handleAction}
          className="bg-primary rounded-lg px-4 py-2 mt-4"
          accessibilityLabel={info.action === 'retry' ? 'Retry' : 'Log out'}
          accessibilityRole="button"
        >
          <Text className="text-white font-semibold">
            {info.action === 'retry' ? 'Retry' : 'Log Out'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
