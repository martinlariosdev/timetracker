# TimeTrack Mobile App - Audit Fix Plan

**Date:** April 13, 2026  
**Based On:** UI_UX_AUDIT.md  
**Total Issues:** 23  
**Estimated Total Effort:** 8-12 days (1-2 sprints)

---

## Issue Summary

| Priority | Count | Est. Time | Impact |
|----------|-------|-----------|--------|
| Critical | 4 | 1-2 days | App core functionality broken |
| High | 8 | 3-5 days | Major UX problems |
| Medium | 7 | 2-3 days | Noticeable issues |
| Low | 4 | 0.5-1 day | Polish items |
| **Total** | **23** | **8-12 days** | - |

---

## Sprint 1: Critical Fixes (MUST FIX - Day 1-2)

### Issue #1: GraphQL - timesheetSubmission Argument Mismatch ⚠️ CRITICAL

**Severity:** 10/10  
**Effort:** Medium (2-4 hours)  
**Files:**
- Mobile: `/Users/martinlarios/personal/apps/mobile/lib/graphql/queries.ts` (line 143)
- Mobile: `/Users/martinlarios/personal/apps/mobile/app/(tabs)/index.tsx` (lines 718-723)
- Backend: `/Users/martinlarios/personal/apps/backend/src/timesheet/submission.resolver.ts` (line 89)

**Problem:**
Mobile queries `timesheetSubmission(payPeriodId: $payPeriodId)` but backend expects `timesheetSubmission(id: $id)`.

**Solution Option A: Backend Change (Recommended)**
Add new query resolver that accepts `payPeriodId`:

```typescript
// Backend: submission.resolver.ts
@Query(() => TimesheetSubmissionType, { nullable: true })
async timesheetSubmissionByPayPeriod(
  @Args('payPeriodId') payPeriodId: string,
  @CurrentUser() user: Consultant,
) {
  return this.submissionService.getSubmissionByPayPeriod(user.id, payPeriodId);
}

// Backend: submission.service.ts
async getSubmissionByPayPeriod(consultantId: string, payPeriodId: string) {
  return this.prisma.timesheetSubmission.findFirst({
    where: { consultantId, payPeriodId },
    include: { consultant: true },
  });
}
```

Then update mobile query:
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

**Solution Option B: Mobile Change Only**
Fetch all submissions and filter client-side:

```typescript
// Mobile: queries.ts
export const MY_TIMESHEET_SUBMISSIONS_QUERY = gql`
  query MyTimesheetSubmissions {
    myTimesheetSubmissions {
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
`;

// Mobile: index.tsx
const { data: submissionsData } = useAuthenticatedQuery(MY_TIMESHEET_SUBMISSIONS_QUERY);

const submission = useMemo(() => {
  return submissionsData?.myTimesheetSubmissions?.find(
    s => s.payPeriodId === payPeriodId
  ) ?? null;
}, [submissionsData, payPeriodId]);
```

**Recommended:** Option A (better performance, cleaner API)

**Testing:**
- [ ] Query returns submission when one exists
- [ ] Query returns null when no submission exists
- [ ] UI displays "Not submitted" badge correctly
- [ ] UI displays "Submitted" badge with date
- [ ] UI displays "Approved"/"Rejected" badges

---

### Issue #2: GraphQL - totalHours Field Missing ⚠️ CRITICAL

**Severity:** 10/10  
**Effort:** Small (1-2 hours)  
**Files:**
- Mobile: `/Users/martinlarios/personal/apps/mobile/lib/graphql/queries.ts` (line 155)
- Mobile: `/Users/martinlarios/personal/apps/mobile/app/(tabs)/index.tsx` (line 505)

**Problem:**
Mobile requests `totalHours` field on `TimesheetSubmissionType` but backend schema doesn't have it.

**Solution Option A: Remove from Mobile Query (Recommended - Quick Fix)**
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
    # REMOVED: totalHours
  }
}
```

Update UI to calculate from entries instead:
```typescript
// index.tsx (line 505)
{submission.status !== 'draft' && (
  <Text style={{ fontSize: 12, color: config.color }}>
    {thisWeekHours.toFixed(1)} hrs  {/* Use calculated value */}
  </Text>
)}
```

**Solution Option B: Add Computed Field to Backend**
```typescript
// Backend: submission.type.ts
@ObjectType()
export class TimesheetSubmissionType {
  // ... existing fields ...
  
  @Field(() => Float, { description: 'Total hours in this submission' })
  totalHours: number;
}

