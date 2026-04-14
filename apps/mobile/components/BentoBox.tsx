import { View, Text, TouchableOpacity, TextInput, ViewProps, TextProps, TouchableOpacityProps, TextInputProps } from 'react-native';
import { ReactNode } from 'react';

/**
 * Bento Box Design System Components
 *
 * These components implement the Bento Box design system with NativeWind styling.
 * See /design/bento-box-system.md for full design specifications.
 */

// Card Component - The fundamental building block of Bento Box
interface CardProps extends ViewProps {
  children: ReactNode;
  shadow?: 'level-1' | 'level-2' | 'level-3' | 'level-4';
}

export function Card({ children, shadow = 'level-2', className = '', ...props }: CardProps) {
  const shadowClass = `shadow-${shadow}`;
  return (
    <View className={`bg-white rounded-lg ${shadowClass} p-md ${className}`} {...props}>
      {children}
    </View>
  );
}

// Button Components
interface ButtonProps extends TouchableOpacityProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
}

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const variantClasses = {
    primary: 'bg-primary active:bg-primary-dark',
    secondary: 'bg-gray-100 active:bg-gray-200',
    outline: 'bg-transparent border-2 border-primary active:bg-primary/10',
    danger: 'bg-error active:bg-error/90',
  };

  const textColorClasses = {
    primary: 'text-white',
    secondary: 'text-gray-800',
    outline: 'text-primary',
    danger: 'text-white',
  };

  return (
    <TouchableOpacity
      className={`rounded-md py-3 px-4 ${variantClasses[variant]} ${className}`}
      activeOpacity={0.8}
      {...props}
    >
      <Text className={`text-button ${textColorClasses[variant]} text-center`}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

// Typography Components
interface HeadingProps extends TextProps {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4;
}

export function Heading({ children, level = 1, className = '', ...props }: HeadingProps) {
  const sizeClasses = {
    1: 'text-h1',
    2: 'text-h2',
    3: 'text-h3',
    4: 'text-h4',
  };

  return (
    <Text className={`${sizeClasses[level]} font-semibold text-gray-800 ${className}`} {...props}>
      {children}
    </Text>
  );
}

export function BodyText({ children, className = '', ...props }: TextProps & { children: ReactNode }) {
  return (
    <Text className={`text-body text-gray-600 ${className}`} {...props}>
      {children}
    </Text>
  );
}

export function Caption({ children, className = '', ...props }: TextProps & { children: ReactNode }) {
  return (
    <Text className={`text-caption text-gray-500 ${className}`} {...props}>
      {children}
    </Text>
  );
}

// Input Component
interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-body-small text-gray-700 mb-2">
          {label}
        </Text>
      )}
      <TextInput
        className={`h-12 px-3 rounded-md border ${
          error ? 'border-error' : 'border-gray-300'
        } text-body text-gray-800 ${className}`}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && (
        <Text className="text-caption text-error mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}

// List Item Component
interface ListItemProps extends TouchableOpacityProps {
  children: ReactNode;
  showDivider?: boolean;
}

export function ListItem({ children, showDivider = true, className = '', ...props }: ListItemProps) {
  return (
    <TouchableOpacity
      className={`min-h-[56px] px-3 py-4 active:bg-gray-50 ${
        showDivider ? 'border-b border-gray-200' : ''
      } ${className}`}
      activeOpacity={0.8}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}

// Badge Component
interface BadgeProps extends ViewProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

export function Badge({ children, variant = 'neutral', className = '', ...props }: BadgeProps) {
  const variantClasses = {
    success: 'bg-success/10 border-success/20',
    warning: 'bg-warning/10 border-warning/20',
    error: 'bg-error/10 border-error/20',
    info: 'bg-info/10 border-info/20',
    neutral: 'bg-gray-100 border-gray-200',
  };

  const textColorClasses = {
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    info: 'text-info',
    neutral: 'text-gray-700',
  };

  return (
    <View className={`rounded-sm px-2 py-1 border ${variantClasses[variant]} ${className}`} {...props}>
      <Text className={`text-caption font-medium ${textColorClasses[variant]}`}>
        {children}
      </Text>
    </View>
  );
}

// Floating Action Button (FAB)
export function FAB({ children, className = '', ...props }: TouchableOpacityProps & { children: ReactNode }) {
  return (
    <TouchableOpacity
      className={`absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full shadow-level-3 items-center justify-center active:bg-primary-dark ${className}`}
      activeOpacity={0.8}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}
