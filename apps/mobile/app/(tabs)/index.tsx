import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// Types for our data structures
interface TimeEntry {
  id: string;
  client: string;
  description: string;
  hours: number;
  timeBreakdown: string[];
}

interface DayData {
  date: string;
  dayName: string;
  dayOfMonth: number;
  fullDate: string;
  totalHours: number;
  entries: TimeEntry[];
}

interface WeekDate {
  date: string;
  dayAbbr: string;
  dayOfMonth: number;
  hasEntries: boolean;
  isToday: boolean;
  isSelected: boolean;
}

interface Metric {
  id: string;
  label: string;
  value: string;
  subtext: string;
  color?: string;
}

export default function TimesheetListScreen() {
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [currentWeekStart, setCurrentWeekStart] = useState(0);

  // Mock data - Replace with API calls
  const metrics: Metric[] = [
    {
      id: '1',
      label: 'Total Hours',
      value: '56.00',
      subtext: 'this period',
    },
    {
      id: '2',
      label: 'ETO',
      value: '33.92',
      subtext: 'hours used',
      color: '#0EA5E9',
    },
    {
      id: '3',
      label: 'Pending',
      value: '4',
      subtext: 'days left',
      color: '#F59E0B',
    },
    {
      id: '4',
      label: 'This Week',
      value: '32.00',
      subtext: 'hours logged',
    },
  ];

  const weekDates: WeekDate[] = [
    {
      date: '2026-04-01',
      dayAbbr: 'Sun',
      dayOfMonth: 1,
      hasEntries: true,
      isToday: false,
      isSelected: selectedDateIndex === 0,
    },
    {
      date: '2026-04-02',
      dayAbbr: 'Mon',
      dayOfMonth: 2,
      hasEntries: true,
      isToday: true,
      isSelected: selectedDateIndex === 1,
    },
    {
      date: '2026-04-03',
      dayAbbr: 'Tue',
      dayOfMonth: 3,
      hasEntries: true,
      isToday: false,
      isSelected: selectedDateIndex === 2,
    },
    {
      date: '2026-04-04',
      dayAbbr: 'Wed',
      dayOfMonth: 4,
      hasEntries: false,
      isToday: false,
      isSelected: selectedDateIndex === 3,
    },
    {
      date: '2026-04-05',
      dayAbbr: 'Thu',
      dayOfMonth: 5,
      hasEntries: true,
      isToday: false,
      isSelected: selectedDateIndex === 4,
    },
    {
      date: '2026-04-06',
      dayAbbr: 'Fri',
      dayOfMonth: 6,
      hasEntries: true,
      isToday: false,
      isSelected: selectedDateIndex === 5,
    },
    {
      date: '2026-04-07',
      dayAbbr: 'Sat',
      dayOfMonth: 7,
      hasEntries: false,
      isToday: false,
      isSelected: selectedDateIndex === 6,
    },
  ];

  const dailyData: DayData[] = [
    {
      date: '2026-04-01',
      dayName: 'Sunday',
      dayOfMonth: 1,
      fullDate: 'Sunday, April 1',
      totalHours: 8.0,
      entries: [
        {
          id: '1',
          client: 'Aderant',
          description: 'Worked on PR #239, #189 Review PR #3, #54, #201',
          hours: 8.0,
          timeBreakdown: ['08:00', '12:00', '13:00', '17:00'],
        },
      ],
    },
    {
      date: '2026-04-02',
      dayName: 'Monday',
      dayOfMonth: 2,
      fullDate: 'Monday, April 2',
      totalHours: 8.0,
      entries: [
        {
          id: '2',
          client: 'Aderant',
          description: 'Worked on PR #239, #189 Review PR #3, #54, #201',
          hours: 8.0,
          timeBreakdown: ['08:00', '12:00', '13:00', '17:00'],
        },
      ],
    },
    {
      date: '2026-04-03',
      dayName: 'Tuesday',
      dayOfMonth: 3,
      fullDate: 'Tuesday, April 3',
      totalHours: 8.0,
      entries: [
        {
          id: '3',
          client: 'Aderant',
          description: 'Worked on PR #239, #189 Review PR #3, #54, #201',
          hours: 8.0,
          timeBreakdown: ['08:00', '12:00', '13:00', '17:00'],
        },
      ],
    },
    {
      date: '2026-04-04',
      dayName: 'Wednesday',
      dayOfMonth: 4,
      fullDate: 'Wednesday, April 4',
      totalHours: 0,
      entries: [],
    },
    {
      date: '2026-04-05',
      dayName: 'Thursday',
      dayOfMonth: 5,
      fullDate: 'Thursday, April 5',
      totalHours: 8.0,
      entries: [
        {
          id: '4',
          client: 'Aderant',
          description: 'Worked on PR #239, #189 Review PR #3, #54, #201',
          hours: 8.0,
          timeBreakdown: ['08:00', '12:00', '13:00', '17:00'],
        },
      ],
    },
    {
      date: '2026-04-06',
      dayName: 'Friday',
      dayOfMonth: 6,
      fullDate: 'Friday, April 6',
      totalHours: 8.0,
      entries: [
        {
          id: '5',
          client: 'Aderant',
          description: 'Worked on PR #239, #189 Review PR #3, #54, #201',
          hours: 8.0,
          timeBreakdown: ['08:00', '12:00', '13:00', '17:00'],
        },
      ],
    },
    {
      date: '2026-04-07',
      dayName: 'Saturday',
      dayOfMonth: 7,
      fullDate: 'Saturday, April 7',
      totalHours: 0,
      entries: [],
    },
  ];

  const handleDateSelect = (index: number) => {
    setSelectedDateIndex(index);
  };

  const handleAddEntry = (date?: string) => {
    // TODO: Navigate to add entry screen with pre-filled date
    console.log('Add entry for date:', date);
  };

  const handleEditEntry = (entryId: string) => {
    // TODO: Navigate to edit entry screen
    console.log('Edit entry:', entryId);
  };

  const handleDeleteEntry = (entryId: string) => {
    // TODO: Show delete confirmation
    console.log('Delete entry:', entryId);
  };

  const handleMenuPress = () => {
    // TODO: Open drawer/menu
    console.log('Menu pressed');
  };

  const handleViewToggle = () => {
    // TODO: Toggle between list/calendar/hybrid views
    console.log('Toggle view mode');
  };

  const handleFilterPress = () => {
    // TODO: Open filter modal
    console.log('Filter pressed');
  };

  const screenWidth = Dimensions.get('window').width;
  const dateChipWidth = (screenWidth - 16) / 7.2;

  // Render metric card
  const renderMetricCard = ({ item }: { item: Metric }) => (
    <View
      className="bg-white/15 border border-white/25 rounded-xl p-3 mr-3"
      style={{ width: 120 }}
    >
      <Text className="text-[11px] font-medium text-white/80 mb-1">
        {item.label}
      </Text>
      <Text
        className="text-2xl font-bold mb-0.5"
        style={{ color: item.color || '#FFFFFF' }}
      >
        {item.value}
      </Text>
      <Text className="text-[10px] text-white/70">{item.subtext}</Text>
    </View>
  );

  // Render week date chip
  const renderWeekDate = (date: WeekDate, index: number) => {
    const isSelected = selectedDateIndex === index;
    const isToday = date.isToday;

    return (
      <TouchableOpacity
        key={index}
        onPress={() => handleDateSelect(index)}
        activeOpacity={0.7}
        className={`items-center justify-center rounded-xl mx-0.5 ${
          isSelected
            ? 'bg-primary'
            : isToday
            ? 'border-2 border-primary'
            : ''
        }`}
        style={{ width: dateChipWidth, height: 64 }}
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
        {date.hasEntries && (
          <View
            className={`w-1.5 h-1.5 rounded-full mt-2 ${
              isSelected ? 'bg-white' : 'bg-primary'
            }`}
          />
        )}
      </TouchableOpacity>
    );
  };

  // Render time entry item
  const renderEntryItem = (entry: TimeEntry) => (
    <View
      key={entry.id}
      className="bg-gray-50 rounded-lg p-2.5 mb-2 border-l-[3px] border-primary"
    >
      <View className="flex-row justify-between">
        {/* Left section: Client and description */}
        <View className="flex-1 mr-3">
          <Text className="text-sm font-semibold text-gray-800">
            {entry.client}
          </Text>
          <Text
            className="text-xs text-gray-500 mt-0.5"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {entry.description}
          </Text>
          {/* Time breakdown chips */}
          <View className="flex-row flex-wrap mt-1.5">
            {entry.timeBreakdown.map((time, idx) => (
              <View
                key={idx}
                className="bg-white border border-gray-200 rounded px-1.5 py-0.5 mr-1 mb-1"
              >
                <Text className="text-[10px] text-gray-600">{time}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Right section: Hours and actions */}
        <View className="items-end">
          <Text className="text-base font-bold text-primary">
            {entry.hours.toFixed(2)}
          </Text>
          <View className="flex-row mt-2">
            {/* Edit button */}
            <TouchableOpacity
              onPress={() => handleEditEntry(entry.id)}
              className="w-8 h-8 items-center justify-center"
              activeOpacity={0.7}
            >
              {/* TODO: Replace with proper icon */}
              <Text className="text-primary text-xs font-bold">EDIT</Text>
            </TouchableOpacity>
            {/* Delete button */}
            <TouchableOpacity
              onPress={() => handleDeleteEntry(entry.id)}
              className="w-8 h-8 items-center justify-center ml-1"
              activeOpacity={0.7}
            >
              {/* TODO: Replace with proper icon */}
              <Text className="text-red-500 text-xs font-bold">DEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  // Render daily card
  const renderDailyCard = ({ item }: { item: DayData }) => (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm min-h-[96px]">
      {/* Card header */}
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-gray-800">
          {item.fullDate}
        </Text>
        {item.totalHours > 0 && (
          <Text className="text-xl font-bold text-primary">
            {item.totalHours.toFixed(2)} hrs
          </Text>
        )}
      </View>

      {/* Divider */}
      {item.entries.length > 0 && (
        <View className="h-[1px] bg-gray-200 my-3" />
      )}

      {/* Entries list */}
      {item.entries.length > 0 ? (
        <View>{item.entries.map((entry) => renderEntryItem(entry))}</View>
      ) : (
        // Empty state
        <View className="items-center py-4">
          {/* TODO: Replace with proper icon */}
          <View className="w-8 h-8 bg-gray-300 rounded-full mb-2" />
          <Text className="text-sm text-gray-400 mb-3">No entries</Text>
          <TouchableOpacity
            onPress={() => handleAddEntry(item.date)}
            className="bg-primary rounded-lg px-3 py-1.5"
            activeOpacity={0.8}
          >
            <Text className="text-[13px] font-semibold text-white">
              + Add Entry
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Top Navigation Bar */}
      <View
        className="bg-primary h-14 flex-row items-center justify-between px-4"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        }}
      >
        {/* Menu button */}
        <TouchableOpacity
          onPress={handleMenuPress}
          className="w-11 h-11 items-center justify-center"
          activeOpacity={0.7}
        >
          {/* TODO: Replace with proper icon */}
          <Text className="text-white text-lg font-bold">☰</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text className="text-xl font-semibold text-white">Timesheet</Text>

        {/* Right actions */}
        <View className="flex-row">
          <TouchableOpacity
            onPress={handleViewToggle}
            className="w-11 h-11 items-center justify-center"
            activeOpacity={0.7}
          >
            {/* TODO: Replace with proper icon */}
            <Text className="text-white text-lg font-bold">⊞</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleFilterPress}
            className="w-11 h-11 items-center justify-center"
            activeOpacity={0.7}
          >
            {/* TODO: Replace with proper icon */}
            <Text className="text-white text-lg font-bold">⋮</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Metrics Banner - Horizontally Scrollable */}
      <LinearGradient
        colors={['#2563EB', '#1E40AF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="h-22 px-3 py-4"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 2,
        }}
      >
        <FlatList
          data={metrics}
          renderItem={renderMetricCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 0 }}
        />

        {/* Pagination dots */}
        <View className="flex-row items-center justify-center mt-2">
          {metrics.map((_, index) => (
            <View
              key={index}
              className="w-1.5 h-1.5 rounded-full mx-1"
              style={{
                backgroundColor: index === 0 ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </View>
      </LinearGradient>

      {/* Week Date Header - Horizontally Scrollable */}
      <View
        className="bg-white border-b border-gray-200 px-2 py-2"
        style={{ height: 80 }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: 'center',
            paddingHorizontal: 4,
          }}
        >
          {weekDates.map((date, index) => renderWeekDate(date, index))}
        </ScrollView>
      </View>

      {/* Daily Cards - Vertically Scrollable */}
      <FlatList
        data={dailyData}
        renderItem={renderDailyCard}
        keyExtractor={(item) => item.date}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 88,
        }}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <View className="absolute bottom-4 right-4">
        <TouchableOpacity
          onPress={() => handleAddEntry()}
          activeOpacity={0.8}
          className="bg-primary w-14 h-14 rounded-full items-center justify-center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15,
            shadowRadius: 15,
            elevation: 10,
          }}
        >
          {/* TODO: Replace with proper icon */}
          <Text className="text-white text-3xl font-light">+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