// Backend: submission.resolver.ts
@ResolveField(() => Float)
async totalHours(@Parent() submission: TimesheetSubmission) {
  const entries = await this.prisma.timeEntry.findMany({
    where: {
      consultantId: submission.consultantId,
      payPeriodId: submission.payPeriodId,
    },
  });
  return entries.reduce((sum, entry) => sum + entry.hours, 0);
}
```

**Recommended:** Option A for quick fix, Option B for future enhancement

**Testing:**
- [ ] Query succeeds without errors
- [ ] Submission badge displays correctly
- [ ] Hours display correctly (either from field or calculated)

---

### Issue #3: Delete Entry Not Implemented ⚠️ CRITICAL

**Severity:** 9/10  
**Effort:** Medium (2-3 hours)  
**Files:**
- Mobile: `/Users/martinlarios/personal/apps/mobile/app/(tabs)/index.tsx` (lines 819-824)
- Mobile: `/Users/martinlarios/personal/apps/mobile/lib/graphql/mutations.ts` (verify DELETE_TIME_ENTRY_MUTATION exists)

**Problem:**
Delete icon is visible and clickable but does nothing. Users expect to delete entries.

**Solution:**
```typescript
// Import mutation
import { DELETE_TIME_ENTRY_MUTATION } from '@/lib/graphql/mutations';

// Add mutation hook
const [deleteEntry] = useAuthenticatedMutation(DELETE_TIME_ENTRY_MUTATION, {
  refetchQueries: ['WeekTimeEntries'],
});

