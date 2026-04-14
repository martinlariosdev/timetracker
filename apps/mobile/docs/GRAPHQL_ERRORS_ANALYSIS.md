# GraphQL Schema Mismatch Analysis

**Date:** April 14, 2026  
**Branch:** `fix/audit-sprint3-medium-priority`  
**Status:** 🔴 **CRITICAL - Multiple Schema Mismatches**

---

## Executive Summary

The TimeTrack mobile app has **critical GraphQL schema mismatches** between mobile queries and backend schema. These errors prevent core functionality from working properly.

**Impact:**
- ❌ Time entries cannot be fetched (field mismatches)
- ❌ Timesheet submissions fail (wrong query arguments)
- ❌ ETO transactions show wrong data type
- ❌ Multiple queries fail silently

**Root Cause:** Mobile app was developed with an outdated or assumed schema that doesn't match the actual backend GraphQL schema implemented in NestJS.

---

## Error Categories

### 1. Field Name Mismatches (TimeEntry)
### 2. Missing Fields (TimeEntry)
### 3. Type Mismatches (Date filters)
### 4. Query Argument Mismatches (TimesheetSubmission)

---

## Error #1: `lastModified` Field Does Not Exist

**Severity:** 🔴 CRITICAL (10/10)  
**Affected Queries:** TIME_ENTRIES_QUERY, TIME_ENTRY_QUERY, WEEK_TIME_ENTRIES_QUERY, ETO_REQUESTS_QUERY

### The Problem

**Mobile Query Requests:**
```graphql
query TimeEntries($filters: TimeEntryFiltersInput) {
  timeEntries(filters: $filters) {
    id
    consultantId
    date
    hours
    description
    category
    project
    payPeriodId
    syncStatus
    lastModified  # ❌ DOES NOT EXIST
    createdAt
    updatedAt
  }
}
```

**Backend Schema (Actual):**
```typescript
@ObjectType({ description: 'Time entry for tracking work hours' })
export class TimeEntryType {
  @Field(() => ID) id: string;
  @Field(() => ID) consultantId: string;
  @Field(() => ID) payPeriodId: string;
  @Field(() => Date) date: Date;
  @Field(() => String, { nullable: true }) projectTaskNumber?: string;
  @Field(() => String, { nullable: true }) clientName?: string;
  @Field(() => String, { nullable: true }) description?: string;
  @Field(() => Date, { nullable: true }) inTime1?: Date;
  @Field(() => Date, { nullable: true }) outTime1?: Date;
  @Field(() => Date, { nullable: true }) inTime2?: Date;
  @Field(() => Date, { nullable: true }) outTime2?: Date;
  @Field(() => Float) totalHours: number;
  @Field(() => Boolean) synced: boolean;
  @Field(() => Date) createdAt: Date;
  @Field(() => Date) updatedAt: Date;
  // ❌ NO lastModified field!
}
```

### Console Error

```
ERROR [GraphQL error]: Message: Cannot query field "lastModified" on type "TimeEntryType"
```

### Impact

- **Every time entry query fails completely**
- Timesheet screen cannot load entries
- Week view shows empty state
- Add entry "Duplicate Yesterday" fails
- Users cannot see their time entries

### Fix Required

**Option A (Recommended):** Remove `lastModified` from all queries

```diff
query TimeEntries($filters: TimeEntryFiltersInput) {
  timeEntries(filters: $filters) {
    id
    consultantId
    date
-   lastModified
    createdAt
    updatedAt
  }
}
```

**Option B:** Add `lastModified` to backend schema (if needed)

```typescript
@ObjectType()
export class TimeEntryType {
  // ... existing fields ...
  
  @Field(() => Date, { description: 'Last modification timestamp' })
  lastModified: Date;
}
```

Then update the Prisma model and database migration.

---

## Error #2: Field Name Mismatches (TimeEntry)

**Severity:** 🔴 CRITICAL (10/10)  
**Affected Queries:** All time entry queries

### The Problem

Mobile queries request fields that don't exist or have different names in the backend schema.

