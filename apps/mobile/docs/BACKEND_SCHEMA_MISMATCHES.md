# Backend Schema Mismatches - Comprehensive Report

**Date:** April 14, 2026  
**Testing:** 32 GraphQL endpoints tested by 3 parallel agents  
**Status:** 🔴 **CRITICAL BLOCKER FOUND**

---

## Executive Summary

**Results:** 13/32 endpoints passed (40.6%), 19/32 failed (59.4%)

**🚨 CRITICAL BLOCKER:**
Mobile app cannot create time entries! Backend doesn't accept `totalHours` input that mobile now sends.

**Impact:** App is completely broken for creating new time entries after our GraphQL fixes.

---

## 🔴 Priority 1: BLOCKING ISSUES (Must Fix)

### Issue #1: CreateTimeEntry Input Mismatch (CRITICAL!)

**Problem:**
- Mobile sends: `{ date, totalHours, description, projectTaskNumber, clientName }`
- Backend expects: `{ consultantId, payPeriodId, date, inTime1, outTime1, clientName, description }`
- Backend does NOT accept `totalHours` field in input
- Backend CALCULATES `totalHours` from time pairs

**Why This Happened:**
1. ✅ We updated mobile queries to expect `totalHours` in response
2. ✅ Backend returns `totalHours` in response
3. ✅ We updated mobile mutations to SEND `totalHours` 
4. ❌ Backend doesn't ACCEPT `totalHours` in input!

**Location:**
- Backend: `/Users/martinlarios/personal/apps/backend/src/timesheet/dto/create-time-entry.input.ts`
- Mobile: `/Users/martinlarios/personal/apps/mobile/app/(tabs)/add-entry.tsx:335-341`

**Current Backend Schema:**
```graphql
input CreateTimeEntryInput {
  consultantId: ID!      # Required - shouldn't be needed (use auth token)
  payPeriodId: ID!       # Required - shouldn't be needed (calculate from date)
  date: String!
  inTime1: String!       # Required - e.g., "09:00"
  outTime1: String!      # Required - e.g., "17:00"
  inTime2: String        # Optional - for split shifts
  outTime2: String       # Optional - for split shifts
  clientName: String!
  description: String!
  projectTaskNumber: String
}
```

**What Mobile Sends:**
```typescript
{
  date: "2026-04-14",
  totalHours: 8,         // ❌ NOT ACCEPTED
  description: "Work",
  projectTaskNumber: "PROJ-123",
  clientName: "Client Name"
}
```

**Solutions:**

**Option A: Fix Backend (RECOMMENDED)**
```graphql
input CreateTimeEntryInput {
  date: String!
  totalHours: Float!     # ADD THIS - make it primary input
  description: String!
  projectTaskNumber: String
  clientName: String
  # Make time pairs optional (can default to 9-5 or be calculated)
  inTime1: String
  outTime1: String
  inTime2: String
  outTime2: String
  # Remove these - infer from context:
  # consultantId: ID!   # Get from JWT auth token
  # payPeriodId: ID!    # Calculate from date
}
```

**Changes needed in backend:**
1. Add `totalHours?: number` field to CreateTimeEntryInput
2. Make `inTime1` and `outTime1` optional (not required)
3. Remove `consultantId` requirement (get from auth token)
4. Remove `payPeriodId` requirement (calculate from date)
5. Service logic: If `totalHours` provided but no time pairs, default to reasonable times (e.g., 09:00 - calculated end time)

**Option B: Revert Mobile (NOT RECOMMENDED)**
- Revert `/Users/martinlarios/personal/apps/mobile/app/(tabs)/add-entry.tsx` to send time pairs
- Users already enter time pairs in UI, so this is feasible
- But requires reverting our GraphQL fixes
- Creates inconsistency (UI collects pairs → send pairs → backend calculates total)

**Recommendation: Option A** - Backend should accept `totalHours` as primary input since that's the semantic meaning users care about.

---

### Issue #2: Missing Query - timesheetSubmissionByPayPeriod

**Problem:**
- Mobile queries: `timesheetSubmissionByPayPeriod(payPeriodId: "2026-04")`
- Backend: Query does not exist in schema

**Location:**
- Mobile: `/Users/martinlarios/personal/apps/mobile/lib/graphql/queries.ts:172`
- Backend: Query missing from schema

**Mobile Usage:**
```typescript
const { data } = useAuthenticatedQuery(TIMESHEET_SUBMISSION_BY_PAY_PERIOD_QUERY, {
  variables: { payPeriodId: currentPayPeriodId },
});
```

