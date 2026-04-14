/**
 * PayPeriod represents a bi-weekly pay period
 */
export interface PayPeriod {
  /** Unique identifier for the pay period */
  id: number;

  /** Start date of the period in YYYY-MM-DD format */
  startDate: string;

  /** End date of the period in YYYY-MM-DD format */
  endDate: string;

  /** Human-readable display text (e.g., "04/01/2026 - 04/15/2026") */
  displayText: string;

  /** Whether this is the currently active pay period */
  isCurrent: boolean;
}

/**
 * PayPeriodWithStats extends PayPeriod with summary statistics
 */
export interface PayPeriodWithStats extends PayPeriod {
  /** Total hours logged in this period */
  totalHours: number;

  /** Number of time entries in this period */
  totalEntries: number;

  /** Submission status of the timesheet for this period */
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
}
