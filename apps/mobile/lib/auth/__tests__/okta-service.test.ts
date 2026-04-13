/**
 * Tests for OktaService
 *
 * These tests demonstrate the expected behavior of the OktaService.
 * Full implementation would require mocking expo-auth-session.
 */

import { OktaService, OktaAuthError } from '../okta-service';

describe('OktaService', () => {
  describe('decodeToken', () => {
    it('should decode a valid JWT token', () => {
      // Sample JWT token (header.payload.signature)
      // Payload: {"sub":"user123","name":"Test User","email":"test@example.com","exp":1234567890}
      const mockToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwibmFtZSI6IlRlc3QgVXNlciIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImV4cCI6MTIzNDU2Nzg5MH0.xyz';

      const decoded = OktaService.decodeToken(mockToken);

      expect(decoded).toEqual({
        sub: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        exp: 1234567890,
      });
    });

    it('should throw OktaAuthError for invalid token', () => {
      const invalidToken = 'not.a.valid.token';

      expect(() => {
        OktaService.decodeToken(invalidToken);
      }).toThrow(OktaAuthError);
    });

    it('should throw OktaAuthError for malformed token', () => {
      const malformedToken = 'only-one-part';

      expect(() => {
        OktaService.decodeToken(malformedToken);
      }).toThrow(OktaAuthError);
    });
  });

  describe('getUserProfile', () => {
    it('should extract user profile from ID token', () => {
      // Mock ID token with user claims
      const mockIdToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJva3RhLXVzZXItMTIzIiwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJqb2huQGV4YW1wbGUuY29tIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiam9obmRvZSJ9.abc';

      const profile = OktaService.getUserProfile(mockIdToken);

      expect(profile.sub).toBe('okta-user-123');
      expect(profile.name).toBe('John Doe');
      expect(profile.email).toBe('john@example.com');
      expect(profile.preferred_username).toBe('johndoe');
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for valid token', () => {
      // Create token that expires in 1 hour
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({ sub: 'user', exp: futureExp })
      )}.xyz`;

      const isExpired = OktaService.isTokenExpired(mockToken);

      expect(isExpired).toBe(false);
    });

    it('should return true for expired token', () => {
      // Create token that expired 1 hour ago
      const pastExp = Math.floor(Date.now() / 1000) - 3600;
      const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({ sub: 'user', exp: pastExp })
      )}.xyz`;

      const isExpired = OktaService.isTokenExpired(mockToken);

      expect(isExpired).toBe(true);
    });

    it('should return true for token expiring within buffer time', () => {
      // Create token that expires in 30 seconds (within 60 second buffer)
      const soonExp = Math.floor(Date.now() / 1000) + 30;
      const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({ sub: 'user', exp: soonExp })
      )}.xyz`;

      const isExpired = OktaService.isTokenExpired(mockToken, 60);

      expect(isExpired).toBe(true);
    });

    it('should return true for token without exp claim', () => {
      const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({ sub: 'user' })
      )}.xyz`;

      const isExpired = OktaService.isTokenExpired(mockToken);

      expect(isExpired).toBe(true);
    });

    it('should return true for invalid token', () => {
      const invalidToken = 'not.a.valid.token';

      const isExpired = OktaService.isTokenExpired(invalidToken);

      expect(isExpired).toBe(true);
    });
  });
});

describe('OktaAuthError', () => {
  it('should create error with message and code', () => {
    const error = new OktaAuthError('Test error', 'TEST_CODE');

    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.name).toBe('OktaAuthError');
  });

  it('should create error with cause', () => {
    const cause = new Error('Original error');
    const error = new OktaAuthError('Test error', 'TEST_CODE', cause);

    expect(error.cause).toBe(cause);
  });
});
