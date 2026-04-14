import { Platform } from 'react-native';
import { TimeEntryPairData, TimeValidationResult } from '@/types/add-entry';

export function formatDateParam(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function generateWeekStrip(center: Date, weekStartDay: number = 1): Date[] {
  // Generate 7-day week strip based on weekStartDay preference
  // weekStartDay: 0 = Sunday, 1 = Monday (default)
  const d = new Date(center);
  const dayOfWeek = d.getDay();

  // Calculate days to subtract to reach the start of the week
  const daysToStart = (dayOfWeek - weekStartDay + 7) % 7;

  const weekStart = new Date(d);
  weekStart.setDate(weekStart.getDate() - daysToStart);

  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(weekStart);
    dayDate.setDate(dayDate.getDate() + i);
    dates.push(dayDate);
  }
  return dates;
}

const TIME_FORMAT_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidTimeFormat(time: string): boolean {
  return TIME_FORMAT_REGEX.test(time);
}

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function calculateEntryMinutes(entry: TimeEntryPairData): number {
  if (!isValidTimeFormat(entry.inTime) || !isValidTimeFormat(entry.outTime)) {
    return 0;
  }
  const inMinutes = parseTimeToMinutes(entry.inTime);
  const outMinutes = parseTimeToMinutes(entry.outTime);
  if (outMinutes === inMinutes) return 0;
  if (outMinutes > inMinutes) return outMinutes - inMinutes;
  // Midnight span: out is next day
  return (24 * 60 - inMinutes) + outMinutes;
}

export function calculateHoursFromEntries(entries: TimeEntryPairData[]): number {
  let totalMinutes = 0;
  for (const entry of entries) {
    totalMinutes += calculateEntryMinutes(entry);
  }
  return totalMinutes / 60;
}

export function formatHours(hours: number): string {
  return hours.toFixed(1);
}

export function validateTimeEntry(entry: TimeEntryPairData): TimeValidationResult {
  if (!isValidTimeFormat(entry.inTime)) {
    return { valid: false, error: `Invalid clock-in time "${entry.inTime}". Use HH:MM format (00:00–23:59).` };
  }
  if (!isValidTimeFormat(entry.outTime)) {
    return { valid: false, error: `Invalid clock-out time "${entry.outTime}". Use HH:MM format (00:00–23:59).` };
  }
  const inMin = parseTimeToMinutes(entry.inTime);
  const outMin = parseTimeToMinutes(entry.outTime);
  if (inMin === outMin) {
    return { valid: false, error: 'Clock-in and clock-out times cannot be the same (0 hours).' };
  }
  if (outMin < inMin) {
    const hours = ((24 * 60 - inMin) + outMin) / 60;
    return { valid: true, error: `This entry spans midnight (${hours.toFixed(1)} hours overnight).` };
  }
  return { valid: true };
}

export function isValidTimeEntry(entry: TimeEntryPairData): boolean {
  return validateTimeEntry(entry).valid;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatTimeDisplay(time: string): string {
  // Convert HH:MM to display format
  const [h, m] = time.split(':').map(Number);
  if (Platform.OS === 'ios') {
    // 12-hour for iOS
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
  }
  return time;
}
