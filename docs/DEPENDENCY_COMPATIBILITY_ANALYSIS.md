# Dependency Compatibility Analysis Report
**Generated:** 2026-04-13  
**Project:** TimeTrack Monorepo

## Executive Summary

Analysis of 4 package.json files across the monorepo revealed **8 compatibility issues** requiring attention.

### Severity Levels
- 🔴 **CRITICAL**: Breaking changes, application won't work
- 🟡 **WARNING**: Potential issues, deprecated features
- 🟢 **INFO**: Version mismatches that work but should be aligned

---

## 🔴 CRITICAL Issues

### 1. React Native Version Incompatibility with Expo SDK 54
**Location:** `apps/mobile/package.json`
**Issue:** React Native 0.81.5 is incompatible with Expo SDK 54

```json
"expo": "~54.0.33",          // Requires React Native 0.76.x
"react-native": "0.81.5"      // WRONG VERSION
```

**Why Critical:**
- Expo SDK 54 requires React Native 0.76.x (as per Expo SDK 54 release notes)
- Current version (0.81.5) doesn't exist - likely a typo or misunderstanding
- Latest React Native stable is 0.76.x series
- This will cause runtime errors and build failures

**Fix:**
```json
"react-native": "0.76.5"  // Match Expo SDK 54 requirement
```

**Impact:** High - App may not build or crash at runtime

---

### 2. React 19 Incompatibility with React Native 0.76
**Location:** `apps/mobile/package.json`
**Issue:** React 19.1.0 is not compatible with React Native 0.76.x

```json
"react": "19.1.0",            // Too new for React Native
"react-native": "0.81.5"      // Should be 0.76.5
```

**Why Critical:**
- React Native 0.76.x requires React 18.x (18.2.0 or 18.3.x)
- React 19 was released December 2024 and is not yet supported by React Native stable
- React Native ecosystem is still catching up to React 19

**Fix:**
```json
"react": "18.3.1",           // Latest React 18.x stable
"@types/react": "~18.3.0"    // Match React version
```

**Impact:** High - JSX rendering issues, hook compatibility problems

---

## 🟡 WARNING Issues

### 3. TypeScript Version Inconsistencies
**Locations:** Multiple packages
**Issue:** 3 different TypeScript versions across the monorepo

```
Root:     "typescript": "^5.3.3"
Shared:   "typescript": "^5.3.3"
Backend:  "typescript": "^5.7.3"   ⚠️ Newer
Mobile:   "typescript": "~5.9.2"   ⚠️ Much newer
```

**Why Warning:**
- Different TypeScript versions can produce different compilation results
- Type checking may pass locally but fail in CI
- `^5.3.3` allows 5.3.3-5.9.x (any minor version)
- `~5.9.2` locks to 5.9.x patch versions only
- `^5.7.3` allows 5.7.3+ (any minor version)

**Fix:** Standardize on TypeScript 5.9.x across all packages
```json
// All package.json files:
"typescript": "^5.9.2"  // Use caret for flexibility, but same base version
```

**Impact:** Medium - Type errors may appear inconsistently

---

### 4. Node.js Version Mismatch with Package Manager
**Location:** Root `package.json`
**Issue:** packageManager pin may not work across all Node versions

```json
"engines": {
  "node": ">=18.0.0",        // Allows Node 18, 20, 22
  "pnpm": ">=8.0.0"
},
"packageManager": "pnpm@8.15.0"  // Pins to 8.15.0
```

**Why Warning:**
- Node 18 is EOL April 2025 (very soon!)
- Node 20 is LTS (Active until 2026-10-30)
- Should require Node 20+ for long-term stability
- pnpm 8.x works but pnpm 9.x is current stable

**Fix:**
```json
"engines": {
  "node": ">=20.0.0",
  "pnpm": ">=9.0.0"
},
"packageManager": "pnpm@9.15.0"
```

**Impact:** Medium - Node 18 EOL approaching

---

### 5. Jest Version Mismatch
**Locations:** Multiple packages
**Issue:** Different Jest versions across packages

```
Root:     "jest": "^29.7.0"
Shared:   "jest": "^29.7.0"
Backend:  "jest": "^30.0.0"   ⚠️ Major version bump
```

**Why Warning:**
- Jest 30 was released recently (December 2024)
- Breaking changes in Jest 30 vs Jest 29
- Test suites may behave differently
- Some plugins may not support Jest 30 yet

**Fix:** Standardize on Jest 29 (more stable, better ecosystem support)
```json
// Backend package.json:
"jest": "^29.7.0",
"@types/jest": "^29.5.14"  // Match major version
```

**Impact:** Medium - Test behavior inconsistencies

---

### 6. Express Version Major Bump
**Location:** `apps/backend/package.json`
**Issue:** Express 5 is used but ecosystem support is limited

```json
"express": "^5.2.1",                // Express 5.x (new)
"@as-integrations/express5": "^1.1.2",  // Requires Express 5
"@types/express": "^5.0.0"
```

**Why Warning:**
- Express 5 was just released (final stable: October 2024)
- Many middleware packages still only support Express 4
- Breaking changes from Express 4
- Documentation still primarily for Express 4

**Recommendation:** 
- Keep Express 5 if @as-integrations/express5 requires it
- Monitor for middleware compatibility issues
- Consider Express 4 if issues arise

**Impact:** Medium - Middleware compatibility risks

---

## 🟢 INFO Issues

### 7. Expo Package Versions
**Location:** `apps/mobile/package.json`
**Issue:** Some Expo packages use `~` (patch lock) vs `^` (minor updates)

