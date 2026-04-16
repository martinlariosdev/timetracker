# Pay Period Feature Design

**Date:** 2026-04-15  
**Status:** Approved  
**Approach:** Comprehensive Pay Period API (Approach A)

## Problem Statement

Mobile app currently generates fake payPeriodIds like `"pp-2026-04-13"` (strings), but the backend expects MongoDB ObjectIDs. This causes timesheet submission to fail with "Malformed ObjectID" errors. The backend already has a PayPeriod model and logic, but no GraphQL API exposes it to mobile clients.

## Goals

1. Enable timesheet submission by providing real pay period IDs to mobile
2. Allow users to view and browse past pay periods (read-only for submitted)
3. Show clear visual indicators when a week spans multiple pay periods
4. Lock time entries in submitted/approved periods
5. Provide offline support through pay period caching

## Requirements Summary

1. **Pay Period Structure:** Semi-monthly (1st-15th, 16th-end of month)
2. **Default View:** Show pay period containing today's date (note: `isCurrent` flag on backend should always match the period containing today)
3. **Past Periods:** Allow viewing (read-only for submitted/approved)
4. **Week Spanning Periods:** Show visual split when week crosses period boundary
5. **Editing Rules:** Submitted periods are locked (read-only)

## Architecture Overview

### System Components

1. **Backend PayPeriod Module** (new)
   - GraphQL resolver exposing pay period queries
   - Service layer for pay period business logic
   - Reuses existing Prisma PayPeriod model

2. **Mobile PayPeriod Context** (new)
   - React context caching pay periods in memory and AsyncStorage
   - Provides hooks: `useCurrentPayPeriod()`, `usePayPeriodForDate(date)`
   - Refreshes cache on app startup and manual refresh

3. **Modified Timesheet Screen**
   - Week strip detects and displays period boundaries
   - Pay period selector in header (dropdown)
   - Submit button validates against pay period status
   - Entry forms locked for submitted periods

### Key Flow

```
App Launch
  → Fetch pay periods (current + past 6 months)
  → Cache in context (memory + AsyncStorage)

User Views Week
  → Context returns pay period(s) for dates in week
  → UI shows visual boundary if week spans periods

User Adds Entry
  → Uses real payPeriodId from context
  → Form validates period is editable

User Submits
  → Validates period is current & not submitted
  → Creates submission with real payPeriodId
```

## Data Model & API

### Backend GraphQL Schema Additions

```graphql
type PayPeriodType {
  id: ID!
  startDate: DateTime!
  endDate: DateTime!
  displayText: String!       # "April 1-15, 2026"
  isCurrent: Boolean!
  deadlineDate: DateTime
}

extend type Query {
  """Get the current pay period (marked isCurrent: true)"""
  currentPayPeriod: PayPeriodType!
  
  """Get the pay period that contains a specific date"""
  payPeriodForDate(date: DateTime!): PayPeriodType!
  
  """Get recent pay periods (for browsing history)"""
  payPeriods(limit: Int): [PayPeriodType!]!
}
```

### Backend Service Layer

**PayPeriodService** (new file: `src/pay-period/pay-period.service.ts`)

Methods:
- `getCurrentPayPeriod(): Promise<PayPeriod>` - Returns period with `isCurrent: true`
- `getPayPeriodForDate(date: Date): Promise<PayPeriod>` - Finds period containing date
- `getPayPeriods(limit?: number): Promise<PayPeriod[]>` - Returns recent periods, sorted desc

Error Handling:
- Throws `NotFoundException` if no period found
- Logs warning if multiple current periods detected
- Returns most recent by startDate if ambiguous

### Backend Resolver

**PayPeriodResolver** (new file: `src/pay-period/pay-period.resolver.ts`)

Queries:
- `@Query(() => PayPeriodType) currentPayPeriod()`
- `@Query(() => PayPeriodType) payPeriodForDate(@Args('date') date: Date)`
- `@Query(() => [PayPeriodType]) payPeriods(@Args('limit', { nullable: true }) limit?: number)`

All queries require authentication via `@UseGuards(JwtAuthGuard)`.

### Mobile GraphQL Queries

**File:** `lib/graphql/queries.ts`

