import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useDatePicker } from '@/components/DatePicker';
import { useTimePicker } from '@/components/TimePicker';
import { useAuthenticatedMutation } from '@/hooks/useAuthenticatedMutation';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import {
  CREATE_TIME_ENTRY_MUTATION,
  UPDATE_TIME_ENTRY_MUTATION,
} from '@/lib/graphql/mutations';
import { TIME_ENTRY_QUERY } from '@/lib/graphql/queries';

// --- Types ---

interface TimeEntryPairData {
  id: string;
  inTime: string; // HH:MM format
  outTime: string; // HH:MM format
}

interface FormErrors {
  client?: string;
  description?: string;
  timeEntries?: string;
  general?: string;
}

// --- Constants ---

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DEFAULT_IN_TIME = '08:00';
const DEFAULT_OUT_TIME = '17:00';

// Mock last-used client for smart defaults
// TODO: Fetch from user's recent entries when backend is connected
const MOCK_LAST_CLIENT = {
  name: 'Advent',
  lastUsed: 'Last used today',
};

// Mock yesterday's entry for "Duplicate Yesterday"
// TODO: Fetch from backend when connected
const MOCK_YESTERDAY_ENTRY = {
  client: 'Advent',
  description: 'Worked on PR #239, code review',
  projectTask: 'PR #239',
  timeEntries: [
    { id: '1', inTime: '08:00', outTime: '12:00' },
    { id: '2', inTime: '13:00', outTime: '17:00' },
  ],
};

// --- Utilities ---

