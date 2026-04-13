# TypeScript Code Quality Refactoring Plan
**Created:** 2026-04-13  
**Project:** TimeTrack Monorepo  
**Related:** Code Review by typescript-reviewer agent

## Overview

Systematic plan to fix 23 TypeScript code quality issues identified in code review. These are not compilation errors (code already compiles), but type safety improvements to eliminate `any` usage and improve maintainability.

**Total Issues:** 23
- High Priority: 6
- Medium Priority: 11
- Low Priority: 6

**Main Problem:** Excessive `any` usage (18 of 23 issues involve `any`)

---

## PHASE 1: Shared Package Foundation (HIGH PRIORITY)

**Goal:** Establish type-safe foundation that both backend and mobile depend on

### Task 1.1: Fix SyncQueueItem and SyncConflict `any` types

**Files:**
- `packages/shared/src/types/index.ts` (lines 108, 134, 137)

**Issue:** `data: any`, `localVersion: any`, `serverVersion: any` propagate throughout codebase

**Changes:**
```typescript
// Update SyncQueueItem
export interface SyncQueueItem {
  id: string;
  entityType: 'TimeEntry' | 'ETOTransaction' | 'Timesheet';
  operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'SUBMIT';
  data: Record<string, unknown>;  // Generic object instead of any
  retryCount: number;
  createdAt: Date;
  error: string | null;
}

// Update SyncConflict
export interface SyncConflict {
  id: string;
  entityType: 'TimeEntry' | 'ETOTransaction' | 'Timesheet';
  entityId: number | string;
  localVersion: Record<string, unknown>;   // Generic object instead of any
  serverVersion: Record<string, unknown>;  // Generic object instead of any
  resolvedAt: Date | null;
  resolution: 'LOCAL_WINS' | 'SERVER_WINS' | 'MANUAL' | null;
}
```

**Complexity:** Medium  
**Risk:** Medium - These types are used in mobile offline sync logic  
**Testing:** Run `pnpm type-check` and verify mobile sync hooks compile  

**Verification:**
- [ ] Shared package type-checks
- [ ] Backend compiles
- [ ] Mobile compiles
- [ ] Sync-related tests pass

---

## PHASE 2: Backend Services - Core Issues (HIGH PRIORITY)

**Goal:** Fix service-level `any` types that bypass type safety

### Task 2.1: Fix ETO Service return type casts

**Files:**
- `apps/backend/src/eto/eto.service.ts` (lines 64, 126, 196)

**Issue:** `return ... as any` bypasses GraphQL type checking

**Changes:**
```typescript
// Lines 64, 126, 196 - Replace all `as any` casts
// Option 1: Explicit mapping
return transactions.map(tx => ({
  id: tx.id,
  consultantId: tx.consultantId,
  date: tx.date,
  hours: tx.hours,
  transactionType: tx.transactionType as ETOTransactionType,
  description: tx.description,
  projectName: tx.projectName,
  synced: tx.synced,
  createdAt: tx.createdAt,
}));

// Option 2: Type assertion to specific type
return transaction as ETOTransactionObjectType;
```

**Root Cause:** Prisma returns string for enum field, GraphQL expects typed enum

**Complexity:** Low  
**Risk:** Low - Purely type-level change  
**Testing:** Run ETO service tests  

**Verification:**
- [ ] ETO service type-checks
- [ ] `pnpm backend test` passes
- [ ] GraphQL queries return correct data

---

### Task 2.2: Fix Auth Service JWT payload type

**Files:**
- `apps/backend/src/auth/auth.service.ts` (line 85)

**Issue:** `validateJwtPayload(payload: any)` - untyped parameter