| Mobile Field | Backend Field | Status |
|--------------|---------------|--------|
| `hours` | `totalHours` | ❌ Name mismatch |
| `category` | *(does not exist)* | ❌ Missing |
| `project` | `projectTaskNumber` | ❌ Name mismatch |
| `syncStatus` | `synced` | ❌ Name + type mismatch |
| `description` | `description` | ✅ Matches |
| `date` | `date` | ✅ Matches |

### Console Errors

```
ERROR [GraphQL error]: Message: Cannot query field "hours" on type "TimeEntryType"
ERROR [GraphQL error]: Message: Cannot query field "category" on type "TimeEntryType"
ERROR [GraphQL error]: Message: Cannot query field "project" on type "TimeEntryType"
ERROR [GraphQL error]: Message: Cannot query field "syncStatus" on type "TimeEntryType"
```

### Backend Reality

```typescript
@Field(() => Float, { description: 'Total hours worked in this entry' })
totalHours: number;  // ← Mobile expects "hours"

@Field(() => String, { nullable: true, description: 'Project or task number (e.g., PROJ-123)' })
projectTaskNumber?: string;  // ← Mobile expects "project"

@Field(() => Boolean, { description: 'Whether this entry has been synced with the backend' })
synced: boolean;  // ← Mobile expects "syncStatus" (string)

// NO "category" field exists!
```

### Impact

- **All time entry queries fail**
- Cannot display hours worked
- Cannot show project names
- Cannot filter by category
- Sync status indicators broken

### Fix Required

**Mobile queries must be updated to match backend schema:**

```diff
query TimeEntries($filters: TimeEntryFiltersInput) {
  timeEntries(filters: $filters) {
    id
    consultantId
    payPeriodId
    date
-   hours
+   totalHours
    description
-   category
-   project
+   projectTaskNumber
+   clientName
-   syncStatus
-   lastModified
+   synced
    createdAt
    updatedAt
  }
}
```

**Then update mobile TypeScript interfaces:**

```typescript
// apps/mobile/app/(tabs)/index.tsx
interface TimeEntry {
  id: string;
  consultantId: string;
  payPeriodId: string;
  date: string;
  totalHours: number;           // was: hours
  description?: string;
  projectTaskNumber?: string;   // was: project
  clientName?: string;          // NEW
  synced: boolean;              // was: syncStatus (string)
  createdAt: string;
  updatedAt: string;
}
```

---

## Error #3: Date Filter Type Mismatch

**Severity:** 🟡 HIGH (8/10)  
**Affected Queries:** WEEK_TIME_ENTRIES_QUERY, filters in TIME_ENTRIES_QUERY

### The Problem

Mobile queries pass `startDate` and `endDate` as `String!` type, but backend likely expects `DateTime` type.

**Mobile Query:**
```graphql
query WeekTimeEntries($startDate: String!, $endDate: String!) {
  timeEntries(filters: { startDate: $startDate, endDate: $endDate }) {
    # ...
  }
}
```

**Backend Schema Expectation:**
```typescript
@InputType()
export class TimeEntryFiltersInput {
  @Field(() => Date, { nullable: true })
  startDate?: Date;  // ← Expects DateTime, not String
  
  @Field(() => Date, { nullable: true })
  endDate?: Date;
}
```

### Console Error

```
ERROR [GraphQL error]: Message: Variable "$startDate" of type "String!" used in position expecting type "DateTime"
ERROR [GraphQL error]: Message: Variable "$endDate" of type "String!" used in position expecting type "DateTime"
```

### Impact

- Week view queries fail
- "Duplicate Yesterday" feature fails
- Date range filtering doesn't work
- Backend may silently ignore filter or throw validation error

### Fix Required

**Option A (Recommended):** Change variable type to match backend

```diff
- query WeekTimeEntries($startDate: String!, $endDate: String!) {
+ query WeekTimeEntries($startDate: DateTime!, $endDate: DateTime!) {
    timeEntries(filters: { startDate: $startDate, endDate: $endDate }) {
      # ...
    }
  }
```

**But wait:** GraphQL doesn't have a built-in `DateTime` scalar. NestJS uses a custom `Date` scalar.

**Correct Fix:**

```graphql
query WeekTimeEntries($startDate: Date!, $endDate: Date!) {
  timeEntries(filters: { startDate: $startDate, endDate: $endDate }) {
    # ...
  }
}
```