function formatDateParam(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function generateWeekStrip(center: Date): Date[] {
  // Show selected date ±3 days (7 days total, 4 visible at a time)
  const dates: Date[] = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(center);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function calculateHoursFromEntries(entries: TimeEntryPairData[]): number {
  let totalMinutes = 0;
  for (const entry of entries) {
    const inMinutes = parseTimeToMinutes(entry.inTime);
    const outMinutes = parseTimeToMinutes(entry.outTime);
    if (outMinutes > inMinutes) {
      totalMinutes += outMinutes - inMinutes;
    }
  }
  return totalMinutes / 60;
}

function formatHours(hours: number): string {
  return hours.toFixed(1);
}

function isValidTimeEntry(entry: TimeEntryPairData): boolean {
  const inMin = parseTimeToMinutes(entry.inTime);
  const outMin = parseTimeToMinutes(entry.outTime);
  return outMin > inMin;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatTimeDisplay(time: string): string {
  // Convert HH:MM to display format
  const [h, m] = time.split(':').map(Number);
  if (Platform.OS === 'ios') {
    // 12-hour for iOS
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
  }
  return time;
}

// --- Sub-Components ---

function DateSelectorCard({
  date,
  onPress,
}: {
  date: Date;
  onPress: () => void;
}) {
  const formattedDate = `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  const dayOfWeek = FULL_DAY_NAMES[date.getDay()];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityLabel={`Date selector, currently ${formattedDate}, ${dayOfWeek}`}
      accessibilityRole="button"
      accessibilityHint="Tap to change date"
    >
      <LinearGradient
        colors={['#2563EB', '#3B82F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="mx-md mt-md shadow-level-2"
        style={{ height: 96, borderRadius: 16, padding: 20, justifyContent: 'center', alignItems: 'center' }}
      >
        <Text className="text-h2 font-bold" style={{ color: '#FFFFFF' }}>
          {formattedDate}
        </Text>
        <Text className="text-body mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {dayOfWeek}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function WeekStripCard({
  dates,
  selectedDate,
  onSelect,
}: {
  dates: Date[];
  selectedDate: Date;
  onSelect: (date: Date) => void;
}) {
  const today = useMemo(() => new Date(), []);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mx-md mt-3"
      contentContainerStyle={{ gap: 8 }}
    >
      {dates.map((date) => {
        const isSelected = isSameDay(date, selectedDate);
        const isToday = isSameDay(date, today);

        return (
          <TouchableOpacity
            key={formatDateParam(date)}
            onPress={() => onSelect(date)}
            activeOpacity={0.8}
            className={`items-center justify-center ${
              isSelected
                ? 'bg-primary shadow-level-1'
                : isToday
                  ? 'bg-primary-light/10'
                  : 'bg-white'
            }`}
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              borderWidth: isSelected ? 0 : 1,
              borderColor: isSelected ? 'transparent' : '#E5E7EB',
            }}
            accessibilityLabel={`${FULL_DAY_NAMES[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}${isToday ? ', today' : ''}`}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            <Text
              className="text-h4 font-semibold"
              style={{ color: isSelected ? '#FFFFFF' : '#1F2937' }}
            >
              {date.getDate()}
            </Text>
            <Text
              className="text-caption"
              style={{ color: isSelected ? 'rgba(255,255,255,0.9)' : '#6B7280' }}
            >
              {DAY_NAMES[date.getDay()]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function ClientCard({
  clientName,
  subtext,
  onPress,
  isExpanded,
}: {
  clientName: string;
  subtext: string;
  onPress: () => void;
  isExpanded: boolean;
}) {
  if (isExpanded) {
    return (
      <View className="mx-md mt-3">
        <Text className="text-body-small text-gray-700 mb-2">Client</Text>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.8}
          className="bg-white flex-row items-center"
          style={{
            height: 56,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#D1D5DB',
            paddingHorizontal: 16,
          }}
          accessibilityLabel={`Client, ${clientName}`}
          accessibilityRole="button"
        >
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <Text className="text-body text-gray-800 font-semibold flex-1 ml-3">
            {clientName}
          </Text>
          <Ionicons name="checkmark" size={20} color="#2563EB" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="mx-md mt-3 bg-gray-50 flex-row items-center"
      style={{
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 16,
      }}
      accessibilityLabel={`Client, ${clientName}, ${subtext}`}
      accessibilityRole="button"
    >
      <Ionicons name="bookmark" size={20} color="#2563EB" />
      <View className="ml-3 flex-1">
        <Text className="text-body-large text-gray-800 font-semibold">
          {clientName}
        </Text>
        <Text className="text-caption text-gray-500">{subtext}</Text>
      </View>
      <Ionicons name="checkmark-circle" size={20} color="#2563EB" />
    </TouchableOpacity>
  );
}

function TimeEntryPairRow({
  entry,
  index,
  showLabel,
  onChangeInTime,
  onChangeOutTime,
  onRemove,
  canRemove,
  error,
}: {
  entry: TimeEntryPairData;
  index: number;
  showLabel: boolean;
  onChangeInTime: (time: string) => void;
  onChangeOutTime: (time: string) => void;
  onRemove: () => void;
  canRemove: boolean;
  error?: string;
}) {
  const isValid = isValidTimeEntry(entry);
  const borderColor = error ? '#EF4444' : '#D1D5DB';

  const inTimePicker = useTimePicker({
    value: entry.inTime,
    onChange: onChangeInTime,
    label: 'In Time',
  });

  const outTimePicker = useTimePicker({
    value: entry.outTime,
    onChange: onChangeOutTime,
    label: 'Out Time',
  });

  return (
    <View className="mx-md mt-3">
      {showLabel && (
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-body-small text-gray-700">
            Time Entry {index + 1}
          </Text>
          {canRemove && (
            <TouchableOpacity
              onPress={onRemove}
              style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}
              accessibilityLabel={`Remove time entry ${index + 1}`}
              accessibilityRole="button"
            >
              <Ionicons name="close-circle" size={20} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      )}
      <View
        className="bg-white shadow-level-1 flex-row"
        style={{
          borderRadius: 16,
          borderWidth: error ? 2 : 1,
          borderColor,
          padding: 16,
          gap: 12,
        }}
      >
        {/* In Time */}
        <TouchableOpacity
          className="flex-1 items-center"
          style={{ height: 56, justifyContent: 'center' }}
          onPress={inTimePicker.open}
          accessibilityLabel={`In time, ${formatTimeDisplay(entry.inTime)}`}
          accessibilityRole="button"
          accessibilityHint="Tap to change start time"
        >
          <Text className="text-h3 font-bold" style={{ color: '#2563EB' }}>
            {entry.inTime}
          </Text>
          <Text className="text-caption text-gray-500 mt-1">In Time</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View
          style={{
            width: 1,
            backgroundColor: '#E5E7EB',
            marginVertical: 4,
          }}
        />

        {/* Out Time */}
        <TouchableOpacity
          className="flex-1 items-center"
          style={{ height: 56, justifyContent: 'center' }}
          onPress={outTimePicker.open}
          accessibilityLabel={`Out time, ${formatTimeDisplay(entry.outTime)}`}
          accessibilityRole="button"
          accessibilityHint="Tap to change end time"
        >
          <Text className="text-h3 font-bold" style={{ color: '#2563EB' }}>
            {entry.outTime}
          </Text>
          <Text className="text-caption text-gray-500 mt-1">Out Time</Text>
        </TouchableOpacity>
      </View>
      {inTimePicker.modal}
      {outTimePicker.modal}
      {error && (
        <Text className="text-caption text-error mt-1 ml-1">{error}</Text>
      )}
      {!isValid && !error && entry.inTime && entry.outTime && (
        <Text className="text-caption text-error mt-1 ml-1">
          Out time must be after in time
        </Text>
      )}
    </View>
  );
}

function TotalHoursDisplay({ hours }: { hours: number }) {
  const hoursColor =
    hours <= 0
      ? '#EF4444'
      : hours < 4
        ? '#F59E0B'
        : hours > 12
          ? '#F59E0B'
          : '#2563EB';

  return (
    <View
      className="mx-md mt-md items-center justify-center"
      style={{
        height: 64,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: hoursColor,
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 16,
      }}
      accessibilityLabel={`Total ${formatHours(hours)} hours`}
      accessibilityRole="text"
    >
      <View className="flex-row items-center">
        <Ionicons name="time" size={20} color={hoursColor} />
        <Text
          className="text-h2 font-bold ml-2"
          style={{ color: hoursColor }}
        >
          {formatHours(hours)}
        </Text>
      </View>
      <Text className="text-body-small text-gray-600">hours</Text>
    </View>
  );
}

function DuplicateYesterdayButton({
  onPress,
  isAvailable,
}: {
  onPress: () => void;
  isAvailable: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!isAvailable}
      activeOpacity={0.8}
      className={`mx-md mt-3 flex-row items-center justify-center shadow-level-1 ${
        isAvailable ? '' : 'opacity-50'
      }`}
      style={{
        height: 48,
        borderRadius: 12,
        backgroundColor: isAvailable ? '#0EA5E9' : '#D1D5DB',
      }}
      accessibilityLabel="Duplicate yesterday's entry"
      accessibilityRole="button"
      accessibilityState={{ disabled: !isAvailable }}
    >
      <Ionicons
        name="clipboard"
        size={20}
        color={isAvailable ? '#FFFFFF' : '#6B7280'}
      />
      <Text
        className="text-body font-semibold ml-2"
        style={{ color: isAvailable ? '#FFFFFF' : '#6B7280' }}
      >
        Duplicate Yesterday
      </Text>
    </TouchableOpacity>
  );
}

function ExpandToggle({
  isExpanded,
  onToggle,
}: {
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const rotateValue = useSharedValue(0);

  useEffect(() => {
    rotateValue.value = withTiming(isExpanded ? 180 : 0, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
  }, [isExpanded, rotateValue]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateValue.value}deg` }],
  }));

  return (
    <TouchableOpacity
      onPress={onToggle}
      className="mt-2 mb-md items-center justify-center flex-row"
      style={{ height: 44 }}
      accessibilityLabel={
        isExpanded ? 'Show less details' : 'Show more details'
      }
      accessibilityRole="button"
    >
      <Text className="text-body font-semibold" style={{ color: '#2563EB' }}>
        {isExpanded ? 'Less Details' : 'More Details'}
      </Text>
      <Animated.View style={[{ marginLeft: 4 }, chevronStyle]}>
        <Ionicons name="chevron-down" size={16} color="#2563EB" />
      </Animated.View>
    </TouchableOpacity>
  );
}

