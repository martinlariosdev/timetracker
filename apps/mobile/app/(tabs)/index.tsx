import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  useWindowDimensions,
  ActivityIndicator,
  Modal,
  Alert,
  Platform,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { useAuthenticatedMutation } from '@/hooks/useAuthenticatedMutation';
import { WEEK_TIME_ENTRIES_QUERY, TIMESHEET_SUBMISSION_QUERY } from '@/lib/graphql/queries';
import { SUBMIT_TIMESHEET_MUTATION, DELETE_TIME_ENTRY_MUTATION } from '@/lib/graphql/mutations';
import { ErrorView } from '@/components/ErrorView';
import { DayCardSkeletonList } from '@/components/skeletons/DayCardSkeleton';
import { MetricCardSkeleton } from '@/components/skeletons/MetricCardSkeleton';

// --- Types ---

interface TimeEntry {
  id: string;
  consultantId: string;
  date: string;
  hours: number;
  description: string;
  category: string;
  project: string;
  syncStatus: string;
  lastModified: string;
}

interface DayData {
  date: Date;
  dateStr: string;
  dayName: string;
  dayNumber: number;
  monthName: string;
  fullLabel: string;
  entries: TimeEntry[];
  totalHours: number;
}

type SubmissionStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

interface TimesheetSubmission {
  id: string;
  consultantId: string;
  payPeriodId: string;
  status: SubmissionStatus;
  submittedAt: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  rejectedAt: string | null;
  rejectedBy: string | null;
  comments: string | null;
  createdAt: string;
  updatedAt: string;
}

// --- Date Utilities ---

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(start: Date): Date {
  const d = new Date(start);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

function generateWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function formatDateParam(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// --- Mock Data ---
// TODO: Remove when backend is connected. Using mock data for development.

const MOCK_ENTRIES: TimeEntry[] = [
  {
    id: '1',
    consultantId: 'c1',
    date: formatDateParam(new Date()),
    hours: 4,
    description: 'Worked on PR #239, code review',
    category: 'Development',
    project: 'Aderant',
    syncStatus: 'synced',
    lastModified: new Date().toISOString(),
  },
  {
    id: '2',
    consultantId: 'c1',
    date: formatDateParam(new Date()),
    hours: 4,
    description: 'Sprint planning and standup meetings',
    category: 'Meetings',
    project: 'Aderant',
    syncStatus: 'synced',
    lastModified: new Date().toISOString(),
  },
  {
    id: '3',
    consultantId: 'c1',
    date: formatDateParam((() => { const d = new Date(); d.setDate(d.getDate() - 1); return d; })()),
    hours: 6,
    description: 'API integration for timesheet module',
    category: 'Development',
    project: 'TimeTrack',
    syncStatus: 'synced',
    lastModified: new Date().toISOString(),
  },
  {
    id: '4',
    consultantId: 'c1',
    date: formatDateParam((() => { const d = new Date(); d.setDate(d.getDate() - 1); return d; })()),
    hours: 2,
    description: 'Documentation updates',
    category: 'Documentation',
    project: 'TimeTrack',
    syncStatus: 'pending',
    lastModified: new Date().toISOString(),
  },
  {
    id: '5',
    consultantId: 'c1',
    date: formatDateParam((() => { const d = new Date(); d.setDate(d.getDate() - 2); return d; })()),
    hours: 8,
    description: 'Full day on mobile UI implementation',
    category: 'Development',
    project: 'Aderant',
    syncStatus: 'synced',
    lastModified: new Date().toISOString(),
  },
];

const MOCK_METRICS = {
  totalHours: 56.0,
  etoHours: 33.92,
  pendingDays: 4,
  thisWeekHours: 32.0,
};

// --- Sub-Components ---

function MetricCard({
  label,
  value,
  subtext,
  valueColor,
  style,
}: {
  label: string;
  value: string;
  subtext: string;
  valueColor?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      className="rounded-xl p-3"
      style={[
        {
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.25)',
        },
        style,
      ]}
    >
      <Text
        className="font-medium mb-1"
        style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}
      >
        {label}
      </Text>
      <Text
        className="text-2xl font-bold"
        style={{ color: valueColor || '#FFFFFF' }}
      >
        {value}
      </Text>
      <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
        {subtext}
      </Text>
    </View>
  );
}