```typescript
export const FETCH_PAY_PERIODS_QUERY = gql`
  query FetchPayPeriods($limit: Int) {
    payPeriods(limit: $limit) {
      id
      startDate
      endDate
      displayText
      isCurrent
      deadlineDate
    }
  }
`;

export const CURRENT_PAY_PERIOD_QUERY = gql`
  query CurrentPayPeriod {
    currentPayPeriod {
      id
      startDate
      endDate
      displayText
      isCurrent
      deadlineDate
    }
  }
`;

export const PAY_PERIOD_FOR_DATE_QUERY = gql`
  query PayPeriodForDate($date: DateTime!) {
    payPeriodForDate(date: $date) {
      id
      startDate
      endDate
      displayText
      isCurrent
      deadlineDate
    }
  }
`;
```

### Mobile PayPeriod Context

**File:** `contexts/PayPeriodContext.tsx`

```typescript
interface PayPeriod {
  id: string;
  startDate: string;     // ISO format
  endDate: string;       // ISO format
  displayText: string;
  isCurrent: boolean;
  deadlineDate: string | null;
}

interface PayPeriodContextState {
  payPeriods: PayPeriod[];
  currentPayPeriod: PayPeriod | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Hooks exported
usePayPeriodContext(): PayPeriodContextState
useCurrentPayPeriod(): PayPeriod | null
usePayPeriodForDate(date: Date): PayPeriod | null
usePayPeriodsForWeek(dates: Date[]): PayPeriod[]
```

**Behavior:**
- Fetches `payPeriods(limit: 20)` on mount (~10 months of semi-monthly periods)
- Caches in memory and AsyncStorage (key: `pay_periods_cache`)
- Cache expires after 24 hours
- On network error, falls back to cached data with "Offline" indicator
- `refresh()` method for manual refresh (pull-to-refresh)

## UI/UX Changes

### 1. Timesheet Screen Header

**Pay Period Selector** (new component)
- Display current pay period as pill button: `"April 1-15, 2026"` with chevron-down icon
- Tapping opens modal with scrollable list of recent periods
- List items show:
  - Period display text
  - Status badge: "Current", "Submitted ✓", "Approved ✓", "Rejected"
  - Deadline date (if set): "Due Apr 20"
- Current period highlighted with blue background
- Selecting period updates entire screen view

**Visual Location:**
- Below profile header, above week strip
- Horizontal layout: `[← Today] [April 1-15, 2026 ▼]`

### 2. Week Strip Enhancements

**Period Boundary Visual:**
- When week spans two periods, show vertical divider line between dates
- Color: `#D1D5DB` (gray-300), height: 80% of date card
- Labels on each side: `"Apr 1-15"` (small, gray text above dates)

**Date Card Styling:**
- Dates in past submitted periods: slight opacity reduction (0.7)
- Dates in current period: full opacity, normal styling
- Today indicator: blue outline, works across period boundary

**Interaction:**
- Tapping date in locked period: shows toast "Cannot edit - period submitted"
- Tapping date in editable period: navigates to add/edit screen as usual

### 3. Add/Edit Entry Screen

**Read-Only Mode:**
- Triggered when viewing entry in submitted/approved period
- Banner at top: "🔒 View Only - Timesheet Submitted"
- All form fields disabled (grayed out)
- Save/Delete buttons hidden
- Back button only action available

**Editable Mode:**
- Triggered for draft or rejected periods
- Date picker: only shows dates within selected pay period
- If period is rejected: info banner "Timesheet was rejected - edit and resubmit"

### 4. Submit Timesheet Button

**State-Based Behavior:**

| Period State | Button State | Button Text | Action |
|--------------|--------------|-------------|--------|
| Current, not submitted | Enabled | "Submit Timesheet" | Opens submit confirmation |
| Current, submitted | Disabled | "Submitted on Apr 16" | No action |
| Past, not submitted | Disabled | "Cannot submit past period" | No action |
| Past, submitted/approved | Disabled | "View Submission" | Navigate to submission details |
| Not viewing current | Disabled | "Select current period to submit" | No action |

**Visual:**
- Enabled: Blue background, white text
- Disabled: Gray background, gray text
- Status text below button shows reason for disabled state

### 5. Loading & Error States

**App Startup:**
- Shimmer placeholder for pay period selector
- Week strip shows skeleton cards
- After load: animate in real data

