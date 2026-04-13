# Okta Authentication Module

This module provides Okta OIDC authentication for the TimeTrack React Native mobile application.

## Architecture

The authentication system uses a two-step flow:

```
User → Okta OIDC Login → ID Token → Backend API → JWT Token → Authenticated
```

### Components

1. **okta-config.ts** - Configuration management for Okta credentials
2. **okta-service.ts** - Okta OIDC authentication service (login, logout, token refresh)
3. **biometric-service.ts** - Biometric authentication service (fingerprint/Face ID)
4. **useAuth hook** - React hook for authentication state management
5. **types.ts** - TypeScript type definitions

### Flow Diagram

```
┌─────────────┐
│   Mobile    │
│     App     │
└──────┬──────┘
       │
       │ 1. Login initiated
       │
       ▼
┌─────────────┐
│    Okta     │
│   Server    │
└──────┬──────┘
       │
       │ 2. User authenticates
       │    Returns: ID Token, Access Token, Refresh Token
       │
       ▼
┌─────────────┐
│   Mobile    │
│     App     │
└──────┬──────┘
       │
       │ 3. Send ID Token to backend
       │
       ▼
┌─────────────┐
│   Backend   │
│   GraphQL   │
└──────┬──────┘
       │
       │ 4. Validate Okta token
       │    Create/find user
       │    Returns: JWT Token (7 days)
       │
       ▼
┌─────────────┐
│   Mobile    │
│     App     │
└──────┬──────┘
       │
       │ 5. Store JWT in AsyncStorage
       │    Use for API calls
       │
       ▼
   Authenticated
```

## Files

### okta-config.ts

Manages Okta configuration from environment variables or app.json.

**Key functions:**
- `getOktaConfig()` - Get current Okta configuration
- `validateOktaConfig()` - Validate configuration is complete
- `isOktaConfigured()` - Check if Okta is properly configured

**Configuration sources (in order of precedence):**
1. Environment variables (`EXPO_PUBLIC_OKTA_*`)
2. app.json extra config
3. Default values (for development)

### okta-service.ts

Handles Okta OIDC authentication using expo-auth-session.

**Key features:**
- OAuth 2.0 Authorization Code Flow with PKCE
- Token refresh with refresh tokens
- Token decoding and validation
- Logout with Okta session cleanup
- User profile extraction from ID token

**Main methods:**
- `login()` - Authenticate with Okta
- `refreshAccessToken()` - Refresh access token
- `logout()` - Logout from Okta
- `getUserProfile()` - Get user info from ID token
- `isTokenExpired()` - Check token expiration

### useAuth Hook

React hook for authentication state management. Integrates Okta with backend JWT flow.

**State:**
```typescript
{
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  error: string | null;
}
```

**Methods:**
- `login()` - Full login flow (Okta + backend)
- `logout()` - Complete logout
- `getToken()` - Get current JWT (auto-refreshes)
- `checkAuth()` - Check authentication status
- `refreshAuth()` - Reload auth from storage

**Storage:**
Stores authentication data in AsyncStorage:
```typescript
{
  jwtToken: string;           // Backend JWT token
  jwtExpiresAt: number;       // JWT expiration timestamp
  oktaIdToken: string;        // Okta ID token
  oktaRefreshToken?: string;  // Okta refresh token
  user: UserProfile;          // User profile data
}
```

## Security Features

### PKCE (Proof Key for Code Exchange)

Protects against authorization code interception attacks:
- Code verifier generated client-side
- Code challenge sent to authorization server
- Code verifier verified during token exchange

### Token Storage

Tokens are stored in AsyncStorage with the following considerations:
- JWT tokens expire after 7 days (configurable on backend)
- Tokens are automatically refreshed before expiration
- Logout clears all stored tokens
- Future: Implement secure storage (iOS Keychain, Android Keystore)

### Token Validation

- **Client-side**: Basic token decoding for expiration checks
- **Server-side**: Full signature verification and validation

