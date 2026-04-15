import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  from,
} from '@apollo/client';
import { onError, type ErrorLink } from '@apollo/client/link/error';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { setContext } from '@apollo/client/link/context';
import type { GraphQLFormattedError } from 'graphql';
import { Storage } from './storage';
import Constants from 'expo-constants';

// GraphQL endpoint configuration
// In development, use EXPO_PUBLIC_API_URL from .env if available
const GRAPHQL_ENDPOINT = __DEV__
  ? (process.env.EXPO_PUBLIC_API_URL ||
     Constants.expoConfig?.extra?.apiUrl ||
     'http://localhost:3000/graphql') // Fallback for development
  : 'https://api.timetrack.com/graphql'; // Production endpoint (TODO: update)

console.log('[Apollo Client] Using GraphQL endpoint:', GRAPHQL_ENDPOINT);

/**
 * Get JWT token from storage
 * Retrieves the stored authentication token for API requests
 */
const getAuthToken = async (): Promise<string | null> => {
  try {
    const stored = await Storage.getItem<{
      jwtToken: string;
      jwtExpiresAt: number;
    }>('auth_tokens');

    if (!stored || !stored.jwtToken) {
      return null;
    }

    // Check if token is expired
    const now = Date.now();
    if (now >= stored.jwtExpiresAt) {
      return null;
    }

    return stored.jwtToken;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Authentication link - adds JWT token to request headers
 */
const authLink = setContext(async (_, { headers }) => {
  const token = await getAuthToken();

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

/**
 * HTTP link for GraphQL requests
 */
const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT,
});

/**
 * Error handling link
 * Logs GraphQL and network errors
 */
const errorLink = onError((errorResponse: ErrorLink.ErrorHandlerOptions) => {
  const { error } = errorResponse;

  // Check if it's a GraphQL error with an errors array
  if (CombinedGraphQLErrors.is(error)) {
    error.errors.forEach((graphQLError: GraphQLFormattedError) => {
      console.error(
        `[GraphQL error]: Message: ${graphQLError.message}, Location: ${JSON.stringify(graphQLError.locations)}, Path: ${graphQLError.path}`,
      );

      // Handle authentication errors
      if (graphQLError.extensions?.code === 'UNAUTHENTICATED') {
        // TODO: Navigate to login screen or refresh token
        console.warn('Authentication error - user needs to login');
      }
    });
  } else {
    // Network error or other error type
    console.error(`[Network error]: ${error.message}`);
    // TODO: Handle offline mode and queue requests
  }
});

/**
 * Configure Apollo Client cache
 * Optimized for offline support with field policies
 */
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        // Cache time entries by consultant ID and date range
        timeEntries: {
          keyArgs: ['filters', ['consultantId', 'payPeriodId', 'startDate', 'endDate']],
          merge(existing = [], incoming) {
            return incoming;
          },
        },
        // Cache ETO requests by consultant ID
        etoRequests: {
          keyArgs: ['filters', ['consultantId', 'status']],
          merge(existing = [], incoming) {
            return incoming;
          },
        },
      },
    },
    TimeEntryType: {
      keyFields: ['id'],
    },
    ETORequestType: {
      keyFields: ['id'],
    },
    UserType: {
      keyFields: ['id'],
    },
  },
});

/**
 * Create Apollo Client instance
 * Combines auth, error handling, and HTTP links
 */
export const createApolloClient = () => {
  return new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network', // Always check server but use cache
        errorPolicy: 'all', // Return both data and errors
      },
      query: {
        fetchPolicy: 'cache-first', // Use cache if available
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
    // Enable in-memory cache persistence
    // TODO: Add offline persistence with AsyncStorage in Task 28
  });
};

/**
 * Global Apollo Client instance
 */
export const apolloClient = createApolloClient();