**Network Error:**
- Show cached periods with "Offline" badge in header
- Pull-to-refresh shows error toast: "Could not fetch latest periods"
- Add Entry screen shows warning banner if using stale cache

**No Periods Found:**
- Error banner in timesheet screen: "⚠️ Pay periods not configured. Contact support."
- Add Entry button disabled
- Submit button disabled

**Cache States:**
- Fresh (< 24 hrs old): no indicator
- Stale (> 24 hrs old): yellow "⚠️ Using cached data" badge
- Offline: gray "📡 Offline" badge

## Error Handling & Edge Cases

### Backend Error Scenarios

1. **No pay period found for date**
   - Throw `NotFoundException`: "No pay period found for date {date}"
   - HTTP 404 response
   - Mobile shows: "This date is not in any pay period"

2. **Multiple current pay periods**
   - Service layer detects on query
   - Log error: "Multiple periods marked as current"
   - Return most recent by startDate
   - Admin notification (future enhancement)
   - Note: Backend should have a cron job or seed script that ensures `isCurrent` always points to the period containing today's date

3. **Pay period gaps**
   - Validation on period creation: startDate must equal previous endDate + 1 day
   - Seed script ensures no gaps
   - If gap detected: return 400 with clear error message

4. **Database connection failure**
   - Return 503 Service Unavailable
   - Mobile falls back to cache

### Mobile Error Scenarios

1. **Network failure on app launch**
   - Check AsyncStorage for cached periods
   - If found: use cache, show "Offline - using cached data" banner
   - If not found: show full error screen with retry button
   - Pull-to-refresh triggers retry

2. **Date falls in period gap**
   - `usePayPeriodForDate()` returns null
   - Show error toast: "This date is not in any pay period"
   - Disable add entry button for that date
   - Week strip shows date with red outline

3. **User tries to edit submitted period**
   - Entry form opens in read-only mode
   - Edit button hidden
   - Toast on tap: "Cannot edit submitted timesheet"

4. **Week spans 3+ periods (edge case)**
   - Should never happen with semi-monthly structure
   - If detected: show warning, split week visually
   - Log error to monitoring service

5. **Pay period selector empty**
   - Show error screen: "No pay periods available"
   - Button: "Retry" calls refresh()
   - Contact support link

### Cache Invalidation Strategy

**Refresh Triggers:**
- App startup (foreground)
- Pull-to-refresh on timesheet screen
- Manual refresh button (future: settings screen)
- After 24 hours since last fetch

**Cache Storage:**
- Key: `pay_periods_cache`
- Value: `{ periods: PayPeriod[], fetchedAt: ISO timestamp }`
- Stored in AsyncStorage
- Max size: 20 periods (~10 months)

**Offline Behavior:**
- If fetch fails, use cache regardless of age
- Show "Offline" indicator
- Retry on next app launch or manual refresh

## Testing Strategy

### Backend Tests

**PayPeriodService Unit Tests** (`pay-period.service.spec.ts`)
- `getCurrentPayPeriod()` returns period with `isCurrent: true`
- `getCurrentPayPeriod()` throws NotFoundException if none found
- `getPayPeriodForDate()` finds correct period by date range
- `getPayPeriodForDate()` handles boundary dates (1st, 15th, 16th, last day)
- `getPayPeriodForDate()` throws NotFoundException if no match
- `getPayPeriods()` returns limited results, sorted by startDate desc
- `getPayPeriods()` handles empty database
- Multiple current periods: logs warning, returns most recent

**PayPeriodResolver Tests** (`pay-period.resolver.spec.ts`)
- GraphQL queries return correct schema format
- Authentication required for all queries
- Error responses formatted correctly (404, 400, etc.)
- Limit parameter validation in `payPeriods` query

**Integration Tests**
- Time entry creation validates payPeriodId exists
- Timesheet submission blocked for non-current periods
- Date range queries respect pay period boundaries
- Seed script creates valid period structure

### Mobile Tests

**PayPeriodContext Tests**
- Fetches periods on mount
- Caches to AsyncStorage
- `useCurrentPayPeriod()` returns period with isCurrent: true
- `usePayPeriodForDate()` returns correct period for date
- `usePayPeriodsForWeek()` returns all periods for week dates
- Network error: falls back to cache
- Cache expiry: refetches after 24 hours
- Handles empty API response

