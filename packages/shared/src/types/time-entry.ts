/**
 * TimeEntry represents a single time entry record for a consultant
 */
export interface TimeEntry {
  /** Unique identifier (number from server, string for local offline entries) */
  id: number | string;

  /** ID of the consultant who created this entry */
  consultantId: number;

  /** Date of the time entry in YYYY-MM-DD format */
  date: string;

  /** ID of the pay period this entry belongs to */
  payPeriodId: number;

  /** Optional project or task number */
  projectTaskNumber?: string | null;

  /** Name of the client (e.g., "Aderant", "Earned Time Off (ETO)") */
  clientName: string;

  /** Description of work performed */
  description: string;

  /** First in time in HH:mm format (24-hour) */
  inTime1: string;

  /** First out time in HH:mm format (24-hour) */
  outTime1: string;

  /** Optional second in time in HH:mm format (24-hour) */
  inTime2?: string | null;

  /** Optional second out time in HH:mm format (24-hour) */
  outTime2?: string | null;

  /** Total hours calculated from time blocks */
  totalHours: number;

  /** Timestamp when entry was created */
  createdAt: Date;

  /** Timestamp when entry was last updated (null if never updated) */
  updatedAt: Date | null;

  /** Whether this entry has been synced to the server */
  synced: boolean;

  /** Local identifier for offline-created entries (before server sync) */
  localId?: string;
}

/**
 * Input type for creating a new time entry
 */
export interface CreateTimeEntryInput {
  /** ID of the consultant creating this entry */
  consultantId: number;

  /** Date of the time entry in YYYY-MM-DD format */
  date: string;

  /** ID of the pay period this entry belongs to */
  payPeriodId: number;

  /** Optional project or task number */
  projectTaskNumber?: string | null;

  /** Name of the client */
  clientName: string;

  /** Description of work performed */
  description: string;

  /** First in time in HH:mm format (24-hour) */
  inTime1: string;

  /** First out time in HH:mm format (24-hour) */
  outTime1: string;

  /** Optional second in time in HH:mm format (24-hour) */
  inTime2?: string | null;

  /** Optional second out time in HH:mm format (24-hour) */
  outTime2?: string | null;
}

/**
 * Input type for updating an existing time entry
 */
export interface UpdateTimeEntryInput extends CreateTimeEntryInput {
  /** ID of the entry to update */
  id: number | string;
}

/**
 * Summary statistics for a timesheet period
 */
export interface TimesheetSummary {
  /** ID of the pay period */
  periodId: number;

  /** Total regular work hours (non-ETO) */
  totalRegularHours: number;

  /** Hours of ETO converted to regular time */
  convertedETOHours: number;

  /** Hours of ETO used as time off */
  usedETOHours: number;

  /** Total hours (regular + converted ETO) */
  totalHours: number;

  /** Remaining ETO hours balance */
  etoHoursRemaining: number;

  /** Number of days with no time entry */
  pendingDays: number;

  /** Current status of the timesheet */
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
}