**Mobile Code Update:**

```typescript
// apps/mobile/app/(tabs)/index.tsx (line ~520)
const { data, loading, error, refetch } = useAuthenticatedQuery(
  WEEK_TIME_ENTRIES_QUERY,
  {
    variables: {
      // Convert JS Date to ISO string - backend will parse it
      startDate: weekStart.toISOString(),
      endDate: weekEnd.toISOString(),
    },
  },
);
```

**OR keep String but ensure backend accepts ISO strings:**

Check backend resolver - it might already handle ISO string parsing. If so, just update the type declaration:

```graphql
query WeekTimeEntries($startDate: String!, $endDate: String!) {
  timeEntries(filters: { startDate: $startDate, endDate: $endDate }) {
    # ...
  }
}
```

And ensure filters input type accepts strings:

```typescript
@InputType()
export class TimeEntryFiltersInput {
  @Field(() => String, { nullable: true })  // Accept ISO string
  startDate?: string;
  
  @Field(() => String, { nullable: true })
  endDate?: string;
}
```

---

## Error #4: TimesheetSubmission Query Argument Mismatch

**Severity:** 🔴 CRITICAL (10/10)  
**File:** `lib/graphql/queries.ts:164`  
**Backend:** `apps/backend/src/timesheet/timesheet.resolver.ts`

### The Problem

Mobile query passes `payPeriodId` argument, but backend resolver expects `id`.

**Mobile Query (INCORRECT):**
```graphql
query TimesheetSubmissionByPayPeriod($payPeriodId: String!) {
  timesheetSubmissionByPayPeriod(payPeriodId: $payPeriodId) {
    id
    consultantId
    payPeriodId
    status
    submittedAt
    approvedAt
    approvedBy
    rejectedAt
    rejectedBy
    comments
    createdAt
    updatedAt
  }
}
```

**Backend Resolver (ACTUAL):**
```typescript
@Query(() => TimesheetSubmissionType)
async timesheetSubmission(
  @Args('id') id: string,  // ← Expects 'id', not 'payPeriodId'
  @CurrentUser() user: Consultant,
) {
  return this.timesheetService.findSubmissionById(id, user.id);
}
```

### Console Errors

```
ERROR [GraphQL error]: Message: Unknown argument "payPeriodId" on field "Query.timesheetSubmissionByPayPeriod"
ERROR [GraphQL error]: Message: Field "timesheetSubmission" argument "id" of type "String!" is required, but it was not provided
```

### Impact

- **Timesheet submission status cannot be fetched**
- UI cannot show "Submitted", "Approved", or "Rejected" badges
- Users cannot see approval status
- Submit button may allow duplicate submissions

### Fix Required

**Option A:** Update mobile query to use `id` argument

```graphql
query TimesheetSubmission($id: String!) {
  timesheetSubmission(id: $id) {
    id
    consultantId
    payPeriodId
    status
    submittedAt
    approvedAt
    approvedBy
    rejectedAt
    rejectedBy
    comments
    createdAt
    updatedAt
  }
}
```

**Problem:** Mobile doesn't know the submission ID, only the pay period ID.

**Option B (Recommended):** Add new backend query that accepts `payPeriodId`

```typescript
// Backend: apps/backend/src/timesheet/timesheet.resolver.ts
@Query(() => TimesheetSubmissionType, { nullable: true })
async timesheetSubmissionByPayPeriod(
  @Args('payPeriodId') payPeriodId: string,
  @CurrentUser() user: Consultant,
) {
  return this.timesheetService.findSubmissionByPayPeriod(payPeriodId, user.id);
}
```

Then implement the service method:

```typescript
// Backend: apps/backend/src/timesheet/timesheet.service.ts
async findSubmissionByPayPeriod(
  payPeriodId: string,
  consultantId: string,
): Promise<TimesheetSubmission | null> {
  return this.prisma.timesheetSubmission.findFirst({
    where: {
      payPeriodId,
      consultantId,
    },
    orderBy: { createdAt: 'desc' },
  });
}
```

---

## Error #5: Missing `totalHours` Field on TimesheetSubmissionType

**Severity:** 🔴 CRITICAL (10/10)  
**File:** `lib/graphql/mutations.ts:105`

