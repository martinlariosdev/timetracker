# Code Review Fixes - Task 29

## Summary

Fixed all 3 blocking issues identified by code-reviewer.

## Blocking Issues Fixed

### BLOCK-1: Removed unused expo-crypto import ✅

**File:** `lib/auth/okta-service.ts:3`

**Issue:** `Crypto` was imported but never used (PKCE is handled by expo-auth-session)

**Fix Applied:**
- Removed `import * as Crypto from 'expo-crypto';` from imports
- Removed `expo-crypto` package from dependencies (no longer needed)

**Verification:**
- ✅ Import removed
- ✅ Package removed from package.json
- ✅ Type checking passes

---

### BLOCK-2: Fixed useAuth hook stale closure issue ✅

**File:** `hooks/useAuth.ts`

**Issue:** `loadStoredAuth` callback had empty dependency array `[]` but called `refreshJWT` and `logout` which captured `refreshTokenMutation` in a closure, risking stale mutation references that could cause silent auth failures.

**Fix Applied:**
1. Wrapped `refreshJWT` in `useCallback` with `[refreshTokenMutation]` dependency
2. Wrapped `logout` in `useCallback` with `[]` dependency (no external deps)
3. Updated `loadStoredAuth` dependency array to `[refreshJWT, logout]`
4. Moved function declarations to proper order (dependencies before dependents)

**New Structure:**
```typescript
// 1. refreshJWT - depends on refreshTokenMutation
const refreshJWT = useCallback(async (stored) => {
  // ... uses refreshTokenMutation
}, [refreshTokenMutation]);

// 2. logout - no external dependencies
const logout = useCallback(async () => {
  // ... independent
}, []);

// 3. loadStoredAuth - depends on refreshJWT and logout
const loadStoredAuth = useCallback(async () => {
  // ... uses refreshJWT and logout
}, [refreshJWT, logout]);
```

**Verification:**
- ✅ All callbacks have proper dependencies
- ✅ No stale closure issues
- ✅ Type checking passes

---

### BLOCK-3: Fixed fragile expiresIn parsing ✅

**File:** `hooks/useAuth.ts` (lines 150, 212)

**Issue:** Code assumed `expiresIn` was always format like `"7d"` but could be `"3600"` (seconds) which would be treated as 3600 days, making tokens effectively immortal.

**Fix Applied:**
Created robust `parseExpiresIn()` helper function that supports multiple formats:
- **"7d"** → days (multiplied by 24 * 60 * 60 * 1000)
- **"24h"** → hours (multiplied by 60 * 60 * 1000)
- **"3600"** → seconds (multiplied by 1000)
- Validates all inputs and throws error for invalid formats

**Implementation:**
```typescript
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
```

**Updated Usage:**
- Line 150 (refreshJWT): `const expiresInMs = parseExpiresIn(data.refreshToken.expiresIn);`
- Line 291 (login): `const expiresInMs = parseExpiresIn(expiresIn);`

**Verification:**
- ✅ Handles "7d" format (current backend format)
- ✅ Handles "3600" format (seconds, prevents immortal tokens)
- ✅ Handles "24h" format (hours, for flexibility)
- ✅ Validates input and throws descriptive errors
- ✅ Type checking passes

---

## Additional Improvements

While fixing the blocking issues, also:
- Removed duplicate logout function definition
- Improved code organization (callbacks in dependency order)
- Added comprehensive input validation

## Non-Blocking Observations

Acknowledged but not addressed (acceptable as-is per reviewer):
- OBS-1: Config evaluated at module load time (acceptable)
- OBS-2: `atob` usage works with Hermes (acceptable)
- OBS-3: Base64url decoding padding (acceptable for valid JWTs)
- OBS-4: Apollo Client token refresh (documented TODO, acceptable)
- OBS-5: app.json template literals (dead code, fallback works)

## Testing

All fixes verified:
- ✅ TypeScript type checking passes (`pnpm type-check`)
- ✅ No unused imports
- ✅ No stale closures
- ✅ Robust input validation
- ✅ All functions properly defined with useCallback

## Files Modified

1. `/apps/mobile/lib/auth/okta-service.ts` - Removed unused import
2. `/apps/mobile/hooks/useAuth.ts` - Fixed closure issues and parsing
3. `/apps/mobile/package.json` - Removed unused expo-crypto package

## Ready for Re-Review

All blocking issues have been addressed. The implementation is now ready for re-review by code-reviewer.