**Important:** Never trust client-side token validation. Always validate on the backend.

## Configuration

### Environment Variables

Create `.env` file in `apps/mobile`:

```env
EXPO_PUBLIC_OKTA_ISSUER=https://dev-12345.okta.com/oauth2/default
EXPO_PUBLIC_OKTA_CLIENT_ID=0oa1b2c3d4e5f6g7h8i9
EXPO_PUBLIC_OKTA_REDIRECT_URI=exp://localhost:8081
```

### app.json Configuration

Alternative to environment variables:

```json
{
  "expo": {
    "extra": {
      "oktaIssuer": "https://dev-12345.okta.com/oauth2/default",
      "oktaClientId": "0oa1b2c3d4e5f6g7h8i9",
      "oktaRedirectUri": "timetrack://auth/callback"
    }
  }
}
```

## Usage

### Basic Usage

```typescript
import { useAuth } from '@timetrack/mobile/hooks';

function LoginScreen() {
  const { login, isLoading, error } = useAuth();

  return (
    <Button
      title="Login with Okta"
      onPress={login}
      disabled={isLoading}
    />
  );
}
```

### Checking Authentication

```typescript
function App() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? (
    <AuthenticatedApp user={user} />
  ) : (
    <LoginScreen />
  );
}
```

### Getting JWT Token

```typescript
const { getToken } = useAuth();

// Automatically refreshes if expired
const token = await getToken();
```

### Logout

```typescript
const { logout } = useAuth();

await logout();
```

## Error Handling

The module provides structured error handling through `OktaAuthError`:

```typescript
try {
  await login();
} catch (error) {
  if (error instanceof OktaAuthError) {
    console.error(`Okta error [${error.code}]: ${error.message}`);
    
    switch (error.code) {
      case 'DISCOVERY_FAILED':
        // Handle discovery failure
        break;
      case 'TOKEN_EXCHANGE_FAILED':
        // Handle token exchange failure
        break;
      // ... other cases
    }
  }
}
```

### Error Codes

See `types.ts` for complete list of error codes:
- `DISCOVERY_FAILED` - Failed to fetch OIDC discovery document
- `LOGIN_FAILED` - Login flow failed
- `TOKEN_EXCHANGE_FAILED` - Authorization code exchange failed
- `TOKEN_REFRESH_FAILED` - Token refresh failed
- `INVALID_CONFIGURATION` - Okta configuration is invalid
- And more...

## Integration with Apollo Client

The auth system integrates seamlessly with Apollo Client:

```typescript
// apollo-client.ts
const getAuthToken = async (): Promise<string | null> => {
  const stored = await Storage.getItem('auth_tokens');
  return stored?.jwtToken || null;
};

const authLink = setContext(async (_, { headers }) => {
  const token = await getAuthToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});
```

Apollo automatically includes JWT token in all GraphQL requests.

## Testing

### Unit Tests

(Future implementation)

### Integration Tests

(Future implementation)

### Manual Testing

1. **Without Okta Configuration:**
   - App should show error message about missing configuration
   - No crash or undefined behavior

2. **With Okta Configuration:**
   - Login flow should open browser
   - User should be redirected back to app after login
   - JWT token should be stored
   - Subsequent app starts should maintain authentication

3. **Token Refresh:**
   - JWT should auto-refresh before expiration
   - No user interruption during refresh

4. **Logout:**
   - Should clear all tokens
   - Should log out from Okta session
   - Should redirect to login screen

### Mock Authentication

For testing without Okta:

```typescript
import { Storage } from '../storage';

await Storage.setItem('auth_tokens', {
  jwtToken: 'mock-jwt-token',
  jwtExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  oktaIdToken: 'mock-id-token',
  user: {
    id: '1',
    externalId: 'test-user',
    name: 'Test User',
    email: 'test@example.com',
    etoBalance: 80,
  },
});
```

