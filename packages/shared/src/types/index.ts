// TimeEntry types
export {
  TimeEntry,
  CreateTimeEntryInput,
  UpdateTimeEntryInput,
  TimesheetSummary,
} from './time-entry';

// Consultant types
export {
  Consultant,
  TeamLead,
} from './consultant';

// PayPeriod types
export {
  PayPeriod,
  PayPeriodWithStats,
} from './pay-period';

// Common types

/**
 * Pagination input parameters
 */
export interface PaginationInput {
  /** Page number (1-indexed) */
  page: number;

  /** Number of items per page */
  limit: number;

  /** Field to sort by */
  sortBy?: string;

  /** Sort order */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Generic paginated response wrapper
 */
export interface PaginatedResponse<T> {
  /** Array of data items */
  data: T[];

  /** Total number of items across all pages */
  total: number;

  /** Current page number */
  page: number;

  /** Items per page */
  limit: number;

  /** Total number of pages */
  totalPages: number;
}

/**
 * OAuth tokens from Okta authentication
 */
export interface AuthTokens {
  /** JWT access token */
  accessToken: string;

  /** JWT ID token containing user claims */
  idToken: string;

  /** Refresh token for obtaining new access tokens */
  refreshToken: string;

  /** Timestamp (milliseconds since epoch) when access token expires */
  expiresAt: number;
}

/**
 * User session data stored locally
 */
export interface UserSession {
  /** Consultant ID */
  consultantId: number;

  /** Full name */
  name: string;

  /** Email address */
  email: string;

  /** Authentication tokens */
  tokens: AuthTokens;
}

/**
 * Item in the offline sync queue
 */
export interface SyncQueueItem {
  /** Unique identifier for the queue item */
  id: string;

  /** Type of entity being synced */
  entityType: 'TimeEntry' | 'ETOTransaction' | 'Timesheet';

  /** Operation to perform */
  operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'SUBMIT';

  /** Entity data to sync */
  data: Record<string, unknown>;

  /** Number of retry attempts */
  retryCount: number;

  /** Timestamp when queued */
  createdAt: Date;

  /** Error message from last attempt (if failed) */
  error: string | null;
}

/**
 * Sync conflict that requires resolution
 */
export interface SyncConflict {
  /** Unique identifier for the conflict */
  id: string;

  /** Type of entity in conflict */
  entityType: 'TimeEntry' | 'ETOTransaction' | 'Timesheet';

  /** ID of the conflicting entity */
  entityId: number | string;

  /** Local version of the data */
  localVersion: Record<string, unknown>;

  /** Server version of the data */
  serverVersion: Record<string, unknown>;

  /** Timestamp when conflict was resolved (null if unresolved) */
  resolvedAt: Date | null;

  /** How the conflict was resolved (null if unresolved) */
  resolution: 'LOCAL_WINS' | 'SERVER_WINS' | 'MANUAL' | null;
}
