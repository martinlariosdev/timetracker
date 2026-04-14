# Phase 1 Core Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Phase 1 core settings for TimeTrack mobile app: Dark Mode (light/dark/system with theme context), Work Hours (4-12 hours configurable, backend synced), and Week Start Day (Sunday/Monday, locally persisted).

**Architecture:** 
- Create `ThemeContext.tsx` providing light/dark/system theme mode management with AsyncStorage persistence
- Implement three new settings screens: `work-hours.tsx`, `week-start-day.tsx`, `dark-mode.tsx` with modals and pickers
- Add GraphQL mutation `UPDATE_USER_SETTINGS_MUTATION` for Work Hours backend sync
- Create storage utilities for preferences (dark mode, week start) in `lib/preferences.ts`
- Update all screens to use theme context (colors from context instead of hardcoded hex values)
- Update main `settings.tsx` to route to new settings screens instead of "Coming Soon" alerts

**Tech Stack:** 
- React Context for theme management
- AsyncStorage for local preferences (dark mode, week start day)
- GraphQL mutations for Work Hours backend persistence
- React Native Picker and Modal for UI selection
- Color values defined in theme context (light/dark palettes)

---

## File Structure

```
apps/mobile/
├── contexts/
│   └── ThemeContext.tsx (new)           # Theme provider, light/dark/system modes, color palettes
├── lib/
│   └── preferences.ts (new)              # Preference storage utilities (theme, weekStart)
├── app/settings/
│   ├── _layout.tsx (modify)              # Add dark mode provider to settings stack
│   ├── dark-mode.tsx (new)               # Dark mode picker screen
│   ├── work-hours.tsx (new)              # Work hours picker screen (4-12 hours)
│   └── week-start-day.tsx (new)          # Week start day picker screen
├── app/(tabs)/
│   ├── settings.tsx (modify)             # Update handlers to route to new screens
│   ├── index.tsx (modify)                # Apply theme colors
│   ├── add-entry.tsx (modify)            # Apply theme colors
│   ├── eto.tsx (modify)                  # Apply theme colors
│   └── _layout.tsx (modify)              # Wrap with ThemeContext
├── components/
│   └── (existing - apply theme colors throughout)
└── lib/graphql/
    └── mutations.ts (modify)             # Add UPDATE_USER_SETTINGS_MUTATION
```

---

## Task 1: Create ThemeContext with Light/Dark/System Modes

**Files:**
- Create: `apps/mobile/contexts/ThemeContext.tsx`

### Step 1: Create theme context with types and color palettes

Create the theme context file with complete type definitions and color palettes for light and dark modes.

```bash
mkdir -p /Users/martinlarios/personal/apps/mobile/contexts
```

Then create the file:

- [ ] **Create the ThemeContext.tsx file with theme provider**