### The Problem

Mobile mutation expects `totalHours` field in response, but backend schema doesn't have it.

**Mobile Mutation (INCORRECT):**
```graphql
mutation SubmitTimesheet($payPeriodId: String!) {
  submitTimesheet(payPeriodId: $payPeriodId) {
    id
    consultantId
    payPeriodId
    submittedAt
    status
    totalHours  # ❌ DOES NOT EXIST
  }
}
```

**Backend Schema (ACTUAL):**
```typescript
@ObjectType({ description: 'Timesheet submission for approval workflow' })
export class TimesheetSubmissionType {
  @Field(() => ID) id: string;
  @Field(() => ID) consultantId: string;
  @Field(() => ID) payPeriodId: string;
  @Field(() => String) status: string;
  @Field(() => Date, { nullable: true }) submittedAt?: Date;
  @Field(() => Date, { nullable: true }) approvedAt?: Date;
  @Field(() => String, { nullable: true }) approvedBy?: string;
  @Field(() => Date, { nullable: true }) rejectedAt?: Date;
  @Field(() => String, { nullable: true }) rejectedBy?: string;
  @Field(() => String, { nullable: true }) comments?: string;
  @Field(() => Date) createdAt: Date;
  @Field(() => Date) updatedAt: Date;
  // ❌ NO totalHours field!
}
```

### Console Error

```
ERROR [GraphQL error]: Message: Cannot query field "totalHours" on type "TimesheetSubmissionType"
```

### Impact

- **Timesheet submission mutation fails**
- Users cannot submit timesheets
- Submit button appears broken
- Core workflow is blocked

### Fix Required

**Option A (Recommended):** Remove `totalHours` from mobile mutation

```diff
mutation SubmitTimesheet($payPeriodId: String!) {
  submitTimesheet(payPeriodId: $payPeriodId) {
    id
    consultantId
    payPeriodId
    submittedAt
    status
-   totalHours
  }
}
```

If total hours is needed for UI, calculate it client-side from time entries.

**Option B:** Add computed field to backend

```typescript
@ObjectType()
export class TimesheetSubmissionType {
  // ... existing fields ...
  
  @Field(() => Float, { description: 'Total hours in this submission' })
  totalHours: number;
}
```

Then compute it in the resolver by summing time entries for that pay period.

---

## Error #6: ETO Wrong Data Type (Medium Priority)

**Severity:** 🟡 MEDIUM (6/10)  
**File:** `app/(tabs)/eto.tsx:384-413`

### The Problem

ETO screen queries `ETO_REQUESTS_QUERY` but displays it as transaction history. These are different data types:

- **ETO Requests** = Future time off requests ("Vacation on May 1-5")
- **ETO Transactions** = Historical accrual/usage ("Accrued 3.84 hrs on March 31")

**Current Code:**
```typescript
const {
  data: transactionsData,
  loading: transactionsLoading,
  error: transactionsError,
} = useAuthenticatedQuery(ETO_REQUESTS_QUERY, {  // ← Wrong query!
  variables: { filters: {} },
});

// Maps requests to transactions (doesn't make sense)
const transactions: ETOTransaction[] = useMemo(() => {
  if (transactionsData?.etoRequests?.length > 0) {
    return transactionsData.etoRequests.map((req: any) => ({
      id: req.id,
      date: req.startDate || req.requestDate,
      hours: req.status === 'approved' ? -req.hours : req.hours,
      transactionType: req.reason || 'ETO Request',
      description: req.comments || req.reason || '',
      runningBalance: undefined,  // ❌ Cannot calculate!
    }));
  }
  return MOCK_TRANSACTIONS;  // Falls back to mock data
}, [transactionsData]);
```

### Backend Reality

There is an `ETO_TRANSACTIONS_QUERY` query that returns proper transaction history:

```graphql
query ETOTransactions($consultantId: ID!, $limit: Int, $offset: Int) {
  etoTransactions(consultantId: $consultantId, limit: $limit, offset: $offset) {
    id
    consultantId
    date
    hours
    transactionType
    description
    projectName
    synced
    runningBalance  # ✅ Proper running balance!
    createdAt
  }
}
```

