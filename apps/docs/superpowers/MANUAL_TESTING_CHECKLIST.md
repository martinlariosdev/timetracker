# Pay Period Feature - Manual Testing Checklist

**Date:** 2026-04-15  
**Feature:** Pay Period Integration for Timesheet Submissions  
**Status:** Ready for Manual Testing

## Prerequisites

✅ Backend tests passing (13/13 pay-period tests)  
✅ Mobile TypeScript compilation successful  
✅ All 17 implementation tasks complete

## Backend Testing

### 1. Verify Pay Periods Exist in Database

```bash
cd apps/backend
docker exec -it timetracker-mongo mongosh
use timetrack
db.pay_periods.find().pretty()
```

**Expected:**
- Multiple pay periods visible
- One period has `isCurrent: true`
- Semi-monthly periods (1-15, 16-end of month)

### 2. Test GraphQL API

```bash
npm run start:dev
```

Open `http://localhost:3000/graphql` and test:

**Query 1: Get Current Pay Period**
```graphql
query {
  currentPayPeriod {
    id
    startDate
    endDate
    displayText
    isCurrent
    deadlineDate
  }
}
```

**Query 2: Get Pay Period for Date**
```graphql
query {
  payPeriodForDate(date: "2026-04-10T00:00:00.000Z") {
    id
    displayText
    isCurrent
  }
}
```

**Query 3: Get Recent Pay Periods**
```graphql
query {
  payPeriods(limit: 10) {
    id
    displayText
    isCurrent
  }
}
```

## Mobile Testing

### 3. App Launch & Caching

- [ ] **Cold Start**: Open app, check console for `[PayPeriodContext]` logs
  - Should fetch pay periods from backend
  - Should save to AsyncStorage cache
- [ ] **Warm Start**: Kill and restart app
  - Should show "Using fresh cache" if cache < 24hrs old
  - Should still fetch fresh data in background
- [ ] **Offline Mode**: Enable airplane mode, restart app
  - Should load from cache with "Offline" indicator
  - Should show cached pay periods

### 4. Pay Period Selector

- [ ] **Display**: Selector shows current period by default
  - Blue pill button with period text (e.g., "April 1-15, 2026")
  - Chevron-down icon visible
- [ ] **Open Modal**: Tap selector
  - Bottom sheet modal slides up
  - Shows scrollable list of all periods
  - Current period has blue "Current" badge
  - Selected period has checkmark icon
- [ ] **Select Period**: Tap different period
  - Modal closes
  - Selector updates to show new period text
  - Selected period remembered

### 5. Week Strip Period Boundaries

Test around period boundaries (15th/16th of month):

- [ ] **Single Period Week**: Week entirely in one period
  - No divider line visible
  - No period labels shown
- [ ] **Boundary Week**: Week spans two periods (e.g., April 13-19)
  - Vertical divider line appears between dates at boundary
  - Period labels shown above dates ("April 1-15" | "April 16-30")
  - Divider styled correctly (gray, 80% height)

### 6. Time Entry - Period Locking

- [ ] **Draft Period**: Add entry in current/draft period
  - Form fully editable
  - Description and project fields enabled
  - Save button visible and functional
- [ ] **Submitted Period**: View entry from submitted period
  - Yellow "View Only - Timesheet Submitted" banner visible
  - Description field disabled (grayed out, 60% opacity)
  - Project/task field disabled
  - Save button hidden
  - Expand/collapse toggle hidden

### 7. Submit Button States

Test all submit button scenarios:

- [ ] **No Hours**: Current period, 0 hours logged
  - Button disabled (gray background)
  - Text: "No hours to submit"
- [ ] **Ready to Submit**: Current period, hours logged, not submitted
  - Button enabled (blue background)
  - Text: "Submit Timesheet"
  - Icon: send arrow
- [ ] **Past Period Selected**: Viewing past period
  - Button disabled (gray)
  - Text: "Select current period to submit"
- [ ] **Already Submitted**: Current period already submitted
  - Button disabled (gray)
  - Text: "Submitted on [date]" (e.g., "Submitted on 4/16/2026")

### 8. Timesheet Submission Flow

- [ ] **Submit Timesheet**: Select current period, add hours, tap submit
  - Confirmation dialog appears
  - After confirm: Success message
  - Button updates to "Submitted on [date]"
  - Entry form becomes read-only
- [ ] **Refresh After Submit**: Pull to refresh
  - Submission status persists
  - Button still shows "Submitted on [date]"

### 9. Real Pay Period IDs

Check Network tab or logs:

- [ ] **Time Entry Creation**: Create new entry
  - Verify `payPeriodId` in mutation is 24-char hex string (MongoDB ObjectID)
  - NOT starting with "pp-" (fake ID)
- [ ] **Time Entry Query**: Load week view
  - Query variables include real `payPeriodId`
  - Entries load correctly for selected period

## Edge Cases

### 10. Period Transitions

- [ ] **Period Ending Today**: If today is last day of period
  - Current period selector shows period ending today
  - Tomorrow, should switch to next period (requires backend cron job)

### 11. No Pay Periods

- [ ] **Empty Database**: Test with no pay periods in DB
  - App should show error message
  - Submit button disabled
  - Selector shows "Loading periods..."

### 12. Network Errors

- [ ] **Backend Down**: Stop backend, open app
  - Should fall back to cached periods
  - Error indicator visible
  - Offline mode works
- [ ] **Intermittent Network**: Slow/flaky connection
  - Graceful degradation
  - No crashes

## Performance

### 13. Cache Performance

- [ ] **Initial Load**: Measure time to first render with cache
  - Should be < 100ms from cache
- [ ] **Background Fetch**: Cache-first strategy
  - UI updates instantly from cache
  - Fresh data fetched in background

## Accessibility

### 14. Screen Readers

- [ ] **Selector**: VoiceOver announces "Select pay period"
- [ ] **Period List**: Each period announced as "Select [period text]"
- [ ] **Submit Button**: State announced (enabled/disabled)

## Regression Testing

### 15. Existing Features

- [ ] **Login Flow**: Login still works
- [ ] **Time Entry CRUD**: Create, read, update, delete entries
- [ ] **ETO Balance**: ETO features unaffected
- [ ] **Profile/Settings**: Other tabs work normally

## Sign-Off

**Tester:** __________________  
**Date:** __________________  
**Build/Commit:** __________________  

**Overall Status:**
- [ ] ✅ All tests passing - Ready for production
- [ ] ⚠️ Minor issues found - Document below
- [ ] ❌ Blocking issues - Cannot ship

**Issues Found:**

1. _______________________________________________________
2. _______________________________________________________
3. _______________________________________________________

**Notes:**

_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
