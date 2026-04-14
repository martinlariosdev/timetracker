/**
 * TypeScript type definitions for Okta authentication
 */

/**
 * Okta token response from authorization server
 */
export interface OktaTokenResponse {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

/**
 * Okta user info from /userinfo endpoint
 */
export interface OktaUserInfo {
  sub: string;
  name?: string;
  nickname?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  email_verified?: boolean;
  profile?: string;
  picture?: string;
  website?: string;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  updated_at?: number;
  [key: string]: any;
}

/**
 * Okta JWT token payload (decoded)
 */
export interface OktaTokenPayload {
  ver: number;
  jti: string;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  cid: string;
  uid?: string;
  scp?: string[];
  auth_time?: number;
  sub: string;
  [key: string]: any;
}

/**
 * Okta ID token claims
 */
export interface OktaIdTokenClaims extends OktaTokenPayload {
  name?: string;
  email?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  amr?: string[];
  idp?: string;
  nonce?: string;
  at_hash?: string;
}

/**
 * Okta discovery document endpoints
 */
export interface OktaDiscoveryDocument {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  registration_endpoint?: string;
  jwks_uri: string;
  response_types_supported: string[];
  response_modes_supported: string[];
  grant_types_supported: string[];
  subject_types_supported: string[];
  id_token_signing_alg_values_supported: string[];
  scopes_supported: string[];
  token_endpoint_auth_methods_supported: string[];
  claims_supported: string[];
  code_challenge_methods_supported: string[];
  introspection_endpoint?: string;
  introspection_endpoint_auth_methods_supported?: string[];
  revocation_endpoint?: string;
  revocation_endpoint_auth_methods_supported?: string[];
  end_session_endpoint?: string;
  request_parameter_supported?: boolean;
  request_object_signing_alg_values_supported?: string[];
  [key: string]: any;
}

/**
 * Authentication error codes
 */
export enum AuthErrorCode {
  // Okta errors
  DISCOVERY_FAILED = 'DISCOVERY_FAILED',
  LOGIN_FAILED = 'LOGIN_FAILED',
  TOKEN_EXCHANGE_FAILED = 'TOKEN_EXCHANGE_FAILED',
  TOKEN_REFRESH_FAILED = 'TOKEN_REFRESH_FAILED',
  TOKEN_DECODE_FAILED = 'TOKEN_DECODE_FAILED',
  PROFILE_FAILED = 'PROFILE_FAILED',

  // Backend errors
  BACKEND_LOGIN_FAILED = 'BACKEND_LOGIN_FAILED',
  BACKEND_TOKEN_REFRESH_FAILED = 'BACKEND_TOKEN_REFRESH_FAILED',

  // Configuration errors
  MISSING_OKTA_ISSUER = 'MISSING_OKTA_ISSUER',
  MISSING_OKTA_CLIENT_ID = 'MISSING_OKTA_CLIENT_ID',
  MISSING_OKTA_REDIRECT_URI = 'MISSING_OKTA_REDIRECT_URI',
  INVALID_CONFIGURATION = 'INVALID_CONFIGURATION',

  // User errors
  USER_CANCELLED = 'USER_CANCELLED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',

  // Token errors
  MISSING_REFRESH_TOKEN = 'MISSING_REFRESH_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',

  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',

  // Storage errors
  STORAGE_ERROR = 'STORAGE_ERROR',

  // Biometric errors
  BIOMETRIC_NOT_SUPPORTED = 'BIOMETRIC_NOT_SUPPORTED',
  BIOMETRIC_NOT_ENROLLED = 'BIOMETRIC_NOT_ENROLLED',
  BIOMETRIC_AUTH_FAILED = 'BIOMETRIC_AUTH_FAILED',
  BIOMETRIC_CANCELLED = 'BIOMETRIC_CANCELLED',

  // Unknown errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Biometric authentication type
 */
export enum BiometricType {
  FINGERPRINT = 'FINGERPRINT',
  FACIAL_RECOGNITION = 'FACIAL_RECOGNITION',
  IRIS = 'IRIS',
}

/**
 * Biometric availability status
 */
export interface BiometricStatus {
  /** Whether biometric hardware is available on the device */
  isSupported: boolean;
  /** Whether the user has enrolled biometrics on the device */
  isEnrolled: boolean;
  /** Available biometric types on the device */
  availableTypes: BiometricType[];
}

/**
 * Biometric authentication result
 */
export interface BiometricAuthResult {
  success: boolean;
  error?: string;
}
