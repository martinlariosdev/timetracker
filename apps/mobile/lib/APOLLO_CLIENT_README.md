# Apollo Client Setup for TimeTrack Mobile

This document describes the Apollo Client configuration for the TimeTrack mobile application.

## Overview

Apollo Client is configured to communicate with the NestJS GraphQL backend, providing:

- JWT authentication with automatic token injection
- Offline-first caching with optimistic updates
- Error handling for network and authentication errors
- Custom hooks for authenticated queries and mutations
- Queuing for offline operations (Task 28)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Native App                         │
├─────────────────────────────────────────────────────────────┤
│  useAuthenticatedQuery / useAuthenticatedMutation           │
├─────────────────────────────────────────────────────────────┤
│                    Apollo Client                             │
│  ┌───────────┐  ┌──────────┐  ┌─────────────┐             │
│  │  Error    │→ │  Auth    │→ │    HTTP     │             │
│  │  Link     │  │  Link    │  │    Link     │             │
│  └───────────┘  └──────────┘  └─────────────┘             │
│                                      ↓                       │
│  ┌──────────────────────────────────────────────┐          │
│  │         InMemory Cache (Offline)              │          │
│  └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              NestJS GraphQL Backend                          │
│              (http://localhost:3000/graphql)                 │
└─────────────────────────────────────────────────────────────┘
```

## Files Structure

```
apps/mobile/
├── lib/
│   ├── apollo-client.ts          # Apollo Client configuration
│   ├── apollo-provider.tsx       # Apollo Provider wrapper
│   ├── graphql/
│   │   ├── queries.ts            # GraphQL queries
│   │   ├── mutations.ts          # GraphQL mutations
│   │   └── index.ts              # Barrel export
│   ├── examples/
│   │   └── ApolloExample.tsx     # Usage examples
│   └── __tests__/
│       └── apollo-client.test.ts # Tests
└── hooks/
    ├── useAuthenticatedQuery.ts  # Custom query hook
    └── useAuthenticatedMutation.ts # Custom mutation hook
```

## Configuration

### Apollo Client (`lib/apollo-client.ts`)

The Apollo Client is configured with three links:

1. **Error Link**: Logs GraphQL and network errors, handles authentication failures
2. **Auth Link**: Injects JWT token into request headers
3. **HTTP Link**: Connects to GraphQL endpoint

**Cache Configuration**:
- `InMemoryCache` with custom type policies
- `cache-and-network` fetch policy for queries (check server, use cache)
- `cache-first` for repeated queries (offline support)

**Endpoint Configuration**:
- Development: `http://localhost:3000/graphql`
- Production: `https://api.timetrack.com/graphql` (TODO: update)

### Authentication

JWT tokens are stored in AsyncStorage (Task 28) and automatically added to requests:

```typescript
headers: {
  authorization: token ? `Bearer ${token}` : '',
}
```

## Usage

### 1. Wrap App with Apollo Provider

Update `app/_layout.tsx`:

```tsx
import { ApolloProvider } from '../lib/apollo-provider';

export default function RootLayout() {
  return (
    <ApolloProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'TimeTrack' }} />
      </Stack>
    </ApolloProvider>
  );
}
```

### 2. Query Data with `useAuthenticatedQuery`

```tsx
import { useAuthenticatedQuery } from '../hooks/useAuthenticatedQuery';
import { TIME_ENTRIES_QUERY } from '../lib/graphql';

function TimeEntriesScreen() {
  const { data, loading, error, refetch } = useAuthenticatedQuery(
    TIME_ENTRIES_QUERY,
    {
      variables: {
        filters: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      },
    },
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <FlatList
      data={data.timeEntries}
      renderItem={({ item }) => <TimeEntryCard entry={item} />}
      onRefresh={refetch}
      refreshing={loading}
    />
  );
}
```

### 3. Mutate Data with `useAuthenticatedMutation`

```tsx
import { useAuthenticatedMutation } from '../hooks/useAuthenticatedMutation';
import { CREATE_TIME_ENTRY_MUTATION } from '../lib/graphql';

function AddTimeEntryScreen() {
  const [createEntry, { loading, error }] = useAuthenticatedMutation(
    CREATE_TIME_ENTRY_MUTATION,
    {
      refetchQueries: ['TimeEntries'],
      onCompleted: (data) => {
        console.log('Created:', data.createTimeEntry);
        navigation.goBack();
      },
    },
  );

  const handleSubmit = (values) => {
    createEntry({
      variables: { input: values },
    });
  };

  return <TimeEntryForm onSubmit={handleSubmit} loading={loading} />;
}
```

### 4. Optimistic Updates

For immediate UI feedback before server response:

```tsx
const [updateEntry, { loading }] = useAuthenticatedMutation(
  UPDATE_TIME_ENTRY_MUTATION,
  {
    optimisticResponse: (variables) => ({
      updateTimeEntry: {
        __typename: 'TimeEntryType',
        id: variables.id,
        ...variables.input,
        updatedAt: new Date().toISOString(),
      },
    }),
    update: (cache, { data }) => {
      // Update cache manually if needed
      cache.modify({
        id: cache.identify(data.updateTimeEntry),
        fields: {
          hours: () => data.updateTimeEntry.hours,
          description: () => data.updateTimeEntry.description,
        },
      });
    },
  },
);
```

## Available GraphQL Operations

### Queries

- `HEALTH_QUERY` - Health check (public)
- `ME_QUERY` - Get current user profile
- `TIME_ENTRIES_QUERY` - Get time entries with filters
- `TIME_ENTRY_QUERY` - Get single time entry by ID
- `ETO_REQUESTS_QUERY` - Get ETO requests with filters
- `PENDING_SYNC_QUERY` - Get pending sync items

### Mutations

- `LOGIN_MUTATION` - Login with Okta token
- `REFRESH_TOKEN_MUTATION` - Refresh JWT token
- `CREATE_TIME_ENTRY_MUTATION` - Create time entry
- `UPDATE_TIME_ENTRY_MUTATION` - Update time entry
- `DELETE_TIME_ENTRY_MUTATION` - Delete time entry
- `SUBMIT_TIMESHEET_MUTATION` - Submit timesheet
- `CREATE_ETO_REQUEST_MUTATION` - Create ETO request
- `UPDATE_ETO_REQUEST_MUTATION` - Update ETO request
- `CANCEL_ETO_REQUEST_MUTATION` - Cancel ETO request
- `SYNC_CHANGES_MUTATION` - Sync pending changes

## Error Handling

The custom hooks automatically handle:

1. **Authentication Errors**: Redirects to login (TODO: implement navigation)
2. **Network Errors**: Queues mutations for offline sync (Task 28)
3. **GraphQL Errors**: Returned in `error` object with `errorPolicy: 'all'`

```tsx
const { data, error } = useAuthenticatedQuery(QUERY);

if (error) {
  // Check for specific error types
  const authError = error.graphQLErrors.find(
    (err) => err.extensions?.code === 'UNAUTHENTICATED'
  );
  
  if (authError) {
    // Handle auth error
  }
}
```

## Offline Support

Current implementation:

- ✅ InMemory cache for offline reads
- ✅ `cache-and-network` fetch policy
- ✅ Error detection for offline state
- ⏳ Offline mutation queue (Task 28)
- ⏳ AsyncStorage persistence (Task 28)

## Testing

Test the Apollo Client setup:

```bash
cd apps/mobile
pnpm test lib/__tests__/apollo-client.test.ts
```

Test with backend running:

```bash
# Terminal 1: Start backend
cd apps/backend
pnpm dev

# Terminal 2: Start mobile app
cd apps/mobile
pnpm start
```

## TODO

- [ ] Implement AsyncStorage for token persistence (Task 28)
- [ ] Add offline mutation queue with AsyncStorage (Task 28)
- [ ] Implement navigation to login on auth errors
- [ ] Update production GraphQL endpoint URL
- [ ] Add cache persistence with apollo-cache-persist
- [ ] Add retry logic for failed mutations
- [ ] Implement token refresh on expiration

## Dependencies

```json
{
  "@apollo/client": "^3.x",
  "graphql": "^16.x"
}
```

## Related Tasks

- Task 26: Setup Apollo Client ✅ (this task)
- Task 28: Setup AsyncStorage for Offline Queue ⏳
- Task 29: Implement Authentication Flow ⏳

## Resources

- [Apollo Client Docs](https://www.apollographql.com/docs/react/)
- [GraphQL Schema](../../backend/src/schema.gql)
- [Backend Resolvers](../../backend/src/*/resolvers/)
