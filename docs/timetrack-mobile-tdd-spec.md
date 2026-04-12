# TimeTrack Mobile App - TDD Specification
**Version:** 1.0  
**Date:** April 10, 2026  
**Purpose:** Test-Driven Development specification for TimeTrack mobile application

---

## Table of Contents
1. [Testing Strategy](#testing-strategy)
2. [Unit Tests](#unit-tests)
3. [Integration Tests](#integration-tests)
4. [E2E Tests](#e2e-tests)
5. [Test Scenarios by Feature](#test-scenarios-by-feature)

---

## Testing Strategy

### Test Pyramid
```
           E2E Tests (10%)
      ╱─────────────────╲
     Integration Tests (30%)
   ╱─────────────────────────╲
  Unit Tests (60%)
╱─────────────────────────────╲
```

### Testing Tools (Recommendations)
- **Unit:** Jest + Testing Library (React Native) or JUnit (Android) / XCTest (iOS)
- **Integration:** Supertest (API), Jest
- **E2E:** Detox (React Native), Appium, or native frameworks
- **Mocking:** MSW (Mock Service Worker) for API mocking
- **Coverage Target:** 80%+ overall, 90%+ for critical paths

---

## 1. Unit Tests

### 1.1 Authentication Module

#### Test: Okta OAuth Flow Initialization
```typescript
describe('OktaAuth', () => {
  test('should initialize OAuth config with correct parameters', () => {
    const config = initializeOktaAuth();
    
    expect(config.issuer).toBe('https://number8.okta.com');
    expect(config.clientId).toBeDefined();
    expect(config.redirectUri).toBeDefined();
    expect(config.scopes).toContain('openid');
    expect(config.scopes).toContain('profile');
  });

  test('should handle OAuth redirect response', async () => {
    const mockTokens = {
      accessToken: 'mock-access-token',
      idToken: 'mock-id-token',
      refreshToken: 'mock-refresh-token'
    };
    
    const result = await handleOAuthCallback(mockRedirectUrl);
    
    expect(result.accessToken).toBeDefined();
    expect(result.idToken).toBeDefined();
  });

  test('should store tokens securely', async () => {
    const tokens = {
      accessToken: 'test-token',
      refreshToken: 'test-refresh'
    };
    
    await storeTokens(tokens);
    
    const retrieved = await getStoredTokens();
    expect(retrieved.accessToken).toBe(tokens.accessToken);
  });

  test('should refresh expired tokens', async () => {
    mockTokenExpiry(true);
    
    const refreshed = await refreshAccessToken();
    
    expect(refreshed.accessToken).not.toBe(oldToken);
    expect(isTokenExpired(refreshed.accessToken)).toBe(false);
  });
});
```

#### Test: Session Management
```typescript
describe('SessionManager', () => {
  test('should detect expired session', () => {
    const expiredToken = createExpiredToken();
    
    const isExpired = SessionManager.isExpired(expiredToken);
    
    expect(isExpired).toBe(true);
  });

  test('should clear session on logout', async () => {
    await SessionManager.login(mockCredentials);
    await SessionManager.logout();
    
    const session = await SessionManager.getCurrent();
    expect(session).toBeNull();
  });

  test('should restore session from secure storage', async () => {
    const mockSession = createMockSession();
    await secureStorage.save('session', mockSession);
    
    const restored = await SessionManager.restore();
    
    expect(restored.consultantId).toBe(mockSession.consultantId);
  });
});
```

---

### 1.2 Time Entry Module

#### Test: Time Entry Validation
```typescript
describe('TimeEntry Validation', () => {
  test('should validate required fields', () => {
    const invalidEntry = {
      date: null,
      client: '',
      description: ''
    };
    
    const errors = validateTimeEntry(invalidEntry);
    
    expect(errors).toContainEqual({ field: 'date', message: 'Date is required' });
    expect(errors).toContainEqual({ field: 'client', message: 'Client is required' });
    expect(errors).toContainEqual({ field: 'description', message: 'Description is required' });
  });

  test('should validate time ranges', () => {
    const entry = {
      inTime1: '12:00',
      outTime1: '08:00' // Invalid: out before in
    };
    
    const errors = validateTimeEntry(entry);
    
    expect(errors).toContainEqual({ 
      field: 'outTime1', 
      message: 'Out time must be after in time' 
    });
  });

  test('should calculate total hours correctly', () => {
    const entry = {
      inTime1: '08:00',
      outTime1: '12:00',
      inTime2: '13:00',
      outTime2: '17:00'
    };
    
    const total = calculateTotalHours(entry);
    
    expect(total).toBe(8.0);
  });

  test('should handle single time block', () => {
    const entry = {
      inTime1: '09:00',
      outTime1: '17:00',
      inTime2: null,
      outTime2: null
    };
    
    const total = calculateTotalHours(entry);
    
    expect(total).toBe(8.0);
  });

  test('should reject overlapping time blocks', () => {
    const entry = {
      inTime1: '08:00',
      outTime1: '13:00',
      inTime2: '12:00', // Overlaps with first block
      outTime2: '17:00'
    };
    
    const errors = validateTimeEntry(entry);
    
    expect(errors).toContainEqual({ 
      field: 'inTime2', 
      message: 'Time blocks cannot overlap' 
    });
  });

  test('should validate date within current period', () => {
    const entry = {
      date: '2026-03-15', // Outside current period (04/01-04/15)
      periodId: 741
    };
    
    const errors = validateTimeEntry(entry, currentPeriod);
    
    expect(errors).toContainEqual({ 
      field: 'date', 
      message: 'Date must be within selected period' 
    });
  });
});
```

#### Test: Time Entry CRUD Operations
```typescript
describe('TimeEntry CRUD', () => {
  let timeEntryRepo;

  beforeEach(() => {
    timeEntryRepo = new TimeEntryRepository(mockDb);
  });

  test('should create time entry', async () => {
    const entry = createValidTimeEntry();
    
    const created = await timeEntryRepo.create(entry);
    
    expect(created.id).toBeDefined();
    expect(created.date).toBe(entry.date);
  });

  test('should read time entry by ID', async () => {
    const entry = await timeEntryRepo.create(createValidTimeEntry());
    
    const retrieved = await timeEntryRepo.findById(entry.id);
    
    expect(retrieved).toEqual(entry);
  });

  test('should update time entry', async () => {
    const entry = await timeEntryRepo.create(createValidTimeEntry());
    entry.description = 'Updated description';
    
    const updated = await timeEntryRepo.update(entry);
    
    expect(updated.description).toBe('Updated description');
  });

  test('should delete time entry', async () => {
    const entry = await timeEntryRepo.create(createValidTimeEntry());
    
    await timeEntryRepo.delete(entry.id);
    
    const retrieved = await timeEntryRepo.findById(entry.id);
    expect(retrieved).toBeNull();
  });

  test('should list entries for period', async () => {
    await timeEntryRepo.create({ ...createValidTimeEntry(), date: '2026-04-01' });
    await timeEntryRepo.create({ ...createValidTimeEntry(), date: '2026-04-02' });
    
    const entries = await timeEntryRepo.findByPeriod(741);
    
    expect(entries).toHaveLength(2);
  });
});
```

---

### 1.3 ETO Module

#### Test: ETO Balance Calculation
```typescript
describe('ETO Balance', () => {
  test('should calculate current balance', () => {
    const transactions = [
      { type: 'accrued', hours: 40, date: '2026-01-01' },
      { type: 'used', hours: 8, date: '2026-02-01' },
      { type: 'accrued', hours: 2, date: '2026-03-01' }
    ];
    
    const balance = calculateETOBalance(transactions);
    
    expect(balance).toBe(34); // 40 - 8 + 2
  });

  test('should get balance as of date', () => {
    const transactions = [
      { type: 'accrued', hours: 40, date: '2026-01-01' },
      { type: 'used', hours: 8, date: '2026-02-01' },
      { type: 'accrued', hours: 2, date: '2026-03-01' }
    ];
    
    const balance = calculateETOBalanceAsOf(transactions, '2026-02-01');
    
    expect(balance).toBe(32); // 40 - 8 (doesn't include March accrual)
  });

  test('should handle negative balance', () => {
    const transactions = [
      { type: 'accrued', hours: 8, date: '2026-01-01' },
      { type: 'used', hours: 16, date: '2026-02-01' }
    ];
    
    const balance = calculateETOBalance(transactions);
    
    expect(balance).toBe(-8);
  });
});
```

---

### 1.4 Offline Sync Module

#### Test: Sync Queue Management
```typescript
describe('Sync Queue', () => {
  let syncQueue;

  beforeEach(() => {
    syncQueue = new SyncQueue();
  });

  test('should enqueue operations while offline', async () => {
    const operation = {
      type: 'CREATE',
      entity: 'TimeEntry',
      data: createValidTimeEntry()
    };
    
    await syncQueue.enqueue(operation);
    
    const pending = await syncQueue.getPending();
    expect(pending).toHaveLength(1);
    expect(pending[0]).toEqual(operation);
  });

  test('should process queue when back online', async () => {
    await syncQueue.enqueue({ type: 'CREATE', entity: 'TimeEntry', data: mockEntry });
    
    mockNetworkOnline();
    await syncQueue.process();
    
    const pending = await syncQueue.getPending();
    expect(pending).toHaveLength(0);
  });

  test('should handle sync conflicts', async () => {
    const localEntry = { id: 1, description: 'Local', modifiedAt: '2026-04-10T10:00:00Z' };
    const serverEntry = { id: 1, description: 'Server', modifiedAt: '2026-04-10T11:00:00Z' };
    
    const resolved = resolveSyncConflict(localEntry, serverEntry, 'SERVER_WINS');
    
    expect(resolved.description).toBe('Server');
  });

  test('should retry failed operations', async () => {
    const operation = { type: 'CREATE', entity: 'TimeEntry', data: mockEntry };
    await syncQueue.enqueue(operation);
    
    mockApiError(500); // First attempt fails
    await syncQueue.process();
    
    const pending = await syncQueue.getPending();
    expect(pending[0].retryCount).toBe(1);
  });

  test('should preserve operation order', async () => {
    await syncQueue.enqueue({ type: 'CREATE', data: { id: 1 } });
    await syncQueue.enqueue({ type: 'UPDATE', data: { id: 1 } });
    await syncQueue.enqueue({ type: 'DELETE', data: { id: 1 } });
    
    const pending = await syncQueue.getPending();
    
    expect(pending[0].type).toBe('CREATE');
    expect(pending[1].type).toBe('UPDATE');
    expect(pending[2].type).toBe('DELETE');
  });
});
```

---

### 1.5 Notification Module

#### Test: Deadline Reminders
```typescript
describe('Deadline Notifications', () => {
  test('should schedule notification for 7th of month', () => {
    const notification = scheduleDeadlineNotification('7th');
    
    expect(notification.date.getDate()).toBe(7);
    expect(notification.time).toBe('09:00');
    expect(notification.title).toContain('Timesheet Due');
  });

  test('should schedule notification for 22nd of month', () => {
    const notification = scheduleDeadlineNotification('22nd');
    
    expect(notification.date.getDate()).toBe(22);
    expect(notification.time).toBe('09:00');
  });

  test('should reschedule for next month if date passed', () => {
    // Current date: April 8, 2026
    const notification = scheduleDeadlineNotification('7th');
    
    expect(notification.date.getMonth()).toBe(4); // May (0-indexed)
    expect(notification.date.getDate()).toBe(7);
  });

  test('should include pending days in notification', () => {
    const notification = createDeadlineNotification({
      deadline: '2026-04-07',
      pendingDays: 4
    });
    
    expect(notification.body).toContain('4 days');
  });
});
```

---

## 2. Integration Tests

### 2.1 API Integration

#### Test: Authentication API
```typescript
describe('Authentication API Integration', () => {
  test('should login with valid Okta tokens', async () => {
    const tokens = await getOktaTokens();
    
    const response = await api.post('/auth/login', { tokens });
    
    expect(response.status).toBe(200);
    expect(response.data.consultantId).toBeDefined();
    expect(response.data.session).toBeDefined();
  });

  test('should reject invalid tokens', async () => {
    const invalidTokens = { accessToken: 'invalid' };
    
    const response = await api.post('/auth/login', { tokens: invalidTokens });
    
    expect(response.status).toBe(401);
  });

  test('should refresh expired token', async () => {
    const refreshToken = 'valid-refresh-token';
    
    const response = await api.post('/auth/refresh', { refreshToken });
    
    expect(response.status).toBe(200);
    expect(response.data.accessToken).toBeDefined();
  });
});
```

#### Test: Time Entry API
```typescript
describe('Time Entry API Integration', () => {
  let authToken;

  beforeAll(async () => {
    authToken = await getAuthToken();
  });

  test('should create time entry', async () => {
    const entry = createValidTimeEntry();
    
    const response = await api.post('/api/v2/timeentries', entry, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    expect(response.status).toBe(201);
    expect(response.data.id).toBeDefined();
  });

  test('should list time entries for period', async () => {
    const response = await api.get('/api/v2/timeentries?periodId=741', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  test('should update time entry', async () => {
    const created = await createTimeEntry();
    created.description = 'Updated';
    
    const response = await api.put(`/api/v2/timeentries/${created.id}`, created, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    expect(response.status).toBe(200);
    expect(response.data.description).toBe('Updated');
  });

  test('should delete time entry', async () => {
    const created = await createTimeEntry();
    
    const response = await api.delete(`/api/v2/timeentries/${created.id}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    expect(response.status).toBe(204);
  });

  test('should reject time entry outside period', async () => {
    const entry = { ...createValidTimeEntry(), date: '2026-03-01' }; // Wrong period
    
    const response = await api.post('/api/v2/timeentries', entry, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    expect(response.status).toBe(400);
    expect(response.data.error).toContain('period');
  });
});
```

#### Test: Timesheet Submission API
```typescript
describe('Timesheet Submission API Integration', () => {
  test('should submit timesheet for period', async () => {
    const response = await api.post('/api/v2/timesheets/741/submit', {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    expect(response.status).toBe(200);
    expect(response.data.status).toBe('SUBMITTED');
  });

  test('should reject submission with pending validation', async () => {
    // Create entry with missing hours
    await createTimeEntry({ totalHours: 0 });
    
    const response = await api.post('/api/v2/timesheets/741/submit', {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    expect(response.status).toBe(400);
    expect(response.data.error).toContain('validation');
  });

  test('should get timesheet status', async () => {
    const response = await api.get('/api/v2/timesheets/741/status', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    expect(response.status).toBe(200);
    expect(response.data.status).toBeDefined();
  });
});
```

---

### 2.2 Database Integration

#### Test: Local Database Operations
```typescript
describe('Local Database', () => {
  let db;

  beforeEach(async () => {
    db = await initializeDatabase();
  });

  afterEach(async () => {
    await db.close();
  });

  test('should persist time entries', async () => {
    const entry = createValidTimeEntry();
    
    await db.timeEntries.insert(entry);
    const retrieved = await db.timeEntries.findOne({ date: entry.date });
    
    expect(retrieved).toMatchObject(entry);
  });

  test('should handle transactions', async () => {
    await db.transaction(async (tx) => {
      await tx.timeEntries.insert(createValidTimeEntry());
      await tx.syncQueue.insert({ type: 'CREATE' });
    });
    
    const entries = await db.timeEntries.count();
    const queue = await db.syncQueue.count();
    
    expect(entries).toBe(1);
    expect(queue).toBe(1);
  });

  test('should rollback on error', async () => {
    try {
      await db.transaction(async (tx) => {
        await tx.timeEntries.insert(createValidTimeEntry());
        throw new Error('Simulated error');
      });
    } catch (e) {}
    
    const count = await db.timeEntries.count();
    expect(count).toBe(0);
  });
});
```

---

## 3. E2E Tests

### 3.1 Authentication Flow
```typescript
describe('E2E: Authentication', () => {
  test('should complete Okta login flow', async () => {
    await app.launch();
    
    await element(by.id('sign-in-with-okta')).tap();
    await waitFor(element(by.text('Number8 - Sign In'))).toBeVisible();
    
    await element(by.id('okta-username')).typeText('martin.larios@test.com');
    await element(by.id('okta-password')).typeText('password123');
    await element(by.id('okta-sign-in')).tap();
    
    await waitFor(element(by.text('Timecard Entry'))).toBeVisible();
  });

  test('should restore session on app restart', async () => {
    await app.launch();
    await loginUser();
    
    await app.terminate();
    await app.launch();
    
    await expect(element(by.text('Timecard Entry'))).toBeVisible();
  });

  test('should logout and clear session', async () => {
    await app.launch();
    await loginUser();
    
    await element(by.id('user-menu')).tap();
    await element(by.id('logout')).tap();
    
    await expect(element(by.id('sign-in-with-okta'))).toBeVisible();
  });
});
```

### 3.2 Time Entry Management
```typescript
describe('E2E: Time Entry Management', () => {
  beforeEach(async () => {
    await app.launch();
    await loginUser();
  });

  test('should create time entry', async () => {
    await element(by.id('add-time-entry')).tap();
    
    await element(by.id('date-picker')).tap();
    await element(by.text('10')).tap(); // Select April 10
    
    await element(by.id('client-input')).typeText('Aderant');
    await element(by.id('description-input')).typeText('Worked on PR #123');
    await element(by.id('in-time-1')).typeText('08:00');
    await element(by.id('out-time-1')).typeText('12:00');
    await element(by.id('in-time-2')).typeText('13:00');
    await element(by.id('out-time-2')).typeText('17:00');
    
    await element(by.id('save-time-entry')).tap();
    
    await expect(element(by.text('Aderant'))).toBeVisible();
    await expect(element(by.text('8.00'))).toBeVisible();
  });

  test('should edit time entry', async () => {
    await element(by.id('time-entry-1')).tap();
    await element(by.id('edit-button')).tap();
    
    await element(by.id('description-input')).clearText();
    await element(by.id('description-input')).typeText('Updated description');
    
    await element(by.id('save-time-entry')).tap();
    
    await expect(element(by.text('Updated description'))).toBeVisible();
  });

  test('should duplicate time entry', async () => {
    await element(by.id('time-entry-1')).tap();
    await element(by.id('duplicate-button')).tap();
    
    await element(by.id('date-picker')).tap();
    await element(by.text('11')).tap(); // Change date
    
    await element(by.id('save-time-entry')).tap();
    
    const entries = await element(by.id('time-entry-list'));
    await expect(entries).toHaveLength(2);
  });

  test('should delete time entry', async () => {
    await element(by.id('time-entry-1')).tap();
    await element(by.id('delete-button')).tap();
    await element(by.text('Confirm')).tap();
    
    await expect(element(by.id('time-entry-1'))).not.toBeVisible();
  });
});
```

### 3.3 Timesheet Submission
```typescript
describe('E2E: Timesheet Submission', () => {
  beforeEach(async () => {
    await app.launch();
    await loginUser();
  });

  test('should submit timesheet', async () => {
    await element(by.id('submit-timesheet')).tap();
    await element(by.text('Confirm Submission')).tap();
    
    await expect(element(by.text('Timesheet submitted successfully'))).toBeVisible();
  });

  test('should show validation errors before submission', async () => {
    // Create incomplete entry
    await createTimeEntry({ description: '' });
    
    await element(by.id('submit-timesheet')).tap();
    
    await expect(element(by.text('Please fix validation errors'))).toBeVisible();
  });
});
```

### 3.4 Offline Mode
```typescript
describe('E2E: Offline Mode', () => {
  beforeEach(async () => {
    await app.launch();
    await loginUser();
  });

  test('should create entry while offline and sync when online', async () => {
    await device.disableNetwork();
    
    await element(by.id('add-time-entry')).tap();
    await fillTimeEntryForm();
    await element(by.id('save-time-entry')).tap();
    
    await expect(element(by.id('sync-pending-badge'))).toBeVisible();
    
    await device.enableNetwork();
    await waitFor(element(by.id('sync-pending-badge'))).not.toBeVisible().withTimeout(5000);
  });

  test('should show offline indicator', async () => {
    await device.disableNetwork();
    
    await expect(element(by.id('offline-banner'))).toBeVisible();
    
    await device.enableNetwork();
    
    await expect(element(by.id('offline-banner'))).not.toBeVisible();
  });
});
```

### 3.5 Push Notifications
```typescript
describe('E2E: Push Notifications', () => {
  test('should show notification for approaching deadline', async () => {
    await device.launchApp({ newInstance: true });
    await loginUser();
    
    await device.setTime({ day: 6, month: 4, year: 2026, hour: 9, minute: 0 }); // Day before 7th
    
    await waitFor(element(by.text('Timesheet Due Tomorrow'))).toBeVisible().withTimeout(5000);
  });

  test('should open app from notification', async () => {
    await device.sendUserNotification({
      title: 'Timesheet Due Tomorrow',
      body: 'You have 4 pending days'
    });
    
    await device.openNotification();
    
    await expect(element(by.text('Timecard Entry'))).toBeVisible();
  });
});
```

---

## 4. Test Scenarios by Feature

### 4.1 Authentication Scenarios

| Scenario | Expected Result | Priority |
|----------|----------------|----------|
| Valid Okta login | User authenticated, redirect to dashboard | P0 |
| Invalid Okta credentials | Error message, remain on login screen | P0 |
| Expired session | Auto-logout, redirect to login | P0 |
| Token refresh success | New token acquired, continue session | P0 |
| Token refresh failure | Logout, redirect to login | P0 |
| Biometric login (after initial login) | Quick access without Okta | P1 |
| Network error during login | Retry option, error message | P1 |

### 4.2 Time Entry Scenarios

| Scenario | Expected Result | Priority |
|----------|----------------|----------|
| Add valid time entry | Entry saved, appears in list | P0 |
| Add entry with missing required fields | Validation error, entry not saved | P0 |
| Add entry with invalid time range | Validation error, helpful message | P0 |
| Edit existing entry | Changes saved, list updated | P0 |
| Duplicate entry to new date | New entry created with same details | P0 |
| Delete entry | Entry removed from list | P0 |
| Add entry while offline | Entry queued for sync | P0 |
| Calculate total hours (single block) | Correct calculation displayed | P0 |
| Calculate total hours (two blocks) | Correct calculation displayed | P0 |
| Add entry outside current period | Validation error | P1 |
| Overlapping time blocks | Validation error | P1 |
| Sync queued entries when back online | All entries synced successfully | P0 |

### 4.3 ETO Scenarios

| Scenario | Expected Result | Priority |
|----------|----------------|----------|
| View current ETO balance | Correct balance displayed | P0 |
| View ETO transaction history | List of accruals and usage | P1 |
| Add ETO time off | Balance decremented, entry recorded | P1 |
| Balance reaches zero | Warning message displayed | P2 |
| Balance goes negative | Error or warning based on policy | P2 |

### 4.4 Timesheet Submission Scenarios

| Scenario | Expected Result | Priority |
|----------|----------------|----------|
| Submit valid timesheet | Status changes to SUBMITTED | P0 |
| Submit with validation errors | Error list shown, submission blocked | P0 |
| Submit with pending days | Warning message, user confirms or cancels | P1 |
| Submit while offline | Queued for submission when online | P1 |
| Submit already submitted timesheet | Error message, no duplicate submission | P1 |
| View submission status | Current status displayed | P1 |

### 4.5 Deadline Notification Scenarios

| Scenario | Expected Result | Priority |
|----------|----------------|----------|
| Deadline approaching (7th, 22nd) | Notification sent day before | P0 |
| User has pending days | Notification includes count | P0 |
| Tap notification | App opens to timesheet | P0 |
| Timesheet already submitted | No notification sent | P1 |
| User opts out of notifications | No notifications sent | P1 |
| Multiple deadlines in one month | Separate notifications for each | P1 |

### 4.6 Sync Scenarios

| Scenario | Expected Result | Priority |
|----------|----------------|----------|
| Create entry offline, go online | Entry synced to server | P0 |
| Edit entry offline, go online | Changes synced to server | P0 |
| Delete entry offline, go online | Deletion synced to server | P0 |
| Sync conflict (server wins) | Server version retained | P0 |
| Sync conflict (client wins) | Client version uploaded | P0 |
| Sync conflict (manual resolution) | User prompted to choose | P1 |
| Network error during sync | Retry with exponential backoff | P0 |
| Partial sync success | Successful items synced, failed items queued | P1 |

---

## 5. Performance Tests

### 5.1 Load Testing
```typescript
describe('Performance: Load Testing', () => {
  test('should render 100 time entries without lag', async () => {
    const entries = generateTimeEntries(100);
    await loadTimeEntries(entries);
    
    const startTime = Date.now();
    await scrollToBottom();
    const endTime = Date.now();
    
    expect(endTime - startTime).toBeLessThan(1000); // < 1 second
  });

  test('should sync 50 entries in under 10 seconds', async () => {
    const entries = generateTimeEntries(50);
    await queueForSync(entries);
    
    const startTime = Date.now();
    await syncQueue.process();
    const endTime = Date.now();
    
    expect(endTime - startTime).toBeLessThan(10000);
  });
});
```

### 5.2 Battery & Network Efficiency
```typescript
describe('Performance: Efficiency', () => {
  test('should batch API requests', async () => {
    const spy = jest.spyOn(api, 'request');
    
    await syncQueue.process();
    
    // Should batch requests, not make 50 individual calls
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('should debounce sync attempts', async () => {
    const spy = jest.spyOn(syncQueue, 'process');
    
    // Trigger multiple sync events
    await createTimeEntry();
    await createTimeEntry();
    await createTimeEntry();
    
    // Should debounce to single sync
    await wait(1000);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
```

---

## 6. Security Tests

### 6.1 Authentication Security
```typescript
describe('Security: Authentication', () => {
  test('should not store tokens in plain text', async () => {
    await login();
    
    const storage = await getSecureStorage();
    const token = storage.get('accessToken');
    
    expect(token).not.toEqual(expect.stringMatching(/^ey/)); // Not a plain JWT
  });

  test('should invalidate session on tampering', async () => {
    await login();
    
    // Tamper with stored session
    await secureStorage.set('session', { consultantId: 99999 });
    
    const session = await SessionManager.getCurrent();
    
    expect(session).toBeNull();
  });

  test('should prevent token replay attacks', async () => {
    const oldToken = await getAccessToken();
    await refreshToken();
    
    const response = await api.get('/api/v2/timeentries', {
      headers: { Authorization: `Bearer ${oldToken}` }
    });
    
    expect(response.status).toBe(401);
  });
});
```

### 6.2 Data Privacy
```typescript
describe('Security: Data Privacy', () => {
  test('should encrypt local database', async () => {
    await db.timeEntries.insert(createValidTimeEntry());
    
    const rawData = await readDatabaseFile();
    
    expect(rawData).not.toContain('Aderant'); // Should be encrypted
  });

  test('should clear sensitive data on logout', async () => {
    await login();
    await createTimeEntry();
    await logout();
    
    const db = await openDatabase();
    const entries = await db.timeEntries.count();
    
    expect(entries).toBe(0);
  });
});
```

---

## 7. Accessibility Tests

### 7.1 Screen Reader Support
```typescript
describe('Accessibility: Screen Reader', () => {
  test('should have accessible labels on all buttons', async () => {
    await navigateToHome();
    
    const addButton = await element(by.id('add-time-entry'));
    const label = await addButton.getAccessibilityLabel();
    
    expect(label).toBe('Add time entry');
  });

  test('should announce time entry creation', async () => {
    const spy = jest.spyOn(accessibility, 'announce');
    
    await createTimeEntry();
    
    expect(spy).toHaveBeenCalledWith('Time entry created successfully');
  });
});
```

### 7.2 Keyboard Navigation
```typescript
describe('Accessibility: Keyboard', () => {
  test('should navigate form with tab key', async () => {
    await openAddTimeEntry();
    
    await device.pressKey('tab');
    expect(await element(by.id('date-picker')).isFocused()).toBe(true);
    
    await device.pressKey('tab');
    expect(await element(by.id('client-input')).isFocused()).toBe(true);
  });
});
```

---

## 8. Test Coverage Goals

### Coverage Targets

| Module | Unit | Integration | E2E | Total Target |
|--------|------|-------------|-----|--------------|
| Authentication | 95% | 90% | 100% | 95% |
| Time Entry CRUD | 90% | 90% | 100% | 90% |
| Validation | 100% | N/A | 90% | 95% |
| Offline Sync | 90% | 95% | 100% | 95% |
| ETO Management | 85% | 85% | 80% | 85% |
| Notifications | 90% | 85% | 90% | 90% |
| UI Components | 80% | N/A | 90% | 85% |
| **Overall** | **90%** | **88%** | **93%** | **90%** |

---

## 9. Continuous Testing Strategy

### Pre-Commit
- Unit tests (fast suite < 30s)
- Linting
- Type checking

### CI Pipeline
- Full unit test suite
- Integration tests
- Code coverage report
- Security scan

### Pre-Release
- Full E2E test suite
- Performance tests
- Accessibility audit
- Manual QA on physical devices

### Production Monitoring
- Error tracking (Sentry)
- Performance monitoring (Firebase)
- User analytics
- Crash reports

---

**End of TDD Specification**
