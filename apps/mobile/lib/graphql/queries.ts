import { gql } from '@apollo/client';

/**
 * GraphQL queries for TimeTrack mobile app
 * These queries match the backend GraphQL schema
 */

/**
 * Health check query - public, no authentication required
 */
export const HEALTH_QUERY = gql`
  query Health {
    health {
      status
      timestamp
      version
    }
  }
`;

/**
 * Get current user profile - requires authentication
 */
export const ME_QUERY = gql`
  query Me {
    me {
      id
      externalId
      name
      email
      etoBalance
      workingHoursPerPeriod
      paymentType
    }
  }
`;

/**
 * Get time entries with optional filters - requires authentication
 */
export const TIME_ENTRIES_QUERY = gql`
  query TimeEntries($filters: TimeEntryFiltersInput) {
    timeEntries(filters: $filters) {
      id
      consultantId
      date
      hours
      description
      category
      project
      payPeriodId
      syncStatus
      lastModified
      createdAt
      updatedAt
    }
  }
`;

/**
 * Get a single time entry by ID - requires authentication
 */
export const TIME_ENTRY_QUERY = gql`
  query TimeEntry($id: String!) {
    timeEntry(id: $id) {
      id
      consultantId
      date
      hours
      description
      category
      project
      payPeriodId
      syncStatus
      lastModified
      createdAt
      updatedAt
    }
  }
`;

/**
 * Get ETO requests with optional filters - requires authentication
 */
export const ETO_REQUESTS_QUERY = gql`
  query EtoRequests($filters: ETOFiltersInput) {
    etoRequests(filters: $filters) {
      id
      consultantId
      requestDate
      startDate
      endDate
      hours
      reason
      status
      reviewedBy
      reviewedAt
      comments
      syncStatus
      lastModified
      createdAt
      updatedAt
    }
  }
`;

/**
 * Get time entries for a date range (week view) - requires authentication
 */
export const WEEK_TIME_ENTRIES_QUERY = gql`
  query WeekTimeEntries($startDate: String!, $endDate: String!) {
    timeEntries(filters: { startDate: $startDate, endDate: $endDate }) {
      id
      consultantId
      date
      hours
      description
      category
      project
      syncStatus
      lastModified
    }
  }
`;

/**
 * Get timesheet metrics for current pay period - requires authentication
 */
export const TIMESHEET_METRICS_QUERY = gql`
  query TimesheetMetrics {
    me {
      id
      etoBalance
      workingHoursPerPeriod
    }
  }
`;

/**
 * Get pending sync items - requires authentication
 */
export const PENDING_SYNC_QUERY = gql`
  query PendingSync($consultantId: String!) {
    pendingSync(consultantId: $consultantId) {
      pendingTimeEntries
      pendingEtoRequests
      lastSyncAt
    }
  }
`;
