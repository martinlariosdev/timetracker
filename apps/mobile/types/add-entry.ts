export interface TimeEntryPairData {
  id: string;
  inTime: string; // HH:MM format
  outTime: string; // HH:MM format
}

export interface FormErrors {
  client?: string;
  description?: string;
  timeEntries?: string;
  general?: string;
}
