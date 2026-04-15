/**
 * Pay period type definition
 * Matches backend GraphQL PayPeriodType
 */
export interface PayPeriod {
  id: string;
  startDate: string;     // ISO format
  endDate: string;       // ISO format
  displayText: string;   // "April 1-15, 2026"
  isCurrent: boolean;
  deadlineDate: string | null;
}

/**
 * Pay period cache structure
 */
export interface PayPeriodCache {
  periods: PayPeriod[];
  fetchedAt: string;  // ISO timestamp
}

/**
 * Pay period context state
 */
export interface PayPeriodContextState {
  payPeriods: PayPeriod[];
  currentPayPeriod: PayPeriod | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}
