import { useQuery } from '@apollo/client/react';
import type {
  DocumentNode,
  OperationVariables,
  TypedDocumentNode,
} from '@apollo/client';

/**
 * Custom hook that wraps Apollo's useQuery with authentication handling
 * Provides consistent error handling and loading states
 *
 * @param query - GraphQL query document
 * @param options - Query options
 * @returns Query result with data, loading, error states
 *
 * @example
 * ```tsx
 * const TIME_ENTRIES_QUERY = gql`
 *   query TimeEntries($filters: TimeEntryFiltersInput) {
 *     timeEntries(filters: $filters) {
 *       id
 *       date
 *       hours
 *       description
 *     }
 *   }
 * `;
 *
 * function TimeEntriesScreen() {
 *   const { data, loading, error, refetch } = useAuthenticatedQuery(
 *     TIME_ENTRIES_QUERY,
 *     {
 *       variables: { filters: { startDate: '2024-01-01' } }
 *     }
 *   );
 *
 *   if (loading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *
 *   return <TimeEntriesList entries={data.timeEntries} />;
 * }
 * ```
 */
export function useAuthenticatedQuery<
  TData = any,
  TVariables extends OperationVariables = OperationVariables,
>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: any,
) {
  const result = useQuery<TData, TVariables>(query, {
    ...options,
    // Override fetch policy if needed
    fetchPolicy: options?.fetchPolicy || 'cache-and-network',
    // Ensure errors are returned along with data
    errorPolicy: 'all',
  });

  // Handle authentication errors
  if (result.error) {
    const authError = (result.error as any).graphQLErrors?.find(
      (err: any) => err.extensions?.code === 'UNAUTHENTICATED',
    );

    if (authError) {
      // TODO: Navigate to login screen
      console.warn('Authentication required - redirecting to login');
    }
  }

  return result;
}
