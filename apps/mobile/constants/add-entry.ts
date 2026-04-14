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

// Mock yesterday's entry for "Duplicate Yesterday"
// TODO: Fetch from backend when connected
export const MOCK_YESTERDAY_ENTRY = {
  client: 'Advent',
  description: 'Worked on PR #239, code review',
  projectTask: 'PR #239',
  timeEntries: [
    { id: '1', inTime: '08:00', outTime: '12:00' },
    { id: '2', inTime: '13:00', outTime: '17:00' },
  ],
};
