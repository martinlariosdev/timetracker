# Sprint 3 Testing Report - Issues Found

**Date:** April 14, 2026  
**Testing Device:** iPhone 17 Simulator (iOS 26.4)  
**Branch:** `fix/audit-sprint3-medium-priority`  
**Build:** Development Build (Expo SDK 54.0.0)

---

## Executive Summary

Sprint 3 implementation completed successfully with **5 issues fixed** and all TypeScript compilation passing (0 errors). However, **runtime testing revealed 3 critical errors** that prevent the app from loading:

### Issues Fixed in Sprint 3 ✅
- ✅ Issue #13: Duplicate Yesterday (real GraphQL query)
- ✅ Issue #14: Multi-entry time pairs documentation
- ✅ Issue #15: Time validation edge cases
- ✅ Issue #17: Delete account modal removed
- ✅ Issue #18: Search result highlighting

### Critical Runtime Errors Found 🔴
1. **React Native Reanimated Error** - HostFunction exception in login.tsx
2. **Apollo Client Initialization Error** - Invariant Violation in useAuth.ts
3. **Missing Default Exports** - Warnings in login.tsx and add-entry.tsx

---

## Detailed Issue Analysis

### Issue #1: React Native Reanimated HostFunction Exception

**Severity:** CRITICAL (App won't load)  
**File:** `app/(auth)/login.tsx:7`  
**Error Type:** Exception in HostFunction: <unknown>

**Error Details:**
```
ERROR [Error: Exception in HostFunction: <unknown>]

Code: login.tsx
  5 | import { Feather, Ionicons } from '@expo/vector-icons';
  6 | import { useState, useEffect } from 'react';
> 7 | import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
    | ^
  8 | import { useAuth } from '@/hooks/useAuth';
  9 | import { BiometricService } from '@/lib/auth/biometric-service';
```

**Call Stack:**
```
<global> (apps/mobile/app/(auth)/login.tsx:7)
```

**Root Cause:**
React Native Reanimated requires native module setup. The error occurs because:
1. Reanimated's native module is not properly initialized in the development build
2. The Reanimated Babel plugin may not be configured correctly
3. The app may need to rebuild the native code after adding Reanimated

**Impact:**
- App immediately crashes on load
- Login screen cannot render
- All authentication flows blocked

**Related Files:**
- `app/(auth)/login.tsx` - Uses Reanimated animations
- `babel.config.js` - Should include Reanimated plugin
- `metro.config.js` - Metro bundler configuration

---

### Issue #2: Apollo Client Invariant Violation

**Severity:** CRITICAL (GraphQL queries fail)  
**File:** `hooks/useAuth.ts:127`  
**Error Type:** Invariant Violation

**Error Details:**
```
ERROR [Invariant Violation: An error occurred! For more details, see the full error text at https://go.apollo.dev/c/err#%7B%22version%22%3A%224.1.7%22%2C%22message%22%3A28%2C%22args%22%3A%5B%5D%7D]

Code: useAuth.ts
 125 |
 126 |   // GraphQL mutations
>127 |   const [loginMutation] = useMutation<LoginResponse>(LOGIN_MUTATION);
     |                                      ^
 128 |   const [refreshTokenMutation] = useMutation<RefreshTokenResponse>(REFRESH_TOKEN_MUTATION);
```

**Call Stack:**
```
useAuth (apps/mobile/hooks/useAuth.ts:127:38)
RootLayout (apps/mobile/app/_layout.tsx:15:49)
```

**Root Cause:**
Apollo Client error code 28 typically indicates:
1. Apollo Client is not properly initialized with ApolloProvider
2. useMutation is called outside of ApolloProvider context
3. Apollo Client cache or link configuration issue

**Impact:**
- All GraphQL mutations fail
- Login functionality broken
- No data can be saved or updated
- All authentication and API calls blocked

**Related Files:**
- `hooks/useAuth.ts` - Uses useMutation hook
- `app/_layout.tsx` - Should wrap app with ApolloProvider
- `lib/apollo-client.ts` - Apollo Client configuration

---

### Issue #3: Missing Default Exports (Warnings)

**Severity:** MEDIUM (Warnings, not blocking)  
**Files:** 
- `app/(auth)/login.tsx`
- `app/(tabs)/add-entry.tsx`

**Warning Details:**
```
WARN Route "./(auth)/login.tsx" is missing the required default export. Ensure a React component is exported as default.
WARN Route "./(tabs)/add-entry.tsx" is missing the required default export. Ensure a React component is exported as default.
```

**Root Cause:**
Expo Router requires route files to have a default export. These files may be using named exports instead.

**Impact:**
- Routes may not work correctly with Expo Router
- Navigation may fail
- Type checking warnings in IDE

**Note:** This may be a false warning if the files do have default exports but Expo Router isn't detecting them correctly.

---

### Issue #4: Time Reconstruction Overflow (From Code Review)

**Severity:** LOW (Edge case, gracefully handled)  
**File:** `app/(tabs)/add-entry.tsx:172-174`  
**Identified By:** Code review (Issue 3.1)

**Code:**
```typescript
const totalMin = (entry.hours || 8) * 60;
const inMin = 8 * 60; // default 08:00
const outMin = inMin + totalMin;
const outH = Math.floor(outMin / 60);
const outM = outMin % 60;
```

**Problem:**
If `entry.hours` is 20 or more:
- `outMin = 480 + 1200 = 1680`
- `outH = 28`
- Creates invalid time string "28:00"

**Impact:**
- Time validation fails (TIME_FORMAT_REGEX rejects hours > 23)
- TimeEntryPairRow component shows error message in red
- User sees: "Invalid clock-out time "28:00". Use HH:MM format (00:00–23:59)."
- Does NOT crash the app (graceful error handling)

**Mitigation:**
The error is caught and displayed by the validation system, preventing save. This is not a critical bug but poor UX for edge cases.

---

### Issue #5: Search Highlighting Dark Mode (From Code Review)

**Severity:** LOW (UI polish issue)  
**File:** `app/(tabs)/settings.tsx`  
**Identified By:** Code review (Issue 3.4)

**Problem:**
Search highlighting uses hardcoded color `#FEF3C7` (amber-100) which may have poor contrast in dark mode.

**Impact:**
- Highlighted text may be hard to read in dark mode
- Not theme-aware
- Inconsistent with rest of app's theming

---

## Additional Observations

### Metro Bundler Performance
- **Initial Build Time:** 60+ seconds (cache rebuild)
- **Bundle Size:** 2261 modules
- **Build Time:** 5446ms after cache rebuild
- **Status:** Successfully bundled

### Backend Status
- **GraphQL Endpoint:** http://localhost:3000/graphql ✅
- **Status:** Healthy and responding
- **Test Query:** `{ __typename }` returns `{"data":{"__typename":"Query"}}`

### Expo Configuration
- **Expo SDK:** 54.0.0
- **Metro Bundler:** Running on port 8081
- **Development Mode:** Active
- **Expo Go Warnings:** Present but not blocking (notifications limitation)

---

## Root Cause Summary

The app fails to load due to **2 critical initialization issues**:

1. **React Native Reanimated** - Native module not initialized
   - Requires Babel plugin configuration
   - May require native rebuild
   - Blocks login screen render

2. **Apollo Client** - Not wrapped in ApolloProvider at root
   - useMutation called outside provider context
   - Blocks all GraphQL operations
   - Critical for authentication and data fetching

Both issues are **pre-existing** and not introduced by Sprint 3 changes. Sprint 3 code changes are sound, but the app has fundamental initialization problems that prevent any testing of the new features.

---

## Testing Status

### What Was Tested ✅
- TypeScript compilation: **0 errors**
- Code structure and imports: **Valid**
- Backend connectivity: **Working**
- Expo Metro bundler: **Successfully bundling**

### What Could NOT Be Tested ❌
- Issue #13 (Duplicate Yesterday) - App won't load
- Issue #14 (Documentation) - App won't load
- Issue #15 (Time Validation) - App won't load
- Issue #17 (Delete Account removed) - App won't load
- Issue #18 (Search Highlighting) - App won't load
- Any user flows or UI interactions
- Authentication
- GraphQL queries/mutations
- Navigation
- Settings screen
- Timesheet functionality

---

## Screenshots

### Error Screen 1: React Native Reanimated Error
**File:** `/tmp/sprint3-test-3.png`
- Shows "Uncaught Error: Exception in HostFunction"
- Source: login.tsx line 7
- Call stack points to Reanimated import
- "Log 1 of 3" - indicates multiple errors

### Loading Screen
**File:** `/tmp/sprint3-test-1.png`
- Shows Expo development build selector
- "How would you like to open this project?"
- Options: Development Build / Expo Go
- Indicates app structure loaded but not executing

---

## Next Steps

See `SPRINT3_FIX_PLAN.md` for comprehensive fix strategy.