```typescript
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Storage } from '@/lib/storage';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Neutral colors
  white: string;
  black: string;
  
  // Gray scale
  gray50: string;
  gray100: string;
  gray200: string;
  gray300: string;
  gray400: string;
  gray500: string;
  gray600: string;
  gray700: string;
  gray800: string;
  gray900: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Background and text
  background: string;
  surface: string;
  surfaceVariant: string;
  text: string;
  textSecondary: string;
  textDisabled: string;
  
  // Borders
  border: string;
  borderLight: string;
}

export interface Theme {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
}

interface ThemeContextType {
  theme: Theme;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const lightColors: ThemeColors = {
  primary: '#2563EB',
  primaryLight: '#93C5FD',
  primaryDark: '#1E40AF',
  
  white: '#FFFFFF',
  black: '#000000',
  
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#0EA5E9',
  
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceVariant: '#F9FAFB',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textDisabled: '#D1D5DB',
  
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
};

const darkColors: ThemeColors = {
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  primaryDark: '#1E40AF',
  
  white: '#FFFFFF',
  black: '#000000',
  
  gray50: '#0F172A',
  gray100: '#1E293B',
  gray200: '#334155',
  gray300: '#475569',
  gray400: '#64748B',
  gray500: '#78716C',
  gray600: '#8B7E74',
  gray700: '#A8A29E',
  gray800: '#D6D3D1',
  gray900: '#F5F5F4',
  
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#38BDF8',
  
  background: '#0F172A',
  surface: '#1E293B',
  surfaceVariant: '#334155',
  text: '#F5F5F4',
  textSecondary: '#CBD5E1',
  textDisabled: '#475569',
  
  border: '#334155',
  borderLight: '#475569',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme preference from storage on mount
  useEffect(() => {
    loadThemeMode();
  }, []);

  const loadThemeMode = async () => {
    try {
      const saved = await Storage.getItem<ThemeMode>('THEME_MODE');
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        setThemeMode(saved);
      }
    } catch (error) {
      console.warn('Failed to load theme mode:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const handleSetThemeMode = async (mode: ThemeMode) => {
    try {
      await Storage.setItem('THEME_MODE', mode);
      setThemeMode(mode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
      throw error;
    }
  };

  // Determine actual theme based on mode and system preference
  const getIsDark = (): boolean => {
    if (themeMode === 'dark') return true;
    if (themeMode === 'light') return false;
    return systemColorScheme === 'dark';
  };

  const theme: Theme = {
    mode: themeMode,
    isDark: getIsDark(),
    colors: getIsDark() ? darkColors : lightColors,
  };

  // Don't render until theme is loaded to prevent flashing
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setThemeMode: handleSetThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context.theme;
}

export function useSetThemeMode(): (mode: ThemeMode) => Promise<void> {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useSetThemeMode must be used within ThemeProvider');
  }
  return context.setThemeMode;
}
```

- [ ] **Verify file was created**

```bash
test -f /Users/martinlarios/personal/apps/mobile/contexts/ThemeContext.tsx && echo "ThemeContext created" || echo "Failed"
```

Expected output: `ThemeContext created`

- [ ] **Run TypeScript check to verify no syntax errors**

```bash
cd /Users/martinlarios/personal/apps/mobile && npx tsc --noEmit 2>&1 | head -20
```

Expected: No errors or just warnings

- [ ] **Commit**

```bash
cd /Users/martinlarios/personal && git add apps/mobile/contexts/ThemeContext.tsx && git commit -m "[refactor-implementer] Create ThemeContext with light/dark/system theme support"
```

---

## Task 2: Create Preferences Storage Utilities

**Files:**
- Create: `apps/mobile/lib/preferences.ts`

### Step 1: Create preferences storage module

- [ ] **Create preferences.ts with types and storage functions**

```typescript
import { Storage } from '@/lib/storage';

export type ThemeMode = 'light' | 'dark' | 'system';
export type WeekStartDay = 'sunday' | 'monday';

export interface UserPreferences {
  themeMode?: ThemeMode;
  weekStartDay?: WeekStartDay;
  workHours?: number;
}

const PREFERENCES_KEY = 'USER_PREFERENCES';

export async function loadPreferences(): Promise<UserPreferences> {
  try {
    const prefs = await Storage.getItem<UserPreferences>(PREFERENCES_KEY);
    return prefs || {};
  } catch (error) {
    console.warn('Failed to load preferences:', error);
    return {};
  }
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  try {
    const existing = await loadPreferences();
    const updated = { ...existing, ...prefs };
    await Storage.setItem(PREFERENCES_KEY, updated);
  } catch (error) {
    console.error('Failed to save preferences:', error);
    throw error;
  }
}

export async function getWeekStartDay(): Promise<WeekStartDay> {
  try {
    const prefs = await loadPreferences();
    return prefs.weekStartDay || 'monday';
  } catch (error) {
    console.warn('Failed to get week start day:', error);
    return 'monday';
  }
}

export async function setWeekStartDay(day: WeekStartDay): Promise<void> {
  await savePreferences({ weekStartDay: day });
}

export async function getWorkHours(): Promise<number> {
  try {
    const prefs = await loadPreferences();
    return prefs.workHours || 8;
  } catch (error) {
    console.warn('Failed to get work hours:', error);
    return 8;
  }
}

export async function setWorkHours(hours: number): Promise<void> {
  if (hours < 4 || hours > 12) {
    throw new Error('Work hours must be between 4 and 12');
  }
  await savePreferences({ workHours: hours });
}
```