// --- Main Screen ---

export default function AddEntryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ date?: string; id?: string }>();

  const isEditMode = !!params.id;

  // --- State ---
  const [isExpanded, setIsExpanded] = useState(isEditMode);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (params.date) {
      return parseDate(params.date);
    }
    return new Date();
  });
  const [client, setClient] = useState(MOCK_LAST_CLIENT.name);
  const [description, setDescription] = useState('');
  const [projectTask, setProjectTask] = useState('');
  const [timeEntries, setTimeEntries] = useState<TimeEntryPairData[]>([
    { id: generateId(), inTime: DEFAULT_IN_TIME, outTime: DEFAULT_OUT_TIME },
  ]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  // --- Derived State ---
  const totalHours = useMemo(
    () => calculateHoursFromEntries(timeEntries),
    [timeEntries],
  );

  const weekStrip = useMemo(
    () => generateWeekStrip(selectedDate),
    [selectedDate],
  );

  const headerTitle = isEditMode
    ? 'Edit Entry'
    : isExpanded
      ? 'Add Entry'
      : 'Quick Add';

  const saveButtonLabel = isEditMode
    ? 'Update Entry'
    : isExpanded
      ? 'Save Entry'
      : 'Quick Save';

  // --- Animation ---
  const expandedHeight = useSharedValue(0);

  useEffect(() => {
    expandedHeight.value = withTiming(isExpanded ? 1 : 0, {
      duration: isExpanded ? 400 : 300,
      easing: isExpanded ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
    });
  }, [isExpanded, expandedHeight]);

  const expandedStyle = useAnimatedStyle(() => ({
    opacity: expandedHeight.value,
    maxHeight: expandedHeight.value * 600,
    overflow: 'hidden' as const,
  }));

  // --- GraphQL ---
  const [createEntry] = useAuthenticatedMutation(CREATE_TIME_ENTRY_MUTATION, {
    refetchQueries: ['WeekTimeEntries'],
  });

  const [updateEntry] = useAuthenticatedMutation(UPDATE_TIME_ENTRY_MUTATION, {
    refetchQueries: ['WeekTimeEntries'],
  });

  // Fetch existing entry for edit mode
  const { data: existingEntryData } = useAuthenticatedQuery(TIME_ENTRY_QUERY, {
    variables: { id: params.id },
    skip: !params.id,
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (existingEntryData?.timeEntry) {
      const entry = existingEntryData.timeEntry;
      setSelectedDate(parseDate(entry.date));
      setClient(entry.project || MOCK_LAST_CLIENT.name);
      setDescription(entry.description || '');
      setProjectTask(entry.category || '');
      // For edit mode, use the stored hours to create a single time entry pair
      // TODO: Support multiple time entry pairs from backend
      const totalMin = (entry.hours || 8) * 60;
      const inMin = 8 * 60; // default 08:00
      const outMin = inMin + totalMin;
      const outH = Math.floor(outMin / 60);
      const outM = outMin % 60;
      setTimeEntries([
        {
          id: generateId(),
          inTime: '08:00',
          outTime: `${String(outH).padStart(2, '0')}:${String(outM).padStart(2, '0')}`,
        },
      ]);
    }
  }, [existingEntryData]);

  // --- Date Picker ---
  const datePicker = useDatePicker({
    value: selectedDate,
    onChange: setSelectedDate,
  });

  // --- Handlers ---

  const handleClientPress = useCallback(() => {
    // TODO: Open client selector/autocomplete
    Alert.alert(
      'Client Selector',
      'Client autocomplete will be integrated when client list API is available',
    );
  }, []);

  const handleDuplicateYesterday = useCallback(() => {
    // Copy mock yesterday's entry
    // TODO: Fetch actual yesterday's entry from backend
    setClient(MOCK_YESTERDAY_ENTRY.client);
    setDescription(MOCK_YESTERDAY_ENTRY.description);
    setProjectTask(MOCK_YESTERDAY_ENTRY.projectTask);
    setTimeEntries(
      MOCK_YESTERDAY_ENTRY.timeEntries.map((e) => ({
        ...e,
        id: generateId(),
      })),
    );

    const yesterday = new Date(selectedDate);
    yesterday.setDate(yesterday.getDate() - 1);
    Alert.alert(
      'Duplicated',
      `Copied from ${MONTH_NAMES[yesterday.getMonth()]} ${yesterday.getDate()}`,
    );
  }, [selectedDate]);

  const handleAddTimeEntry = useCallback(() => {
    setTimeEntries((prev) => [
      ...prev,
      { id: generateId(), inTime: '13:00', outTime: '17:00' },
    ]);
  }, []);

  const handleRemoveTimeEntry = useCallback((id: string) => {
    setTimeEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleUpdateInTime = useCallback((id: string, time: string) => {
    setTimeEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, inTime: time } : e)),
    );
  }, []);

  const handleUpdateOutTime = useCallback((id: string, time: string) => {
    setTimeEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, outTime: time } : e)),
    );
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!client.trim()) {
      newErrors.client = 'Client is required';
    }

    if (isExpanded && !description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (timeEntries.length === 0) {
      newErrors.timeEntries = 'At least one time entry is required';
    }

    const hasInvalidTimes = timeEntries.some((e) => !isValidTimeEntry(e));
    if (hasInvalidTimes) {
      newErrors.timeEntries = 'All time entries must have out time after in time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [client, description, isExpanded, timeEntries]);

  const handleSave = useCallback(async () => {
    if (!validate()) return;

    setIsSaving(true);
    setErrors({});

    const dateStr = formatDateParam(selectedDate);
    const autoDescription = isExpanded
      ? description.trim()
      : description.trim() || `Work on ${client} - ${dateStr}`;

    const input = {
      date: dateStr,
      hours: totalHours,
      description: autoDescription,
      category: projectTask.trim() || undefined,
      project: client.trim(),
    };

    try {
      if (isEditMode && params.id) {
        await updateEntry({
          variables: { id: params.id, input },
        });
      } else {
        await createEntry({
          variables: { input },
        });
      }

      Alert.alert('Success', 'Time entry saved!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error('Save failed:', err);
      setErrors({
        general: 'Failed to save. Please try again.',
      });
      // TODO: Remove mock alert when backend is connected
      Alert.alert('Save Failed (Dev)', 'Backend unavailable. Entry was not saved.');
    } finally {
      setIsSaving(false);
    }
  }, [
    validate,
    selectedDate,
    isExpanded,
    description,
    client,
    projectTask,
    totalHours,
    isEditMode,
    params.id,
    updateEntry,
    createEntry,
    router,
  ]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  // --- Render ---

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* Modal Header */}
      <View
        className="bg-white shadow-level-1"
        style={{
          paddingTop: insets.top,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
        }}
      >
        <View
          className="flex-row items-center justify-between px-4"
          style={{ height: 56 }}
        >
          <TouchableOpacity
            onPress={handleClose}
            className="items-center justify-center"
            style={{ width: 44, height: 44 }}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={24} color="#4B5563" />
          </TouchableOpacity>

          <Text className="text-h4 font-semibold text-gray-800">
            {headerTitle}
          </Text>

          {/* Spacer for centering */}
          <View style={{ width: 44 }} />
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Date Selector Card */}
        <DateSelectorCard date={selectedDate} onPress={datePicker.open} />

        {/* Week Strip */}
        <WeekStripCard
          dates={weekStrip}
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
        />

        {/* Client Card */}
        <ClientCard
          clientName={client}
          subtext={MOCK_LAST_CLIENT.lastUsed}
          onPress={handleClientPress}
          isExpanded={isExpanded}
        />
        {errors.client && (
          <Text className="text-caption text-error mx-md mt-1">
            {errors.client}
          </Text>
        )}

        {/* Expanded-only fields */}
        <Animated.View style={expandedStyle}>
          {/* Description Field */}
          <View className="mx-md mt-3">
            <Text className="text-body-small text-gray-700 mb-2">
              Description *
            </Text>
            <TextInput
              className="bg-white text-body text-gray-800"
              style={{
                minHeight: 96,
                maxHeight: 160,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: errors.description ? '#EF4444' : '#D1D5DB',
                padding: 12,
              }}
              placeholder="What did you work on?"
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (errors.description) {
                  setErrors((prev) => ({ ...prev, description: undefined }));
                }
              }}
              multiline
              textAlignVertical="top"
              maxLength={500}
              accessibilityLabel="Description"
              accessibilityHint="Required field, describe what you worked on"
            />
            <Text className="text-caption text-gray-500 mt-1 text-right">
              ({description.length}/500)
            </Text>
            {errors.description && (
              <Text className="text-caption text-error mt-1">
                {errors.description}
              </Text>
            )}
          </View>

          {/* Project/Task Field */}
          <View className="mx-md mt-3">
            <Text className="text-body-small text-gray-700 mb-2">
              Project/Task #
            </Text>
            <TextInput
              className="bg-white text-body text-gray-800"
              style={{
                height: 48,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#D1D5DB',
                paddingHorizontal: 12,
              }}
              placeholder="e.g., PR #239"
              placeholderTextColor="#9CA3AF"
              value={projectTask}
              onChangeText={setProjectTask}
              accessibilityLabel="Project or task number"
              accessibilityHint="Optional field"
            />
          </View>
        </Animated.View>

        {/* Time Entry Pairs */}
        {timeEntries.map((entry, index) => (
          <TimeEntryPairRow
            key={entry.id}
            entry={entry}
            index={index}
            showLabel={isExpanded || timeEntries.length > 1}
            onChangeInTime={(time) => handleUpdateInTime(entry.id, time)}
            onChangeOutTime={(time) => handleUpdateOutTime(entry.id, time)}
            onRemove={() => handleRemoveTimeEntry(entry.id)}
            canRemove={timeEntries.length > 1}
          />
        ))}

        {/* Add Another Time (expanded only or when already multiple) */}
        {(isExpanded || timeEntries.length > 1) && (
          <TouchableOpacity
            onPress={handleAddTimeEntry}
            className="mx-md mt-3 items-center justify-center"
            style={{
              height: 48,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: '#E5E7EB',
              borderStyle: 'dashed',
            }}
            accessibilityLabel="Add another time entry"
            accessibilityRole="button"
          >
            <Text className="text-body font-semibold text-gray-500">
              + Add Another Time
            </Text>
          </TouchableOpacity>
        )}

        {errors.timeEntries && (
          <Text className="text-caption text-error mx-md mt-1">
            {errors.timeEntries}
          </Text>
        )}

        {/* Total Hours Display */}
        <TotalHoursDisplay hours={totalHours} />

        {/* Hour warnings */}
        {totalHours > 0 && totalHours < 4 && (
          <Text className="text-caption mx-md mt-1 text-center" style={{ color: '#F59E0B' }}>
            This seems like a short day ({formatHours(totalHours)} hours). Is
            this correct?
          </Text>
        )}
        {totalHours > 12 && (
          <Text className="text-caption mx-md mt-1 text-center" style={{ color: '#F59E0B' }}>
            You've entered {formatHours(totalHours)} hours. Double-check times.
          </Text>
        )}

        {/* Duplicate Yesterday (collapsed only, not edit mode) */}
        {!isExpanded && !isEditMode && (
          <DuplicateYesterdayButton
            onPress={handleDuplicateYesterday}
            isAvailable={true}
          />
        )}

        {/* General Error */}
        {errors.general && (
          <Text className="text-body-small text-error mx-md mt-3 text-center">
            {errors.general}
          </Text>
        )}

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.8}
          className="mx-md mt-md flex-row items-center justify-center shadow-level-2"
          style={{
            height: 56,
            borderRadius: 12,
            backgroundColor: isSaving ? '#D1D5DB' : '#10B981',
          }}
          accessibilityLabel={saveButtonLabel}
          accessibilityRole="button"
          accessibilityState={{ disabled: isSaving }}
        >
          {isSaving ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text className="text-button text-white ml-2">Saving...</Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark" size={24} color="#FFFFFF" />
              <Text className="text-button text-white ml-2">
                {saveButtonLabel}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Expand/Collapse Toggle */}
        <ExpandToggle
          isExpanded={isExpanded}
          onToggle={() => setIsExpanded((prev) => !prev)}
        />
      </ScrollView>
      {datePicker.modal}
    </View>
  );
}
