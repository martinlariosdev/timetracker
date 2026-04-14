# Dependency Compatibility Fix Plan
**Created:** 2026-04-13  
**Project:** TimeTrack Monorepo  
**Related:** DEPENDENCY_COMPATIBILITY_ANALYSIS.md

## Overview

This plan addresses 8 compatibility issues discovered in the dependency analysis, with focus on 2 critical fixes that must be completed immediately.

---

## Task Breakdown

### 🔴 Phase 1: Critical Fixes (Required)

#### Task 1: Fix React Native Version
**Priority:** CRITICAL  
**Estimated Time:** 15 minutes  
**Risk:** High - App won't work without this

**Current State:**
```json
// apps/mobile/package.json
"react-native": "0.81.5"  // WRONG - this version doesn't exist
```

**Target State:**
```json
"react-native": "0.76.5"  // Correct for Expo SDK 54
```

**Steps:**
1. Update apps/mobile/package.json
2. Run `cd apps/mobile && pnpm install`
3. Clear cache: `pnpm run dev` (runs expo start --clear)
4. Test on iOS simulator

**Verification:**
- [ ] App builds successfully
- [ ] No React Native version errors in console
- [ ] App launches on simulator

---

#### Task 2: Downgrade React to 18.3.1
**Priority:** CRITICAL  
**Estimated Time:** 15 minutes  
**Risk:** High - React 19 not compatible with RN 0.76

**Current State:**
```json
// apps/mobile/package.json
"react": "19.1.0",
"@types/react": "~19.1.0"
```

**Target State:**
```json
"react": "18.3.1",
"@types/react": "~18.3.0"
```

**Steps:**
1. Update apps/mobile/package.json
2. Run `cd apps/mobile && pnpm install`
3. Check for peer dependency warnings
4. Run type check: `pnpm run type-check`
5. Test app rendering

**Verification:**
- [ ] No React version warnings
- [ ] TypeScript compiles without errors
- [ ] All hooks work correctly
- [ ] Navigation functional
- [ ] GraphQL queries work

---

### 🟡 Phase 2: Standardization (Recommended)

#### Task 3: Align TypeScript Versions
**Priority:** HIGH  
**Estimated Time:** 20 minutes  
**Risk:** Medium - Type checking inconsistencies

**Current State:**
```
Root:     ^5.3.3
Shared:   ^5.3.3
Backend:  ^5.7.3
Mobile:   ~5.9.2
```

**Target State:**
```
All packages: ^5.9.2
```

**Steps:**
1. Update package.json in all 4 locations:
   - Root: `package.json`
   - Shared: `packages/shared/package.json`
   - Backend: `apps/backend/package.json`
   - Mobile: `apps/mobile/package.json`
2. Run `pnpm install` at root
3. Run `pnpm run type-check` in each package
4. Fix any new type errors

**Verification:**
- [ ] All packages use TypeScript 5.9.2
- [ ] Root type-check passes
- [ ] Backend type-check passes
- [ ] Mobile type-check passes
- [ ] Shared type-check passes

---

#### Task 4: Downgrade Backend Jest
**Priority:** HIGH  
**Estimated Time:** 15 minutes  
**Risk:** Medium - Test behavior differences

**Current State:**
```json
// apps/backend/package.json
"jest": "^30.0.0",
"@types/jest": "^30.0.0"
```

**Target State:**
```json
"jest": "^29.7.0",
"@types/jest": "^29.5.14"
```

**Steps:**
1. Update apps/backend/package.json
2. Run `cd apps/backend && pnpm install`
3. Run existing tests: `pnpm test`
4. Check for any test failures

**Verification:**
- [ ] Jest 29.7.0 installed
- [ ] Existing tests pass
- [ ] No deprecation warnings
- [ ] ts-jest compatible

---

#### Task 5: Update Node.js Engine Requirement
**Priority:** MEDIUM  
**Estimated Time:** 5 minutes  
**Risk:** Low - Documentation only

**Current State:**
```json
// package.json (root)
"engines": {
  "node": ">=18.0.0",
  "pnpm": ">=8.0.0"
}
```

**Target State:**
```json
"engines": {
  "node": ">=20.0.0",
  "pnpm": ">=9.0.0"
}
```

