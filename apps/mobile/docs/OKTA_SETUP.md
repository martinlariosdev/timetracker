# Okta Authentication Setup

This guide explains how to configure Okta authentication for the TimeTrack mobile application.

## Overview

The TimeTrack mobile app uses a two-step authentication flow:

1. **Okta OIDC Authentication**: User authenticates with Okta using OAuth 2.0 + OIDC
2. **Backend Token Exchange**: Okta ID token is exchanged for a backend JWT token

## Prerequisites

- Okta developer account (free at [developer.okta.com](https://developer.okta.com))
- Okta application configured for mobile/native apps
- TimeTrack backend API running

## Okta Application Setup

### 1. Create Okta Application

1. Log into your Okta Admin Console
2. Navigate to **Applications** → **Applications**
3. Click **Create App Integration**
4. Select:
   - **Sign-in method**: OIDC - OpenID Connect
   - **Application type**: Native Application
5. Click **Next**

### 2. Configure Application Settings

**General Settings:**
- **App integration name**: TimeTrack Mobile
- **Logo**: (Optional) Upload your app logo

**Sign-in redirect URIs:**
Add the following URIs based on your environment:

For development with Expo:
```
exp://localhost:8081
exp://localhost:8081/auth/callback
```

For production (custom scheme):
```
timetrack://auth/callback
```

**Sign-out redirect URIs:**
```
exp://localhost:8081/auth/logout
timetrack://auth/logout
```

**Assignments:**
- Select who can access this app (e.g., "Allow everyone in your organization to access")

### 3. Get Application Credentials

After creating the application, note the following:

- **Client ID**: Found on the General tab (e.g., `0oa1b2c3d4e5f6g7h8i9`)
- **Okta Domain**: Your Okta domain (e.g., `dev-12345.okta.com`)

The **Issuer URL** will be:
```
https://<your-okta-domain>/oauth2/default
```

## Mobile App Configuration

### 1. Create Environment File

Copy the example environment file:

```bash
cd apps/mobile
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` and add your Okta credentials:

```env
# Okta Issuer URL
EXPO_PUBLIC_OKTA_ISSUER=https://dev-12345.okta.com/oauth2/default

# Okta Client ID
EXPO_PUBLIC_OKTA_CLIENT_ID=0oa1b2c3d4e5f6g7h8i9

# Redirect URI (match what you configured in Okta)
# Development:
EXPO_PUBLIC_OKTA_REDIRECT_URI=exp://localhost:8081

# Production (when building standalone apps):
# EXPO_PUBLIC_OKTA_REDIRECT_URI=timetrack://auth/callback
```

### 3. Update app.json (Optional)

If not using environment variables, you can configure directly in `app.json`:

```json
{
  "expo": {
    "scheme": "timetrack",
    "extra": {
      "oktaIssuer": "https://dev-12345.okta.com/oauth2/default",
      "oktaClientId": "0oa1b2c3d4e5f6g7h8i9",
      "oktaRedirectUri": "timetrack://auth/callback"
    }
  }
}
```

## Backend Configuration

The backend must be configured to validate Okta tokens. See the backend README for details.

Key backend settings:
- JWT secret for signing backend tokens
- Okta issuer URL for token validation
- Token expiration settings

## Usage in Code

### Basic Authentication

```typescript
import { useAuth } from '@timetrack/mobile/hooks';

function LoginScreen() {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login();
      // User is now authenticated
      // Navigate to home screen
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Button
      onPress={handleLogin}
      disabled={isLoading}
      title={isLoading ? 'Logging in...' : 'Login with Okta'}
    />
  );
}
```

### Check Authentication State

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

### Access JWT Token

```typescript
const { getToken } = useAuth();

// Get current JWT token (auto-refreshes if expired)
const token = await getToken();
```

### Logout

```typescript
const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
  // User is logged out
};
```

## Authentication Flow Details

### Login Flow

1. User taps "Login with Okta" button
2. App opens Okta login page in system browser
3. User enters Okta credentials
4. Okta redirects back to app with authorization code
5. App exchanges code for Okta tokens (access token, ID token, refresh token)
6. App sends Okta ID token to backend `/graphql` endpoint (login mutation)
7. Backend validates Okta token and creates/finds user in database
8. Backend returns JWT token (valid for 7 days)
9. App stores JWT and user profile in AsyncStorage
10. User is authenticated

### Token Refresh

- JWT tokens are automatically refreshed when they expire
- useAuth hook manages token lifecycle
- Refresh happens transparently before API calls

### Logout Flow

1. User taps "Logout"
2. App clears stored tokens from AsyncStorage
3. App calls Okta logout endpoint (best effort)
4. User is logged out

## Troubleshooting

### "Okta is not configured" Error

**Cause**: Environment variables are missing or invalid

**Solution**:
1. Verify `.env` file exists with correct values
2. Restart Expo dev server to load new environment variables
3. Check that `EXPO_PUBLIC_` prefix is used for all variables

### "Invalid redirect URI" Error

**Cause**: Redirect URI doesn't match Okta configuration

**Solution**:
1. Verify redirect URI in `.env` matches Okta app settings
2. For Expo dev: Use `exp://localhost:8081`
3. For production: Use custom scheme (e.g., `timetrack://auth/callback`)
4. Ensure URI is added to both sign-in and sign-out redirect URIs in Okta

### "Network request failed" Error

**Cause**: Backend API is not accessible

**Solution**:
1. Verify backend is running
2. Check `GRAPHQL_ENDPOINT` in `apollo-client.ts`
3. For iOS simulator: Use `http://localhost:3000`
4. For Android emulator: Use `http://10.0.2.2:3000`
5. For physical device: Use computer's IP address

### Token Validation Fails

**Cause**: Backend can't validate Okta token

**Solution**:
1. Verify backend Okta issuer matches mobile app issuer
2. Check backend logs for validation errors
3. Ensure Okta token hasn't expired (tokens are short-lived)

## Security Best Practices

1. **Never commit `.env` file**: Add to `.gitignore`
2. **Use PKCE flow**: Enabled by default in implementation
3. **Store tokens securely**: Using AsyncStorage with encryption (future: secure storage)
4. **Validate tokens on backend**: Never trust client tokens
5. **Use HTTPS in production**: Protect token transmission
6. **Implement token refresh**: Handle expired tokens gracefully
7. **Clear tokens on logout**: Remove all stored credentials

## Testing Without Okta

For development/testing without Okta configuration:

1. The app checks if Okta is configured using `isOktaConfigured()`
2. If not configured, login will show an error message
3. You can mock authentication for testing:

```typescript
// For testing only - bypass Okta
const mockLogin = async () => {
  const mockTokens = {
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
  };
  
  await Storage.setItem('auth_tokens', mockTokens);
};
```

## Additional Resources

- [Okta Developer Documentation](https://developer.okta.com/docs/)
- [Expo Auth Session](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [OAuth 2.0 + OIDC](https://oauth.net/2/)
- [PKCE Flow](https://oauth.net/2/pkce/)
