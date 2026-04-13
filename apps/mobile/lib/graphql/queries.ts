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
