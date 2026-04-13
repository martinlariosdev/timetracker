import { useMutation, type MutationResult, type MutationTuple } from '@apollo/client/react';
import type {
  DocumentNode,
  OperationVariables,
  TypedDocumentNode,
} from '@apollo/client';
import type { GraphQLError } from 'graphql';
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
  options?: Record<string, unknown>,
): readonly [
  MutationTuple<TData, TVariables>[0],
  MutationTuple<TData, TVariables>[1] & { isOfflineQueued: boolean }
] {
  const [isOfflineQueued, setIsOfflineQueued] = useState(false);

  // Type assertion needed here because Apollo's useMutation has complex conditional types
  // for the options parameter that are difficult to satisfy when wrapping the hook
  const [mutate, result] = useMutation<TData, TVariables>(mutation, {
    ...options,
    // Ensure errors are returned along with data
    errorPolicy: 'all',
    onError: (error: Record<string, unknown>, ...args: unknown[]) => {
      // Check if it's a network error (offline)
      if ('networkError' in error && error.networkError) {
        console.log('Network error - queueing mutation for offline sync');
        setIsOfflineQueued(true);
        // TODO: Queue mutation for offline sync in Task 28
      }

      // Check for authentication errors
      if ('graphQLErrors' in error) {
        const graphQLErrors = error.graphQLErrors as readonly GraphQLError[];
        const authError = graphQLErrors?.find(
          (err: GraphQLError) => err.extensions?.code === 'UNAUTHENTICATED',
        );

        if (authError) {
          console.warn('Authentication required - redirecting to login');
          // TODO: Navigate to login screen
        }
      }

      // Call original onError handler if provided
      if (options?.onError && typeof options.onError === 'function') {
        (options.onError as (...params: unknown[]) => void)(error, ...args);
      }
    },
    onCompleted: (data: TData, ...args: unknown[]) => {
      setIsOfflineQueued(false);

      // Call original onCompleted handler if provided
      if (options?.onCompleted && typeof options.onCompleted === 'function') {
        (options.onCompleted as (...params: unknown[]) => void)(data, ...args);
      }
    },
  } as never);

  return [
    mutate,
    {
      ...result,
      isOfflineQueued,
    },
  ] as const;
}
