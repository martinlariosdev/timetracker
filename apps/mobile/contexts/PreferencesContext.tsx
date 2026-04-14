import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type WeekStartDay = 'sunday' | 'monday';

interface PreferencesContextType {
  workHours: number;
  weekStartDay: WeekStartDay;
  setWorkHours: (hours: number) => Promise<void>;
  setWeekStartDay: (day: WeekStartDay) => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

const STORAGE_KEYS = {
  WORK_HOURS: 'workHours',
  WEEK_START_DAY: 'weekStartDay',
};

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [workHours, setWorkHoursState] = useState(8);
  const [weekStartDay, setWeekStartDayState] = useState<WeekStartDay>('monday');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from storage on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const [hours, day] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.WORK_HOURS),
        AsyncStorage.getItem(STORAGE_KEYS.WEEK_START_DAY),
      ]);

      if (hours && /^\d+$/.test(hours)) {
        const parsedHours = parseInt(hours, 10);
        if (parsedHours >= 4 && parsedHours <= 12) {
          setWorkHoursState(parsedHours);
        }
      }

      if (day && ['sunday', 'monday'].includes(day)) {
        setWeekStartDayState(day as WeekStartDay);
      }

      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load preferences:', error);
      setIsLoaded(true);
    }
  };

  const setWorkHours = async (hours: number) => {
    if (hours < 4 || hours > 12) {
      throw new Error('Work hours must be between 4 and 12');
    }
    setWorkHoursState(hours);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WORK_HOURS, hours.toString());
    } catch (error) {
      console.error('Failed to save work hours:', error);
    }
  };

  const setWeekStartDay = async (day: WeekStartDay) => {
    if (!['sunday', 'monday'].includes(day)) {
      throw new Error('Week start day must be sunday or monday');
    }
    setWeekStartDayState(day);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WEEK_START_DAY, day);
    } catch (error) {
      console.error('Failed to save week start day:', error);
    }
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <PreferencesContext.Provider
      value={{
        workHours,
        weekStartDay,
        setWorkHours,
        setWeekStartDay,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
