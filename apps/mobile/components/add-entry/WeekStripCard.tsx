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