**Steps:**
1. Update root package.json
2. Document in README.md
3. Update CI/CD if applicable

**Verification:**
- [ ] engines field updated
- [ ] README reflects new requirement
- [ ] Team notified

---

### 🟢 Phase 3: Future Improvements (Optional)

#### Task 6: Update pnpm to 9.x
**Priority:** LOW  
**Estimated Time:** 15 minutes  
**Risk:** Low - pnpm 9 is stable

**Current State:**
```json
"packageManager": "pnpm@8.15.0"
```

**Target State:**
```json
"packageManager": "pnpm@9.15.0"
```

**Steps:**
1. Update packageManager field in root package.json
2. Run `corepack prepare pnpm@9.15.0 --activate`
3. Delete node_modules and pnpm-lock.yaml
4. Run `pnpm install`
5. Test all build scripts

**Verification:**
- [ ] pnpm version shows 9.15.0
- [ ] pnpm-lock.yaml regenerated
- [ ] All packages install correctly
- [ ] Build scripts work

---

#### Task 7: Standardize Expo Package Pins
**Priority:** LOW  
**Estimated Time:** 10 minutes  
**Risk:** Very Low - cosmetic improvement

**Current State:**
```json
// apps/mobile/package.json (mixed)
"expo-auth-session": "^55.0.14",  // ^ (minor updates)
"expo-notifications": "~0.32.16"  // ~ (patch only)
```

**Target State:**
```json
// All Expo packages use ~
"expo-auth-session": "~55.0.14",
"expo-constants": "~55.0.14",
// etc.
```

**Steps:**
1. Update all Expo package versions to use `~` prefix
2. Run `pnpm install`
3. Test app functionality

**Verification:**
- [ ] All Expo packages use `~`
- [ ] App functions normally

---

#### Task 8: Verify Peer Dependencies
**Priority:** LOW  
**Estimated Time:** 10 minutes  
**Risk:** Very Low - likely satisfied

**Steps:**
1. Run `pnpm install` and review warnings
2. Check for unmet peer dependencies
3. Install any missing peer deps
4. Document findings

**Verification:**
- [ ] No peer dependency warnings
- [ ] All packages resolve correctly

---

## Execution Order

### Immediate (Do Now)
1. ✅ Task 1: Fix React Native version → Mobile app
2. ✅ Task 2: Downgrade React → Mobile app
3. ✅ Test mobile app end-to-end

### Next Session (Before Testing Phase)
4. ✅ Task 3: Align TypeScript versions → All packages
5. ✅ Task 4: Downgrade Backend Jest → Backend
6. ✅ Test full monorepo build

### Optional (When Convenient)
7. ⚪ Task 5: Update Node.js requirement → Documentation
8. ⚪ Task 6: Update pnpm → Infrastructure
9. ⚪ Task 7: Standardize Expo pins → Mobile app
10. ⚪ Task 8: Verify peer deps → All packages

---

## Testing Strategy

### After Phase 1 (Critical Fixes)
```bash
# Mobile app
cd apps/mobile
pnpm install
pnpm run type-check
pnpm run ios  # or android

# Test core functionality:
- [ ] App launches
- [ ] Login works
- [ ] Timesheet list loads
- [ ] Can add entry
- [ ] Offline mode works
- [ ] Notifications permission requested
```

### After Phase 2 (Standardization)
```bash
# Backend
cd apps/backend
pnpm install
pnpm run build
pnpm test

# Mobile
cd apps/mobile
pnpm install
pnpm run type-check

# Shared
cd packages/shared
pnpm install
pnpm run build
pnpm test

# Root
pnpm install
pnpm run build
pnpm run type-check
```

### After Phase 3 (Improvements)
```bash
# Full clean install
rm -rf node_modules packages/*/node_modules apps/*/node_modules
rm pnpm-lock.yaml
pnpm install

# Full test suite
pnpm run build
pnpm run test
pnpm run lint
```

---

## Rollback Plan

If critical fixes cause issues:

### Rollback Task 1 (React Native)
```bash
cd apps/mobile
git checkout package.json
pnpm install
```

### Rollback Task 2 (React)
```bash
cd apps/mobile
pnpm install react@19.1.0 @types/react@~19.1.0
```