**Timesheet Screen Tests**
- Week strip shows period boundary divider when dates span periods
- Week strip labels show correct period ranges
- Submit button disabled for non-current periods
- Submit button disabled for submitted periods
- Pay period selector shows correct list
- Selecting period updates week display
- Locked entries show read-only indicator

**Add Entry Screen Tests**
- Form disabled when viewing entry in submitted period
- Banner shows "View Only" for locked entries
- Date picker restricted to selected pay period dates
- Save uses correct payPeriodId
- Error handling for missing pay period

**PayPeriod Selector Modal Tests**
- Displays all cached periods
- Highlights current period
- Shows status badges correctly
- Selecting period updates context
- Closes on selection or backdrop tap

### Manual Testing Checklist

- [ ] App launch fetches and displays current period
- [ ] Week strip shows divider when spanning periods (test around 15th/16th)
- [ ] Period labels appear above week strip sections
- [ ] Cannot add/edit entries in submitted period
- [ ] Submit button only enabled for current period
- [ ] Submit button text updates based on period state
- [ ] Pay period selector opens and closes
- [ ] Selecting past period shows entries from that period
- [ ] Submitted period shows status badge
- [ ] Offline mode uses cached periods
- [ ] Pull-to-refresh updates period list
- [ ] Cache expiry triggers refetch after 24 hours
- [ ] Toast appears when tapping locked entry date
- [ ] Today indicator works across period boundary

## Implementation Notes

### Migration Strategy

1. **Backend First**
   - Add PayPeriod module (service + resolver)
   - Deploy to staging, verify queries work
   - Run seed script to ensure periods exist

2. **Mobile Context**
   - Add PayPeriodContext and hooks
   - Wire up to existing timesheet screen (replace fake IDs)
   - Test with backend staging environment

3. **Mobile UI Enhancements**
   - Add pay period selector component
   - Enhance week strip with boundary detection
   - Update add/edit screen with locking logic
   - Update submit button state logic

4. **Testing & Rollout**
   - Complete test coverage on both sides
   - Beta test with small user group
   - Monitor for errors in production
   - Full rollout

### Backwards Compatibility

- Mobile app version check: require backend v2.0+ for pay period support
- Graceful degradation: if backend doesn't support queries, show error message
- Fake payPeriodIds removed completely once deployed

### Performance Considerations

- Cache 20 periods (~10 months) to minimize API calls
- Use memo hooks to avoid re-computing period for same date
- AsyncStorage read on app launch should be < 50ms
- Week strip boundary detection runs on date change (memoized)

### Future Enhancements (Out of Scope)

- Admin UI for managing pay periods
- Automatic period creation and `isCurrent` flag update (cron job running daily)
- Pay period calendar view (full month grid)
- Bulk entry operations within period
- Period-based reporting and analytics
- Custom period structures (configurable by organization)

### Clarifications

**Current Period Definition:**
The "current period" refers to the pay period that contains today's date. The backend's `isCurrent: true` flag should always be set on the period that contains the current date. For implementation:
- Backend seed script sets `isCurrent` based on date ranges at creation time
- Future enhancement: cron job updates `isCurrent` flag daily to ensure it stays accurate
- Mobile uses `currentPayPeriod` query which returns period with `isCurrent: true`
- If backend `isCurrent` flag is stale, mobile can fall back to `payPeriodForDate(date: today)`

## Success Metrics

1. **Timesheet submission works** - No more "Malformed ObjectID" errors
2. **Users understand periods** - Visual boundaries reduce confusion
3. **Past period browsing** - Users can view historical timesheets
4. **Offline resilience** - App works with cached periods when offline
5. **Performance** - Pay period lookup < 10ms, cache hit rate > 95%

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Pay period gaps in database | Validation on creation, seed script ensures coverage |
| Multiple current periods | Service layer detects and logs, returns most recent |
| Large cache size | Limit to 20 periods, prune old data |
| Network failure on launch | Use cached periods, show offline indicator |
| Users confused by period boundary | Clear visual divider and labels in week strip |
| Submit button states unclear | Descriptive text below button explains state |

## Open Questions

None - all requirements clarified during design phase.