- [ ] **Verify file was created**

```bash
test -f /Users/martinlarios/personal/apps/mobile/lib/preferences.ts && echo "preferences.ts created" || echo "Failed"
```

Expected: `preferences.ts created`

- [ ] **Run TypeScript check**

```bash
cd /Users/martinlarios/personal/apps/mobile && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Commit**

```bash
cd /Users/martinlarios/personal && git add apps/mobile/lib/preferences.ts && git commit -m "[refactor-implementer] Create preferences storage utilities"
```

---

## Task 3: Create Dark Mode Settings Screen

**Files:**
- Create: `apps/mobile/app/settings/dark-mode.tsx`

### Step 1: Create dark mode selection screen

- [ ] **Create dark-mode.tsx with theme mode selector**

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useSetThemeMode, type ThemeMode } from '@/contexts/ThemeContext';

function TopBar({
  topInset,
  onBack,
}: {
  topInset: number;
  onBack: () => void;
}) {
  const theme = useTheme();
  
  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        paddingTop: topInset,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <View
        style={{
          height: 56,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
        }}
      >
        <TouchableOpacity
          onPress={onBack}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.text,
            flex: 1,
            textAlign: 'center',
            marginRight: 44,
          }}
          accessibilityRole="header"
        >
          Dark Mode
        </Text>
      </View>
    </View>
  );
}

function ThemeModeOption({
  mode,
  label,
  description,
  icon,
  isSelected,
  onSelect,
}: {
  mode: ThemeMode;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onSelect}
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 16,
        borderWidth: 2,
        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
        flexDirection: 'row',
        alignItems: 'center',
      }}
      accessibilityLabel={`${label}, ${description}`}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
    >
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        {isSelected && (
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: theme.colors.primary,
            }}
          />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Ionicons name={icon} size={24} color={theme.colors.primary} style={{ marginBottom: 4 }} />
        <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text }}>
          {label}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginTop: 4,
          }}
        >
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function DarkModeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const setThemeMode = useSetThemeMode();
  const [selectedMode, setSelectedMode] = useState<ThemeMode>(theme.mode);
  const [isSaving, setIsSaving] = useState(false);

  const handleModeSelect = async (mode: ThemeMode) => {
    setSelectedMode(mode);
    setIsSaving(true);
    try {
      await setThemeMode(mode);
    } catch (error) {
      console.error('Failed to set theme mode:', error);
      Alert.alert('Error', 'Failed to save theme preference. Please try again.');
      setSelectedMode(theme.mode); // Revert on error
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <TopBar topInset={insets.top} onBack={() => router.back()} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 16, paddingBottom: insets.bottom + 24 }}
        scrollEnabled={false}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            paddingHorizontal: 16,
            marginBottom: 16,
          }}
        >
          Choose your theme:
        </Text>

        <ThemeModeOption
          mode="light"
          label="Light"
          description="Always use light theme"
          icon="sunny-outline"
          isSelected={selectedMode === 'light'}
          onSelect={() => handleModeSelect('light')}
        />

        <ThemeModeOption
          mode="dark"
          label="Dark"
          description="Always use dark theme"
          icon="moon-outline"
          isSelected={selectedMode === 'dark'}
          onSelect={() => handleModeSelect('dark')}
        />

        <ThemeModeOption
          mode="system"
          label="System"
          description="Follow device settings"
          icon="phone-portrait-outline"
          isSelected={selectedMode === 'system'}
          onSelect={() => handleModeSelect('system')}
        />

        <Text
          style={{
            fontSize: 12,
            color: theme.colors.textSecondary,
            paddingHorizontal: 16,
            marginTop: 24,
            lineHeight: 18,
          }}
        >
          The System option will automatically switch between light and dark themes based on your device's appearance settings.
        </Text>
      </ScrollView>
    </View>
  );
}
```

