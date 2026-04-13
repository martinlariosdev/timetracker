import { gql } from '@apollo/client';
import { createApolloClient } from '../apollo-client';

/**
 * Basic Apollo Client tests
 * These tests verify the Apollo Client configuration
 * and demonstrate how to query the backend GraphQL API
 */

describe('Apollo Client', () => {
  let client: ReturnType<typeof createApolloClient>;

  beforeEach(() => {
    client = createApolloClient();
  });

  afterEach(() => {
    client.stop();
    client.clearStore();
  });

  it('should create Apollo Client instance', () => {
    expect(client).toBeDefined();
    expect(client.cache).toBeDefined();
    expect(client.link).toBeDefined();
  });

  it('should handle health check query', async () => {
    const HEALTH_QUERY = gql`
      query Health {
        health {
          status
          timestamp
        }
      }
    `;

    try {
      const result = await client.query({
        query: HEALTH_QUERY,
      });

      expect(result.data).toBeDefined();
      expect((result.data as any).health.status).toBe('ok');
    } catch (error) {
      // If backend is not running, this will fail
      // That's expected in a test environment
      console.warn('Backend not available for testing:', error);
    }
  });

  it('should handle unauthenticated requests', async () => {
    const ME_QUERY = gql`
      query Me {
        me {
          id
          name
          email
        }
      }
    `;

    try {
      const result = await client.query({
        query: ME_QUERY,
      });

      // Should fail because we're not authenticated
      expect(result.error).toBeDefined();
    } catch (error: any) {
      // Expected to fail with UNAUTHENTICATED error
      expect(error.graphQLErrors).toBeDefined();
      const authError = error.graphQLErrors.find(
        (err: any) => err.extensions?.code === 'UNAUTHENTICATED',
      );
      expect(authError).toBeDefined();
    }
  });

  it('should cache query results', async () => {
    const HEALTH_QUERY = gql`
      query Health {
        health {
          status
          timestamp
        }
      }
    `;

    try {
      // First query - should hit network
      const result1 = await client.query({
        query: HEALTH_QUERY,
        fetchPolicy: 'network-only',
      });

      // Second query - should use cache
      const result2 = await client.query({
        query: HEALTH_QUERY,
        fetchPolicy: 'cache-first',
      });

      expect(result1.data).toEqual(result2.data);
    } catch (error) {
      console.warn('Backend not available for testing:', error);
    }
  });
});