**Available Backend Alternatives:**
- `timesheetSubmission(id: String!)` - Lookup by submission ID
- `myTimesheetSubmissions` - Get all submissions for current user

**Solutions:**

**Option A: Add Backend Query (RECOMMENDED)**
```graphql
type Query {
  timesheetSubmissionByPayPeriod(payPeriodId: String!): TimesheetSubmissionType
}
```

Implementation:
```typescript
// src/timesheet/submission.resolver.ts
@Query(() => TimesheetSubmissionType, { nullable: true })
async timesheetSubmissionByPayPeriod(
  @Args('payPeriodId') payPeriodId: string,
  @CurrentUser() user: Consultant,
): Promise<TimesheetSubmissionType | null> {
  return this.submissionService.findByPayPeriod(payPeriodId, user.id);
}
```

**Option B: Update Mobile**
Replace query with `myTimesheetSubmissions` and filter client-side:
```typescript
const { data } = useAuthenticatedQuery(MY_TIMESHEET_SUBMISSIONS_QUERY);
const submission = data?.myTimesheetSubmissions?.find(
  s => s.payPeriodId === currentPayPeriodId
);
```

**Recommendation: Option A** - The query is semantically clearer and more efficient.

---

### Issue #3: Missing Query - clients

**Problem:**
- Mobile expects: `query { clients { id name code active } }`
- Backend: Resolver exists but NOT registered in GraphQL schema

**Location:**
- Backend Resolver: `/Users/martinlarios/personal/apps/backend/src/clients/clients.resolver.ts:21`
- Backend Module: ClientsModule imported in app.module.ts

**Root Cause:**
ClientsResolver is defined but GraphQL can't find it. Likely module registration issue.

**Solution:**
Verify ClientsModule is properly configured in GraphQL schema generation:
1. Check `ClientsModule` is in `imports` array of main AppModule
2. Check `ClientsResolver` is in `providers` array of ClientsModule
3. Regenerate schema: `npm run generate:schema`

---

## 🟡 Priority 2: HIGH PRIORITY ISSUES

### Issue #4: Sync Mutation Input Format Mismatch

**Affected Endpoints:**
- `syncTimeEntries`
- `syncETOTransactions`
- `syncTimesheetSubmissions`

**Problem:**
Mobile expects generic sync format, backend expects flat structured objects.

**Mobile Sends:**
```graphql
{
  operation: CREATE,
  entityId: "abc123",
  data: "{\"date\":\"2026-04-14\",\"hours\":8}"  # JSON string
}
```

**Backend Expects:**
```graphql
# Flat, typed fields (NOT JSON string)
{
  operation: CREATE,
  id: "abc123",
  date: "2026-04-14",
  inTime1: "09:00",
  outTime1: "17:00",
  clientName: "Client",
  description: "Work",
  totalHours: 8
}
```

**Solutions:**

**Option A: Update Backend**
Accept generic format with JSON data string:
```graphql
input GenericSyncInput {
  operation: SyncOperation!
  entityId: ID!
  data: String!  # JSON string
}
```

**Option B: Update Mobile**
Send flat structured objects instead of JSON strings.

**Recommendation:** Discuss with team - this is an architectural decision about sync API design.

---

### Issue #5: UpdateTimeEntry Signature Quirk

**Problem:**
Backend requires `id` in TWO places:
```graphql
updateTimeEntry(id: String!, input: UpdateTimeEntryInput!)

input UpdateTimeEntryInput {
  id: ID!  # Also required here!
  # ... other fields
}
```

**Solution:**
Remove `id` from `UpdateTimeEntryInput`:
```graphql
updateTimeEntry(id: ID!, input: UpdateTimeEntryInput!)

input UpdateTimeEntryInput {
  # id field removed - use argument instead
  description: String
  projectTaskNumber: String
  clientName: String
  totalHours: Float
  # ... other fields
}
```

---

### Issue #6: SyncLogObjectType Field Name Mismatches

**Problem:**
Mobile and backend use different field names.

| Mobile Expects | Backend Has | Fix |
|----------------|-------------|-----|
| `consultantId` | `userId` | Add alias or rename |
| `timestamp` | `syncedAt` | Add alias or rename |
| `entityCount` | *missing* | Add field |
| `successful` | `success` (Boolean) | Change to count |
| `failed` | *missing* | Add field |

