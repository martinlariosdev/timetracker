import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { getOktaConfig, validateOktaConfig } from './okta-config';

// Enable WebBrowser to close properly on Android
WebBrowser.maybeCompleteAuthSession();

/**
 * Okta authentication result
 */
export interface OktaAuthResult {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresIn: number;
}

/**
 * Decoded JWT token payload
 * Contains standard JWT claims that may be present in Okta tokens
 */
export interface DecodedJWT {
  sub?: string; // Subject (user ID)
  exp?: number; // Expiration time (seconds since epoch)
  iat?: number; // Issued at time (seconds since epoch)
  iss?: string; // Issuer
  aud?: string | string[]; // Audience
  name?: string; // User's full name
  email?: string; // User's email
  preferred_username?: string; // Preferred username
  [key: string]: unknown; // Additional claims
}

/**
 * Okta user profile from ID token
 */
export interface OktaUserProfile {
  sub: string; // User ID
  name?: string;
  email?: string;
  preferred_username?: string;
  [key: string]: unknown;
}

/**
 * Okta authentication error
 */
export class OktaAuthError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'OktaAuthError';
  }
}

/**
 * OktaService - Handles Okta OIDC authentication flow
 *
 * Uses OAuth 2.0 Authorization Code Flow with PKCE for secure authentication.
 * Implements expo-auth-session for React Native Expo apps.
 */
export class OktaService {
  private static discovery: AuthSession.DiscoveryDocument | null = null;

  /**
   * Get OIDC discovery document from Okta issuer
   * Caches the discovery document for subsequent requests
   */
  private static async getDiscovery(): Promise<AuthSession.DiscoveryDocument> {
    if (this.discovery) {
      return this.discovery;
    }

    const config = getOktaConfig();
    validateOktaConfig(config);

    try {
      this.discovery = await AuthSession.fetchDiscoveryAsync(config.issuer);
      return this.discovery;
    } catch (error) {
      throw new OktaAuthError(
        'Failed to fetch Okta discovery document',
        'DISCOVERY_FAILED',
        error as Error
      );
    }
  }

  /**
   * Login with Okta using Authorization Code Flow with PKCE
   *
   * @returns Okta authentication result with tokens
   * @throws OktaAuthError if authentication fails
   */
  static async login(): Promise<OktaAuthResult> {
    const config = getOktaConfig();
    validateOktaConfig(config);

    try {
      const discovery = await this.getDiscovery();

      // Create authorization request with PKCE
      const redirectUri = AuthSession.makeRedirectUri({
        path: 'auth/callback',
      });

      const request = new AuthSession.AuthRequest({
        clientId: config.clientId,
        scopes: config.scopes,
        redirectUri,
        usePKCE: true, // Enable PKCE for security
        responseType: AuthSession.ResponseType.Code,
      });

      // Perform authentication
      const result = await request.promptAsync(discovery);

      if (result.type !== 'success') {
        throw new OktaAuthError(
          `Authentication failed: ${result.type}`,
          result.type.toUpperCase()
        );
      }

      // Exchange authorization code for tokens
      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          clientId: config.clientId,
          code: result.params.code,
          redirectUri,
          extraParams: {
            code_verifier: request.codeVerifier || '',
          },
        },
        discovery
      );

      if (!tokenResult.accessToken || !tokenResult.idToken) {
        throw new OktaAuthError(
          'Token exchange failed: missing tokens',
          'TOKEN_EXCHANGE_FAILED'
        );
      }

