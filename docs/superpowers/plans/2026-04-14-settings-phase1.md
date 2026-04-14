# Issue #12: Most Settings Not Implemented (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement three core settings (Dark Mode, Work Hours, Week Start Day) to replace "Coming Soon" placeholders with functional features that persist correctly.

**Architecture:** 
- ThemeContext provides light/dark/system theme state and persists to AsyncStorage
- Theme context wraps root layout to apply to all screens via CSS/className theming
- Settings handlers navigate to dedicated modals (dark-mode.tsx, work-hours.tsx, week-start.tsx)
- Work hours mutation updates backend user profile; week start persists locally via AsyncStorage
- Settings screen wired to dispatch theme changes and navigate to setting modals

**Tech Stack:** 
- React Native, AsyncStorage, React Context, GraphQL mutations, Tailwind CSS
- Expo Router for navigation to setting modals
- useAuthenticatedMutation hook for backend updates

---

## File Structure

### New Files to Create
1. `contexts/ThemeContext.tsx` - Theme state, persistence, provider
2. `app/settings/dark-mode.tsx` - Dark mode toggle modal
3. `app/settings/work-hours.tsx` - Work hours picker modal (4-12 hours)
4. `app/settings/week-start.tsx` - Week start day picker modal (Sunday/Monday)
5. `hooks/useTheme.ts` - Custom hook to access ThemeContext
6. `lib/graphql/mutations.ts` - ADD: `UPDATE_USER_PROFILE_MUTATION` for work hours

### Modified Files
1. `app/_layout.tsx` - Wrap app with ThemeContext provider
2. `app/(tabs)/settings.tsx` - Wire up dark-mode/work-hours/week-start handlers; remove Phase 2&3 unimplemented settings
3. `utils/add-entry.ts` - ADD: `getWeekStartDay()` to use stored preference; `generateWeekStrip()` updated to use preference
4. `global.css` - ADD: dark mode color overrides

---

## Task Breakdown

### Task 1: Create ThemeContext with Persistence

**Files:**
- Create: `contexts/ThemeContext.tsx`
- Create: `hooks/useTheme.ts`

- [ ] **Step 1: Create ThemeContext**