// Implement handler
const handleDeleteEntry = useCallback(
  (id: string) => {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;

    Alert.alert(
      'Delete Time Entry',
      `Delete entry for ${entry.project}?\n${entry.hours.toFixed(1)} hours - ${entry.description}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEntry({ variables: { id } });
              // Refetch is automatic due to refetchQueries
            } catch (error) {
              Alert.alert(
                'Delete Failed',
                'Could not delete entry. Please try again.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  },
  [entries, deleteEntry],
);
```

**Backend Verification:**
Ensure mutation exists:
```graphql
mutation DeleteTimeEntry($id: String!) {
  deleteTimeEntry(id: $id)
}
```

**Testing:**
- [ ] Tap delete icon shows confirmation dialog
- [ ] Cancel button closes dialog without deleting
- [ ] Delete button removes entry from UI
- [ ] Entry is deleted from backend (verify with query)
- [ ] Error alert appears if deletion fails
- [ ] Cannot delete entry from submitted timesheet

---

### Issue #4: ETO Screen Queries Wrong Data ⚠️ CRITICAL

**Severity:** 8/10  
**Effort:** Large (4-6 hours)  
**Files:**
- Backend: Create new transaction history resolver
- Mobile: `/Users/martinlarios/personal/apps/mobile/app/(tabs)/eto.tsx` (lines 384-413)
- Mobile: `/Users/martinlarios/personal/apps/mobile/lib/graphql/queries.ts` (add new query)

**Problem:**
ETO screen queries `etoRequests` (future vacation requests) instead of `etoTransactions` (historical accruals/usage).

**Solution:**

**Step 1: Backend - Create Transaction Type**
```typescript
// Backend: src/eto/dto/transaction.type.ts
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class ETOTransactionType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  consultantId: string;

  @Field(() => Date)
  transactionDate: Date;

  @Field(() => Float, { description: 'Hours added (positive) or used (negative)' })
  hours: number;

  @Field(() => String, { description: 'Transaction type: accrual, usage, adjustment' })
  type: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  payPeriodId?: string;

  @Field(() => Float, { description: 'Balance after this transaction' })
  runningBalance: number;
}
```

**Step 2: Backend - Create Resolver**
```typescript
// Backend: src/eto/transaction.resolver.ts
@Resolver(() => ETOTransactionType)
@UseGuards(JwtAuthGuard)
export class ETOTransactionResolver {
  @Query(() => [ETOTransactionType])
  async etoTransactions(
    @CurrentUser() user: Consultant,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 20 }) limit: number,
  ) {
    // Fetch accrual records, usage records, and adjustments
    // Calculate running balance for each
    // Return sorted by date descending
    return this.etoService.getTransactionHistory(user.id, limit);
  }

  @Query(() => ETOTransactionType)
  async etoTransaction(
    @Args('id') id: string,
    @CurrentUser() user: Consultant,
  ) {
    return this.etoService.getTransaction(id, user.id);
  }
}
```

**Step 3: Mobile - Create Query**
```typescript
// Mobile: lib/graphql/queries.ts
export const ETO_TRANSACTIONS_QUERY = gql`
  query ETOTransactions($limit: Int) {
    etoTransactions(limit: $limit) {
      id
      consultantId
      transactionDate
      hours
      type
      description
      payPeriodId
      runningBalance
    }
  }
`;
```

**Step 4: Mobile - Update Component**
```typescript
// Mobile: app/(tabs)/eto.tsx
const {
  data: transactionsData,
  loading: transactionsLoading,
  error: transactionsError,
  refetch: refetchTransactions,
} = useAuthenticatedQuery(ETO_TRANSACTIONS_QUERY, {
  variables: { limit: 20 },
});

const transactions: ETOTransaction[] = useMemo(() => {
  if (transactionsData?.etoTransactions?.length > 0) {
    return transactionsData.etoTransactions.map((t: any) => ({
      id: t.id,
      date: t.transactionDate,
      hours: t.hours,
      transactionType: t.type,
      description: t.description || '',
      periodStart: t.payPeriodId ? extractPeriodStart(t.payPeriodId) : undefined,
      periodEnd: t.payPeriodId ? extractPeriodEnd(t.payPeriodId) : undefined,
      runningBalance: t.runningBalance,
    }));
  }
  return MOCK_TRANSACTIONS; // Fallback during development
}, [transactionsData]);
```

**Testing:**
- [ ] Query returns accrual transactions
- [ ] Query returns usage transactions
- [ ] Running balance is calculated correctly
- [ ] Transactions are sorted by date descending
- [ ] Recent change indicator is accurate
- [ ] Transaction detail modal shows correct data

---

## Sprint 2: High Priority UX (Day 3-7)

### Issue #5: MetricCard Content Cutoff 🔴 HIGH

**Severity:** 8/10  
**Effort:** Small (30 minutes)  
**Files:**
- Mobile: `/Users/martinlarios/personal/apps/mobile/app/(tabs)/index.tsx` (line 950)

**Solution:**
```typescript
// Line 950: Increase banner height from 88 to 100
<LinearGradient
  colors={['#2563EB', '#1E40AF']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
  className="shadow-level-1"
  style={{ height: 100, paddingVertical: 18, paddingHorizontal: 12 }}  // Was: 88, 16
>
```

**Testing:**
- [ ] All metric subtext is fully visible
- [ ] No text clipping on any metric card
- [ ] Test on iPhone SE (small screen)
- [ ] Test on iPhone Pro Max (large screen)

---

### Issue #6: Add Entry Opens in Wrong Mode 🔴 HIGH

**Severity:** 7/10  
**Effort:** Small (1 hour)  
**Files:**
- Mobile: `/Users/martinlarios/personal/apps/mobile/app/(tabs)/add-entry.tsx` (line 71)

**Solution:**
```typescript
// Line 71: Always start expanded
const [isExpanded, setIsExpanded] = useState(true);

// Or: Keep collapse/expand toggle but default to expanded
const [isExpanded, setIsExpanded] = useState(isEditMode || true);
```

**Alternative (if collapse is needed for specific use cases):**
```typescript
// Accept query param to control initial state
const params = useLocalSearchParams<{ date?: string; id?: string; collapsed?: string }>();
const [isExpanded, setIsExpanded] = useState(
  isEditMode || params.collapsed !== 'true'
);
```

**Testing:**
- [ ] Navigate from Timesheet "+ Add Entry" - opens expanded
- [ ] Navigate from FAB - opens expanded
- [ ] Navigate from edit icon - opens expanded with data
- [ ] Toggle expand/collapse still works

---

### Issue #7: Client Selector Not Implemented 🔴 HIGH

**Severity:** 7/10  
**Effort:** Large (1-2 days)  
**Files:**
- Backend: Create clients query and type
- Mobile: `/Users/martinlarios/personal/apps/mobile/app/(tabs)/add-entry.tsx` (lines 174-180)
- Mobile: Create `components/ClientSelectorModal.tsx`

**Solution:**

**Step 1: Backend - Create Client Type and Query**
```typescript
// Backend: src/clients/dto/client.type.ts
@ObjectType()
export class ClientType {
  @Field(() => ID) id: string;
  @Field(() => String) name: string;
  @Field(() => String) code: string;
  @Field(() => Boolean) active: boolean;
}

// Backend: src/clients/clients.resolver.ts
@Query(() => [ClientType])
@UseGuards(JwtAuthGuard)
async clients(@CurrentUser() user: Consultant) {
  return this.clientsService.getClientsForConsultant(user.id);
}
```

**Step 2: Mobile - Create Query**
```typescript
// Mobile: lib/graphql/queries.ts
export const CLIENTS_QUERY = gql`
  query Clients {
    clients {
      id
      name
      code
      active
    }
  }
`;
```

**Step 3: Mobile - Create ClientSelectorModal Component**
```typescript
// Mobile: components/ClientSelectorModal.tsx
interface ClientSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (client: { id: string; name: string }) => void;
  selectedClientId?: string;
}

export function ClientSelectorModal({ visible, onClose, onSelect, selectedClientId }: ClientSelectorModalProps) {
  const [search, setSearch] = useState('');
  const { data, loading } = useAuthenticatedQuery(CLIENTS_QUERY);
  
  const filteredClients = useMemo(() => {
    if (!data?.clients) return [];
    if (!search.trim()) return data.clients;
    return data.clients.filter((c: any) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);
  
  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Select Client</Text>
          <View style={{ width: 44 }} />
        </View>
        
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search clients..."
          style={styles.searchInput}
        />
        
        <FlatList
          data={filteredClients}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                onSelect({ id: item.id, name: item.name });
                onClose();
              }}
              style={styles.clientRow}
            >
              <View>
                <Text style={styles.clientName}>{item.name}</Text>
                <Text style={styles.clientCode}>{item.code}</Text>
              </View>
              {selectedClientId === item.id && (
                <Ionicons name="checkmark" size={20} color="#2563EB" />
              )}
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}
```

**Step 4: Mobile - Wire Up to Add Entry**
```typescript
// Mobile: app/(tabs)/add-entry.tsx
const [clientSelectorVisible, setClientSelectorVisible] = useState(false);
const [client, setClient] = useState('');
const [clientId, setClientId] = useState<string | undefined>(undefined);

const handleClientPress = useCallback(() => {
  setClientSelectorVisible(true);
}, []);

const handleClientSelect = useCallback((selected: { id: string; name: string }) => {
  setClientId(selected.id);
  setClient(selected.name);
  setClientSelectorVisible(false);
}, []);

// In render:
<ClientSelectorModal
  visible={clientSelectorVisible}
  onClose={() => setClientSelectorVisible(false)}
  onSelect={handleClientSelect}
  selectedClientId={clientId}
/>
```

**Testing:**
- [ ] Tap client field opens modal
- [ ] Modal shows list of clients
- [ ] Search filters clients correctly
- [ ] Selecting client updates form
- [ ] Selected client is highlighted
- [ ] Close button dismisses modal

**Workaround for MVP:**
If backend client list is not ready, allow manual text entry:
```typescript
<TextInput
  value={client}
  onChangeText={setClient}
  placeholder="Enter client name"
  style={styles.clientInput}
/>
```

---

### Issue #8: Touch Targets Too Small 🔴 HIGH

**Severity:** 6/10  
**Effort:** Small (1 hour)  
**Files:**
- Mobile: `/Users/martinlarios/personal/apps/mobile/app/(tabs)/index.tsx` (lines 338-356)

**Solution:**
```typescript
// Line 338-356: Increase touch target size
<TouchableOpacity
  onPress={onEdit}
  className="items-center justify-center"
  style={{ width: 44, height: 44 }}  // Was: 32x32
  accessibilityLabel={`Edit ${entry.project} entry`}
  accessibilityRole="button"
>
  <Ionicons name="pencil" size={16} color="#2563EB" />  // Keep icon 16px
</TouchableOpacity>
<TouchableOpacity
  onPress={onDelete}
  className="items-center justify-center ml-1"
  style={{ width: 44, height: 44 }}  // Was: 32x32
  accessibilityLabel={`Delete ${entry.project} entry`}
  accessibilityRole="button"
>
  <Ionicons name="trash" size={16} color="#EF4444" />  // Keep icon 16px
</TouchableOpacity>
```

**Testing:**
- [ ] Edit icon is easy to tap
- [ ] Delete icon is easy to tap
- [ ] No accidental taps on adjacent icons
- [ ] Test on physical device
- [ ] Test with accessibility zoom enabled

---

### Issue #9: Metric Scroll Not Discoverable 🔴 HIGH

**Severity:** 6/10  
**Effort:** Medium (2-3 hours)  
**Files:**
- Mobile: `/Users/martinlarios/personal/apps/mobile/app/(tabs)/index.tsx` (lines 952-1000)

**Solution:**

**Option A: Show Partial Next Card (Recommended)**
```typescript
// Calculate card width to show edge of next card
const { width: screenWidth } = useWindowDimensions();
const cardWidth = screenWidth * 0.7;  // 70% width shows 30% of next card

<MetricCard
  label="Total Hours"
  value={metrics.totalHours.toFixed(2)}
  subtext="this period"
  style={{ width: cardWidth, marginRight: 12 }}
/>
```

**Option B: Increase Pagination Dot Size**
```typescript
// Line 984-999: Make dots more prominent
<View
  key={i}
  className="rounded-full mx-1"
  style={{
    width: 8,  // Was: 6
    height: 8,  // Was: 6
    backgroundColor:
      i === metricsScrollIndex
        ? '#FFFFFF'
        : 'rgba(255,255,255,0.5)',  // Was: 0.4
  }}
/>
```

**Option C: Auto-Scroll Carousel**
```typescript
const metricsScrollRef = useRef<ScrollView>(null);
const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

useEffect(() => {
  if (!autoScrollEnabled) return;
  
  const interval = setInterval(() => {
    setMetricsScrollIndex((prev) => {
      const next = (prev + 1) % 4;
      metricsScrollRef.current?.scrollTo({
        x: next * 132,
        animated: true,
      });
      return next;
    });
  }, 4000);
  
  return () => clearInterval(interval);
}, [autoScrollEnabled]);

// Stop auto-scroll when user manually scrolls
const handleManualScroll = useCallback(() => {
  setAutoScrollEnabled(false);
}, []);
```

**Recommended:** Combination of Option A (partial card) + Option B (larger dots)

**Testing:**
- [ ] Users notice they can scroll
- [ ] Scroll animation is smooth
- [ ] Pagination dots update correctly
- [ ] All 4 metrics are easily accessible
- [ ] Test on iPhone SE (small screen)

---

### Issue #10: Error States Lack Detail 🔴 HIGH

**Severity:** 5/10  
**Effort:** Medium (3-4 hours)  
**Files:**
- Mobile: Create `components/ErrorView.tsx`
- Mobile: Update all screens to use ErrorView

**Solution:**

**Step 1: Create ErrorView Component**
```typescript
// Mobile: components/ErrorView.tsx
import { ApolloError } from '@apollo/client';

interface ErrorInfo {
  title: string;
  message: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  action?: 'retry' | 'logout' | 'none';
}

function getErrorInfo(error: ApolloError | Error | null): ErrorInfo {
  if (!error) {
    return {
      title: 'Something Went Wrong',
      message: 'Please try again',
      icon: 'alert-circle',
      color: '#EF4444',
      action: 'retry',
    };
  }

  // Network error (offline, timeout)
  if ('networkError' in error && error.networkError) {
    return {
      title: 'No Internet Connection',
      message: 'Check your connection and try again',
      icon: 'wifi-off',
      color: '#F59E0B',
      action: 'retry',
    };
  }

  // Authentication error
  if ('graphQLErrors' in error && error.graphQLErrors?.some(e =>
    e.message.includes('Unauthorized') ||
    e.message.includes('Authentication') ||
    e.extensions?.code === 'UNAUTHENTICATED'
  )) {
    return {
      title: 'Session Expired',
      message: 'Please log in again',
      icon: 'lock-closed',
      color: '#EF4444',
      action: 'logout',
    };
  }

  // Server error (500)
  if ('graphQLErrors' in error && error.graphQLErrors?.some(e =>
    e.extensions?.code === 'INTERNAL_SERVER_ERROR'
  )) {
    return {
      title: 'Server Error',
      message: "We're working on it. Try again later.",
      icon: 'server',
      color: '#EF4444',
      action: 'none',
    };
  }

  // Not found (404)
  if ('graphQLErrors' in error && error.graphQLErrors?.some(e =>
    e.message.includes('not found') ||
    e.extensions?.code === 'NOT_FOUND'
  )) {
    return {
      title: 'Data Not Found',
      message: 'This entry may have been deleted',
      icon: 'document-text-outline',
      color: '#6B7280',
      action: 'retry',
    };
  }

  // Permission error (403)
  if ('graphQLErrors' in error && error.graphQLErrors?.some(e =>
    e.message.includes('Forbidden') ||
    e.message.includes('permission') ||
    e.extensions?.code === 'FORBIDDEN'
  )) {
    return {
      title: 'Access Denied',
      message: "You don't have permission to view this",
      icon: 'shield-off',
      color: '#EF4444',
      action: 'none',
    };
  }

  // Generic error
  return {
    title: 'Something Went Wrong',
    message: error.message || 'Please try again',
    icon: 'alert-circle',
    color: '#EF4444',
    action: 'retry',
  };
}

interface ErrorViewProps {
  error: ApolloError | Error | null;
  onRetry?: () => void;
  onLogout?: () => void;
}

export function ErrorView({ error, onRetry, onLogout }: ErrorViewProps) {
  const info = getErrorInfo(error);

  const handleAction = () => {
    if (info.action === 'retry' && onRetry) {
      onRetry();
    } else if (info.action === 'logout' && onLogout) {
      onLogout();
    }
  };

  return (
    <View className="flex-1 items-center justify-center p-4">
      <Ionicons name={info.icon} size={48} color={info.color} />
      <Text
        className="text-base font-semibold text-gray-800 mt-3 text-center"
      >
        {info.title}
      </Text>
      <Text className="text-sm text-gray-500 mt-1 text-center">
        {info.message}
      </Text>
      {info.action !== 'none' && (
        <TouchableOpacity
          onPress={handleAction}
          className="bg-primary rounded-lg px-4 py-2 mt-4"
          accessibilityLabel={info.action === 'retry' ? 'Retry' : 'Log out'}
          accessibilityRole="button"
        >
          <Text className="text-white font-semibold">
            {info.action === 'retry' ? 'Retry' : 'Log Out'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

**Step 2: Update All Screens**
```typescript
// Example: index.tsx
import { ErrorView } from '@/components/ErrorView';

{error && !entries.length ? (
  <ErrorView
    error={error}
    onRetry={handleRefresh}
    onLogout={logout}
  />
) : (
  /* content */
)}
```

**Testing:**
- [ ] Network error shows wifi icon and "No Internet Connection"
- [ ] Auth error shows lock icon and "Session Expired"
- [ ] Server error shows server icon and helpful message
- [ ] Generic error shows alert icon and retry button
- [ ] Retry button refetches data
- [ ] Logout button logs user out

---

### Issue #11: Loading States Inconsistent 🔴 HIGH

**Severity:** 5/10  
**Effort:** Medium (4-6 hours)  
**Files:**
- Mobile: Create skeleton components
- Mobile: Update all screens

**Solution:**

**Step 1: Create Skeleton Components**
```typescript
// Mobile: components/skeletons/DayCardSkeleton.tsx
export function DayCardSkeleton() {
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-level-1" style={{ minHeight: 96 }}>
      <View className="flex-row items-center justify-between">
        <View style={{ width: 120, height: 16, backgroundColor: '#E5E7EB', borderRadius: 4 }} />
        <View style={{ width: 60, height: 20, backgroundColor: '#E5E7EB', borderRadius: 4 }} />
      </View>
      <View className="my-3" style={{ borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }} />
      <View style={{ width: '100%', height: 60, backgroundColor: '#F3F4F6', borderRadius: 8 }} />
    </View>
  );
}

export function DayCardSkeletonList({ count = 7 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <DayCardSkeleton key={i} />
      ))}
    </>
  );
}

