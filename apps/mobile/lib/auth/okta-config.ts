import Constants from 'expo-constants';

/**
 * Okta OIDC Configuration
 *
 * Configuration for Okta authentication using OAuth 2.0 + OIDC flow.
 * Values should be set in app.json under extra or environment variables.
 */
export interface OktaConfig {
  issuer: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

/**
 * Default Okta configuration from app.json or environment
 */
const defaultConfig: OktaConfig = {
  // Okta issuer URL (e.g., https://dev-12345.okta.com/oauth2/default)
  issuer: Constants.expoConfig?.extra?.oktaIssuer ||
    process.env.EXPO_PUBLIC_OKTA_ISSUER ||
    'https://dev-example.okta.com/oauth2/default',

  // Okta client ID (from Okta application)
  clientId: Constants.expoConfig?.extra?.oktaClientId ||
    process.env.EXPO_PUBLIC_OKTA_CLIENT_ID ||
    'your-client-id',

  // Redirect URI for Expo app (must match Okta app configuration)
  // Format: exp://localhost:8081 for dev, or custom scheme for production
  redirectUri: Constants.expoConfig?.extra?.oktaRedirectUri ||
    process.env.EXPO_PUBLIC_OKTA_REDIRECT_URI ||
    'exp://localhost:8081',

  // OAuth scopes to request
  scopes: ['openid', 'profile', 'email', 'offline_access'],
};

/**
 * Get Okta configuration
 * @returns Okta configuration object
 */
export const getOktaConfig = (): OktaConfig => {
  return defaultConfig;
};

/**
 * Validate Okta configuration
 * @throws Error if configuration is invalid or incomplete
 */
export const validateOktaConfig = (config: OktaConfig): void => {
  if (!config.issuer || config.issuer === 'https://dev-example.okta.com/oauth2/default') {
    throw new Error(
      'Okta issuer is not configured. Set EXPO_PUBLIC_OKTA_ISSUER in .env or app.json'
    );
  }

  if (!config.clientId || config.clientId === 'your-client-id') {
    throw new Error(
      'Okta client ID is not configured. Set EXPO_PUBLIC_OKTA_CLIENT_ID in .env or app.json'
    );
  }

  if (!config.redirectUri) {
    throw new Error(
      'Okta redirect URI is not configured. Set EXPO_PUBLIC_OKTA_REDIRECT_URI in .env or app.json'
    );
  }

  // Validate issuer URL format
  try {
    new URL(config.issuer);
  } catch {
    throw new Error(`Invalid Okta issuer URL: ${config.issuer}`);
  }
};

/**
 * Check if Okta is properly configured
 * @returns true if Okta is configured, false otherwise
 */
export const isOktaConfigured = (): boolean => {
  const config = getOktaConfig();
  try {
    validateOktaConfig(config);
    return true;
  } catch {
    return false;
  }
};
