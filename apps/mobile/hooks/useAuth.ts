import { useState, useEffect, useCallback } from 'react';
import { useMutation } from '@apollo/client/react';
import { Storage } from '../lib/storage';
import { OktaService, OktaAuthError } from '../lib/auth/okta-service';
import { isOktaConfigured } from '../lib/auth/okta-config';
import { BiometricService } from '../lib/auth/biometric-service';
import { LOGIN_MUTATION, REFRESH_TOKEN_MUTATION } from '../lib/graphql/mutations';

/**
 * Authentication state
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  error: string | null;
}

/**
 * User profile information
 */
export interface UserProfile {
  id: string;
  externalId: string;
  name: string;
  email: string;
  etoBalance: number;
  workingHoursPerPeriod?: number;
  paymentType?: string;
}

/**
 * Stored authentication tokens
 */
interface StoredAuthTokens {
  jwtToken: string;
  jwtExpiresAt: number;
  oktaIdToken: string;
  oktaRefreshToken?: string;
  user: UserProfile;
}

/**
 * GraphQL mutation response types
 */
interface RefreshTokenResponse {
  refreshToken: {
    accessToken: string;
    expiresIn: string;
  };
}

interface LoginResponse {
  login: {
    accessToken: string;
    expiresIn: string;
    user: UserProfile;
  };
}

// Storage keys
const AUTH_STORAGE_KEY = 'auth_tokens';

/**
 * Parse expiresIn string from backend to milliseconds
 * Supports formats: "7d" (days), "3600" (seconds), "24h" (hours)
 *
 * @param expiresIn - Expiration string from backend
 * @returns Expiration time in milliseconds
 * @throws Error if format is invalid
 */
function parseExpiresIn(expiresIn: string): number {
  const trimmed = expiresIn.trim();

  // Format: "7d" (days)
  if (trimmed.endsWith('d')) {
    const days = parseInt(trimmed.slice(0, -1));
    if (isNaN(days) || days <= 0) {
      throw new Error(`Invalid expiresIn format: ${expiresIn}`);
    }
    return days * 24 * 60 * 60 * 1000;
  }

  // Format: "24h" (hours)
  if (trimmed.endsWith('h')) {
    const hours = parseInt(trimmed.slice(0, -1));
    if (isNaN(hours) || hours <= 0) {
      throw new Error(`Invalid expiresIn format: ${expiresIn}`);
    }
    return hours * 60 * 60 * 1000;
  }

  // Format: "3600" (seconds - numeric only)
  const seconds = parseInt(trimmed);
  if (isNaN(seconds) || seconds <= 0) {
    throw new Error(`Invalid expiresIn format: ${expiresIn}`);
  }
  return seconds * 1000;
}