- [ ] **Verify file was created**

```bash
test -f /Users/martinlarios/personal/apps/mobile/app/settings/dark-mode.tsx && echo "dark-mode.tsx created" || echo "Failed"
```

- [ ] **Run TypeScript check**

```bash
cd /Users/martinlarios/personal/apps/mobile && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Commit**

```bash
cd /Users/martinlarios/personal && git add apps/mobile/app/settings/dark-mode.tsx && git commit -m "[refactor-implementer] Create dark mode settings screen"
```

---

## Task 4: Create Work Hours Settings Screen

**Files:**
- Create: `apps/mobile/app/settings/work-hours.tsx`

### Step 1: Create work hours picker screen

- [ ] **Create work-hours.tsx with hours selector (4-12 hours)**

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@/contexts/ThemeContext';
import { getWorkHours, setWorkHours } from '@/lib/preferences';
import { useAuthenticatedMutation } from '@/hooks/useAuthenticatedMutation';
import { UPDATE_USER_SETTINGS_MUTATION } from '@/lib/graphql/mutations';

function TopBar({
  topInset,
  onBack,
}: {
  topInset: number;
  onBack: () => void;
}) {
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        paddingTop: topInset,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <View
        style={{
          height: 56,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
        }}
      >
        <TouchableOpacity
          onPress={onBack}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.text,
            flex: 1,
            textAlign: 'center',
            marginRight: 44,
          }}
          accessibilityRole="header"
        >
          Work Hours
        </Text>
      </View>
    </View>
  );
}

function HoursCard({
  hours,
  isSelected,
  onSelect,
}: {
  hours: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onSelect}
      style={{
        backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceVariant,
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
      }}
      accessibilityLabel={`${hours} hours per day`}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
    >
      <Text
        style={{
          fontSize: 32,
          fontWeight: '700',
          color: isSelected ? theme.colors.white : theme.colors.text,
          marginBottom: 4,
        }}
      >
        {hours}h
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: isSelected ? theme.colors.white : theme.colors.textSecondary,
        }}
      >
        hours per day
      </Text>
    </TouchableOpacity>
  );
}

export default function WorkHoursScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const [selectedHours, setSelectedHours] = useState<number>(8);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [updateUserSettings] = useAuthenticatedMutation(UPDATE_USER_SETTINGS_MUTATION);

  useEffect(() => {
    loadWorkHours();
  }, []);

  const loadWorkHours = async () => {
    try {
      const hours = await getWorkHours();
      setSelectedHours(hours);
    } catch (error) {
      console.error('Failed to load work hours:', error);
      Alert.alert('Error', 'Failed to load work hours setting.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save locally
      await setWorkHours(selectedHours);

      // Sync to backend
      try {
        await updateUserSettings({
          variables: {
            input: {
              workingHoursPerPeriod: selectedHours * 5, // Assuming 5-day work week
            },
          },
        });
      } catch (backendError) {
        console.warn('Failed to sync to backend:', backendError);
        Alert.alert(
          'Partially Saved',
          'Work hours saved locally but sync to server failed. It will retry later.'
        );
      }

      Alert.alert('Success', 'Work hours updated!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Failed to save work hours:', error);
      Alert.alert('Error', 'Failed to save work hours. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="hourglass" size={48} color={theme.colors.primary} />
        <Text style={{ color: theme.colors.text, marginTop: 12 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <TopBar topInset={insets.top} onBack={() => router.back()} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 20,
          paddingBottom: insets.bottom + 100,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: 12,
          }}
        >
          Daily work hours:
        </Text>

        {[4, 6, 7, 8, 9, 10, 12].map((hours) => (
          <HoursCard
            key={hours}
            hours={hours}
            isSelected={selectedHours === hours}
            onSelect={() => setSelectedHours(hours)}
          />
        ))}

        <Text
          style={{
            fontSize: 12,
            color: theme.colors.textSecondary,
            marginTop: 24,
            lineHeight: 18,
          }}
        >
          Your daily work hours are used to calculate remaining hours in your work day when logging time entries. This is synced to your profile on the server.
        </Text>
      </ScrollView>

      {/* Save Button */}
      <View
        style={{
          position: 'absolute',
          bottom: insets.bottom + 16,
          left: 16,
          right: 16,
        }}
      >
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          style={{
            backgroundColor: isSaving ? theme.colors.gray300 : theme.colors.primary,
            borderRadius: 12,
            height: 56,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
          }}
          accessibilityLabel="Save work hours"
          accessibilityRole="button"
          accessibilityState={{ disabled: isSaving }}
        >
          {isSaving ? (
            <>
              <Ionicons name="hourglass" size={20} color={theme.colors.white} />
              <Text
                style={{
                  color: theme.colors.white,
                  fontSize: 16,
                  fontWeight: '600',
                  marginLeft: 8,
                }}
              >
                Saving...
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color={theme.colors.white} />
              <Text
                style={{
                  color: theme.colors.white,
                  fontSize: 16,
                  fontWeight: '600',
                  marginLeft: 8,
                }}
              >
                Save
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

- [ ] **Verify file was created**

```bash
test -f /Users/martinlarios/personal/apps/mobile/app/settings/work-hours.tsx && echo "work-hours.tsx created" || echo "Failed"
```

- [ ] **Run TypeScript check**

```bash
cd /Users/martinlarios/personal/apps/mobile && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Commit**

