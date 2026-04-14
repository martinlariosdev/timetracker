/**
 * Mock Authentication Setup Script
 *
 * This script sets up mock authentication in AsyncStorage so you can
 * test the app without needing Okta configured.
 *
 * Usage:
 *   1. Import this in app/_layout.tsx or any screen
 *   2. Call setupMockAuth() when you want to bypass Okta
 *   3. The app will be authenticated with a mock user
 */

import { Storage } from '../lib/storage';

export interface MockUser {
  id: string;
  externalId: string;
  name: string;
  email: string;
  etoBalance: number;
  workingHoursPerPeriod?: number;
  paymentType?: string;
}

export const MOCK_USERS = {
  john: {
    id: '1',
    externalId: 'john.doe',
    name: 'John Doe',
    email: 'john.doe@example.com',
    etoBalance: 80,
    workingHoursPerPeriod: 88,
    paymentType: 'HOURLY',
  },
  jane: {
    id: '2',
    externalId: 'jane.smith',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    etoBalance: 120,
    workingHoursPerPeriod: 88,
    paymentType: 'SALARY',
  },
  admin: {
    id: '999',
    externalId: 'admin',
    name: 'Admin User',
    email: 'admin@softwaremind.com',
    etoBalance: 200,
    workingHoursPerPeriod: 88,
    paymentType: 'SALARY',
  },
};

/**
 * Set up mock authentication
 * Bypasses Okta and uses a fake JWT token for testing
 *
 * @param user - Optional user to authenticate as (defaults to John Doe)
 * @param expiresInDays - How many days until mock token expires (default: 7)
 */
export async function setupMockAuth(
  user: MockUser = MOCK_USERS.john,
  expiresInDays: number = 7
): Promise<void> {
  try {
    const mockTokens = {
      jwtToken: `mock-jwt-token-${user.id}-${Date.now()}`,
      jwtExpiresAt: Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
      oktaIdToken: `mock-okta-id-token-${user.id}`,
      oktaRefreshToken: `mock-okta-refresh-token-${user.id}`,
      user,
    };

    await Storage.setItem('auth_tokens', mockTokens);

    console.log('✅ Mock authentication setup complete');
    console.log(`👤 User: ${user.name} (${user.email})`);
    console.log(`🎫 Token expires: ${new Date(mockTokens.jwtExpiresAt).toLocaleString()}`);
  } catch (error) {
    console.error('❌ Failed to setup mock auth:', error);
    throw error;
  }
}

/**
 * Clear mock authentication
 * Removes stored tokens to simulate logout
 */
export async function clearMockAuth(): Promise<void> {
  try {
    await Storage.removeItem('auth_tokens');
    console.log('✅ Mock authentication cleared');
  } catch (error) {
    console.error('❌ Failed to clear mock auth:', error);
    throw error;
  }
}

/**
 * Check if mock authentication is active
 */
export async function isMockAuthActive(): Promise<boolean> {
  try {
    const tokens = await Storage.getItem<any>('auth_tokens');
    return tokens !== null && tokens.jwtToken?.startsWith('mock-jwt-token');
  } catch (error) {
    return false;
  }
}

/**
 * Get current mock user (if any)
 */
export async function getMockUser(): Promise<MockUser | null> {
  try {
    const tokens = await Storage.getItem<any>('auth_tokens');
    if (tokens && tokens.jwtToken?.startsWith('mock-jwt-token')) {
      return tokens.user;
    }
    return null;
  } catch (error) {
    return null;
  }
}