function DateChip({
  date,
  isSelected,
  isToday,
  hasEntries,
  onPress,
  chipWidth,
}: {
  date: Date;
  isSelected: boolean;
  isToday: boolean;
  hasEntries: boolean;
  onPress: () => void;
  chipWidth: number;
}) {
  const dayName = DAY_NAMES[date.getDay()];
  const dateNum = date.getDate();

  const chipBg = isSelected
    ? 'bg-primary'
    : isToday
      ? 'border-2 border-primary'
      : '';

  const dayColor = isSelected ? 'rgba(255,255,255,0.9)' : '#6B7280';
  const dateColor = isSelected ? '#FFFFFF' : '#1F2937';
  const dotColor = isSelected ? '#FFFFFF' : '#2563EB';

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`items-center justify-center rounded-xl mx-0.5 ${chipBg}`}
      style={{ width: chipWidth, height: 64 }}
      accessibilityLabel={`${dayName}, ${MONTH_NAMES[date.getMonth()]} ${dateNum}${hasEntries ? ', has entries' : ', no entries'}${isToday ? ', today' : ''}`}
      accessibilityRole="button"
    >
      <Text className="font-medium" style={{ fontSize: 11, color: dayColor }}>
        {dayName}
      </Text>
      <Text
        className="font-semibold mt-1"
        style={{ fontSize: 20, color: dateColor }}
      >
        {dateNum}
      </Text>
      {hasEntries && (
        <View
          className="rounded-full mt-2"
          style={{ width: 6, height: 6, backgroundColor: dotColor }}
        />
      )}
    </TouchableOpacity>
  );
}