// Mobile: components/skeletons/MetricCardSkeleton.tsx
export function MetricCardSkeleton() {
  return (
    <View
      className="rounded-xl p-3 mr-3"
      style={{
        width: 120,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
      }}
    >
      <View style={{ width: 60, height: 11, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, marginBottom: 4 }} />
      <View style={{ width: 80, height: 28, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 4, marginBottom: 4 }} />
      <View style={{ width: 50, height: 10, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4 }} />
    </View>
  );
}
```

**Step 2: Update Timesheet Screen**
```typescript
// index.tsx
{loading && !entries.length ? (
  <ScrollView className="flex-1 px-4 pt-3">
    <DayCardSkeletonList count={7} />
  </ScrollView>
) : error && !entries.length ? (
  <ErrorView error={error} onRetry={handleRefresh} />
) : (
  <ScrollView
    className="flex-1 px-4 pt-3"
    refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
    }
  >
    {dayDataList.map((day) => (
      <DayCard key={day.dateStr} day={day} {...handlers} />
    ))}
  </ScrollView>
)}
```

**Step 3: Update Other Screens**
- ETO screen: Transaction card skeletons
- Settings screen: Setting row skeletons
- Add Entry: No skeleton needed (uses inline loading states)

**Testing:**
- [ ] Skeleton screens appear during initial load
- [ ] Skeleton screens match actual content layout
- [ ] Smooth transition from skeleton to content
- [ ] Pull-to-refresh works on all screens
- [ ] No flashing or jumping during load

---

### Issue #12: Most Settings Not Implemented 🔴 HIGH

**Severity:** 5/10  
**Effort:** Large (2-3 days for high-priority settings)  
**Files:**
- Mobile: `/Users/martinlarios/personal/apps/mobile/app/(tabs)/settings.tsx`
- Mobile: Create setting-specific screens and logic

**Phased Approach:**

**Phase 1: Core Settings (2-3 days)**

1. **Dark Mode (4-6 hours)**
   - Create theme context
   - Define light/dark color palettes
   - Apply theme to all screens
   - Persist preference to AsyncStorage
   - Use system preference as default

2. **Work Hours (2-3 hours)**
   - Create work hours picker modal
   - Validate input (4-12 hours)
   - Save to user profile (backend mutation)
   - Update backend `workingHoursPerPeriod` field

3. **Week Start Day (1-2 hours)**
   - Create day picker modal (Sunday/Monday)
   - Persist preference to AsyncStorage
   - Update all week calculations
   - Test calendar views

**Phase 2: Secondary Settings (future sprint)**
4. Time Format (12/24 hour)
5. Language (i18n setup)
6. About page (version, licenses, credits)

**Phase 3: Remove Until Ready**
7. Remove unimplemented settings from UI
   - Change Password (needs backend)
   - Two-Factor Auth (needs backend)
   - Help Center (needs content)
   - Contact Support (needs support system)

**Implementation: Dark Mode**

```typescript
// Mobile: contexts/ThemeContext.tsx
type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  colors: ColorPalette;
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('system');
  const colorScheme = useColorScheme();
  
  const effectiveTheme = useMemo(() => {
    if (theme === 'system') return colorScheme || 'light';
    return theme;
  }, [theme, colorScheme]);

  const colors = useMemo(() => {
    return effectiveTheme === 'dark' ? darkColors : lightColors;
  }, [effectiveTheme]);

  const setTheme = useCallback(async (newTheme: Theme) => {
    setThemeState(newTheme);
    await AsyncStorage.setItem('theme', newTheme);
  }, []);

  // Load theme on mount
  useEffect(() => {
    AsyncStorage.getItem('theme').then((savedTheme) => {
      if (savedTheme) setThemeState(savedTheme as Theme);
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Color palettes
const lightColors = {
  background: '#FFFFFF',
  backgroundSecondary: '#F3F4F6',
  text: '#1F2937',
  textSecondary: '#6B7280',
  primary: '#2563EB',
  error: '#EF4444',
  success: '#10B981',
  border: '#E5E7EB',
  // ... more colors
};

const darkColors = {
  background: '#1F2937',
  backgroundSecondary: '#111827',
  text: '#F3F4F6',
  textSecondary: '#9CA3AF',
  primary: '#3B82F6',
  error: '#F87171',
  success: '#34D399',
  border: '#374151',
  // ... more colors
};
```

**Implementation: Work Hours**

```typescript
// Mobile: app/settings/work-hours.tsx
export default function WorkHoursScreen() {
  const { user } = useAuth();
  const [hours, setHours] = useState(user?.workingHoursPerPeriod || 8);
  const [updateProfile] = useAuthenticatedMutation(UPDATE_PROFILE_MUTATION);

  const handleSave = async () => {
    try {
      await updateProfile({
        variables: { input: { workingHoursPerPeriod: hours } },
      });
      Alert.alert('Saved', 'Work hours updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update work hours');
    }
  };

  return (
    <View>
      <Text>Daily Work Hours</Text>
      <Slider
        value={hours}
        onValueChange={setHours}
        minimumValue={4}
        maximumValue={12}
        step={0.5}
      />
      <Text>{hours} hours per day</Text>
      <Button title="Save" onPress={handleSave} />
    </View>
  );
}
```

**Testing:**
- [ ] Dark mode applies to all screens
- [ ] Dark mode persists across app restarts
- [ ] Work hours saves to backend
- [ ] Work hours updates timesheet calculations
- [ ] Week start day updates calendar views

---

## Sprint 3: Medium Priority (Day 8-10)

### Issue #13-17: Medium Priority Items

Brief implementation notes for medium-priority issues:

**#13: Duplicate Yesterday Uses Mock Data** (2-3 hours)
- Query yesterday's entry with `TIME_ENTRY_QUERY`
- Handle "no entry found" case
- Copy all fields to form

**#14: Multi-Entry Time Pairs Not Saved** (Accept for MVP)
- Document limitation in UI
- Consider future enhancement with JSON field

**#15: Time Validation Edge Cases** (2-3 hours)
- Review validation function
- Add edge case tests
- Handle midnight spanning entries

**#16: Biometric Auth Not Tested** (1 day on physical device)
- Test Face ID/Touch ID prompts
- Test permission denial handling
- Test on device without biometrics

**#17: Delete Account Modal Misleading** (1 hour)
- Remove button until implemented, OR
- Change to disabled state with "Coming Soon" label
- Remove scary confirmation modal

**#18: Search Results No Highlighting** (2-3 hours)
- Implement match highlighting
- Show matched keyword in results
- Improve search UX

---

## Sprint 4: Low Priority Polish (Day 11-12)

### Issue #19-23: Low Priority Items

Quick fixes for polish items:

**#19: FAB Position Jump** (30 min)
- Keep FAB at same position, use opacity for disabled state

**#20: Week Navigation Limits** (30 min)
- Disable "Next Week" when at current week

**#21: Date Chip Today Border** (30 min)
- Increase border width or add text color

**#22: Avatar Initials Too Small** (15 min)
- Increase avatar from 40x40 to 48x48

**#23: Search Bar Focus Border Shift** (15 min)
- Always use 2px border, change only color

---

## Implementation Order (Recommended)

### Week 1 (Sprint 1)
**Day 1:**
- [ ] Fix GraphQL timesheetSubmission query (Issue #1) - 2-4 hours
- [ ] Fix GraphQL totalHours field (Issue #2) - 1-2 hours
- [ ] Implement delete entry (Issue #3) - 2-3 hours

**Day 2:**
- [ ] Fix ETO transactions query (Issue #4) - 4-6 hours
- [ ] Increase MetricCard height (Issue #5) - 30 min
- [ ] Fix Add Entry mode (Issue #6) - 1 hour

### Week 2 (Sprint 2)
**Day 3-4:**
- [ ] Implement client selector (Issue #7) - 1-2 days

**Day 5:**
- [ ] Increase touch targets (Issue #8) - 1 hour
- [ ] Make metric scroll discoverable (Issue #9) - 2-3 hours
- [ ] Improve error states (Issue #10) - 3-4 hours

**Day 6-7:**
- [ ] Standardize loading states (Issue #11) - 4-6 hours
- [ ] Implement core settings (Issue #12 - Dark Mode, Work Hours) - 1 day

### Week 3 (Sprint 3) - Optional Polish
**Day 8-10:**
- [ ] Medium priority items (#13-18)
- [ ] Low priority polish (#19-23)
- [ ] Device-specific testing
- [ ] Bug fixes from testing

---

## Testing Strategy

### After Each Fix
1. Verify fix works as expected
2. Test related functionality
3. Check for regressions
4. Update tests

### End of Sprint 1
1. Full regression test
2. Test all GraphQL queries
3. Verify timesheet submission flow
4. Test delete functionality

### End of Sprint 2
1. Test on multiple devices
2. Test all user flows
3. Verify UI consistency
4. Accessibility audit

### Before Release
1. Full app test on physical devices
2. Test on iOS and Android
3. Test on small and large screens
4. Performance testing
5. Accessibility testing
6. User acceptance testing

---

## Success Metrics

**Sprint 1 Success Criteria:**
- [ ] All Critical issues resolved
- [ ] Timesheet submission works end-to-end
- [ ] No GraphQL errors in console
- [ ] Users can delete entries
- [ ] ETO screen shows correct data

**Sprint 2 Success Criteria:**
- [ ] All High Priority issues resolved
- [ ] UI is consistent and polished
- [ ] Users can select clients
- [ ] Error messages are helpful
- [ ] Loading states are smooth

**Overall Success Criteria:**
- [ ] 0 Critical issues
- [ ] 0 High Priority issues
- [ ] <5 Medium Priority issues
- [ ] App feels professional and complete
- [ ] No major user complaints

---

## Risk Mitigation

### High-Risk Items

**Risk #1: Backend API Changes Required**
- Issues #1, #2, #4, #7 require backend changes
- **Mitigation:** Coordinate with backend team early
- **Fallback:** Implement mobile-only workarounds for MVP

**Risk #2: Time Estimates Too Optimistic**
- Complex issues may take longer than estimated
- **Mitigation:** Focus on Critical issues first, defer others if needed
- **Buffer:** Built-in 2-day buffer (12 days estimated, could take 14)

**Risk #3: Testing Gaps**
- Some issues require physical device testing
- **Mitigation:** Borrow devices or use cloud testing service
- **Fallback:** Release with known limitations documented

**Risk #4: Scope Creep**
- Users may request additional features
- **Mitigation:** Strict priority system, defer new features
- **Communication:** Set clear expectations about MVP scope

---

## Dependencies

### Backend Dependencies
- GraphQL schema changes (Issues #1, #2)
- New ETO transactions endpoint (Issue #4)
- Clients query endpoint (Issue #7)
- Work hours mutation (Issue #12)

### Mobile Dependencies
- None - all issues can be addressed independently

### External Dependencies
- Testing devices (physical iPhones/iPads/Android)
- Backend team availability
- Design approval for UI changes

---

## Documentation Updates

After completing fixes:
1. Update GraphQL schema documentation
2. Update component documentation
3. Update README with new features
4. Update CHANGELOG with bug fixes
5. Create migration guide if needed

---

**Plan Generated:** April 13, 2026  
**Total Estimated Effort:** 8-12 days (1-2 sprints)  
**Recommended Team Size:** 1-2 developers  
**Target Completion:** End of Sprint 2 (2 weeks)