**Changes:**
```typescript
// Add interface at top of file
interface JwtPayload {
  sub: string;          // External ID from Okta
  email?: string;
  name?: string;
  consultantId?: string;
  iat?: number;
  exp?: number;
}

// Line 85 - Update method signature
async validateJwtPayload(payload: JwtPayload): Promise<Consultant> {
  if (!payload || !payload.sub) {
    this.logger.warn('Invalid JWT payload');
    throw new UnauthorizedException('Invalid JWT payload');
  }
  // ... rest remains same
}
```

**Complexity:** Low  
**Risk:** Low - Method is used by JWT strategy  
**Testing:** Run auth service tests, verify JWT validation  

**Verification:**
- [ ] Auth service type-checks
- [ ] Auth tests pass
- [ ] Login flow works
- [ ] JWT validation works

---

### Task 2.3: Fix Auth Service OktaProfile index signature

**Files:**
- `apps/backend/src/auth/auth.service.ts` (line 10)

**Issue:** `[key: string]: any` index signature weakens type safety

**Changes:**
```typescript
// Replace broad index signature
interface OktaProfile {
  id: string;
  displayName: string;
  emails: Array<{ value: string }>;
  email?: string;
  name?: string;
  // Remove: [key: string]: any;
}

// Update access patterns in validateOktaUser (lines 28-30)
const email = profile.emails?.[0]?.value || profile.email || '';
const name = profile.displayName || profile.name || '';
```

**Complexity:** Low  
**Risk:** Low - Only used during Okta authentication  
**Testing:** Test Okta login flow  

**Verification:**
- [ ] Auth service type-checks
- [ ] Okta login works (if configured)
- [ ] Mock login works

---

### Task 2.4: Fix Timesheet Service `any` types

**Files:**
- `apps/backend/src/timesheet/timesheet.service.ts` (lines 112, 174, 211)

**Issue:** `where: any`, `validationData: any`, `prismaData: any` in CRUD logic

**Changes:**
```typescript
// Import Prisma types at top
import { Prisma } from '../generated';

// Line 112 - Replace `const where: any = {};`
const where: Prisma.TimeEntryWhereInput = {};

// Line 174 - Replace `const validationData: any = {};`
const validationData: Partial<Prisma.TimeEntryCreateInput> = {};

// Line 211 - Replace `const prismaData: any = {};`
const prismaData: Partial<Prisma.TimeEntryUpdateInput> = {};
```

**Complexity:** Medium  
**Risk:** Low - Prisma types are already generated  
**Testing:** Run timesheet service tests  

**Verification:**
- [ ] Timesheet service type-checks
- [ ] Create time entry works
- [ ] Update time entry works
- [ ] Query time entries works

---

### Task 2.5: Fix Sync Service `any` types

**Files:**
- `apps/backend/src/sync/sync.service.ts` (lines 835, 1253)

**Issue:** `prismaUpdateData: any` and `updateData: any` in sync logic

