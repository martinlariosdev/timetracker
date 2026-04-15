import React, { useMemo } from 'react';
import {
  View,
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
import { usePayPeriodsForWeek } from '@/contexts/PayPeriodContext';

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
  const periods = usePayPeriodsForWeek(dates);
  const hasBoundary = periods.length > 1;

  // Find the boundary index (where period changes)
  const boundaryIndex = useMemo(() => {
    if (!hasBoundary || periods.length !== 2) return -1;

    for (let i = 0; i < dates.length - 1; i++) {
      const currentPeriod = periods.find(p => {
        const start = new Date(p.startDate).getTime();
        const end = new Date(p.endDate).getTime();
        const dateTime = dates[i].getTime();
        return dateTime >= start && dateTime <= end;
      });

      const nextPeriod = periods.find(p => {
        const start = new Date(p.startDate).getTime();
        const end = new Date(p.endDate).getTime();
        const dateTime = dates[i + 1].getTime();
        return dateTime >= start && dateTime <= end;
      });

      if (currentPeriod?.id !== nextPeriod?.id) {
        return i;
      }
    }
    return -1;
  }, [hasBoundary, periods, dates]);

  return (
    <View>
      {/* Period Labels */}
      {hasBoundary && periods.length === 2 && (
        <View className="flex-row mb-2 px-2" style={{ marginHorizontal: 16, marginTop: 8 }}>
          <View className="flex-1">
            <Text className="text-xs text-gray-500 text-center">
              {periods[0].displayText}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-gray-500 text-center">
              {periods[1].displayText}
            </Text>
          </View>
        </View>
      )}

      {/* Date Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: 16, marginTop: hasBoundary ? 0 : 12 }}
        contentContainerStyle={{ gap: 8, alignItems: 'center' }}
      >
        {dates.map((date, index) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);

          return (
            <React.Fragment key={formatDateParam(date)}>
              <TouchableOpacity
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

              {/* Period Boundary Divider */}
              {index === boundaryIndex && (
                <View
                  style={{
                    width: 2,
                    height: '80%',
                    backgroundColor: '#D1D5DB',
                    marginHorizontal: 8,
                    alignSelf: 'center',
                  }}
                  accessibilityLabel="Pay period boundary"
                />
              )}
            </React.Fragment>
          );
        })}
      </ScrollView>
    </View>
  );
}
