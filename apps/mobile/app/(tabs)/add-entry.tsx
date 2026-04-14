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
import { useLazyQuery } from '@apollo/client/react';
import { useDatePicker } from '@/components/DatePicker';
import { ClientSelectorModal } from '@/components/ClientSelectorModal';
import { useAuthenticatedMutation } from '@/hooks/useAuthenticatedMutation';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { usePreferences } from '@/contexts/PreferencesContext';
import { DateSelectorCard } from '@/components/add-entry/DateSelectorCard';
import { WeekStripCard } from '@/components/add-entry/WeekStripCard';
import { ClientCard } from '@/components/add-entry/ClientCard';
import { TimeEntryPairRow } from '@/components/add-entry/TimeEntryPairRow';
import { TotalHoursDisplay } from '@/components/add-entry/TotalHoursDisplay';
import { DuplicateYesterdayButton } from '@/components/add-entry/DuplicateYesterdayButton';
import { ExpandToggle } from '@/components/add-entry/ExpandToggle';
import {
  CREATE_TIME_ENTRY_MUTATION,
  UPDATE_TIME_ENTRY_MUTATION,
} from '@/lib/graphql/mutations';
import { TIME_ENTRY_QUERY, TIME_ENTRIES_QUERY } from '@/lib/graphql/queries';
import { TimeEntryPairData, FormErrors } from '@/types/add-entry';
import {
  DAY_NAMES,
  FULL_DAY_NAMES,
  MONTH_NAMES,
  DEFAULT_IN_TIME,
  DEFAULT_OUT_TIME,
  MOCK_LAST_CLIENT,
} from '@/constants/add-entry';
import {
  formatDateParam,
  parseDate,
  isSameDay,
  generateWeekStrip,
  parseTimeToMinutes,
  calculateHoursFromEntries,
  formatHours,
  validateTimeEntry,
  generateId,
  formatTimeDisplay,
} from '@/utils/add-entry';

// --- Main Screen ---

export default function AddEntryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ date?: string; id?: string }>();
  const { weekStartDay } = usePreferences();

  const isEditMode = !!params.id;

  // --- State ---
  const [isExpanded, setIsExpanded] = useState(true);
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
  const [clientSelectorVisible, setClientSelectorVisible] = useState(false);
  const [clientId, setClientId] = useState<string | undefined>(undefined);

  // --- Derived State ---
  const totalHours = useMemo(
    () => calculateHoursFromEntries(timeEntries),
    [timeEntries],
  );

  const weekStartDayNum = weekStartDay === 'sunday' ? 0 : 1;

  const weekStrip = useMemo(
    () => generateWeekStrip(selectedDate, weekStartDayNum),
    [selectedDate, weekStartDayNum],
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

  // Lazy query for fetching yesterday's entry on demand
  const [fetchYesterdayEntries, { loading: isDuplicating }] = useLazyQuery<{
    timeEntries: Array<{
      id: string;
      date: string;
      hours: number;
      description: string;
      category: string;
      project: string;
    }>;
  }>(TIME_ENTRIES_QUERY, { fetchPolicy: 'network-only' });

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
    setClientSelectorVisible(true);
  }, []);

  const handleClientSelect = useCallback(
    (selected: { id: string; name: string }) => {
      setClientId(selected.id);
      setClient(selected.name);
    },
    [],
  );

  const handleDuplicateYesterday = useCallback(async () => {
    const yesterday = new Date(selectedDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDateParam(yesterday);

    try {
      const { data, error } = await fetchYesterdayEntries({
        variables: {
          filters: { startDate: yesterdayStr, endDate: yesterdayStr },
        },
      });

      if (error) {
        Alert.alert('Error', 'Failed to fetch yesterday\'s entry. Please try again.');
        return;
      }

      const entries = data?.timeEntries;
      if (!entries || entries.length === 0) {
        Alert.alert('No Entry Found', `No time entry found for ${MONTH_NAMES[yesterday.getMonth()]} ${yesterday.getDate()}.`);
        return;
      }

      // Use the first entry from yesterday
      const entry = entries[0];
      setClient(entry.project || '');
      setDescription(entry.description || '');
      setProjectTask(entry.category || '');

      // Convert hours to a single time entry pair starting at 08:00
      const totalMin = (entry.hours || 8) * 60;
      const inMin = 8 * 60;
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

      Alert.alert(
        'Duplicated',
        `Copied from ${MONTH_NAMES[yesterday.getMonth()]} ${yesterday.getDate()}`,
      );
    } catch (err) {
      console.error('Failed to fetch yesterday\'s entry:', err);
      Alert.alert('Error', 'Failed to fetch yesterday\'s entry. Please try again.');
    }
  }, [selectedDate, fetchYesterdayEntries]);

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

    for (const entry of timeEntries) {
      const result = validateTimeEntry(entry);
      if (!result.valid) {
        newErrors.timeEntries = result.error;
        break;
      }
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
            isLoading={isDuplicating}
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
      <ClientSelectorModal
        visible={clientSelectorVisible}
        onClose={() => setClientSelectorVisible(false)}
        onSelect={handleClientSelect}
        selectedClientId={clientId}
      />
    </View>
  );
}