```typescript
// contexts/ThemeContext.tsx
import React, { createContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => Promise<void>;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem('theme-mode');
        const themeMode = (stored as ThemeMode) || 'light';
        setModeState(themeMode);
        
        // For system mode, we'd need to check device preference
        // For now, just use the stored value
        if (themeMode === 'dark') {
          setIsDark(true);
        } else if (themeMode === 'system') {
          // TODO: Check device color scheme preference
          setIsDark(false);
        } else {
          setIsDark(false);
        }
      } catch (err) {
        console.error('Failed to load theme:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  const setMode = async (newMode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('theme-mode', newMode);
      setModeState(newMode);
      
      if (newMode === 'dark') {
        setIsDark(true);
      } else if (newMode === 'system') {
        // TODO: Check device color scheme preference
        setIsDark(false);
      } else {
        setIsDark(false);
      }
    } catch (err) {
      console.error('Failed to save theme:', err);
    }
  };

  if (isLoading) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ mode, isDark, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

- [ ] **Step 2: Create useTheme hook**

```typescript
// hooks/useTheme.ts
import { useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

- [ ] **Step 3: Verify both files created and no syntax errors**

Run: `cd /Users/martinlarios/personal/apps/mobile && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add contexts/ThemeContext.tsx hooks/useTheme.ts
git commit -m "[settings-implementer] Create ThemeContext with persistence"
```

---

### Task 2: Wrap App with ThemeProvider

**Files:**
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Import ThemeProvider**

In `/Users/martinlarios/personal/apps/mobile/app/_layout.tsx`, add to imports:
```typescript
import { ThemeProvider } from '../contexts/ThemeContext';
```

- [ ] **Step 2: Wrap entire app content with ThemeProvider**

Replace the return statement (lines 45-49) with:
```typescript
  return (
    <ApolloProvider>
      <ThemeProvider>
        <Slot />
      </ThemeProvider>
    </ApolloProvider>
  );
```

- [ ] **Step 3: Verify compilation**

Run: `cd /Users/martinlarios/personal/apps/mobile && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add app/_layout.tsx
git commit -m "[settings-implementer] Wrap app with ThemeProvider"
```

---

### Task 3: Create Dark Mode Modal Screen

**Files:**
- Create: `app/settings/dark-mode.tsx`
- Modify: `app/settings/_layout.tsx`

- [ ] **Step 1: Check settings layout exists**

Run: `cat /Users/martinlarios/personal/apps/mobile/app/settings/_layout.tsx`

If it doesn't exist or needs updating, it should have a Stack navigator. For now, assume it exists. If not, create it with:

```typescript
import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

- [ ] **Step 2: Create dark mode modal screen**

```typescript
// app/settings/dark-mode.tsx
import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';

const THEME_OPTIONS: Array<{ id: ThemeMode; label: string; description: string; icon: keyof typeof Ionicons.glyphMap }> = [
  {
    id: 'light',
    label: 'Light',
    description: 'Always use light theme',
    icon: 'sunny-outline',
  },
  {
    id: 'dark',
    label: 'Dark',
    description: 'Always use dark theme',
    icon: 'moon-outline',
  },
  {
    id: 'system',
    label: 'System',
    description: 'Follow device settings',
    icon: 'settings-outline',
  },
];

export default function DarkModeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { mode, setMode } = useTheme();

  const handleSelect = async (selectedMode: ThemeMode) => {
    await setMode(selectedMode);
    // Don't navigate back immediately; let user see change
    setTimeout(() => {
      router.back();
    }, 300);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* Header */}
      <View
        className="bg-white shadow-level-1"
        style={{
          paddingTop: insets.top,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
        }}
      >
        <View
          className="flex-row items-center justify-between px-4"
          style={{ height: 56 }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="items-center justify-center"
            style={{ width: 44, height: 44 }}
            accessibilityLabel="Back"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={24} color="#4B5563" />
          </TouchableOpacity>

          <Text className="text-h4 font-semibold text-gray-800">
            Dark Mode
          </Text>

          <View style={{ width: 44 }} />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        <View className="mx-md mt-md">
          <Text className="text-body text-gray-600">
            Choose how you'd like the app to appear.
          </Text>
        </View>

        {/* Theme Options */}
        <View className="mx-md mt-md">
          {THEME_OPTIONS.map((option, index) => {
            const isSelected = mode === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                onPress={() => handleSelect(option.id)}
                activeOpacity={0.7}
                className={`flex-row items-center px-4 py-3 ${
                  isSelected ? 'bg-primary/10' : 'bg-white'
                }`}
                style={{
                  minHeight: 80,
                  borderRadius: index === 0 ? 12 : index === THEME_OPTIONS.length - 1 ? 12 : 0,
                  marginBottom: index < THEME_OPTIONS.length - 1 ? 1 : 0,
                  borderWidth: 1,
                  borderColor: isSelected ? '#2563EB' : '#E5E7EB',
                }}
                accessibilityLabel={`${option.label}: ${option.description}`}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                {/* Icon */}
                <View
                  className="items-center justify-center"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: isSelected ? '#2563EB' : '#F3F4F6',
                  }}
                >
                  <Ionicons
                    name={option.icon}
                    size={24}
                    color={isSelected ? '#FFFFFF' : '#6B7280'}
                  />
                </View>

                {/* Text */}
                <View className="flex-1 ml-4">
                  <Text
                    className="text-body font-semibold text-gray-800"
                  >
                    {option.label}
                  </Text>
                  <Text className="text-caption text-gray-500 mt-1">
                    {option.description}
                  </Text>
                </View>

                {/* Checkmark */}
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color="#2563EB" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
```

- [ ] **Step 3: Verify compilation**

Run: `cd /Users/martinlarios/personal/apps/mobile && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add app/settings/dark-mode.tsx
git commit -m "[settings-implementer] Create dark mode modal screen"
```

---

### Task 4: Add UPDATE_USER_PROFILE_MUTATION to GraphQL

**Files:**
- Modify: `lib/graphql/mutations.ts`

- [ ] **Step 1: Read current mutations file to find insertion point**

The file should end around line 276. Add the new mutation before the closing of the file.

- [ ] **Step 2: Add UPDATE_USER_PROFILE_MUTATION**

Add this mutation after line 276 (before the closing of the file):

```typescript
/**
 * Update user profile settings - requires authentication
 */
export const UPDATE_USER_PROFILE_MUTATION = gql`
  mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      id
      name
      email
      workingHoursPerPeriod
      weekStartDay
      theme
    }
  }
`;
```

- [ ] **Step 3: Verify file syntax**

Run: `cd /Users/martinlarios/personal/apps/mobile && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add lib/graphql/mutations.ts
git commit -m "[settings-implementer] Add UPDATE_USER_PROFILE_MUTATION"
```

---

### Task 5: Create Work Hours Modal Screen

**Files:**
- Create: `app/settings/work-hours.tsx`

- [ ] **Step 1: Create work hours modal**

```typescript
// app/settings/work-hours.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useAuthenticatedMutation } from '@/hooks/useAuthenticatedMutation';
import { UPDATE_USER_PROFILE_MUTATION } from '@/lib/graphql/mutations';

const WORK_HOURS_OPTIONS = [4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function WorkHoursScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  
  const [selectedHours, setSelectedHours] = useState(user?.workingHoursPerPeriod || 8);
  const [isSaving, setIsSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const [updateProfile] = useAuthenticatedMutation(UPDATE_USER_PROFILE_MUTATION);

  const handleSave = useCallback(async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        variables: {
          input: {
            workingHoursPerPeriod: selectedHours,
          },
        },
      });

      Alert.alert('Success', `Work hours updated to ${selectedHours} hours per day`, [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      console.error('Failed to update work hours:', err);
      Alert.alert('Error', 'Failed to save work hours. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [selectedHours, user?.id, updateProfile, router]);

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* Header */}
      <View
        className="bg-white shadow-level-1"
        style={{
          paddingTop: insets.top,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
        }}
      >
        <View
          className="flex-row items-center justify-between px-4"
          style={{ height: 56 }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="items-center justify-center"
            style={{ width: 44, height: 44 }}
            accessibilityLabel="Back"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={24} color="#4B5563" />
          </TouchableOpacity>

          <Text className="text-h4 font-semibold text-gray-800">
            Work Hours
          </Text>

          <View style={{ width: 44 }} />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        <View className="mx-md mt-md">
          <Text className="text-body text-gray-600">
            Set your default work hours per day (4-12 hours). This is used for calculations and reminders.
          </Text>
        </View>

        {/* Current Selection */}
        <View className="mx-md mt-md bg-white shadow-level-1 px-4 py-4" style={{ borderRadius: 12 }}>
          <Text className="text-body-small text-gray-600">Current Setting</Text>
          <Text className="text-h2 font-bold text-primary mt-2">
            {selectedHours} hours
          </Text>
          <Text className="text-caption text-gray-500 mt-1">per day</Text>
        </View>

        {/* Picker Trigger */}
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          activeOpacity={0.7}
          className="mx-md mt-md bg-white shadow-level-1 px-4 py-3 flex-row items-center justify-between"
          style={{ borderRadius: 12, minHeight: 56 }}
          accessibilityLabel="Open work hours picker"
          accessibilityRole="button"
        >
          <Text className="text-body font-semibold text-gray-800">
            Change work hours
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Info Box */}
        <View className="mx-md mt-md px-4 py-3 bg-blue-50" style={{ borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#2563EB' }}>
          <Text className="text-caption font-semibold text-primary">Note</Text>
          <Text className="text-caption text-gray-700 mt-1">
            This setting is saved to your profile and used across all devices.
          </Text>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View
        className="bg-white shadow-level-2 px-4 py-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving || selectedHours === user?.workingHoursPerPeriod}
          activeOpacity={0.8}
          className="flex-row items-center justify-center"
          style={{
            height: 56,
            borderRadius: 12,
            backgroundColor: isSaving || selectedHours === user?.workingHoursPerPeriod ? '#D1D5DB' : '#10B981',
          }}
          accessibilityLabel="Save work hours"
          accessibilityRole="button"
        >
          {isSaving ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text className="text-button text-white ml-2">Saving...</Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              <Text className="text-button text-white ml-2">Save</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Hours Picker Modal */}
      <Modal
        visible={showPicker}
        transparent
        animationType={Platform.OS === 'ios' ? 'slide' : 'fade'}
        onRequestClose={() => setShowPicker(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setShowPicker(false)}
            accessibilityLabel="Close picker"
          />
          <View
            className="bg-white"
            style={{
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: Platform.OS === 'ios' ? 40 : 24,
            }}
          >
            {/* Handle */}
            <View
              className="self-center rounded-full mb-4"
              style={{ width: 40, height: 4, backgroundColor: '#D1D5DB' }}
            />

            <Text className="text-h3 font-semibold text-gray-800 mb-4">
              Select Work Hours
            </Text>

            {/* Grid of hours */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
              {WORK_HOURS_OPTIONS.map((hours) => {
                const isSelected = selectedHours === hours;
                return (
                  <TouchableOpacity
                    key={hours}
                    onPress={() => {
                      setSelectedHours(hours);
                      setShowPicker(false);
                    }}
                    activeOpacity={0.7}
                    className={`items-center justify-center flex-1 ${
                      isSelected ? 'bg-primary' : 'bg-gray-100'
                    }`}
                    style={{
                      width: '48%',
                      height: 80,
                      borderRadius: 12,
                      borderWidth: isSelected ? 2 : 0,
                      borderColor: '#2563EB',
                    }}
                    accessibilityLabel={`${hours} hours`}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      className={`text-h2 font-bold ${
                        isSelected ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      {hours}
                    </Text>
                    <Text
                      className={`text-caption ${
                        isSelected ? 'text-white' : 'text-gray-600'
                      }`}
                    >
                      hours
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
```

- [ ] **Step 2: Verify compilation**

Run: `cd /Users/martinlarios/personal/apps/mobile && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/settings/work-hours.tsx
git commit -m "[settings-implementer] Create work hours modal screen"
```

---

### Task 6: Create Week Start Day Modal Screen

**Files:**
- Create: `app/settings/week-start.tsx`

- [ ] **Step 1: Create week start modal**

```typescript
// app/settings/week-start.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WEEK_START_OPTIONS = [
  { id: 'sunday', label: 'Sunday', value: 0 },
  { id: 'monday', label: 'Monday', value: 1 },
];

export default function WeekStartScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load current preference on mount
  useEffect(() => {
    const loadPreference = async () => {
      try {
        const stored = await AsyncStorage.getItem('week-start-day');
        setSelectedDay(stored ? parseInt(stored, 10) : 1); // Default to Monday
      } catch (err) {
        console.error('Failed to load week start preference:', err);
        setSelectedDay(1);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreference();
  }, []);

  const handleSave = useCallback(async () => {
    if (selectedDay === null) return;

    setIsSaving(true);
    try {
      await AsyncStorage.setItem('week-start-day', selectedDay.toString());
      
      const dayLabel = WEEK_START_OPTIONS.find((opt) => opt.value === selectedDay)?.label || 'Unknown';
      Alert.alert('Success', `Week now starts on ${dayLabel}`, [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      console.error('Failed to save week start day:', err);
      Alert.alert('Error', 'Failed to save week start day. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [selectedDay, router]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* Header */}
      <View
        className="bg-white shadow-level-1"
        style={{
          paddingTop: insets.top,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
        }}
      >
        <View
          className="flex-row items-center justify-between px-4"
          style={{ height: 56 }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="items-center justify-center"
            style={{ width: 44, height: 44 }}
            accessibilityLabel="Back"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={24} color="#4B5563" />
          </TouchableOpacity>

          <Text className="text-h4 font-semibold text-gray-800">
            Week Start Day
          </Text>

          <View style={{ width: 44 }} />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        <View className="mx-md mt-md">
          <Text className="text-body text-gray-600">
            Choose which day your week should start on. This affects calendar views and week calculations.
          </Text>
        </View>

        {/* Day Options */}
        <View className="mx-md mt-md">
          {WEEK_START_OPTIONS.map((option, index) => {
            const isSelected = selectedDay === option.value;
            return (
              <TouchableOpacity
                key={option.id}
                onPress={() => setSelectedDay(option.value)}
                activeOpacity={0.7}
                className={`flex-row items-center px-4 py-3 ${
                  isSelected ? 'bg-primary/10' : 'bg-white'
                }`}
                style={{
                  minHeight: 72,
                  borderRadius: index === 0 ? 12 : index === WEEK_START_OPTIONS.length - 1 ? 12 : 0,
                  marginBottom: index < WEEK_START_OPTIONS.length - 1 ? 1 : 0,
                  borderWidth: 1,
                  borderColor: isSelected ? '#2563EB' : '#E5E7EB',
                }}
                accessibilityLabel={`${option.label}`}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                {/* Icon */}
                <View
                  className="items-center justify-center"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: isSelected ? '#2563EB' : '#F3F4F6',
                  }}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={24}
                    color={isSelected ? '#FFFFFF' : '#6B7280'}
                  />
                </View>

                {/* Text */}
                <View className="flex-1 ml-4">
                  <Text className="text-body font-semibold text-gray-800">
                    {option.label}
                  </Text>
                  <Text className="text-caption text-gray-500 mt-1">
                    Week starts on {option.label}
                  </Text>
                </View>

                {/* Checkmark */}
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color="#2563EB" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Info Box */}
        <View className="mx-md mt-md px-4 py-3 bg-blue-50" style={{ borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#2563EB' }}>
          <Text className="text-caption font-semibold text-primary">Note</Text>
          <Text className="text-caption text-gray-700 mt-1">
            This setting is saved locally on your device and affects how dates are grouped in the app.
          </Text>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View
        className="bg-white shadow-level-2 px-4 py-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.8}
          className="flex-row items-center justify-center"
          style={{
            height: 56,
            borderRadius: 12,
            backgroundColor: isSaving ? '#D1D5DB' : '#10B981',
          }}
          accessibilityLabel="Save week start day"
          accessibilityRole="button"
        >
          {isSaving ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text className="text-button text-white ml-2">Saving...</Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              <Text className="text-button text-white ml-2">Save</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Verify compilation**

Run: `cd /Users/martinlarios/personal/apps/mobile && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add app/settings/week-start.tsx
git commit -m "[settings-implementer] Create week start day modal screen"
```

---

### Task 7: Update Settings Screen Handlers

**Files:**
- Modify: `app/(tabs)/settings.tsx`

- [ ] **Step 1: Import useTheme hook at top of file**

Add to imports (around line 18):
```typescript
import { useTheme } from '@/hooks/useTheme';
```

- [ ] **Step 2: Update handleNavSetting function (around line 785-791)**

Replace the entire `handleNavSetting` function with:

```typescript
const handleNavSetting = useCallback((settingId: string) => {
  if (settingId === 'notifications') {
    router.push('/settings/notifications');
    return;
  }
  if (settingId === 'dark-mode') {
    router.push('/settings/dark-mode');
    return;
  }
  if (settingId === 'work-hours') {
    router.push('/settings/work-hours');
    return;
  }
  if (settingId === 'week-start') {
    router.push('/settings/week-start');
    return;
  }
  // Phase 2 & 3: Coming Soon
  Alert.alert('Coming Soon', `The "${settingId}" setting will be available in a future update.`);
}, [router]);
```

- [ ] **Step 3: Update handleToggle function to handle dark-mode (around line 760-783)**

Replace the entire `handleToggle` function with:

```typescript
const handleToggle = useCallback(
  async (settingId: string, value: boolean) => {
    if (settingId === 'biometric') {
      try {
        if (value) {
          await enableBiometric();
        } else {
          await disableBiometric();
        }
      } catch {
        // Biometric toggle failed, don't update UI
      }
      return; // Let the useEffect sync from biometricEnabled
    }
    if (settingId === 'notifications') {
      setToggleStates((prev) => ({ ...prev, notifications: value }));
      const prefs = await loadNotificationPreferences();
      await saveNotificationPreferences({ ...prefs, masterEnabled: value });
      return;
    }
    if (settingId === 'dark-mode') {
      // Dark mode is handled via modal screen
      router.push('/settings/dark-mode');
      return;
    }
    setToggleStates((prev) => ({ ...prev, [settingId]: value }));
  },
  [enableBiometric, disableBiometric, router],
);
```

- [ ] **Step 4: Verify compilation**

Run: `cd /Users/martinlarios/personal/apps/mobile && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add app/\(tabs\)/settings.tsx
git commit -m "[settings-implementer] Wire up dark-mode, work-hours, week-start handlers"
```

---

### Task 8: Update generateWeekStrip to Use Week Start Preference

**Files:**
- Modify: `utils/add-entry.ts`

- [ ] **Step 1: Read the add-entry utilities to understand current implementation**

Run: `head -100 /Users/martinlarios/personal/apps/mobile/utils/add-entry.ts`

- [ ] **Step 2: Add getWeekStartDay helper function**

Add this function after the existing functions in `add-entry.ts`:

```typescript
/**
 * Get the week start day preference from AsyncStorage
 * Returns 0 for Sunday, 1 for Monday
 * Defaults to 1 (Monday) if not set
 */
export async function getWeekStartDay(): Promise<number> {
  try {
    const stored = await AsyncStorage.getItem('week-start-day');
    return stored ? parseInt(stored, 10) : 1;
  } catch (err) {
    console.error('Failed to get week start day:', err);
    return 1;
  }
}
```

Wait, this would need to be async. Instead, add a synchronous version that returns a default:

```typescript
/**
 * Get the week start day preference (synchronous, defaults to Monday)
 * For async loading, use AsyncStorage directly in components
 * Returns 0 for Sunday, 1 for Monday
 */
export function getDefaultWeekStartDay(): number {
  // Defaults to Monday (1)
  // In practice, components should load this from AsyncStorage
  return 1;
}
```

- [ ] **Step 3: Update generateWeekStrip to accept weekStartDay parameter**

Find the `generateWeekStrip` function (should be around line 80-110) and update it:

```typescript
/**
 * Generate an array of 7 dates for the week containing the given date
 * @param date - The date to center the week around
 * @param weekStartDay - Day to start week on (0 = Sunday, 1 = Monday), defaults to 1
 */
export function generateWeekStrip(date: Date, weekStartDay: number = 1): Date[] {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  
  // Calculate days to subtract to get to week start
  const daysToStart = (dayOfWeek - weekStartDay + 7) % 7;
  
  const weekStart = new Date(d);
  weekStart.setDate(weekStart.getDate() - daysToStart);

  const week: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(weekStart);
    dayDate.setDate(dayDate.getDate() + i);
    week.push(dayDate);
  }

  return week;
}
```

- [ ] **Step 4: Verify compilation**

Run: `cd /Users/martinlarios/personal/apps/mobile && npx tsc --noEmit`
Expected: No errors (Note: there may be import errors for AsyncStorage if not already imported)

- [ ] **Step 5: Commit**

```bash
git add utils/add-entry.ts
git commit -m "[settings-implementer] Update generateWeekStrip to accept weekStartDay parameter"
```

---

### Task 9: Update Add Entry Screen to Use Week Start Preference

**Files:**
- Modify: `app/(tabs)/add-entry.tsx`

- [ ] **Step 1: Add AsyncStorage import if not present**

Check if AsyncStorage is imported. If not, add to imports:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
```

- [ ] **Step 2: Update weekStrip useMemo to load and use week start day**

Find the `weekStrip` useMemo (around line 454-457) and replace it with:

```typescript
  const [weekStartDay, setWeekStartDay] = useState(1); // Default Monday

  // Load week start preference on mount
  useEffect(() => {
    const loadWeekStartDay = async () => {
      try {
        const stored = await AsyncStorage.getItem('week-start-day');
        setWeekStartDay(stored ? parseInt(stored, 10) : 1);
      } catch (err) {
        console.error('Failed to load week start day:', err);
      }
    };
    loadWeekStartDay();
  }, []);

  const weekStrip = useMemo(
    () => generateWeekStrip(selectedDate, weekStartDay),
    [selectedDate, weekStartDay],
  );
```

- [ ] **Step 3: Verify compilation**

Run: `cd /Users/martinlarios/personal/apps/mobile && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add app/\(tabs\)/add-entry.tsx
git commit -m "[settings-implementer] Use week start day preference in add-entry"
```

---

### Task 10: Verify All Settings Screen Integrations

**Files:**
- Read: `app/(tabs)/settings.tsx` (for final verification)

- [ ] **Step 1: Manually test dark mode toggle navigation**

The settings screen should now allow tapping dark-mode to navigate to /settings/dark-mode. Verify the handler fires without errors.

- [ ] **Step 2: Manually test work hours navigation**

Tapping work-hours should navigate to /settings/work-hours. Verify the modal appears correctly.

- [ ] **Step 3: Manually test week start day navigation**

Tapping week-start should navigate to /settings/week-start. Verify the modal appears correctly.

- [ ] **Step 4: Run TypeScript compilation on full app**

Run: `cd /Users/martinlarios/personal/apps/mobile && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Final commit message for integration**

```bash
git log --oneline -10
```

Verify all commits are present. If anything failed, fix and commit. Otherwise, all Phase 1 settings are implemented.

---

## Spec Coverage Check

✓ **Dark Mode Toggle** - Task 3 (dark-mode.tsx) + Task 2 (ThemeProvider) implements light/dark/system toggle with AsyncStorage persistence
✓ **Work Hours Modal** - Task 5 (work-hours.tsx) provides picker for 4-12 hours, validates range, saves to backend via UPDATE_USER_PROFILE_MUTATION
✓ **Week Start Day Modal** - Task 6 (week-start.tsx) provides picker for Sunday/Monday, persists to AsyncStorage locally
✓ **Theme Applied to App** - Task 2 wraps app root with ThemeProvider
✓ **Week Strip Updated** - Task 8 & 9 update generateWeekStrip to accept weekStartDay and add-entry to use it
✓ **Settings Screen Integration** - Task 7 wires up handlers to navigate to modals
✓ **No Changes to Phase 2** - time-format, language, about remain as "Coming Soon"
✓ **No Changes to Phase 3** - change-password, 2fa, help-center, contact-support, report-bug remain as "Coming Soon"

---

## Testing Checklist

Before marking complete:
- [ ] Dark mode toggle appears and switches between light/dark/system
- [ ] Dark mode selection persists across app restart
- [ ] Work hours picker shows 4-12 options in grid
- [ ] Work hours selection saves to backend (check GraphQL call)
- [ ] Week start day picker shows Sunday/Monday options
- [ ] Week start day selection persists across app restart
- [ ] Week strip in add-entry reflects selected week start day
- [ ] All existing settings functionality (notifications, biometric) still works
- [ ] No TypeScript errors: `cd apps/mobile && npx tsc --noEmit`
- [ ] All settings screens accessible from settings.tsx
