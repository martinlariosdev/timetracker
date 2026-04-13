# Quick Start - Okta Authentication

Quick reference for using the Okta authentication integration.

## Setup (One-Time)

1. **Configure Environment Variables**
   ```bash
   cd apps/mobile
   cp .env.example .env
   # Edit .env with your Okta credentials
   ```

2. **Restart Expo**
   ```bash
   pnpm dev
   ```

## Basic Usage

### Login

```typescript
import { useAuth } from '@timetrack/mobile/hooks';

function LoginScreen() {
  const { login, isLoading } = useAuth();
  
  return (
    <Button 
      title="Login with Okta" 
      onPress={login}
      disabled={isLoading}
    />
  );
}
```

### Check Authentication

```typescript
function App() {
  const { isAuthenticated, user } = useAuth();
  
  return isAuthenticated ? (
    <Text>Welcome, {user?.name}!</Text>
  ) : (
    <LoginScreen />
  );
}
```

### Logout

```typescript
function ProfileScreen() {
  const { logout } = useAuth();
  
  return <Button title="Logout" onPress={logout} />;
}
```

### Make API Calls

Apollo Client automatically includes JWT token:

```typescript
import { useQuery } from '@apollo/client/react';
import { ME_QUERY } from '../lib/graphql/queries';

function Profile() {
  const { data } = useQuery(ME_QUERY);
  return <Text>{data?.me?.name}</Text>;
}
```

## Configuration

Required environment variables:

```env
EXPO_PUBLIC_OKTA_ISSUER=https://dev-12345.okta.com/oauth2/default
EXPO_PUBLIC_OKTA_CLIENT_ID=0oa1b2c3d4e5f6g7h8i9
EXPO_PUBLIC_OKTA_REDIRECT_URI=exp://localhost:8081
```

## Features

- ✅ OAuth 2.0 + OIDC with PKCE
- ✅ Automatic JWT refresh
- ✅ Persistent authentication
- ✅ Error handling
- ✅ TypeScript support

## Documentation

- **Setup Guide**: `docs/OKTA_SETUP.md`
- **Code Examples**: `docs/AUTH_USAGE_EXAMPLES.md`
- **Technical Docs**: `lib/auth/README.md`
- **Implementation Summary**: `OKTA_INTEGRATION_SUMMARY.md`

## Key Files

```
lib/auth/
├── okta-config.ts      # Configuration
├── okta-service.ts     # Okta authentication
├── types.ts            # TypeScript types
└── README.md           # Documentation

hooks/
└── useAuth.ts          # Authentication hook
```

## Common Issues

**"Okta is not configured"**
- Check `.env` file exists
- Verify environment variables
- Restart Expo dev server

**"Invalid redirect URI"**
- Match Okta app settings
- Use `exp://localhost:8081` for dev

**Network errors**
- Check backend is running
- Verify GraphQL endpoint

## Testing Without Okta

```typescript
import { Storage } from './lib/storage';

// Mock authentication
await Storage.setItem('auth_tokens', {
  jwtToken: 'mock-token',
  jwtExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  oktaIdToken: 'mock-id',
  user: {
    id: '1',
    externalId: 'test',
    name: 'Test User',
    email: 'test@example.com',
    etoBalance: 80,
  },
});
```

## Next Steps

- Task 30: Build Login Screen UI
- Task 31: JWT Storage Enhancement (already implemented)
- Task 32: Add Biometric Authentication