### Fix Required

Use the correct query:

```diff
const {
  data: transactionsData,
  loading: transactionsLoading,
  error: transactionsError,
  refetch: refetchTransactions,
-} = useAuthenticatedQuery(ETO_REQUESTS_QUERY, {
-  variables: { filters: {} },
+} = useAuthenticatedQuery(ETO_TRANSACTIONS_QUERY, {
+  variables: {
+    consultantId: user?.id || '',
+    limit: 50,
+    offset: 0,
+  },
});

const transactions: ETOTransaction[] = useMemo(() => {
-  if (transactionsData?.etoRequests?.length > 0) {
-    return transactionsData.etoRequests.map((req: any) => ({ ... }));
+  if (transactionsData?.etoTransactions?.length > 0) {
+    return transactionsData.etoTransactions;
  }
  return MOCK_TRANSACTIONS;
}, [transactionsData]);
```

---

## Summary of All Fixes Required

### Mobile GraphQL Queries (`lib/graphql/queries.ts`)

1. **Remove `lastModified` field** from:
   - TIME_ENTRIES_QUERY (line 53)
   - TIME_ENTRY_QUERY (line 75)
   - WEEK_TIME_ENTRIES_QUERY (line 142)
   - ETO_REQUESTS_QUERY (line 100)

2. **Rename fields** in all time entry queries:
   - `hours` → `totalHours`
   - `project` → `projectTaskNumber`
   - `syncStatus` → `synced`
   - Add `clientName`
   - Remove `category` (doesn't exist in backend)

3. **Fix date filter types** in WEEK_TIME_ENTRIES_QUERY:
   - Keep as `String!` if backend accepts ISO strings
   - OR change to backend's custom Date scalar type

4. **Fix TimesheetSubmission query**:
   - Either rename to use `id` argument
   - OR add new backend resolver for `payPeriodId` lookup

### Mobile GraphQL Mutations (`lib/graphql/mutations.ts`)

1. **Remove `totalHours`** from SUBMIT_TIMESHEET_MUTATION (line 105)

2. **Update field names** in all time entry mutations:
   - Same changes as queries (hours → totalHours, etc.)

### Mobile TypeScript Interfaces

Update all interfaces to match backend schema:

```typescript
interface TimeEntry {
  id: string;
  consultantId: string;
  payPeriodId: string;
  date: string;
  projectTaskNumber?: string;  // was: project
  clientName?: string;         // NEW
  description?: string;
  inTime1?: string;            // NEW
  outTime1?: string;           // NEW
  inTime2?: string;            // NEW
  outTime2?: string;           // NEW
  totalHours: number;          // was: hours
  synced: boolean;             // was: syncStatus (string)
  createdAt: string;
  updatedAt: string;
}
```

### Backend (Optional Additions)

**If mobile needs these features:**

1. Add `timesheetSubmissionByPayPeriod` resolver
2. Consider adding `lastModified` field if sync conflict detection needs it
3. Consider adding `totalHours` computed field on TimesheetSubmissionType

---

## Testing Checklist

After fixes applied:

- [ ] TIME_ENTRIES_QUERY returns data without errors
- [ ] WEEK_TIME_ENTRIES_QUERY works with date filters
- [ ] Timesheet screen displays entries correctly
- [ ] "Duplicate Yesterday" feature works
- [ ] Delete entry mutation works
- [ ] Submit timesheet mutation works
- [ ] Timesheet submission status displays
- [ ] ETO transactions show proper history (not requests)
- [ ] No GraphQL errors in Metro console
- [ ] All TypeScript compilation errors resolved

---

## Priority Order

1. **P0 (Blocking):** Fix TimeEntry field mismatches - core app broken
2. **P0 (Blocking):** Remove `lastModified` - all queries fail
3. **P1 (Critical):** Fix TimesheetSubmission query - submissions broken
4. **P1 (Critical):** Remove `totalHours` from mutation - can't submit
5. **P2 (Important):** Fix date filter types - week view broken
6. **P3 (Nice to have):** Fix ETO data type - shows mock data currently

---

**Document Version:** 1.0  
**Last Updated:** April 14, 2026  
**Status:** 🔴 Awaiting Implementation