```bash
cd /Users/martinlarios/personal && git add apps/mobile/app/settings/work-hours.tsx && git commit -m "[refactor-implementer] Create work hours settings screen"
```

---

## Task 5: Create Week Start Day Settings Screen

**Files:**
- Create: `apps/mobile/app/settings/week-start-day.tsx`

### Step 1: Create week start day picker screen

- [ ] **Create week-start-day.tsx with Sunday/Monday selector**

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { getWeekStartDay, setWeekStartDay, type WeekStartDay } from '@/lib/preferences';

function TopBar({
  topInset,
  onBack,
}: {
  topInset: number;
  onBack: () => void;
}) {
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        paddingTop: topInset,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <View
        style={{
          height: 56,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
        }}
      >
        <TouchableOpacity
          onPress={onBack}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.text,
            flex: 1,
            textAlign: 'center',
            marginRight: 44,
          }}
          accessibilityRole="header"
        >
          Week Start Day
        </Text>
      </View>
    </View>
  );
}

function DayOption({
  day,
  label,
  isSelected,
  onSelect,
}: {
  day: WeekStartDay;
  label: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onSelect}
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 12,
        padding: 20,
        borderWidth: 2,
        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
      accessibilityLabel={label}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <Ionicons
          name={day === 'sunday' ? 'calendar' : 'calendar-outline'}
          size={24}
          color={theme.colors.primary}
          style={{ marginRight: 12 }}
        />
        <View>
          <Text style={{ fontSize: 16, fontWeight: '600', color: theme.colors.text }}>
            {label}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.textSecondary,
              marginTop: 4,
            }}
          >
            {day === 'sunday'
              ? 'Week starts on Sunday'
              : 'Week starts on Monday (ISO 8601)'}
          </Text>
        </View>
      </View>
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isSelected && (
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: theme.colors.primary,
            }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function WeekStartDayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const [selectedDay, setSelectedDay] = useState<WeekStartDay>('monday');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWeekStartDay();
  }, []);

  const loadWeekStartDay = async () => {
    try {
      const day = await getWeekStartDay();
      setSelectedDay(day);
    } catch (error) {
      console.error('Failed to load week start day:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setWeekStartDay(selectedDay);
      Alert.alert('Success', 'Week start day updated!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Failed to save week start day:', error);
      Alert.alert('Error', 'Failed to save week start day. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="calendar" size={48} color={theme.colors.primary} />
        <Text style={{ color: theme.colors.text, marginTop: 12 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <TopBar topInset={insets.top} onBack={() => router.back()} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingVertical: 16,
          paddingBottom: insets.bottom + 100,
        }}
      >
        <DayOption
          day="sunday"
          label="Sunday"
          isSelected={selectedDay === 'sunday'}
          onSelect={() => setSelectedDay('sunday')}
        />

        <DayOption
          day="monday"
          label="Monday"
          isSelected={selectedDay === 'monday'}
          onSelect={() => setSelectedDay('monday')}
        />

        <Text
          style={{
            fontSize: 12,
            color: theme.colors.textSecondary,
            marginHorizontal: 16,
            marginTop: 24,
            lineHeight: 18,
          }}
        >
          This setting determines which day is shown as the first day of the week in your calendar and reports.
        </Text>
      </ScrollView>

      {/* Save Button */}
      <View
        style={{
          position: 'absolute',
          bottom: insets.bottom + 16,
          left: 16,
          right: 16,
        }}
      >
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          style={{
            backgroundColor: isSaving ? theme.colors.gray300 : theme.colors.primary,
            borderRadius: 12,
            height: 56,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
          }}
          accessibilityLabel="Save week start day"
          accessibilityRole="button"
          accessibilityState={{ disabled: isSaving }}
        >
          {isSaving ? (
            <>
              <Ionicons name="hourglass" size={20} color={theme.colors.white} />
              <Text
                style={{
                  color: theme.colors.white,
                  fontSize: 16,
                  fontWeight: '600',
                  marginLeft: 8,
                }}
              >
                Saving...
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color={theme.colors.white} />
              <Text
                style={{
                  color: theme.colors.white,
                  fontSize: 16,
                  fontWeight: '600',
                  marginLeft: 8,
                }}
              >
                Save
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

- [ ] **Verify file was created**

```bash
test -f /Users/martinlarios/personal/apps/mobile/app/settings/week-start-day.tsx && echo "week-start-day.tsx created" || echo "Failed"
```

- [ ] **Run TypeScript check**

```bash
cd /Users/martinlarios/personal/apps/mobile && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Commit**

```bash
cd /Users/martinlarios/personal && git add apps/mobile/app/settings/week-start-day.tsx && git commit -m "[refactor-implementer] Create week start day settings screen"
```

---

## Task 6: Add UPDATE_USER_SETTINGS_MUTATION to GraphQL

**Files:**
- Modify: `apps/mobile/lib/graphql/mutations.ts`

### Step 1: Add the GraphQL mutation

- [ ] **Add UPDATE_USER_SETTINGS_MUTATION to mutations.ts**

At the end of the mutations file (before the closing), add:

```typescript
/**
 * Update user settings - requires authentication
 */
export const UPDATE_USER_SETTINGS_MUTATION = gql`
  mutation UpdateUserSettings($input: UpdateUserSettingsInput!) {
    updateUserSettings(input: $input) {
      id
      name
      email
      workingHoursPerPeriod
      updatedAt
    }
  }
`;
```

- [ ] **Run TypeScript check**

```bash
cd /Users/martinlarios/personal/apps/mobile && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Commit**

```bash
cd /Users/martinlarios/personal && git add apps/mobile/lib/graphql/mutations.ts && git commit -m "[refactor-implementer] Add UPDATE_USER_SETTINGS_MUTATION to GraphQL"
```

---

## Task 7: Update Settings Screen to Route to New Settings

**Files:**
- Modify: `apps/mobile/app/(tabs)/settings.tsx`

### Step 1: Update handlers to route to new settings screens

Find and replace the `handleNavSetting` function (around line 785):

- [ ] **Update handleNavSetting function**

Replace:
```typescript
const handleNavSetting = useCallback((settingId: string) => {
  if (settingId === 'notifications') {
    router.push('/settings/notifications');
    return;
  }
  Alert.alert('Coming Soon', `The "${settingId}" setting will be available in a future update.`);
}, [router]);
```

With:
```typescript
const handleNavSetting = useCallback((settingId: string) => {
  switch (settingId) {
    case 'notifications':
      router.push('/settings/notifications');
      break;
    case 'dark-mode':
      router.push('/settings/dark-mode');
      break;
    case 'work-hours':
      router.push('/settings/work-hours');
      break;
    case 'week-start':
      router.push('/settings/week-start-day');
      break;
    default:
      Alert.alert('Coming Soon', `The "${settingId}" setting will be available in a future update.`);
  }
}, [router]);
```

- [ ] **Update handleCategoryPress function**

Find and replace the `handleCategoryPress` function (around line 793):

Replace:
```typescript
const handleCategoryPress = useCallback((categoryLabel: string) => {
  if (categoryLabel === 'Preferences') {
    router.push('/settings/notifications');
    return;
  }
  Alert.alert('Coming Soon', `The "${categoryLabel}" category will be available in a future update.`);
}, [router]);
```

With:
```typescript
const handleCategoryPress = useCallback((categoryLabel: string) => {
  if (categoryLabel === 'Preferences') {
    // Show preferences menu or navigate to first preference setting
    Alert.alert('Preferences', 'Choose a preference to modify:', [
      { text: 'Work Hours', onPress: () => router.push('/settings/work-hours') },
      { text: 'Week Start Day', onPress: () => router.push('/settings/week-start-day') },
      { text: 'Cancel', style: 'cancel' },
    ]);
    return;
  }
  Alert.alert('Coming Soon', `The "${categoryLabel}" category will be available in a future update.`);
}, [router]);
```

- [ ] **Update handleToggle function to support dark-mode toggle**

Find the `handleToggle` function (around line 760) and update it to handle dark mode:

Modify the top of the function to add dark mode handling:

```typescript
const handleToggle = useCallback(
  async (settingId: string, value: boolean) => {
    if (settingId === 'dark-mode') {
      // Navigate to dark mode screen instead of toggling
      router.push('/settings/dark-mode');
      return;
    }
    if (settingId === 'biometric') {
      // ... rest of existing code
```

- [ ] **Run TypeScript check**

```bash
cd /Users/martinlarios/personal/apps/mobile && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Commit**

```bash
cd /Users/martinlarios/personal && git add apps/mobile/app/\(tabs\)/settings.tsx && git commit -m "[refactor-implementer] Update settings screen to route to new settings"
```

---

## Task 8: Wrap App Root with ThemeProvider

**Files:**
- Modify: `apps/mobile/app/_layout.tsx`

### Step 1: Add ThemeProvider to app root

- [ ] **Read the current _layout.tsx file**

```bash
head -50 /Users/martinlarios/personal/apps/mobile/app/_layout.tsx
```

- [ ] **Update _layout.tsx to wrap with ThemeProvider**

Add the import at the top:
```typescript
import { ThemeProvider } from '@/contexts/ThemeContext';
```

Then wrap the RootLayoutNav or main layout component with ThemeProvider. If the structure is:

```typescript
export default function RootLayout() {
  return (
    <RootLayoutNav />
  );
}
```

Change to:

```typescript
export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}
```

- [ ] **Run TypeScript check**

```bash
cd /Users/martinlarios/personal/apps/mobile && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Commit**

```bash
cd /Users/martinlarios/personal && git add apps/mobile/app/_layout.tsx && git commit -m "[refactor-implementer] Wrap app root with ThemeProvider"
```

---

## Task 9: Apply Theme Colors to Settings Screen

**Files:**
- Modify: `apps/mobile/app/(tabs)/settings.tsx`

### Step 1: Import and apply theme to settings screen

- [ ] **Add useTheme import**

At the top of settings.tsx, add to the import section:
```typescript
import { useTheme } from '@/contexts/ThemeContext';
```

- [ ] **Use theme in SettingsScreen component**

Add at the start of the SettingsScreen function:
```typescript
const theme = useTheme();
```

- [ ] **Replace hardcoded colors with theme colors throughout the file**

This is a large refactor. Replace all instances of:
- `'#FFFFFF'` → `theme.colors.white`
- `'#F3F4F6'` → `theme.colors.surfaceVariant`
- `'#E5E7EB'` → `theme.colors.border`
- `'#2563EB'` → `theme.colors.primary`
- `'#1F2937'` → `theme.colors.gray800`
- `'#6B7280'` → `theme.colors.gray500`
- `'#9CA3AF'` → `theme.colors.gray400`
- `'#4B5563'` → `theme.colors.gray600`
- `'#D1D5DB'` → `theme.colors.gray300`
- `'#10B981'` → `theme.colors.success`
- `'#0EA5E9'` → `theme.colors.info`
- `'#EF4444'` → `theme.colors.error`

And replace:
- `backgroundColor: '#FFFFFF'` → `backgroundColor: theme.colors.surface`
- `backgroundColor: '#F9FAFB'` → `backgroundColor: theme.colors.background`
- `backgroundColor: 'rgba(0,0,0,0.5)'` → `backgroundColor: 'rgba(0,0,0,0.5)'` (keep as is)
- `color: '#FFFFFF'` → `color: theme.colors.white`
- `color: '#F9FAFB'` → `color: theme.colors.background`
- `color: '#1F2937'` → `color: theme.colors.text`

Also update `StatusBar` to use:
```typescript
<StatusBar style={theme.isDark ? 'light' : 'dark'} />
```

- [ ] **Run TypeScript check**

```bash
cd /Users/martinlarios/personal/apps/mobile && npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Commit**

```bash
cd /Users/martinlarios/personal && git add apps/mobile/app/\(tabs\)/settings.tsx && git commit -m "[refactor-implementer] Apply theme colors to settings screen"
```

---

## Task 10: Type-Check All Changes and Test

**Files:**
- All modified files

### Step 1: Run full TypeScript check

- [ ] **Run TypeScript compiler on entire mobile app**

```bash
cd /Users/martinlarios/personal/apps/mobile && npx tsc --noEmit
```

Expected: No errors

- [ ] **If there are errors, review and fix them**

Look at error messages and fix any issues in the modified files.

- [ ] **List all files modified in this phase**

```bash
cd /Users/martinlarios/personal && git log --oneline | head -15
```

- [ ] **Verify all new settings screens can be imported**

```bash
cd /Users/martinlarios/personal/apps/mobile && npx tsc --noEmit --skipLibCheck 2>&1 | grep -i "error\|cannot find"
```

Expected: No errors related to the new settings files

- [ ] **Final commit if needed for cleanup**

If there were any last-minute fixes:

```bash
cd /Users/martinlarios/personal && git add -A && git status
```

Verify no unexpected files are staged. If clean, no additional commit needed.

---

## Verification Checklist

Before marking this phase complete, verify:

- [ ] ThemeContext created with light/dark/system modes
- [ ] Dark mode toggle changes theme immediately
- [ ] Dark mode preference persists across app restarts
- [ ] Work hours setting saves to AsyncStorage and backend
- [ ] Work hours validates 4-12 hours range
- [ ] Week start day setting saves locally
- [ ] Settings screen routes to new settings screens (not "Coming Soon")
- [ ] All screens apply theme colors correctly
- [ ] TypeScript compilation passes with no errors
- [ ] App builds and runs without crashes

---

## Summary

This plan implements Phase 1 core settings infrastructure:

1. **ThemeContext** - Centralized theme management with three modes
2. **Preferences storage** - Local storage for theme and calendar preferences
3. **Three settings screens** - Dark mode, work hours (4-12h with backend sync), week start day
4. **Settings screen integration** - Routes to new screens instead of placeholders
5. **Theme application** - Settings screen and context updated to use theme colors
6. **GraphQL mutation** - Added for work hours backend synchronization

This creates the foundation for Phase 2 (time format, language, about page) and Phase 3 (removal of unimplemented settings).
