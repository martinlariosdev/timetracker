import { gql } from '@apollo/client';

/**
 * GraphQL mutations for TimeTrack mobile app
 * These mutations match the backend GraphQL schema
 */

/**
 * Login with Okta token - public, no authentication required
 */
export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      expiresIn
      user {
        id
        externalId
        name
        email
        etoBalance
        workingHoursPerPeriod
        paymentType
      }
    }
  }
`;

/**
 * Refresh JWT token - requires authentication
 */
export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken {
    refreshToken {
      accessToken
      expiresIn
    }
  }
`;

/**
 * Create a new time entry - requires authentication
 */
export const CREATE_TIME_ENTRY_MUTATION = gql`
  mutation CreateTimeEntry($input: CreateTimeEntryInput!) {
    createTimeEntry(input: $input) {
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
 * Update an existing time entry - requires authentication
 */
export const UPDATE_TIME_ENTRY_MUTATION = gql`
  mutation UpdateTimeEntry($id: String!, $input: UpdateTimeEntryInput!) {
    updateTimeEntry(id: $id, input: $input) {
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
 * Delete a time entry - requires authentication
 */
export const DELETE_TIME_ENTRY_MUTATION = gql`
  mutation DeleteTimeEntry($id: String!) {
    deleteTimeEntry(id: $id)
  }
`;

/**
 * Submit timesheet for a pay period - requires authentication
 */
export const SUBMIT_TIMESHEET_MUTATION = gql`
  mutation SubmitTimesheet($payPeriodId: String!) {
    submitTimesheet(payPeriodId: $payPeriodId) {
      id
      consultantId
      payPeriodId
      submittedAt
      status
      totalHours
    }
  }
`;

/**
 * Create a new ETO request - requires authentication
 */
export const CREATE_ETO_REQUEST_MUTATION = gql`
  mutation CreateEtoRequest($input: CreateETORequestInput!) {
    createEtoRequest(input: $input) {
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
 * Update an existing ETO request - requires authentication
 */
export const UPDATE_ETO_REQUEST_MUTATION = gql`
  mutation UpdateEtoRequest($id: String!, $input: UpdateETORequestInput!) {
    updateEtoRequest(id: $id, input: $input) {
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
 * Cancel an ETO request - requires authentication
 */
export const CANCEL_ETO_REQUEST_MUTATION = gql`
  mutation CancelEtoRequest($id: String!) {
    cancelEtoRequest(id: $id) {
      id
      status
    }
  }
`;

/**
 * Sync pending changes to backend - requires authentication
 */
export const SYNC_CHANGES_MUTATION = gql`
  mutation SyncChanges($consultantId: String!) {
    syncChanges(consultantId: $consultantId) {
      success
      syncedTimeEntries
      syncedEtoRequests
      errors
    }
  }
`;

/**
 * Batch sync time entries - requires authentication
 */
export const SYNC_TIME_ENTRIES_MUTATION = gql`
  mutation SyncTimeEntries($entries: [SyncTimeEntryInput!]!, $deviceId: String!) {
    syncTimeEntries(entries: $entries, deviceId: $deviceId) {
      successful
      failed
      conflicts {
        hasConflict
        serverVersion
        clientVersion
        serverUpdatedAt
        clientLastSyncedAt
        conflictDetails
      }
      errors {
        entityId
        entityType
        operation
        error
      }
    }
  }
`;

/**
 * Batch sync ETO transactions - requires authentication
 */
export const SYNC_ETO_TRANSACTIONS_MUTATION = gql`
  mutation SyncETOTransactions($transactions: [SyncETOTransactionInput!]!, $deviceId: String!) {
    syncETOTransactions(transactions: $transactions, deviceId: $deviceId) {
      successful
      failed
      conflicts {
        hasConflict
        serverVersion
        clientVersion
        serverUpdatedAt
        clientLastSyncedAt
        conflictDetails
      }
      errors {
        entityId
        entityType
        operation
        error
      }
    }
  }
`;

/**
 * Batch sync timesheet submissions - requires authentication
 */
export const SYNC_TIMESHEET_SUBMISSIONS_MUTATION = gql`
  mutation SyncTimesheetSubmissions($submissions: [SyncTimesheetSubmissionInput!]!, $deviceId: String!) {
    syncTimesheetSubmissions(submissions: $submissions, deviceId: $deviceId) {
      successful
      failed
      conflicts {
        hasConflict
        serverVersion
        clientVersion
        serverUpdatedAt
        clientLastSyncedAt
        conflictDetails
      }
      errors {
        entityId
        entityType
        operation
        error
      }
    }
  }
`;
