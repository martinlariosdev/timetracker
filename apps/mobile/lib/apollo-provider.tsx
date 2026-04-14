import React from 'react';
import { ApolloProvider as BaseApolloProvider } from '@apollo/client/react';
import { apolloClient } from './apollo-client';

interface ApolloProviderProps {
  children: React.ReactNode;
}

/**
 * Apollo Provider wrapper component
 * Wraps the app with Apollo Client context
 *
 * Usage:
 * ```tsx
 * import { ApolloProvider } from './lib/apollo-provider';
 *
 * export default function App() {
 *   return (
 *     <ApolloProvider>
 *       <YourApp />
 *     </ApolloProvider>
 *   );
 * }
 * ```
 */
export function ApolloProvider({ children }: ApolloProviderProps) {
  return (
    <BaseApolloProvider client={apolloClient}>
      {children}
    </BaseApolloProvider>
  );
}
