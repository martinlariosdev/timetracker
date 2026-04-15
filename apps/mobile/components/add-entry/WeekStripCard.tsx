import React, { useMemo } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import {
  FULL_DAY_NAMES,
  MONTH_NAMES,
  DAY_NAMES,
} from '@/constants/add-entry';
import {
  isSameDay,
  formatDateParam,
} from '@/utils/add-entry';

export function WeekStripCard({
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
      style={{ marginHorizontal: 16, marginTop: 12 }}
      contentContainerStyle={{ gap: 8 }}
    >
      {dates.map((date) => {
        const isSelected = isSameDay(date, selectedDate);
        const isToday = isSameDay(date, today);

        return (
          <TouchableOpacity
            key={formatDateParam(date)}
            onPress={() => {
              console.log('Date selected:', formatDateParam(date));
              onSelect(date);
            }}
            activeOpacity={0.8}
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              borderWidth: isSelected ? 0 : 1,
              borderColor: isSelected ? 'transparent' : '#E5E7EB',
              backgroundColor: isSelected
                ? '#2563EB'
                : isToday
                  ? 'rgba(59, 130, 246, 0.1)'
                  : '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: isSelected ? '#000' : 'transparent',
              shadowOffset: isSelected ? { width: 0, height: 1 } : { width: 0, height: 0 },
              shadowOpacity: isSelected ? 0.1 : 0,
              shadowRadius: isSelected ? 3 : 0,
              elevation: isSelected ? 2 : 0,
            }}
            accessibilityLabel={`${FULL_DAY_NAMES[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}${isToday ? ', today' : ''}`}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: isSelected ? '#FFFFFF' : '#1F2937',
              }}
            >
              {date.getDate()}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: isSelected ? 'rgba(255,255,255,0.9)' : '#6B7280',
              }}
            >
              {DAY_NAMES[date.getDay()]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