function EntryRow({
  entry,
  onEdit,
  onDelete,
}: {
  entry: TimeEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View
      className="bg-gray-50 rounded-lg p-2.5 mb-2"
      style={{ borderLeftWidth: 3, borderLeftColor: '#2563EB' }}
    >
      <View className="flex-row">
        <View style={{ flex: 0.7 }}>
          <Text className="text-sm font-semibold text-gray-800">
            {entry.project}
          </Text>
          <Text
            className="text-gray-500 mt-0.5"
            style={{ fontSize: 13 }}
            numberOfLines={1}
          >
            {entry.description}
          </Text>
          <View className="flex-row flex-wrap mt-1.5">
            <View
              className="bg-white rounded mr-1 mb-1"
              style={{
                borderWidth: 1,
                borderColor: '#E5E7EB',
                paddingHorizontal: 4,
                paddingVertical: 1,
              }}
            >
              <Text style={{ fontSize: 10, color: '#4B5563' }}>
                {entry.category}
              </Text>
            </View>
            {entry.syncStatus === 'pending' && (
              <View
                className="rounded mr-1 mb-1"
                style={{
                  backgroundColor: '#FEF3C7',
                  borderWidth: 1,
                  borderColor: '#FCD34D',
                  paddingHorizontal: 4,
                  paddingVertical: 1,
                }}
              >
                <Text style={{ fontSize: 10, color: '#92400E' }}>Pending</Text>
              </View>
            )}
          </View>
        </View>
        <View style={{ flex: 0.3, alignItems: 'flex-end' }}>
          <Text className="text-base font-bold text-primary">
            {entry.hours.toFixed(2)}
          </Text>
          <View className="flex-row mt-2">
            <TouchableOpacity
              onPress={onEdit}
              className="items-center justify-center"
              style={{ width: 44, height: 44 }}
              accessibilityLabel={`Edit ${entry.project} entry`}
              accessibilityRole="button"
            >
              <Ionicons name="pencil" size={14} color="#2563EB" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onDelete}
              className="items-center justify-center ml-1"
              style={{ width: 44, height: 44 }}
              accessibilityLabel={`Delete ${entry.project} entry`}
              accessibilityRole="button"
            >
              <Ionicons name="trash" size={14} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

function DayCard({
  day,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
}: {
  day: DayData;
  onAddEntry: (date: string) => void;
  onEditEntry: (id: string) => void;
  onDeleteEntry: (id: string) => void;
}) {
  const hasEntries = day.entries.length > 0;

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-level-1" style={{ minHeight: 96 }}>
      {/* Card Header */}
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-gray-800">
          {day.fullLabel}
        </Text>
        {hasEntries && (
          <Text className="text-xl font-bold text-primary">
            {day.totalHours.toFixed(2)} hrs
          </Text>
        )}
      </View>

      {hasEntries ? (
        <>
          {/* Divider */}
          <View
            className="my-3"
            style={{ borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}
          />

          {/* Entries */}
          {day.entries.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              onEdit={() => onEditEntry(entry.id)}
              onDelete={() => onDeleteEntry(entry.id)}
            />
          ))}

          {/* Quick Add */}
          <TouchableOpacity
            onPress={() => onAddEntry(day.dateStr)}
            className="bg-primary rounded-lg px-3 py-1.5 mt-1 self-start"
            accessibilityLabel={`Add entry for ${day.fullLabel}`}
            accessibilityRole="button"
          >
            <Text className="text-white font-semibold" style={{ fontSize: 13 }}>
              + Add Entry
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        /* Empty Day State */
        <View className="items-center py-3">
          <Ionicons name="time-outline" size={32} color="#D1D5DB" />
          <Text className="text-sm text-gray-400 mt-2">No entries</Text>
          <TouchableOpacity
            onPress={() => onAddEntry(day.dateStr)}
            className="bg-primary rounded-lg px-3 py-1.5 mt-3"
            accessibilityLabel={`Add entry for ${day.fullLabel}`}
            accessibilityRole="button"
          >
            <Text className="text-white font-semibold" style={{ fontSize: 13 }}>
              + Add Entry
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function SubmissionStatusBadge({
  submission,
  thisWeekHours,
  onViewDetails,
}: {
  submission: TimesheetSubmission;
  thisWeekHours: number;
  onViewDetails: () => void;
}) {
  const statusConfig: Record<
    SubmissionStatus,
    { label: string; color: string; bgColor: string; icon: keyof typeof Ionicons.glyphMap }
  > = {
    draft: {
      label: 'Not submitted',
      color: '#6B7280',
      bgColor: '#F3F4F6',
      icon: 'document-text-outline',
    },
    submitted: {
      label: `Submitted ${submission.submittedAt ? `on ${new Date(submission.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}`,
      color: '#2563EB',
      bgColor: '#EFF6FF',
      icon: 'checkmark-circle',
    },
    approved: {
      label: 'Approved',
      color: '#10B981',
      bgColor: '#ECFDF5',
      icon: 'checkmark-circle',
    },
    rejected: {
      label: 'Rejected',
      color: '#EF4444',
      bgColor: '#FEF2F2',
      icon: 'information-circle',
    },
  };

  const config = statusConfig[submission.status];

  return (
    <TouchableOpacity
      onPress={onViewDetails}
      activeOpacity={0.7}
      className="flex-row items-center justify-between mx-4 mt-2 rounded-xl px-4"
      style={{
        backgroundColor: config.bgColor,
        height: 48,
        borderWidth: 1,
        borderColor: `${config.color}20`,
      }}
      accessibilityLabel={`Timesheet status: ${config.label}. Tap to view details.`}
      accessibilityRole="button"
    >
      <View className="flex-row items-center">
        <Ionicons name={config.icon} size={18} color={config.color} />
        <Text
          className="font-semibold ml-2"
          style={{ fontSize: 14, color: config.color }}
        >
          {config.label}
        </Text>
      </View>
      {submission.status !== 'draft' && (
        <Text style={{ fontSize: 12, color: config.color }}>
          {thisWeekHours.toFixed(1)} hrs
        </Text>
      )}
    </TouchableOpacity>
  );
}

function ConfirmSubmitModal({
  visible,
  totalHours,
  onCancel,
  onConfirm,
  isSubmitting,
}: {
  visible: boolean;
  totalHours: number;
  onCancel: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType={Platform.OS === 'ios' ? 'slide' : 'fade'}
      onRequestClose={onCancel}
    >
      <View
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onCancel}
          accessibilityLabel="Close modal"
        />
        <View
          className="bg-white"
          style={{
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: Platform.OS === 'ios' ? 40 : 24,
          }}
        >
          {/* Handle indicator */}
          <View
            className="self-center rounded-full mb-4"
            style={{ width: 40, height: 4, backgroundColor: '#D1D5DB' }}
          />

          {/* Title */}
          <Text
            className="font-bold text-gray-900"
            style={{ fontSize: 24, lineHeight: 32 }}
          >
            Submit Timesheet?
          </Text>

          {/* Summary */}
          <View
            className="flex-row items-center mt-4 rounded-xl px-4"
            style={{ height: 56, backgroundColor: '#EFF6FF' }}
          >
            <Ionicons name="time" size={22} color="#2563EB" />
            <Text
              className="font-bold ml-3"
              style={{ fontSize: 20, color: '#2563EB' }}
            >
              {totalHours.toFixed(1)} hours
            </Text>
            <Text
              className="ml-2"
              style={{ fontSize: 14, color: '#6B7280' }}
            >
              total for this period
            </Text>
          </View>

          {/* Warning */}
          <View
            className="flex-row mt-4 rounded-lg p-3"
            style={{ backgroundColor: '#FFFBEB' }}
          >
            <Ionicons name="warning" size={18} color="#F59E0B" style={{ marginTop: 2 }} />
            <Text
              className="flex-1 ml-2"
              style={{ fontSize: 14, lineHeight: 20, color: '#92400E' }}
            >
              Once submitted, entries cannot be edited until approved or rejected.
            </Text>
          </View>

          {/* Actions */}
          <View className="flex-row mt-6" style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={onCancel}
              disabled={isSubmitting}
              className="flex-1 items-center justify-center rounded-xl"
              style={{
                height: 52,
                borderWidth: 1.5,
                borderColor: '#D1D5DB',
                backgroundColor: '#FFFFFF',
              }}
              accessibilityLabel="Cancel submission"
              accessibilityRole="button"
            >
              <Text
                className="font-semibold"
                style={{ fontSize: 16, color: '#4B5563' }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              disabled={isSubmitting}
              className="flex-1 flex-row items-center justify-center rounded-xl"
              style={{
                height: 52,
                backgroundColor: isSubmitting ? '#93C5FD' : '#2563EB',
              }}
              accessibilityLabel="Confirm and submit timesheet"
              accessibilityRole="button"
              accessibilityState={{ disabled: isSubmitting }}
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text
                    className="font-semibold ml-2"
                    style={{ fontSize: 16, color: '#FFFFFF' }}
                  >
                    Submitting...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="send" size={18} color="#FFFFFF" />
                  <Text
                    className="font-semibold ml-2"
                    style={{ fontSize: 16, color: '#FFFFFF' }}
                  >
                    Submit
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// --- Main Screen ---

export default function TimesheetListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const { width: screenWidth } = useWindowDimensions();
  const chipWidth = (screenWidth - 16) / 7.2;
  const cardWidth = screenWidth * 0.7; // 70% width shows edge of next card

  const today = useMemo(() => new Date(), []);

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [refreshing, setRefreshing] = useState(false);
  const [metricsScrollIndex, setMetricsScrollIndex] = useState(0);
  const metricsScrollRef = useRef<ScrollView>(null);

  // Calculate current week bounds based on offset
  const weekStart = useMemo(() => {
    const start = getWeekStart(today);
    start.setDate(start.getDate() + weekOffset * 7);
    return start;
  }, [today, weekOffset]);

  const weekEnd = useMemo(() => getWeekEnd(weekStart), [weekStart]);

  const weekDates = useMemo(() => generateWeekDates(weekStart), [weekStart]);

  const weekLabel = useMemo(() => {
    const startMonth = MONTH_NAMES[weekStart.getMonth()];
    const endMonth = MONTH_NAMES[weekEnd.getMonth()];
    if (startMonth === endMonth) {
      return `${startMonth} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;
    }
    return `${startMonth} ${weekStart.getDate()} - ${endMonth} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;
  }, [weekStart, weekEnd]);

  // GraphQL query for week entries
  // TODO: Switch from mock data when backend is available
  const { data, loading, error, refetch } = useAuthenticatedQuery(
    WEEK_TIME_ENTRIES_QUERY,
    {
      variables: {
        startDate: formatDateParam(weekStart),
        endDate: formatDateParam(weekEnd),
      },
    },
  );

  // Mock pay period ID (TODO: derive from actual pay period when backend is connected)
  const payPeriodId = useMemo(() => {
    return `pp-${formatDateParam(weekStart)}`;
  }, [weekStart]);

  // Submission status query
  const {
    data: submissionData,
    refetch: refetchSubmission,
  } = useAuthenticatedQuery(TIMESHEET_SUBMISSION_QUERY, {
    variables: { payPeriodId },
  });

  const submission: TimesheetSubmission | null = useMemo(() => {
    return submissionData?.timesheetSubmissionByPayPeriod ?? null;
  }, [submissionData]);

  const isSubmitted = submission !== null && submission.status !== 'draft';

  // Submit mutation
  const [submitTimesheet, { loading: isSubmitting }] = useAuthenticatedMutation(
    SUBMIT_TIMESHEET_MUTATION,
    {
      refetchQueries: ['WeekTimeEntries', 'TimesheetSubmissionByPayPeriod'],
    },
  );

  // Delete mutation
  const [deleteEntry] = useAuthenticatedMutation(DELETE_TIME_ENTRY_MUTATION, {
    refetchQueries: ['WeekTimeEntries'],
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Use API data if available, fall back to mock data
  const entries: TimeEntry[] = useMemo(() => {
    if (data?.timeEntries?.length > 0) {
      return data.timeEntries;
    }
    // Fall back to mock data for development
    return MOCK_ENTRIES;
  }, [data]);

  // Group entries by date and build day data
  const dayDataList: DayData[] = useMemo(() => {
    const entryMap = new Map<string, TimeEntry[]>();
    for (const entry of entries) {
      const dateKey = entry.date.slice(0, 10); // YYYY-MM-DD
      const existing = entryMap.get(dateKey) || [];
      existing.push(entry);
      entryMap.set(dateKey, existing);
    }

    return weekDates.map((date) => {
      const dateStr = formatDateParam(date);
      const dayEntries = entryMap.get(dateStr) || [];
      const totalHours = dayEntries.reduce((sum, e) => sum + e.hours, 0);
      const dayOfWeek = DAY_NAMES[date.getDay()];
      const monthName = MONTH_NAMES[date.getMonth()];

      return {
        date,
        dateStr,
        dayName: dayOfWeek,
        dayNumber: date.getDate(),
        monthName,
        fullLabel: `${FULL_DAY_NAMES[date.getDay()]}, ${monthName} ${date.getDate()}`,
        entries: dayEntries,
        totalHours,
      };
    });
  }, [weekDates, entries]);

  // Compute this-week hours from entries
  const thisWeekHours = useMemo(
    () => dayDataList.reduce((sum, d) => sum + d.totalHours, 0),
    [dayDataList],
  );

  // Metrics (using mock + computed)
  const metrics = useMemo(
    () => ({
      ...MOCK_METRICS,
      thisWeekHours,
    }),
    [thisWeekHours],
  );

  // Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetch(), refetchSubmission()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetch, refetchSubmission]);

  const handleAddEntry = useCallback(
    (date: string) => {
      router.push({ pathname: '/add-entry', params: { date } });
    },
    [router],
  );

  const handleEditEntry = useCallback(
    (id: string) => {
      router.push({ pathname: '/add-entry', params: { id } });
    },
    [router],
  );

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

  const handleSubmitPress = useCallback(() => {
    setShowConfirmModal(true);
  }, []);

  const handleConfirmSubmit = useCallback(async () => {
    try {
      await submitTimesheet({
        variables: { payPeriodId },
      });
      setShowConfirmModal(false);
      await refetchSubmission();
      Alert.alert(
        'Timesheet Submitted',
        'Your timesheet has been submitted for approval.',
      );
    } catch (err) {
      setShowConfirmModal(false);
      Alert.alert(
        'Submission Failed',
        'Could not submit your timesheet. Please try again.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: handleSubmitPress },
        ],
      );
    }
  }, [submitTimesheet, payPeriodId, refetchSubmission, handleSubmitPress]);

  const handleCancelSubmit = useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  const handleViewSubmissionDetails = useCallback(() => {
    if (!submission) return;

    const details: string[] = [];
    if (submission.submittedAt) {
      details.push(`Submitted: ${new Date(submission.submittedAt).toLocaleString()}`);
    }
    if (submission.approvedAt && submission.approvedBy) {
      details.push(`Approved: ${new Date(submission.approvedAt).toLocaleString()}`);
      details.push(`By: ${submission.approvedBy}`);
    }
    if (submission.rejectedAt && submission.rejectedBy) {
      details.push(`Rejected: ${new Date(submission.rejectedAt).toLocaleString()}`);
      details.push(`By: ${submission.rejectedBy}`);
    }
    if (submission.comments) {
      details.push(`Comments: ${submission.comments}`);
    }
    details.push(`Total Hours: ${thisWeekHours.toFixed(1)}`);

    Alert.alert('Submission Details', details.join('\n'));
  }, [submission, thisWeekHours]);

  const handlePrevWeek = useCallback(() => {
    setWeekOffset((prev) => prev - 1);
  }, []);

  const handleNextWeek = useCallback(() => {
    setWeekOffset((prev) => prev + 1);
  }, []);

  const handleFabPress = useCallback(() => {
    const dateParam = formatDateParam(selectedDate);
    router.push({ pathname: '/add-entry', params: { date: dateParam } });
  }, [router, selectedDate]);

  const handleMetricsScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { x: number } } }) => {
      const idx = Math.round(event.nativeEvent.contentOffset.x / (cardWidth + 12));
      setMetricsScrollIndex(idx);
    },
    [cardWidth],
  );

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="light" />

      {/* === Top Navigation Bar === */}
      <View
        className="bg-primary shadow-level-1"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center justify-between px-4" style={{ height: 56 }}>
          <TouchableOpacity
            className="items-center justify-center"
            style={{ width: 44, height: 44 }}
            accessibilityLabel="Menu"
            accessibilityRole="button"
          >
            <Ionicons name="menu" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <Text className="text-xl font-semibold text-white">Timesheet</Text>

          <View className="flex-row items-center">
            <TouchableOpacity
              className="items-center justify-center"
              style={{ width: 44, height: 44 }}
              accessibilityLabel="Toggle view"
              accessibilityRole="button"
            >
              <Ionicons name="grid-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              className="items-center justify-center ml-3"
              style={{ width: 44, height: 44 }}
              accessibilityLabel="Filter"
              accessibilityRole="button"
            >
              <Ionicons name="filter" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* === Metrics Banner === */}
      <LinearGradient
        colors={['#2563EB', '#1E40AF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="shadow-level-1"
        style={{ height: 100, paddingVertical: 18, paddingHorizontal: 12 }}
      >
        <ScrollView
          ref={metricsScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleMetricsScroll}
          scrollEventThrottle={32}
          snapToInterval={cardWidth + 12}
          decelerationRate="fast"
        >
          <MetricCard
            label="Total Hours"
            value={metrics.totalHours.toFixed(2)}
            subtext="this period"
            style={{ width: cardWidth, marginRight: 12 }}
          />
          <MetricCard
            label="ETO"
            value={metrics.etoHours.toFixed(2)}
            subtext="hours used"
            valueColor="#0EA5E9"
            style={{ width: cardWidth, marginRight: 12 }}
          />
          <MetricCard
            label="Pending"
            value={String(metrics.pendingDays)}
            subtext="days left"
            valueColor="#F59E0B"
            style={{ width: cardWidth, marginRight: 12 }}
          />
          <MetricCard
            label="This Week"
            value={metrics.thisWeekHours.toFixed(2)}
            subtext="hours logged"
            style={{ width: cardWidth, marginRight: 12 }}
          />
        </ScrollView>

        {/* Pagination Dots */}
        <View className="flex-row items-center justify-center mt-2">
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              className="rounded-full mx-1"
              style={{
                width: 8,
                height: 8,
                backgroundColor:
                  i === metricsScrollIndex
                    ? '#FFFFFF'
                    : 'rgba(255,255,255,0.5)',
              }}
            />
          ))}
        </View>
      </LinearGradient>

      {/* === Week Date Header === */}
      <View
        className="bg-white px-2 py-2"
        style={{ borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}
      >
        {/* Week Nav Row */}
        <View className="flex-row items-center justify-between px-2 mb-2">
          <TouchableOpacity
            onPress={handlePrevWeek}
            className="items-center justify-center"
            style={{ width: 44, height: 44 }}
            accessibilityLabel="Previous week"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={20} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-sm font-semibold text-gray-800">
            {weekLabel}
          </Text>
          <TouchableOpacity
            onPress={handleNextWeek}
            className="items-center justify-center"
            style={{ width: 44, height: 44 }}
            accessibilityLabel="Next week"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Date Chips */}
        <View className="flex-row justify-center">
          {weekDates.map((date) => {
            const dateStr = formatDateParam(date);
            const hasEntries = dayDataList.some(
              (d) => d.dateStr === dateStr && d.entries.length > 0,
            );
            return (
              <DateChip
                key={dateStr}
                date={date}
                isSelected={isSameDay(date, selectedDate)}
                isToday={isSameDay(date, today)}
                hasEntries={hasEntries}
                onPress={() => setSelectedDate(date)}
                chipWidth={chipWidth}
              />
            );
          })}
        </View>
      </View>

      {/* === Submission Status Badge === */}
      {submission && submission.status !== 'draft' && (
        <SubmissionStatusBadge
          submission={submission}
          thisWeekHours={thisWeekHours}
          onViewDetails={handleViewSubmissionDetails}
        />
      )}

      {/* === Daily Entry Cards (Vertical Scroll) === */}
      {loading && !entries.length ? (
        <ScrollView className="flex-1 px-4 pt-3">
          <DayCardSkeletonList count={7} />
        </ScrollView>
      ) : error && !entries.length ? (
        <ErrorView
          error={error}
          onRetry={refetch}
          onLogout={logout}
        />
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-3"
          contentContainerStyle={{ paddingBottom: isSubmitted ? 88 : 160 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#2563EB"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {dayDataList.map((day) => (
            <DayCard
              key={day.dateStr}
              day={day}
              onAddEntry={handleAddEntry}
              onEditEntry={handleEditEntry}
              onDeleteEntry={handleDeleteEntry}
            />
          ))}
        </ScrollView>
      )}

      {/* === Submit Timesheet Footer === */}
      {!isSubmitted && (
        <View
          className="absolute left-0 right-0 bg-white shadow-level-2"
          style={{
            bottom: 0,
            paddingBottom: insets.bottom + 8,
            paddingTop: 12,
            paddingHorizontal: 16,
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
          }}
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              {submission?.status === 'draft' || !submission
                ? 'Not submitted'
                : ''}
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              {thisWeekHours.toFixed(1)} hrs this week
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleSubmitPress}
            disabled={thisWeekHours === 0}
            activeOpacity={0.8}
            className="flex-row items-center justify-center rounded-xl"
            style={{
              height: 52,
              backgroundColor: thisWeekHours === 0 ? '#D1D5DB' : '#2563EB',
            }}
            accessibilityLabel="Submit timesheet for approval"
            accessibilityRole="button"
            accessibilityState={{ disabled: thisWeekHours === 0 }}
          >
            <Ionicons
              name="send"
              size={18}
              color={thisWeekHours === 0 ? '#9CA3AF' : '#FFFFFF'}
            />
            <Text
              className="font-semibold ml-2"
              style={{
                fontSize: 16,
                color: thisWeekHours === 0 ? '#9CA3AF' : '#FFFFFF',
              }}
            >
              Submit Timesheet
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* === Floating Action Button === */}
      {!isSubmitted ? (
        <TouchableOpacity
          onPress={handleFabPress}
          className="absolute bg-primary rounded-full shadow-level-3 items-center justify-center"
          style={{
            width: 56,
            height: 56,
            bottom: 96 + insets.bottom,
            right: 16,
          }}
          activeOpacity={0.8}
          accessibilityLabel={`Add time entry for ${formatDateParam(selectedDate)}`}
          accessibilityRole="button"
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={handleFabPress}
          disabled
          className="absolute rounded-full shadow-level-3 items-center justify-center"
          style={{
            width: 56,
            height: 56,
            bottom: 16 + insets.bottom,
            right: 16,
            backgroundColor: '#D1D5DB',
          }}
          activeOpacity={0.8}
          accessibilityLabel="Cannot add entries to submitted timesheet"
          accessibilityRole="button"
          accessibilityState={{ disabled: true }}
        >
          <Ionicons name="add" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      )}

      {/* === Confirmation Modal === */}
      <ConfirmSubmitModal
        visible={showConfirmModal}
        totalHours={thisWeekHours}
        onCancel={handleCancelSubmit}
        onConfirm={handleConfirmSubmit}
        isSubmitting={isSubmitting}
      />
    </View>
  );
}