## Performance Considerations

1. **Token Refresh**: Happens automatically 5 minutes before expiration
2. **Discovery Document**: Cached after first fetch
3. **Storage Access**: Async operations, minimal performance impact
4. **Browser Launch**: Native browser on device, optimized by OS

## Biometric Authentication

Biometric authentication provides quick unlock for returning users who have already authenticated with Okta.

### Architecture

```
First-time user → Okta Login → Enable biometric in Settings
Returning user  → Biometric prompt → Check stored tokens → Resume session
Fallback        → If biometric fails → Okta Login
```

### Components

**biometric-service.ts** - Core biometric functionality using expo-local-authentication and expo-secure-store.

Key methods:
- `isBiometricSupported()` - Check device hardware and enrollment
- `authenticateWithBiometric()` - Prompt biometric authentication
- `setBiometricEnabled()` / `isBiometricEnabled()` - Manage user preference
- `getBiometricLabel()` - Get human-readable label (e.g., "Face ID", "Fingerprint")
- `getBiometricIconName()` - Get icon name for UI display

### useAuth Hook Integration

The hook exposes biometric state and actions:
- `biometricEnabled` - Whether user has enabled biometric unlock
- `biometricSupported` - Whether device supports biometrics
- `enableBiometric()` - Enable biometric (prompts verification first)
- `disableBiometric()` - Disable biometric
- `authenticateWithBiometric()` - Authenticate and restore session

### Security

- Only a boolean preference flag is stored in SecureStore (never credentials)
- Biometric only works if valid session tokens exist
- If JWT is expired, token refresh is attempted; on failure, falls back to Okta
- Logout clears biometric preference
- Biometric is always optional, never forced

### Usage

```typescript
// In Settings - enable biometric
const { biometricSupported, biometricEnabled, enableBiometric, disableBiometric } = useAuth();

// In Login - use biometric
const { authenticateWithBiometric, biometricEnabled } = useAuth();
const success = await authenticateWithBiometric();
```

## Future Enhancements

1. **Secure Storage**: Migrate from AsyncStorage to secure storage
   - iOS: Keychain
   - Android: Keystore

2. **Token Encryption**: Encrypt tokens before storing

3. **Offline Support**: Handle authentication in offline mode

4. **Multi-Factor Authentication**: Support MFA flows

5. **Session Management**: Track active sessions

## Troubleshooting

### Common Issues

1. **"Okta is not configured"**
   - Check environment variables are set
   - Restart Expo dev server
   - Verify `.env` file location

2. **"Invalid redirect URI"**
   - Verify redirect URI matches Okta app configuration
   - Check scheme in app.json matches redirect URI

3. **"Network request failed"**
   - Check backend is running
   - Verify GraphQL endpoint URL
   - Check network connectivity

4. **Token expired errors**
   - Clear app storage
   - Re-authenticate
   - Check backend JWT expiration settings

### Debug Tips

1. Enable debug logging:
```typescript
import { OktaService } from './okta-service';

// Log token contents (DO NOT IN PRODUCTION)
const token = await getToken();
const decoded = OktaService.decodeToken(token);
console.log('Token claims:', decoded);
```

2. Check stored auth:
```typescript
import { Storage } from '../storage';

const auth = await Storage.getItem('auth_tokens');
console.log('Stored auth:', {
  hasToken: !!auth?.jwtToken,
  expiresAt: new Date(auth?.jwtExpiresAt || 0),
  user: auth?.user,
});
```

3. Test Okta configuration:
```typescript
import { isOktaConfigured, getOktaConfig } from './okta-config';

console.log('Okta configured:', isOktaConfigured());
console.log('Okta config:', getOktaConfig());
```

## References

- [Okta Developer Docs](https://developer.okta.com/docs/)
- [Expo Auth Session](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [OAuth 2.0 PKCE](https://oauth.net/2/pkce/)
- [OpenID Connect](https://openid.net/connect/)
