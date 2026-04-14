import { Storage } from './storage';

const STORAGE_KEY = '@timetrack:settings-preferences';

export interface SettingsPreferences {
  /** Default daily work hours (4-12) */
  workHours: number;
  /** First day of the week: 'sunday' or 'monday' */
  weekStartDay: 'sunday' | 'monday';
}

export const DEFAULT_SETTINGS: SettingsPreferences = {
  workHours: 8,
  weekStartDay: 'monday',
};

export async function loadSettingsPreferences(): Promise<SettingsPreferences> {
  try {
    const stored = await Storage.getItem<SettingsPreferences>(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...stored };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettingsPreferences(
  prefs: SettingsPreferences,
): Promise<void> {
  await Storage.setItem(STORAGE_KEY, prefs);
}