      return {
        accessToken: tokenResult.accessToken,
        idToken: tokenResult.idToken,
        refreshToken: tokenResult.refreshToken,
        expiresIn: tokenResult.expiresIn || 3600,
      };
    } catch (error) {
      if (error instanceof OktaAuthError) {
        throw error;
      }
      throw new OktaAuthError(
        'Okta login failed',
        'LOGIN_FAILED',
        error as Error
      );
    }
  }

  /**
   * Refresh access token using refresh token
   *
   * @param refreshToken - Refresh token from previous authentication
   * @returns New authentication result with refreshed tokens
   * @throws OktaAuthError if refresh fails
   */
  static async refreshAccessToken(refreshToken: string): Promise<OktaAuthResult> {
    if (!refreshToken) {
      throw new OktaAuthError('Refresh token is required', 'MISSING_REFRESH_TOKEN');
    }

    const config = getOktaConfig();
    validateOktaConfig(config);

    try {
      const discovery = await this.getDiscovery();

      const tokenResult = await AuthSession.refreshAsync(
        {
          clientId: config.clientId,
          refreshToken,
        },
        discovery
      );

      if (!tokenResult.accessToken) {
        throw new OktaAuthError(
          'Token refresh failed: missing access token',
          'TOKEN_REFRESH_FAILED'
        );
      }

      return {
        accessToken: tokenResult.accessToken,
        idToken: tokenResult.idToken || '',
        refreshToken: tokenResult.refreshToken || refreshToken,
        expiresIn: tokenResult.expiresIn || 3600,
      };
    } catch (error) {
      if (error instanceof OktaAuthError) {
        throw error;
      }
      throw new OktaAuthError(
        'Failed to refresh access token',
        'REFRESH_FAILED',
        error as Error
      );
    }
  }

  /**
   * Logout from Okta
   * Revokes tokens and clears session
   *
   * @param idToken - ID token to revoke
   */
  static async logout(idToken: string): Promise<void> {
    const config = getOktaConfig();
    validateOktaConfig(config);

    try {
      const discovery = await this.getDiscovery();

      if (discovery.endSessionEndpoint) {
        const redirectUri = AuthSession.makeRedirectUri({
          path: 'auth/logout',
        });

        const logoutUrl = `${discovery.endSessionEndpoint}?id_token_hint=${idToken}&post_logout_redirect_uri=${encodeURIComponent(redirectUri)}`;

        // Open browser for logout
        await WebBrowser.openAuthSessionAsync(
          logoutUrl,
          redirectUri
        );
      }
    } catch (error) {
      // Log error but don't throw - logout should be best effort
      console.error('Okta logout error:', error);
    }
  }

  /**
   * Decode JWT token (basic, without verification)
   * Note: This is for reading claims only. Backend should verify tokens.
   *
   * @param token - JWT token to decode
   * @returns Decoded token payload
   */
  static decodeToken(token: string): DecodedJWT {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      // Decode base64url
      const payload = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      const decoded = atob(payload);

      return JSON.parse(decoded);
    } catch (error) {
      throw new OktaAuthError(
        'Failed to decode token',
        'TOKEN_DECODE_FAILED',
        error as Error
      );
    }
  }

  /**
   * Get user profile from ID token
   *
   * @param idToken - ID token from Okta
   * @returns User profile information
   */
  static getUserProfile(idToken: string): OktaUserProfile {
    try {
      const decoded = this.decodeToken(idToken);

      if (!decoded.sub) {
        throw new OktaAuthError(
          'Invalid ID token: missing sub claim',
          'INVALID_TOKEN'
        );
      }

      return {
        sub: decoded.sub,
        name: decoded.name,
        email: decoded.email,
        preferred_username: decoded.preferred_username,
        ...decoded,
      };
    } catch (error) {
      if (error instanceof OktaAuthError) {
        throw error;
      }
      throw new OktaAuthError(
        'Failed to get user profile',
        'PROFILE_FAILED',
        error as Error
      );
    }
  }

  /**
   * Check if token is expired
   *
   * @param token - JWT token to check
   * @param bufferSeconds - Buffer time in seconds (default 60s)
   * @returns true if token is expired or will expire within buffer time
   */
  static isTokenExpired(token: string, bufferSeconds: number = 60): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded.exp) {
        return true;
      }

      const expirationTime = decoded.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const buffer = bufferSeconds * 1000;

      return now >= expirationTime - buffer;
    } catch {
      return true; // Treat decode errors as expired
    }
  }
}
