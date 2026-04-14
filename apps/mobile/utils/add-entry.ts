import { Platform } from 'react-native';
import { TimeEntryPairData } from '@/types/add-entry';

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

export function generateWeekStrip(center: Date): Date[] {
  // Show selected date ±3 days (7 days total, 4 visible at a time)
  const dates: Date[] = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(center);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function calculateHoursFromEntries(entries: TimeEntryPairData[]): number {
  let totalMinutes = 0;
  for (const entry of entries) {
    const inMinutes = parseTimeToMinutes(entry.inTime);
    const outMinutes = parseTimeToMinutes(entry.outTime);
    if (outMinutes > inMinutes) {
      totalMinutes += outMinutes - inMinutes;
    }
  }
  return totalMinutes / 60;
}

export function formatHours(hours: number): string {
  return hours.toFixed(1);
}

export function isValidTimeEntry(entry: TimeEntryPairData): boolean {
  const inMin = parseTimeToMinutes(entry.inTime);
  const outMin = parseTimeToMinutes(entry.outTime);
  return outMin > inMin;
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