**Solution:**
Add GraphQL field aliases in backend:
```typescript
@ObjectType()
export class SyncLogObjectType {
  @Field(() => ID)
  id: string;

  @Field(() => ID, { name: 'consultantId' })  // Alias
  userId: string;

  @Field(() => Date, { name: 'timestamp' })  // Alias
  syncedAt: Date;

  @Field(() => Int, { nullable: true })
  entityCount?: number;

  @Field(() => Int)
  successful: number;

  @Field(() => Int)
  failed: number;
}
```

---

### Issue #7: ETOTransactionObjectType Missing runningBalance

**Problem:**
- Mobile queries: `runningBalance` field
- Backend: Field defined in code but not in schema

**Location:**
- Backend: `/Users/martinlarios/personal/apps/backend/src/eto/dto/eto-transaction.object.ts:48-52`

**Solution:**
Ensure field is decorated with `@Field()`:
```typescript
@Field(() => Float, { nullable: true })
runningBalance?: number;
```

---

## 🟢 Priority 3: NICE TO HAVE

### Issue #8: registerPushToken Platform Field

**Problem:**
- Mobile sends: `{ token, platform }`
- Backend accepts: `{ token }` only

**Solution:**
Add platform field to backend (for future iOS/Android differentiation):
```typescript
export class RegisterPushTokenInput {
  @Field()
  token: string;

  @Field()
  platform: string;  // 'ios' | 'android'
}
```

---

### Issue #9: UseETOInput Structure Mismatch

**Problem:**
- Mobile expects: `{ consultantId, startDate, endDate, hours, description }`
- Backend expects: `{ hours, date, description, projectName }`

**Notes:**
- Backend infers `consultantId` from auth token (correct)
- Backend uses single `date` instead of `startDate/endDate` range

**Solution:**
Update mobile to match backend OR backend to accept date range.

---

### Issue #10: SyncOperationType Enum Values

**Problem:**
- Mobile sends: `"push"` (string)
- Backend expects: `CREATE | UPDATE | DELETE` (enum)

**Solution:**
Update mobile to use correct enum values.

---

## Summary of Required Backend Changes

### CRITICAL (Blocking)
1. ✅ Add `totalHours` input field to CreateTimeEntryInput
2. ✅ Make `inTime1/outTime1` optional
3. ✅ Remove `consultantId` and `payPeriodId` requirements (infer from context)
4. ✅ Add `timesheetSubmissionByPayPeriod` query
5. ✅ Fix ClientsResolver registration

### HIGH
6. ✅ Remove `id` from UpdateTimeEntryInput
7. ✅ Add field aliases to SyncLogObjectType
8. ✅ Expose `runningBalance` in schema

### NICE TO HAVE
9. ⏸️ Decide on sync API format (generic vs typed)
10. ⏸️ Add `platform` to RegisterPushTokenInput
11. ⏸️ Align UseETOInput structure

---

## Testing Results by Batch

### Batch 1 (Endpoints 1-11) - By backend-tester-1
- Passed: 2/11
- Failed: 9/11
- Key issues: clients query, sync endpoints, ETO inputs

### Batch 2 (Endpoints 12-22) - By backend-tester-2  
- Passed: 4/11
- Failed: 7/11
- Key issues: sync format, missing timesheetSubmissionByPayPeriod

### Batch 3 (Endpoints 23-32) - By backend-tester-3
- Passed: 7/10
- Failed: 3/10
- Key issue: CreateTimeEntry input mismatch (CRITICAL BLOCKER)

---

## Recommended Action Plan

### Step 1: Fix Critical Blocker (1-2 hours)
1. Update `CreateTimeEntryInput` to accept `totalHours`
2. Make time pairs optional
3. Auto-infer `consultantId` and `payPeriodId`

### Step 2: Add Missing Queries (30 minutes)
1. Add `timesheetSubmissionByPayPeriod` query
2. Fix ClientsResolver registration

### Step 3: Schema Cleanup (1 hour)
1. Fix `UpdateTimeEntryInput` signature
2. Add field aliases to `SyncLogObjectType`
3. Expose `runningBalance` field

### Step 4: Test End-to-End (30 minutes)
1. Restart backend
2. Test mobile app with fresh build
3. Verify time entry creation works

### Step 5: Document and Review (30 minutes)
1. Document API changes
2. Update mobile if needed
3. Verify all 32 endpoints pass

**Total Estimated Time: 4-5 hours**

---

**Document Version:** 1.0  
**Last Updated:** April 14, 2026  
**Tested Against:** Backend @ http://localhost:3000/graphql  
**All Testing Done By:** 3 parallel agents (backend-tester-1, backend-tester-2, backend-tester-3)
