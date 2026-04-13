import { Storage } from './storage';

const STORAGE_KEY = '@timetrack:notification-preferences';

export interface NotificationPreferences {
  masterEnabled: boolean;
  timesheetReminders: {
    twoDaysBefore: boolean;
    onDeadlineDay: boolean;
  };
  etoReminders: {
    lowBalanceAlert: boolean;
    expiringWarning: boolean;
    monthlySummary: boolean;
  };
  approvalNotifications: {
    timesheetApproved: boolean;
    timesheetRejected: boolean;
    etoRequestApproved: boolean;
    etoRequestRejected: boolean;
  };
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  masterEnabled: true,
  timesheetReminders: {
    twoDaysBefore: true,
    onDeadlineDay: true,
  },
  etoReminders: {
    lowBalanceAlert: true,
    expiringWarning: true,
    monthlySummary: true,
  },
  approvalNotifications: {
    timesheetApproved: true,
    timesheetRejected: true,
    etoRequestApproved: true,
    etoRequestRejected: true,
  },
};

export async function loadNotificationPreferences(): Promise<NotificationPreferences> {
  const stored = await Storage.getItem<NotificationPreferences>(STORAGE_KEY);
  if (!stored) {
    return DEFAULT_PREFERENCES;
  }
  return stored;
}

export async function saveNotificationPreferences(
  prefs: NotificationPreferences,
): Promise<void> {
  await Storage.setItem(STORAGE_KEY, prefs);
}
