import { useMutation } from '@apollo/client/react';
import type {
  DocumentNode,
  OperationVariables,
  TypedDocumentNode,
} from '@apollo/client';
import { useState } from 'react';

/**
 * Custom hook that wraps Apollo's useMutation with authentication handling
 * Provides consistent error handling and loading states
 * Includes offline queue support (to be implemented in Task 28)
 *
 * @param mutation - GraphQL mutation document
 * @param options - Mutation options
 * @returns Mutation function and result with loading, error states
 *
 * @example
 * ```tsx
 * const CREATE_TIME_ENTRY = gql`
 *   mutation CreateTimeEntry($input: CreateTimeEntryInput!) {
 *     createTimeEntry(input: $input) {
 *       id
 *       date
 *       hours
 *       description
 *     }
 *   }
 * `;
 *
 * function AddTimeEntryForm() {
 *   const [createEntry, { loading, error }] = useAuthenticatedMutation(
 *     CREATE_TIME_ENTRY,
 *     {
 *       refetchQueries: ['TimeEntries'],
 *     }
 *   );
 *
 *   const handleSubmit = async (values) => {
 *     try {
 *       const { data } = await createEntry({ variables: { input: values } });
 *       console.log('Created:', data.createTimeEntry);
 *     } catch (err) {
 *       console.error('Failed to create entry:', err);
 *     }
 *   };
 *
 *   return (
 *     <Form onSubmit={handleSubmit} loading={loading} error={error} />
 *   );
 * }
 * ```
 */
export function useAuthenticatedMutation<
  TData = any,
  TVariables extends OperationVariables = OperationVariables,
>(
  mutation: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: any,
) {
  const [isOfflineQueued, setIsOfflineQueued] = useState(false);

  const [mutate, result] = useMutation<TData, TVariables>(mutation, {
    ...options,
    // Ensure errors are returned along with data
    errorPolicy: 'all',
    onError: (error: any, ...args: any[]) => {
      // Check if it's a network error (offline)
      if (error.networkError) {
        console.log('Network error - queueing mutation for offline sync');
        setIsOfflineQueued(true);
        // TODO: Queue mutation for offline sync in Task 28
      }

      // Check for authentication errors
      const authError = error.graphQLErrors?.find(
        (err: any) => err.extensions?.code === 'UNAUTHENTICATED',
      );

      if (authError) {
        console.warn('Authentication required - redirecting to login');
        // TODO: Navigate to login screen
      }

      // Call original onError handler if provided
      if (options?.onError) {
        options.onError(error, ...args);
      }
    },
    onCompleted: (data: TData, ...args: any[]) => {
      setIsOfflineQueued(false);

      // Call original onCompleted handler if provided
      if (options?.onCompleted) {
        options.onCompleted(data, ...args);
      }
    },
  });

  return [
    mutate,
    {
      ...result,
      isOfflineQueued,
    },
  ] as const;
}