### Complete Rollback
```bash
git checkout HEAD -- "**/package.json"
git checkout HEAD -- pnpm-lock.yaml
pnpm install
```

---

## Risk Mitigation

### Before Starting
1. ✅ Commit all current work
2. ✅ Create backup branch
3. ✅ Document current versions

### During Execution
1. ✅ Fix one task at a time
2. ✅ Test after each task
3. ✅ Commit after successful tests
4. ✅ Don't proceed if tests fail

### After Completion
1. ✅ Run full test suite
2. ✅ Test on actual device (not just simulator)
3. ✅ Verify all features work
4. ✅ Update documentation

---

## Known Risks

| Task | Risk | Mitigation |
|------|------|------------|
| Task 1 | RN 0.76 breaking changes | Review RN 0.76 changelog, test thoroughly |
| Task 2 | React 18 missing features | Verify no React 19 features used |
| Task 3 | New TS errors | Fix incrementally, use `// @ts-expect-error` sparingly |
| Task 4 | Jest 29 test failures | Check Jest 30 migration guide |
| Task 6 | pnpm 9 lockfile changes | Regenerate lockfile, test CI |

---

## Success Criteria

### Phase 1 Complete When:
- [ ] Mobile app builds without errors
- [ ] App runs on iOS simulator
- [ ] App runs on Android emulator
- [ ] No React/React Native version warnings
- [ ] All existing features work

### Phase 2 Complete When:
- [ ] All packages use TypeScript 5.9.2
- [ ] Backend uses Jest 29.7.0
- [ ] `pnpm run build` succeeds at root
- [ ] `pnpm run type-check` succeeds at root
- [ ] Existing tests pass

### Phase 3 Complete When:
- [ ] pnpm 9 installed (if doing Task 6)
- [ ] All Expo packages use `~` (if doing Task 7)
- [ ] No peer dependency warnings
- [ ] Documentation updated

---

## Timeline

### Conservative Estimate
- Phase 1: 1 hour (including testing)
- Phase 2: 1 hour (including testing)
- Phase 3: 1 hour (if doing all tasks)
- **Total: 3 hours**

### Optimistic Estimate
- Phase 1: 30 minutes
- Phase 2: 30 minutes
- Phase 3: 30 minutes
- **Total: 1.5 hours**

### Realistic Estimate
- Phase 1: 45 minutes
- Phase 2: 45 minutes
- Phase 3: 45 minutes (optional)
- **Total: 2.5 hours**

---

## Post-Fix Actions

### Update Documentation
1. Update README.md with new Node.js requirement
2. Update CONTRIBUTING.md if exists
3. Document any breaking changes

### Notify Team
1. Announce dependency updates
2. Request everyone to run `pnpm install`
3. Share testing results

### Update CI/CD
1. Update Node.js version in CI config
2. Update pnpm version if changed
3. Verify CI builds pass

---

## Additional Notes

### React Native 0.81.5 Issue
The version 0.81.5 likely came from:
- Misreading Expo docs (mistaking SDK 54 for RN 0.54)
- Typo when setting up package.json
- Confusion about React Native versioning

React Native versioning:
- Current stable: 0.76.x
- Next: 0.77.x (in progress)
- There is no 0.81.x series

### React 19 Adoption
React 19 is very new (December 2024). The React Native team is working on support, but it's not ready yet. React Native stable (0.76.x) requires React 18.x.

When to upgrade to React 19:
- Wait for React Native 0.77+ with explicit React 19 support
- Monitor Expo SDK releases
- Check community feedback
- Likely 6-12 months from now

---

## References

- [Analysis Document](../DEPENDENCY_COMPATIBILITY_ANALYSIS.md)
- [Expo SDK 54 Docs](https://docs.expo.dev/versions/v54.0.0/)
- [React Native 0.76 Changelog](https://github.com/facebook/react-native/releases/tag/v0.76.0)
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [TypeScript 5.9 Release](https://devblogs.microsoft.com/typescript/announcing-typescript-5-9/)

---

## Approval

**Created by:** Claude Code  
**Reviewed by:** [Pending]  
**Approved by:** [Pending]  
**Status:** DRAFT - Awaiting approval to execute
