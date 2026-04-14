import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
}

const FULL_DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const SHORT_MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function formatDisplay(date: Date): string {
  return `${FULL_DAY_NAMES[date.getDay()]}, ${SHORT_MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
}

// --- Modal component defined outside hook for stable identity ---

interface DatePickerModalProps {
  visible: boolean;
  tempDate: Date;
  onCancel: () => void;
  onConfirm: () => void;
  onChange: (event: DateTimePickerEvent, selectedDate?: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
}

function DatePickerModalComponent({
  visible,
  tempDate,
  onCancel,
  onConfirm,
  onChange,
  minimumDate,
  maximumDate,
}: DatePickerModalProps) {
  if (!visible) return null;

  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        value={tempDate}
        mode="date"
        display="calendar"
        onChange={onChange}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
      />
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onCancel}
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}
        accessibilityLabel="Close date picker"
        accessibilityRole="button"
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              paddingBottom: 32,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#E5E7EB',
              }}
            >
              <TouchableOpacity
                onPress={onCancel}
                accessibilityLabel="Cancel"
                accessibilityRole="button"
                style={{ paddingVertical: 4, paddingHorizontal: 8 }}
              >
                <Text style={{ fontSize: 16, color: '#6B7280' }}>Cancel</Text>
              </TouchableOpacity>
              <Text
                style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}
              >
                Select Date
              </Text>
              <TouchableOpacity
                onPress={onConfirm}
                accessibilityLabel="Confirm date selection"
                accessibilityRole="button"
                style={{ paddingVertical: 4, paddingHorizontal: 8 }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#2563EB' }}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>

            {/* Picker */}
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={onChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              style={{ height: 200 }}
            />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

/**
 * Hook that provides a date picker modal element and an open function.
 * The parent renders {datePicker.modal} and calls datePicker.open() from any touchable.
 */
export function useDatePicker(props: DatePickerProps) {
  const [visible, setVisible] = useState(false);
  const [tempDate, setTempDate] = useState(props.value);

  const open = useCallback(() => {
    setTempDate(props.value);
    setVisible(true);
  }, [props.value]);

  const handleChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        setVisible(false);
        if (event.type === 'set' && selectedDate) {
          props.onChange(selectedDate);
        }
        return;
      }
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    },
    [props.onChange],
  );

  const handleConfirm = useCallback(() => {
    props.onChange(tempDate);
    setVisible(false);
  }, [props.onChange, tempDate]);

  const handleCancel = useCallback(() => {
    setVisible(false);
  }, []);

  const modal = (
    <DatePickerModalComponent
      visible={visible}
      tempDate={tempDate}
      onCancel={handleCancel}
      onConfirm={handleConfirm}
      onChange={handleChange}
      minimumDate={props.minimumDate}
      maximumDate={props.maximumDate}
    />
  );

  return { open, formatDisplay, modal };
}

export { formatDisplay };
export default useDatePicker;