**Changes:**
```typescript
// Import Prisma types at top
import { Prisma } from '../generated';

// Line 835 - Replace `const prismaUpdateData: any = {`
const prismaUpdateData: Prisma.TimeEntryUpdateInput = {
  date: new Date(dateStr),
  clientName: entry.clientName,
  description: entry.description,
  inTime1: entry.inTime1 ? this.parseTimeToDateTime(dateStr, entry.inTime1) : null,
  outTime1: entry.outTime1 ? this.parseTimeToDateTime(dateStr, entry.outTime1) : null,
  totalHours,
};

// Line 1253 - Replace `const updateData: any = {};`
const updateData: Partial<Prisma.TimesheetSubmissionUpdateInput> = {};
```

**Complexity:** Low  
**Risk:** Low - Uses existing Prisma types  
**Testing:** Run sync service tests  

**Verification:**
- [ ] Sync service type-checks
- [ ] Batch sync works
- [ ] Conflict resolution works

---

### Task 2.6: Fix Submission Service parameter type

**Files:**
- `apps/backend/src/timesheet/submission.service.ts` (line 260)

**Issue:** `timeEntries: any[]` parameter - untyped array

**Changes:**
```typescript
// Import TimeEntry type from generated
import { TimeEntry } from '../generated';

// Line 260 - Update method signature
private async validateTimeEntries(
  timeEntries: TimeEntry[],
  periodStart: Date,
  periodEnd: Date,
): Promise<void> {
  // ... rest remains same
}
```

**Complexity:** Low  
**Risk:** Low - Internal private method  
**Testing:** Run submission service tests  

**Verification:**
- [ ] Submission service type-checks
- [ ] Timesheet submission works
- [ ] Validation logic works

---

## PHASE 3: Backend - Medium Priority (MEDIUM PRIORITY)

**Goal:** Clean up duplicate schemas and unused imports

### Task 3.1: Remove unused imports in UpdateTimeEntryInput DTO

**Files:**
- `apps/backend/src/timesheet/dto/update-time-entry.input.ts` (lines 1, 4)

**Issue:** Unused `PartialType` import

**Changes:**
```typescript
// Line 1 - Remove PartialType from import
import { InputType, Field, ID } from '@nestjs/graphql';

// Schema is recreated locally, so createTimeEntrySchema import isn't needed
```

**Complexity:** Trivial  
**Risk:** None  
**Testing:** Run `pnpm type-check`  

**Verification:**
- [ ] Backend type-checks
- [ ] No import errors

---

### Task 3.2: Document divergent Zod schemas

**Files:**
- `apps/backend/src/timesheet/dto/create-time-entry.input.ts` (lines 9-20)
- `packages/shared/src/validation/time-entry.schema.ts`

**Issue:** Backend has duplicate Zod schema that diverges from shared package

**Decision:** Keep schemas separate but document why

**Changes:**
```typescript
// In create-time-entry.input.ts, add comment
/**
 * Backend-specific time entry validation schema.
 * 
 * NOTE: This schema differs from the shared package schema because:
 * - Backend uses MongoDB ObjectId strings for consultantId/payPeriodId
 * - Shared package uses numeric IDs for mobile/GraphQL compatibility
 * - Backend requires additional server-side validations
 * 
 * Do NOT consolidate these schemas - they serve different purposes.
 */
export const createTimeEntrySchema = z.object({
  // ... existing schema
});
```

**Complexity:** Trivial  
**Risk:** None  
**Testing:** None needed (documentation only)  

**Verification:**
- [ ] Comment added explaining divergence

---

### Task 3.3: Fix Reminders Service notification preferences cast

**Files:**
- `apps/backend/src/reminders/reminders.service.ts` (line 97)

**Issue:** `consultant.notificationPreferences as any`

**Changes:**
```typescript
// Define notification preferences interface at top
interface NotificationPreferences {
  deadlineReminders?: boolean;
  submissionConfirmations?: boolean;
  approvalNotifications?: boolean;
}

// Line 97 - Replace cast with proper type
const prefs = consultant.notificationPreferences as NotificationPreferences | null;
if (prefs && prefs.deadlineReminders === false) {
  continue; // Skip this consultant
}
```

**Complexity:** Low  
**Risk:** Low - Only affects reminder filtering  
**Testing:** Run reminders service, check notification filtering  

**Verification:**
- [ ] Reminders service type-checks
- [ ] Deadline reminders work
- [ ] Preference filtering works

---

### Task 3.4: Fix ETO Resolver optional user parameter

**Files:**
- `apps/backend/src/eto/eto.resolver.ts` (line 55)

**Issue:** `user?: Consultant` optional on guarded endpoint

**Changes:**
```typescript
// Line 55 - Remove optional marker since JwtAuthGuard ensures user exists
async etoTransactions(
  @Args('startDate') startDate: string,
  @Args('endDate') endDate: string,
  @CurrentUser() user: Consultant,  // Remove the `?`
): Promise<ETOTransactionObjectType[]> {
  // ... rest remains same
}
```

**Complexity:** Trivial  
**Risk:** Low - Guard ensures user exists  
**Testing:** Run ETO resolver tests  

**Verification:**
- [ ] ETO resolver type-checks
- [ ] GraphQL queries work
- [ ] Authorization works

---

## PHASE 4: Mobile Hooks (MEDIUM PRIORITY)

**Goal:** Type Apollo Client hooks properly

### Task 4.1: Fix useAuthenticatedQuery hook types

**Files:**
- `apps/mobile/hooks/useAuthenticatedQuery.ts` (lines 49, 61-62)

**Issue:** `options?: any`, unsafe error cast

**Changes:**
```typescript
import type {
  DocumentNode,
  OperationVariables,
  TypedDocumentNode,
  QueryHookOptions,
  ApolloError,
} from '@apollo/client';

// Line 49 - Replace `options?: any,`
export function useAuthenticatedQuery<
  TData = any,
  TVariables extends OperationVariables = OperationVariables,
>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: QueryHookOptions<TData, TVariables>,
) {
  // Lines 61-62 - Type error properly (remove `as any`)
  if (result.error) {
    const authError = result.error.graphQLErrors?.find(
      (err) => err.extensions?.code === 'UNAUTHENTICATED',
    );
    // ... rest remains same
  }
}
```

**Complexity:** Low  
**Risk:** Low - Apollo Client has proper types  
**Testing:** Check mobile compiles, verify query hooks work  

**Verification:**
- [ ] Mobile type-checks
- [ ] GraphQL queries work
- [ ] Error handling works

---

### Task 4.2: Fix useAuthenticatedMutation hook types

**Files:**
- `apps/mobile/hooks/useAuthenticatedMutation.ts` (lines 59, 67, 77, 90)

**Issue:** Multiple `any` types in mutation hook

**Changes:**
```typescript
import type {
  DocumentNode,
  OperationVariables,
  TypedDocumentNode,
  MutationHookOptions,
  ApolloError,
} from '@apollo/client';

// Line 59 - Replace `options?: any,`
export function useAuthenticatedMutation<
  TData = any,
  TVariables extends OperationVariables = OperationVariables,
>(
  mutation: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: MutationHookOptions<TData, TVariables>,
) {
  // Lines 67, 77, 90 - Properly typed error handlers
  const [mutate, result] = useMutation<TData, TVariables>(mutation, {
    ...options,
    errorPolicy: 'all',
    onError: (error: ApolloError, clientOptions) => {
      // ... properly typed error handling
      if (options?.onError) {
        options.onError(error, clientOptions);
      }
    },
  });
}
```

**Complexity:** Low  
**Risk:** Low - Apollo Client types are well-defined  
**Testing:** Check mobile compiles, verify mutation hooks work  

**Verification:**
- [ ] Mobile type-checks
- [ ] GraphQL mutations work
- [ ] Error handling works
- [ ] Offline queueing works

---

### Task 4.3: Fix Apollo Client error link types

**Files:**
- `apps/mobile/lib/apollo-client.ts` (lines 70, 74)

**Issue:** `(errorResponse: any)` and `(error: any)`

**Changes:**
```typescript
import { onError } from '@apollo/client/link/error';
import type { ErrorResponse } from '@apollo/client/link/error';

// Line 70 - Type error handler parameter
const errorLink = onError((errorResponse: ErrorResponse) => {
  const { graphQLErrors, networkError } = errorResponse;

  // Line 74 - GraphQL errors are already typed from ErrorResponse
  if (graphQLErrors) {
    graphQLErrors.forEach((error) => {
      console.error(
        `[GraphQL error]: Message: ${error.message}, Location: ${JSON.stringify(error.locations)}, Path: ${error.path}`,
      );
    });
  }
});
```

**Complexity:** Trivial  
**Risk:** None  
**Testing:** Check mobile compiles  

**Verification:**
- [ ] Mobile type-checks
- [ ] Error logging works

---

### Task 4.4: Fix Okta Service decodeToken return type

**Files:**
- `apps/mobile/lib/auth/okta-service.ts` (line 240)

**Issue:** `decodeToken` returns `any`

**Changes:**
```typescript
// Define JWT token payload interface
interface JwtTokenPayload {
  sub?: string;
  email?: string;
  name?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;  // Allow additional claims
}

// Line 240 - Type return value
static decodeToken(token: string): JwtTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const payload = parts[1];
    const decoded = atob(payload);
    return JSON.parse(decoded) as JwtTokenPayload;
  } catch (error) {
    console.error('Failed to decode JWT token:', error);
    return null;
  }
}
```

**Complexity:** Low  
**Risk:** Low - Only used for reading token claims  
**Testing:** Test token decoding with mock JWT  

**Verification:**
- [ ] Okta service type-checks
- [ ] Token decoding works
- [ ] Token expiration checks work

---

### Task 4.5: Fix Layout Auth hook shadowing

**Files:**
- `apps/mobile/app/_layout.tsx` (lines 10, 32)

**Issue:** Local `useAuth()` shadows real hook, never checks authentication

**Changes:**
```typescript
// Remove local useAuth function (lines 10-26)
// Import real auth hook instead
import { useAuth } from '../hooks/useAuth';

// Line 32 - Use imported hook
export default function RootLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <ActivityIndicator />;
  }

  return (
    <Stack>
      {!isAuthenticated ? (
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}
```

**Complexity:** Low  
**Risk:** Medium - Changes authentication flow  
**Testing:** Test mobile auth flow thoroughly  

**Verification:**
- [ ] Mobile type-checks
- [ ] Login flow works
- [ ] Logout works
- [ ] Navigation between auth/tabs works
- [ ] Authentication persists across app restarts

---

## PHASE 5: Low Priority Cleanup (LOW PRIORITY - DEFERRED)

**Goal:** Address remaining minor issues

### Deferred Tasks:

**Task 5.1-5.6:** Index signatures, icon casts, Zod refinement callbacks

These are cosmetic improvements that can be addressed in a separate cleanup pass after higher priority work is complete.

**Reasoning:** Low impact on code quality and maintainability. Focus on high/medium priority items first.

---

## Testing Strategy

### After Each Phase:

1. **Type Check:** `pnpm type-check` from root
2. **Unit Tests:** `pnpm test` for affected packages
3. **Build Check:** `pnpm build` to ensure compilation
4. **Manual Testing:** Test affected features in development

### Phase-Specific Tests:

**Phase 1 (Shared):**
```bash
cd packages/shared
pnpm run type-check
cd ../..
pnpm type-check  # Verify backend and mobile still compile
```

**Phase 2 (Backend Services):**
```bash
cd apps/backend
pnpm test                    # All backend tests
pnpm test eto.service        # ETO service tests
pnpm test auth.service       # Auth service tests
pnpm test timesheet.service  # Timesheet service tests
pnpm test sync.service       # Sync service tests
```

**Phase 3 (Backend Medium):**
```bash
cd apps/backend
pnpm run type-check
pnpm test reminders.service
pnpm test eto.resolver
```

**Phase 4 (Mobile Hooks):**
```bash
cd apps/mobile
pnpm run type-check
# Manual testing:
# - Login flow
# - GraphQL queries
# - GraphQL mutations
# - Offline queueing
# - Error handling
```

### Integration Testing:

After all phases complete:
```bash
# Full monorepo check
pnpm type-check
pnpm test
pnpm build

# Manual E2E testing:
# 1. Start backend: pnpm docker:up:dev
# 2. Start mobile: pnpm mobile dev
# 3. Test full authentication flow
# 4. Test timesheet CRUD operations
# 5. Test offline sync
# 6. Test push notifications
```

---

## Risk Assessment

### High Risk Items:

1. **Shared type changes (Phase 1, Task 1.1)**
   - **Risk:** Affects both backend and mobile
   - **Mitigation:** Test both packages immediately after changes
   - **Rollback:** Git revert if issues arise

2. **Layout auth hook (Phase 4, Task 4.5)**
   - **Risk:** Changes authentication flow
   - **Mitigation:** Thoroughly test login/logout/navigation
   - **Rollback:** Revert to dummy hook if auth breaks

### Medium Risk Items:

1. **Sync service types (Phase 2, Task 2.5)**
   - **Risk:** Complex offline sync logic
   - **Mitigation:** Run comprehensive sync tests
   - **Rollback:** Git revert specific file

2. **Timesheet service types (Phase 2, Task 2.4)**
   - **Risk:** Core business logic
   - **Mitigation:** Run full timesheet test suite
   - **Rollback:** Git revert specific file

### Low Risk Items:

- All other changes are primarily type-level
- No runtime behavior changes expected
- Existing tests should catch any regressions

---

## Implementation Order Rationale

1. **Shared types first:** Establishes foundation for backend and mobile
2. **Backend services next:** Core business logic needs solid types
3. **Backend medium priority:** Cleanup before mobile work
4. **Mobile hooks:** Depends on stable backend types
5. **Low priority last:** Can be deferred if time-constrained

---

## Dependencies Between Phases

```
Phase 1 (Shared Types)
   ↓
Phase 2 (Backend Services)
   ↓
Phase 3 (Backend Medium) ←→ Phase 4 (Mobile Hooks)
   ↓                              ↓
Phase 5 (Low Priority - Deferred)
```

**Note:** Phases 3 and 4 can be done in parallel since they don't depend on each other.

---

## Estimated Time

- **Phase 1:** 2-3 hours (careful shared type changes + testing)
- **Phase 2:** 3-4 hours (6 tasks, testing each service)
- **Phase 3:** 2-3 hours (4 tasks, mostly straightforward)
- **Phase 4:** 2-3 hours (5 tasks, Apollo Client types)
- **Phase 5:** 1-2 hours (deferred cleanup)

**Total:** 10-15 hours for complete implementation and testing

---

## Success Criteria

✅ **Type Safety:**
- [ ] `pnpm type-check` passes with zero errors
- [ ] No `any` types in critical code paths
- [ ] Explicit types for all service methods

✅ **Functionality:**
- [ ] All existing tests continue passing
- [ ] No runtime behavior changes
- [ ] Authentication flow works
- [ ] CRUD operations work
- [ ] Offline sync works

✅ **Maintainability:**
- [ ] Code is more maintainable with explicit types
- [ ] Future developers can leverage TypeScript autocomplete
- [ ] Type errors caught at compile time, not runtime

---

## Rollback Plan

If any phase causes issues:

```bash
# View recent commits
git log --oneline -10

# Revert specific commit
git revert <commit-hash>

# Or reset to before changes (careful - loses work)
git reset --hard <commit-before-changes>

# Or revert specific file
git checkout HEAD~1 -- path/to/file.ts
```

**Best Practice:** Commit after each task to enable granular rollback.

---

## Next Steps

1. **Review this plan** - Ensure alignment with team priorities
2. **Schedule implementation** - Allocate 10-15 hours over 1-2 weeks
3. **Execute Phase 1** - Start with shared types foundation
4. **Test thoroughly** - Don't skip testing between phases
5. **Document learnings** - Note any unexpected issues for future reference

---

## References

- [Code Review Report](../TYPESCRIPT_CODE_REVIEW_2026-04-13.md) - Full review findings
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/) - Type system reference
- [Prisma Documentation](https://www.prisma.io/docs) - Generated types reference
- [Apollo Client Types](https://www.apollographql.com/docs/react/development-testing/static-typing/) - GraphQL type safety

---

**Plan Status:** READY FOR EXECUTION  
**Estimated Duration:** 10-15 hours  
**Risk Level:** Low-Medium  
**Impact:** High (improved type safety and maintainability)