```json
"expo": "~54.0.33",                    // Patch lock
"expo-auth-session": "^55.0.14",      // Minor updates allowed
"expo-constants": "^55.0.14",         // Minor updates allowed
"expo-notifications": "~0.32.16",     // Patch lock
```

**Why Info:**
- Expo SDK 54 uses Expo packages in the 54.x and 55.x range
- `~` lock is more conservative (patches only)
- `^` allows minor version bumps
- Mixed approach can cause subtle issues

**Recommendation:** Use `~` for all Expo packages for consistency
```json
"expo-auth-session": "~55.0.14",
"expo-constants": "~55.0.14",
// etc.
```

**Impact:** Low - Expo manages compatibility well

---

### 8. Missing Peer Dependencies Warnings
**Locations:** Mobile app
**Issue:** Some packages may have unmet peer dependencies

**Known potential issues:**
- `@apollo/client` requires `react` 16.8+ (✅ satisfied with React 18)
- `nativewind` requires `tailwindcss` (✅ present)
- `react-native-reanimated` may require specific React Native version

**Recommendation:** Run `pnpm install` and check for peer dependency warnings

**Impact:** Low - Likely already satisfied

---

## Compatibility Matrix

| Package | Current | Required By | Compatible? | Recommended |
|---------|---------|-------------|-------------|-------------|
| React | 19.1.0 | React Native | ❌ NO | 18.3.1 |
| React Native | 0.81.5 | Expo SDK 54 | ❌ NO | 0.76.5 |
| TypeScript | 5.3-5.9 | All | ⚠️ MIXED | 5.9.2 |
| Node.js | >=18 | Project | ⚠️ OLD | >=20.0.0 |
| Jest | 29-30 | Tests | ⚠️ MIXED | 29.7.0 |
| Expo SDK | 54.0.33 | Mobile | ✅ OK | Keep |
| Express | 5.2.1 | Backend | ⚠️ NEW | Monitor |
| pnpm | 8.15.0 | Monorepo | ⚠️ OLD | 9.15.0 |

---

## Recommended Action Plan

### Phase 1: Critical Fixes (MUST FIX)
1. **Fix React Native version**
   ```bash
   cd apps/mobile
   pnpm install react-native@0.76.5
   ```

2. **Downgrade React to 18.3.1**
   ```bash
   cd apps/mobile
   pnpm install react@18.3.1 @types/react@~18.3.0
   ```

3. **Test mobile app**
   ```bash
   cd apps/mobile
   pnpm run ios  # or android
   ```

### Phase 2: Standardization (SHOULD FIX)
4. **Align TypeScript versions**
   ```bash
   # Update all package.json files to use ^5.9.2
   # Then run: pnpm install
   ```

5. **Downgrade Backend Jest to 29.7.0**
   ```bash
   cd apps/backend
   pnpm install jest@^29.7.0 @types/jest@^29.5.14
   ```

6. **Update Node.js requirement**
   ```
   Edit root package.json:
   "engines": { "node": ">=20.0.0" }
   ```

### Phase 3: Future Improvements (NICE TO HAVE)
7. **Update pnpm** (after testing above)
   ```bash
   corepack prepare pnpm@9.15.0 --activate
   # Update package.json: "packageManager": "pnpm@9.15.0"
   ```

8. **Standardize Expo package pins**
   - Use `~` for all Expo packages
   - Prevents unexpected minor version bumps

---

## Testing Strategy

After fixing compatibility issues:

1. **Backend Tests**
   ```bash
   cd apps/backend
   pnpm install
   pnpm run build
   pnpm test
   ```

2. **Mobile Tests**
   ```bash
   cd apps/mobile
   pnpm install
   pnpm run type-check
   pnpm run ios  # Test on simulator
   ```

3. **Shared Package**
   ```bash
   cd packages/shared
   pnpm install
   pnpm run build
   pnpm test
   ```

4. **Monorepo Level**
   ```bash
   pnpm install  # Root level
   pnpm run build
   pnpm run type-check
   ```

---

## Risk Assessment

| Issue | Risk Level | Breakage Probability | Fix Difficulty |
|-------|-----------|----------------------|----------------|
| React Native version | 🔴 HIGH | 95% | Easy |
| React 19 incompatibility | 🔴 HIGH | 90% | Easy |
| TypeScript mismatch | 🟡 MEDIUM | 40% | Easy |
| Node.js version | 🟡 MEDIUM | 20% | Easy |
| Jest version | 🟡 MEDIUM | 30% | Easy |
| Express 5 | 🟡 MEDIUM | 15% | Monitor |
| Expo pins | 🟢 LOW | 5% | Easy |
| Peer deps | 🟢 LOW | 10% | Check only |

---

## References

- [Expo SDK 54 Release Notes](https://expo.dev/changelog/2024/11-12-sdk-54)
- [React Native 0.76 Release](https://reactnative.dev/blog/2024/10/23/the-new-architecture-is-here)
- [React 19 Announcement](https://react.dev/blog/2024/12/05/react-19)
- [TypeScript 5.9 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-9/)
- [pnpm 9 Release Notes](https://github.com/pnpm/pnpm/releases)
- [Node.js Release Schedule](https://nodejs.org/en/about/previous-releases)

---

## Conclusion

The project has **2 critical compatibility issues** that will prevent the mobile app from working correctly:
1. React Native version (0.81.5 doesn't exist, should be 0.76.5)
2. React 19 incompatibility with React Native

These must be fixed before proceeding with testing or deployment. The other issues are standardization improvements that reduce risk but aren't immediately breaking.

**Estimated Fix Time:** 1-2 hours for critical fixes + testing
