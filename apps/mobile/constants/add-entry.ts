// Day and month name constants for date formatting
export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const FULL_DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Default time values for time entries
export const DEFAULT_IN_TIME = '08:00';
export const DEFAULT_OUT_TIME = '17:00';

// Mock last-used client for smart defaults
// TODO: Fetch from user's recent entries when backend is connected
export const MOCK_LAST_CLIENT = {
  name: 'Advent',
  lastUsed: 'Last used today',
};
