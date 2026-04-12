import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Modal,
  Platform,
  StatusBar,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// Types
interface TimeEntry {
  inTime: string;
  outTime: string;
}

interface WeekDate {
  date: Date;
  dayAbbr: string;
  dayOfMonth: number;
  isToday: boolean;
  isSelected: boolean;
}

interface Client {
  id: string;
  name: string;
  lastUsed: string;
}

export default function AddEntryScreen() {
  // State management
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [client, setClient] = useState('Aderant');
  const [description, setDescription] = useState('');
  const [projectTask, setProjectTask] = useState('');
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([
    { inTime: '08:00', outTime: '17:00' },
  ]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activeTimePicker, setActiveTimePicker] = useState<{
    entryIndex: number;
    field: 'inTime' | 'outTime';
  } | null>(null);
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [charCount, setCharCount] = useState(0);

  // Animation value for expansion
  const [expandAnimation] = useState(new Animated.Value(0));

  // Mock data - Replace with API calls
  const recentClients: Client[] = [
    { id: '1', name: 'Aderant', lastUsed: '2 days ago' },
    { id: '2', name: 'TechCorp Inc.', lastUsed: '1 week ago' },
    { id: '3', name: 'Global Solutions', lastUsed: '2 weeks ago' },
  ];

  // Calculate week dates
  const getWeekDates = (): WeekDate[] => {
    const dates: WeekDate[] = [];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 3); // Show today ±3 days

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      dates.push({
        date: new Date(date),
        dayAbbr: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayOfMonth: date.getDate(),
        isToday: date.toDateString() === today.toDateString(),
        isSelected: date.toDateString() === selectedDate.toDateString(),
      });
    }

    return dates;
  };

  const weekDates = getWeekDates();

  // Calculate total hours
  const calculateTotalHours = (): number => {
    let total = 0;

    timeEntries.forEach((entry) => {
      if (entry.inTime && entry.outTime) {
        const [inHour, inMin] = entry.inTime.split(':').map(Number);
        const [outHour, outMin] = entry.outTime.split(':').map(Number);

        const inMinutes = inHour * 60 + inMin;
        const outMinutes = outHour * 60 + outMin;

        if (outMinutes > inMinutes) {
          total += (outMinutes - inMinutes) / 60;
        }
      }
    });

    return total;
  };

  const totalHours = calculateTotalHours();

  // Validation
  const validateTimeEntry = (entry: TimeEntry): boolean => {
    if (!entry.inTime || !entry.outTime) return false;

    const [inHour, inMin] = entry.inTime.split(':').map(Number);
    const [outHour, outMin] = entry.outTime.split(':').map(Number);

    const inMinutes = inHour * 60 + inMin;
    const outMinutes = outHour * 60 + outMin;

    return outMinutes > inMinutes;
  };

  const isFormValid = (): boolean => {
    if (!client) return false;
    if (isExpanded && (!description || description.length < 3)) return false;
    if (timeEntries.length === 0) return false;

    // At least one valid time entry
    return timeEntries.some((entry) => validateTimeEntry(entry));
  };

  // Handlers
  const handleExpand = () => {
    const toValue = isExpanded ? 0 : 1;

    Animated.spring(expandAnimation, {
      toValue,
      useNativeDriver: false,
      friction: 8,
    }).start();

    setIsExpanded(!isExpanded);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddTimeEntry = () => {
    if (timeEntries.length < 4) {
      setTimeEntries([...timeEntries, { inTime: '13:00', outTime: '17:00' }]);
    }
  };

  const handleRemoveTimeEntry = (index: number) => {
    if (timeEntries.length > 1) {
      const newEntries = timeEntries.filter((_, i) => i !== index);
      setTimeEntries(newEntries);
    }
  };

  const handleTimeChange = (
    index: number,
    field: 'inTime' | 'outTime',
    value: string
  ) => {
    const newEntries = [...timeEntries];
    newEntries[index][field] = value;
    setTimeEntries(newEntries);
  };

  const handleDuplicateYesterday = () => {
    // TODO: Fetch yesterday's entry from API
    // For now, just show toast notification
    console.log('Duplicate yesterday entry');

    // Mock data population
    setDescription('Worked on PR #239, #189, Review PR #3, #54, #201');
    setProjectTask('PR #239');
    setTimeEntries([
      { inTime: '08:00', outTime: '12:00' },
      { inTime: '13:00', outTime: '17:00' },
    ]);
  };

  const handleQuickSave = async () => {
    if (!isFormValid()) return;

    setIsSaving(true);

    try {
      // TODO: API call to save entry
      const entryData = {
        date: selectedDate.toISOString(),
        client,
        description: description || `Work on ${client} - ${selectedDate.toLocaleDateString()}`,
        projectTask,
        timeEntries,
        totalHours,
      };

      console.log('Saving entry:', entryData);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Success - navigate back or show success message
      // TODO: Navigate back to list
      console.log('Entry saved successfully');
    } catch (error) {
      console.error('Failed to save entry:', error);
      // TODO: Show error toast
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // TODO: Show confirmation if form has data
    // TODO: Navigate back
    console.log('Cancel entry');
  };

  const handleClientSelect = (clientName: string) => {
    setClient(clientName);
    setShowClientSearch(false);
    setClientSearchQuery('');
  };

  const filteredClients = recentClients.filter((c) =>
    c.name.toLowerCase().includes(clientSearchQuery.toLowerCase())
  );

  // Calculate safe area
  const safeAreaTop = Platform.OS === 'ios' ? (StatusBar.currentHeight || 44) : 0;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Modal Header */}
        <View
          className="bg-white border-b border-gray-200 flex-row items-center justify-between px-4"
          style={{
            height: 56,
            paddingTop: safeAreaTop,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          <TouchableOpacity
            onPress={handleCancel}
            className="w-11 h-11 items-center justify-center"
            activeOpacity={0.7}
          >
            <Text className="text-gray-600 text-2xl font-light">✕</Text>
          </TouchableOpacity>

          <Text className="text-lg font-semibold text-gray-800">
            {isExpanded ? 'Add Entry' : 'Quick Add'}
          </Text>

          <View className="w-11" />
        </View>

        {/* Scrollable Content */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Large Date Selector */}
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
            className="mx-4 mt-4"
          >
            <LinearGradient
              colors={['#2563EB', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-2xl p-5 items-center"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              <Text className="text-2xl font-bold text-white">
                {selectedDate.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
              <Text className="text-base text-white/70 mt-1">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Week Strip */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-2 py-3"
            contentContainerStyle={{ paddingHorizontal: 8 }}
          >
            {weekDates.map((date, index) => {
              const isSelected = date.isSelected;
              const isToday = date.isToday;

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleDateSelect(date.date)}
                  activeOpacity={0.7}
                  className={`items-center justify-center rounded-xl mx-1 ${
                    isSelected
                      ? 'bg-primary'
                      : isToday
                      ? 'border-2 border-primary bg-white'
                      : 'bg-white border border-gray-200'
                  }`}
                  style={{
                    width: 48,
                    height: 64,
                    shadowColor: isSelected ? '#2563EB' : '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: isSelected ? 0.2 : 0.05,
                    shadowRadius: isSelected ? 4 : 2,
                    elevation: isSelected ? 2 : 1,
                  }}
                >
                  <Text
                    className={`text-xs font-medium ${
                      isSelected ? 'text-white/90' : 'text-gray-500'
                    }`}
                  >
                    {date.dayAbbr}
                  </Text>
                  <Text
                    className={`text-xl font-semibold mt-1 ${
                      isSelected
                        ? 'text-white'
                        : isToday
                        ? 'text-primary'
                        : 'text-gray-800'
                    }`}
                  >
                    {date.dayOfMonth}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Last Used Client Card (Collapsed Mode) */}
          {!isExpanded && (
            <TouchableOpacity
              onPress={() => setShowClientSearch(true)}
              activeOpacity={0.7}
              className="mx-4 mt-3 bg-gray-50 border border-gray-200 rounded-xl p-4 flex-row items-center"
            >
              <View className="w-5 h-5 bg-primary rounded mr-3 items-center justify-center">
                <Text className="text-white text-xs">🔖</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-800">
                  {client}
                </Text>
                <Text className="text-xs text-gray-500 mt-0.5">
                  Last used today
                </Text>
              </View>
              <Text className="text-primary text-lg">✓</Text>
            </TouchableOpacity>
          )}

          {/* Expanded Mode Fields */}
          {isExpanded && (
            <View className="px-4 mt-3">
              {/* Client Field */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Client
                </Text>
                <TouchableOpacity
                  onPress={() => setShowClientSearch(true)}
                  activeOpacity={0.7}
                  className="bg-white border border-gray-300 rounded-xl p-4 flex-row items-center"
                  style={{ height: 56 }}
                >
                  <Text className="text-gray-400 mr-3">🔍</Text>
                  <Text className="flex-1 text-base text-gray-800">
                    {client}
                  </Text>
                  <Text className="text-primary text-lg">✓</Text>
                </TouchableOpacity>
              </View>

              {/* Description Field */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Description *
                </Text>
                <TextInput
                  value={description}
                  onChangeText={(text) => {
                    setDescription(text);
                    setCharCount(text.length);
                  }}
                  placeholder="What did you work on?"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  className="bg-white border border-gray-300 rounded-xl p-3 text-base text-gray-800"
                  style={{
                    minHeight: 96,
                    maxHeight: 160,
                    textAlignVertical: 'top',
                  }}
                />
                <Text className="text-xs text-gray-500 mt-1">
                  ({charCount}/500 characters)
                </Text>
              </View>

              {/* Project/Task Field */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Project/Task #
                </Text>
                <TextInput
                  value={projectTask}
                  onChangeText={setProjectTask}
                  placeholder="e.g., PR #239"
                  placeholderTextColor="#9CA3AF"
                  className="bg-white border border-gray-300 rounded-xl p-3 text-base text-gray-800"
                  style={{ height: 48 }}
                />
              </View>
            </View>
          )}

          {/* Time Entry Section */}
          <View className="px-4 mt-3">
            {timeEntries.map((entry, index) => (
              <View key={index} className="mb-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-medium text-gray-700">
                    {index === 0 ? 'Time Entry 1 *' : `Time Entry ${index + 1}`}
                  </Text>
                  {index > 0 && (
                    <TouchableOpacity
                      onPress={() => handleRemoveTimeEntry(index)}
                      className="w-6 h-6"
                      activeOpacity={0.7}
                    >
                      <Text className="text-red-500 text-lg">✕</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View className="flex-row" style={{ gap: 12 }}>
                  {/* In Time */}
                  <TouchableOpacity
                    onPress={() => {
                      setActiveTimePicker({ entryIndex: index, field: 'inTime' });
                      setShowTimePicker(true);
                    }}
                    activeOpacity={0.7}
                    className="flex-1 bg-white border border-gray-300 rounded-xl p-3"
                    style={{ height: 80 }}
                  >
                    <Text className="text-xs text-gray-500 mb-1">In Time</Text>
                    <Text className="text-xl font-semibold text-gray-800">
                      {entry.inTime}
                    </Text>
                  </TouchableOpacity>

                  {/* Out Time */}
                  <TouchableOpacity
                    onPress={() => {
                      setActiveTimePicker({
                        entryIndex: index,
                        field: 'outTime',
                      });
                      setShowTimePicker(true);
                    }}
                    activeOpacity={0.7}
                    className="flex-1 bg-white border border-gray-300 rounded-xl p-3"
                    style={{ height: 80 }}
                  >
                    <Text className="text-xs text-gray-500 mb-1">Out Time</Text>
                    <Text className="text-xl font-semibold text-gray-800">
                      {entry.outTime}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Validation Error */}
                {!validateTimeEntry(entry) && entry.outTime && (
                  <Text className="text-xs text-red-500 mt-1">
                    Out time must be after In time
                  </Text>
                )}
              </View>
            ))}

            {/* Add Another Time Button */}
            {timeEntries.length < 4 && isExpanded && (
              <TouchableOpacity
                onPress={handleAddTimeEntry}
                activeOpacity={0.7}
                className="border border-dashed border-primary rounded-xl p-3 flex-row items-center justify-center mb-4"
                style={{ height: 48 }}
              >
                <Text className="text-primary text-lg mr-2">+</Text>
                <Text className="text-base font-semibold text-primary">
                  Add Another Time
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Total Hours Display */}
          <View className="mx-4 mt-4">
            <View
              className="bg-primary/10 border-2 border-primary rounded-xl p-5 items-center"
            >
              <Text className="text-gray-700 text-base mb-1">Total Hours:</Text>
              <Text className="text-primary text-3xl font-bold">
                {totalHours.toFixed(1)}
              </Text>
            </View>
          </View>

          {/* Duplicate Yesterday Button (Collapsed Mode) */}
          {!isExpanded && (
            <TouchableOpacity
              onPress={handleDuplicateYesterday}
              activeOpacity={0.8}
              className="mx-4 mt-4 bg-[#0EA5E9] rounded-xl p-4 flex-row items-center justify-center"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Text className="text-white text-lg mr-2">📋</Text>
              <Text className="text-base font-semibold text-white">
                Duplicate Yesterday
              </Text>
            </TouchableOpacity>
          )}

          {/* Quick Save / Save Entry Button */}
          <TouchableOpacity
            onPress={handleQuickSave}
            disabled={!isFormValid() || isSaving}
            activeOpacity={0.8}
            className={`mx-4 mt-4 rounded-xl p-4 flex-row items-center justify-center ${
              isFormValid() && !isSaving ? 'bg-[#10B981]' : 'bg-gray-300'
            }`}
            style={{
              height: 56,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isFormValid() ? 0.15 : 0,
              shadowRadius: 6,
              elevation: isFormValid() ? 4 : 0,
            }}
          >
            {isSaving ? (
              <Text className="text-base font-bold text-white">Saving...</Text>
            ) : (
              <>
                <Text className="text-white text-xl mr-2">✓</Text>
                <Text className="text-base font-bold text-white">
                  {isExpanded ? 'Save Entry' : 'Quick Save'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* More/Less Details Trigger */}
          <TouchableOpacity
            onPress={handleExpand}
            activeOpacity={0.7}
            className="items-center py-4"
          >
            <Text className="text-base font-semibold text-primary">
              {isExpanded ? 'Less Details ▲' : 'More Details ▼'}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Client Search Modal */}
        <Modal
          visible={showClientSearch}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowClientSearch(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View
              className="bg-white rounded-t-3xl"
              style={{ maxHeight: '80%' }}
            >
              {/* Modal Header */}
              <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
                <Text className="text-xl font-semibold text-gray-800">
                  Select Client
                </Text>
                <TouchableOpacity
                  onPress={() => setShowClientSearch(false)}
                  className="w-8 h-8 items-center justify-center"
                >
                  <Text className="text-gray-600 text-2xl">✕</Text>
                </TouchableOpacity>
              </View>

              {/* Search Input */}
              <View className="p-4 border-b border-gray-200">
                <View className="bg-gray-50 border border-gray-300 rounded-xl p-3 flex-row items-center">
                  <Text className="text-gray-400 mr-2">🔍</Text>
                  <TextInput
                    value={clientSearchQuery}
                    onChangeText={setClientSearchQuery}
                    placeholder="Search clients..."
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 text-base text-gray-800"
                    autoFocus
                  />
                </View>
              </View>

              {/* Client List */}
              <ScrollView className="flex-1">
                <View className="p-2">
                  <Text className="text-xs font-semibold text-gray-500 uppercase px-3 mb-2">
                    Recent Clients
                  </Text>
                  {filteredClients.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => handleClientSelect(c.name)}
                      activeOpacity={0.7}
                      className="p-4 border-b border-gray-200 bg-white"
                    >
                      <Text className="text-lg font-semibold text-gray-800">
                        {c.name}
                      </Text>
                      <Text className="text-xs text-gray-500 mt-0.5">
                        Last used: {c.lastUsed}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Add New Client */}
                <TouchableOpacity
                  onPress={() => {
                    // TODO: Navigate to add client screen
                    console.log('Add new client');
                  }}
                  activeOpacity={0.7}
                  className="m-4 bg-gray-100 rounded-xl p-4 flex-row items-center justify-center"
                >
                  <Text className="text-primary text-lg mr-2">+</Text>
                  <Text className="text-base font-semibold text-gray-800">
                    Add New Client
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Time Picker Modal */}
        <Modal
          visible={showTimePicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl p-4">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-semibold text-gray-800">
                  Select Time
                </Text>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(false)}
                  className="bg-primary rounded-xl px-4 py-2"
                >
                  <Text className="text-white font-semibold">Done</Text>
                </TouchableOpacity>
              </View>

              {/* TODO: Implement native time picker */}
              <View className="items-center py-8">
                <Text className="text-gray-500">
                  Native time picker will be implemented here
                </Text>
                <Text className="text-xs text-gray-400 mt-2">
                  Use @react-native-community/datetimepicker
                </Text>
              </View>
            </View>
          </View>
        </Modal>

        {/* Date Picker Modal */}
        <Modal
          visible={showDatePicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl p-4">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-semibold text-gray-800">
                  Select Date
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(false)}
                  className="bg-primary rounded-xl px-4 py-2"
                >
                  <Text className="text-white font-semibold">Done</Text>
                </TouchableOpacity>
              </View>

              {/* TODO: Implement native date picker */}
              <View className="items-center py-8">
                <Text className="text-gray-500">
                  Native date picker will be implemented here
                </Text>
                <Text className="text-xs text-gray-400 mt-2">
                  Use @react-native-community/datetimepicker
                </Text>
              </View>

              {/* Quick Select Chips */}
              <View className="flex-row justify-around mb-4">
                <TouchableOpacity
                  onPress={() => {
                    const today = new Date();
                    setSelectedDate(today);
                    setShowDatePicker(false);
                  }}
                  className="bg-gray-100 border border-gray-300 rounded-full px-4 py-2"
                >
                  <Text className="text-sm font-semibold text-gray-600">
                    Today
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    setSelectedDate(yesterday);
                    setShowDatePicker(false);
                  }}
                  className="bg-gray-100 border border-gray-300 rounded-full px-4 py-2"
                >
                  <Text className="text-sm font-semibold text-gray-600">
                    Yesterday
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    setSelectedDate(tomorrow);
                    setShowDatePicker(false);
                  }}
                  className="bg-gray-100 border border-gray-300 rounded-full px-4 py-2"
                >
                  <Text className="text-sm font-semibold text-gray-600">
                    Tomorrow
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