/**
 * useAuth Hook
 *
 * Provides authentication state and methods for Okta + Backend JWT flow.
 *
 * Flow:
 * 1. User authenticates with Okta (login method)
 * 2. Okta returns ID token and access token
 * 3. ID token is sent to backend login mutation
 * 4. Backend validates Okta token and returns JWT
 * 5. JWT is stored and used for backend API calls
 * 6. JWT is refreshed as needed
 *
 * @returns Authentication state and methods
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
  });
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);

  // GraphQL mutations
  const [loginMutation] = useMutation<LoginResponse>(LOGIN_MUTATION);
  const [refreshTokenMutation] = useMutation<RefreshTokenResponse>(REFRESH_TOKEN_MUTATION);

  /**
   * Refresh JWT token using backend mutation
   */
  const refreshJWT = useCallback(
    async (stored: StoredAuthTokens) => {
      try {
        const { data } = await refreshTokenMutation();

        if (!data?.refreshToken) {
          throw new Error('Failed to refresh token');
        }

        // Parse expiration with validation
        const expiresInMs = parseExpiresIn(data.refreshToken.expiresIn);
        const jwtExpiresAt = Date.now() + expiresInMs;

        // Update stored tokens
        const updatedTokens: StoredAuthTokens = {
          ...stored,
          jwtToken: data.refreshToken.accessToken,
          jwtExpiresAt,
        };

        await Storage.setItem(AUTH_STORAGE_KEY, updatedTokens);

        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: stored.user,
          error: null,
        });
      } catch (error) {
        console.error('JWT refresh failed:', error);
        throw error;
      }
    },
    [refreshTokenMutation]
  );

  /**
   * Logout
   * Clears stored tokens and logs out from Okta
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      // Get stored tokens
      const stored = await Storage.getItem<StoredAuthTokens>(AUTH_STORAGE_KEY);

      // Clear local storage and biometric preference
      await Storage.removeItem(AUTH_STORAGE_KEY);
      await BiometricService.clearBiometricPreference();
      setBiometricEnabled(false);

      // Logout from Okta (best effort)
      if (stored?.oktaIdToken) {
        try {
          await OktaService.logout(stored.oktaIdToken);
        } catch (error) {
          console.error('Okta logout error:', error);
        }
      }

      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear state even if storage fails
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
      });
    }
  }, []);

  /**
   * Load stored authentication from AsyncStorage
   */
  const loadStoredAuth = useCallback(async () => {
    try {
      const stored = await Storage.getItem<StoredAuthTokens>(AUTH_STORAGE_KEY);

      if (!stored) {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: null,
        });
        return;
      }

      // Check if JWT is expired
      const now = Date.now();
      if (now >= stored.jwtExpiresAt) {
        // Try to refresh JWT
        try {
          await refreshJWT(stored);
        } catch (error) {
          // Refresh failed, clear auth
          await logout();
        }
        return;
      }

      // Valid stored auth
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: stored.user,
        error: null,
      });
    } catch (error) {
      console.error('Error loading stored auth:', error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: 'Failed to load authentication',
      });
    }
  }, [refreshJWT, logout]);

  /**
   * Login with Okta
   * Performs full authentication flow: Okta login -> Backend token exchange
   */
  const login = async (): Promise<void> => {
    // Check if Okta is configured
    if (!isOktaConfigured()) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Okta is not configured. Please set up Okta credentials.',
      }));
      return;
    }

    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Step 1: Authenticate with Okta
      const oktaResult = await OktaService.login();

      // Step 2: Exchange Okta token for backend JWT
      const { data } = await loginMutation({
        variables: {
          input: {
            oktaToken: oktaResult.idToken,
          },
        },
      });

      if (!data?.login) {
        throw new Error('Backend login failed: no response');
      }

      // Step 3: Store tokens and user profile
      const { accessToken, expiresIn, user } = data.login;

      // Parse expiration with validation
      const expiresInMs = parseExpiresIn(expiresIn);
      const jwtExpiresAt = Date.now() + expiresInMs;

      const authTokens: StoredAuthTokens = {
        jwtToken: accessToken,
        jwtExpiresAt,
        oktaIdToken: oktaResult.idToken,
        oktaRefreshToken: oktaResult.refreshToken,
        user,
      };

      await Storage.setItem(AUTH_STORAGE_KEY, authTokens);

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user,
        error: null,
      });
    } catch (error) {
      let errorMessage = 'Authentication failed';

      if (error instanceof OktaAuthError) {
        errorMessage = `Okta error: ${error.message}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error('Login error:', error);

      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: errorMessage,
      });

      throw error;
    }
  };

  /**
   * Get current JWT token
   * Automatically refreshes if expired
   *
   * @returns JWT token or null if not authenticated
   */
  const getToken = async (): Promise<string | null> => {
    try {
      const stored = await Storage.getItem<StoredAuthTokens>(AUTH_STORAGE_KEY);

      if (!stored) {
        return null;
      }

      // Check if token needs refresh (5 minute buffer)
      const now = Date.now();
      const bufferMs = 5 * 60 * 1000;

      if (now >= stored.jwtExpiresAt - bufferMs) {
        // Token expired or expiring soon, refresh it
        await refreshJWT(stored);

        // Get updated token
        const updated = await Storage.getItem<StoredAuthTokens>(AUTH_STORAGE_KEY);
        return updated?.jwtToken || null;
      }

      return stored.jwtToken;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  /**
   * Check if user is authenticated
   */
  const checkAuth = async (): Promise<boolean> => {
    const token = await getToken();
    return token !== null;
  };

  /**
   * Load biometric availability and preference state
   */
  const loadBiometricState = useCallback(async () => {
    try {
      const supported = await BiometricService.isBiometricSupported();
      setBiometricSupported(supported);

      if (supported) {
        const enabled = await BiometricService.isBiometricEnabled();
        setBiometricEnabled(enabled);
      } else {
        setBiometricEnabled(false);
      }
    } catch (error) {
      console.error('Error loading biometric state:', error);
      setBiometricSupported(false);
      setBiometricEnabled(false);
    }
  }, []);

  /**
   * Enable biometric authentication
   * Requires an existing authenticated session
   */
  const enableBiometric = useCallback(async (): Promise<boolean> => {
    const supported = await BiometricService.isBiometricSupported();
    if (!supported) {
      return false;
    }

    // Verify user can authenticate with biometrics before enabling
    const result = await BiometricService.authenticateWithBiometric(
      'Verify to enable biometric unlock',
    );
    if (!result.success) {
      return false;
    }

    await BiometricService.setBiometricEnabled(true);
    setBiometricEnabled(true);
    return true;
  }, []);

  /**
   * Disable biometric authentication
   */
  const disableBiometric = useCallback(async (): Promise<void> => {
    await BiometricService.setBiometricEnabled(false);
    setBiometricEnabled(false);
  }, []);

  /**
   * Authenticate using biometrics
   * Prompts biometric, then restores session from stored tokens if valid.
   * Falls back to requiring Okta if tokens are expired.
   */
  const authenticateWithBiometric = useCallback(async (): Promise<boolean> => {
    const enabled = await BiometricService.isBiometricEnabled();
    if (!enabled) {
      return false;
    }

    // Prompt biometric
    const result = await BiometricService.authenticateWithBiometric();
    if (!result.success) {
      return false;
    }

    // Check stored tokens
    const stored = await Storage.getItem<StoredAuthTokens>(AUTH_STORAGE_KEY);
    if (!stored) {
      // No stored session - need full Okta login
      return false;
    }

    // Check if JWT is still valid
    const now = Date.now();
    if (now >= stored.jwtExpiresAt) {
      // Token expired - try refresh
      try {
        await refreshJWT(stored);
        return true;
      } catch {
        // Refresh failed - need full Okta login
        return false;
      }
    }

    // Valid token - restore session
    setAuthState({
      isAuthenticated: true,
      isLoading: false,
      user: stored.user,
      error: null,
    });
    return true;
  }, [refreshJWT]);

  // Load stored authentication and biometric state on mount
  useEffect(() => {
    loadStoredAuth();
    loadBiometricState();
  }, [loadStoredAuth, loadBiometricState]);

  return {
    ...authState,
    biometricEnabled,
    biometricSupported,
    login,
    logout,
    getToken,
    checkAuth,
    refreshAuth: loadStoredAuth,
    enableBiometric,
    disableBiometric,
    authenticateWithBiometric,
  };
};
