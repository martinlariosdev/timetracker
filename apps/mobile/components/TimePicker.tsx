import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

interface TimePickerProps {
  value: string; // HH:MM format
  onChange: (time: string) => void;
  label?: string;
}

function timeStringToDate(time: string): Date {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function dateToTimeString(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export default function TimePicker({ value, onChange, label }: TimePickerProps) {
  const [visible, setVisible] = useState(false);
  const [tempDate, setTempDate] = useState(() => timeStringToDate(value));

  const open = useCallback(() => {
    setTempDate(timeStringToDate(value));
    setVisible(true);
  }, [value]);

  const handleChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        setVisible(false);
        if (event.type === 'set' && selectedDate) {
          onChange(dateToTimeString(selectedDate));
        }
        return;
      }
      // iOS: update temp value, wait for confirm
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    },
    [onChange],
  );

  const handleConfirm = useCallback(() => {
    onChange(dateToTimeString(tempDate));
    setVisible(false);
  }, [onChange, tempDate]);

  const handleCancel = useCallback(() => {
    setVisible(false);
  }, []);

  // Android renders inline (no modal needed)
  if (Platform.OS === 'android' && visible) {
    return (
      <DateTimePicker
        value={tempDate}
        mode="time"
        is24Hour={true}
        display="spinner"
        onChange={handleChange}
      />
    );
  }

  return (
    <>
      {/* Hidden trigger — parent provides its own touchable and calls open */}
      {/* Expose open via the component being used inline */}

      {/* iOS modal */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={visible}
          transparent
          animationType="slide"
          onRequestClose={handleCancel}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleCancel}
            style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}
            accessibilityLabel="Close time picker"
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
                    onPress={handleCancel}
                    accessibilityLabel="Cancel"
                    accessibilityRole="button"
                    style={{ paddingVertical: 4, paddingHorizontal: 8 }}
                  >
                    <Text style={{ fontSize: 16, color: '#6B7280' }}>Cancel</Text>
                  </TouchableOpacity>
                  <Text
                    style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}
                  >
                    {label ?? 'Select Time'}
                  </Text>
                  <TouchableOpacity
                    onPress={handleConfirm}
                    accessibilityLabel="Confirm time selection"
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
                  mode="time"
                  is24Hour={true}
                  display="spinner"
                  onChange={handleChange}
                  style={{ height: 200 }}
                />
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
}

// Re-export the helper so the parent can trigger the picker
TimePicker.open = undefined as unknown; // placeholder — see useTimePicker hook below

/**
 * Hook that wraps TimePicker state for use inside a parent component.
 * Returns { openTimePicker, TimePickerModal } so the parent can render
 * the modal and trigger it from any touchable.
 */
export function useTimePicker(props: {
  value: string;
  onChange: (time: string) => void;
  label?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [tempDate, setTempDate] = useState(() => timeStringToDate(props.value));

  const open = useCallback(() => {
    setTempDate(timeStringToDate(props.value));
    setVisible(true);
  }, [props.value]);

  const handleChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        setVisible(false);
        if (event.type === 'set' && selectedDate) {
          props.onChange(dateToTimeString(selectedDate));
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
    props.onChange(dateToTimeString(tempDate));
    setVisible(false);
  }, [props.onChange, tempDate]);

  const handleCancel = useCallback(() => {
    setVisible(false);
  }, []);

  const TimePickerModal = useCallback(() => {
    if (!visible) return null;

    // Android renders a system dialog directly
    if (Platform.OS === 'android') {
      return (
        <DateTimePicker
          value={tempDate}
          mode="time"
          is24Hour={true}
          display="spinner"
          onChange={handleChange}
        />
      );
    }

    // iOS modal
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleCancel}
          style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}
          accessibilityLabel="Close time picker"
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
                  onPress={handleCancel}
                  accessibilityLabel="Cancel"
                  accessibilityRole="button"
                  style={{ paddingVertical: 4, paddingHorizontal: 8 }}
                >
                  <Text style={{ fontSize: 16, color: '#6B7280' }}>Cancel</Text>
                </TouchableOpacity>
                <Text
                  style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}
                >
                  {props.label ?? 'Select Time'}
                </Text>
                <TouchableOpacity
                  onPress={handleConfirm}
                  accessibilityLabel="Confirm time selection"
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
                mode="time"
                is24Hour={true}
                display="spinner"
                onChange={handleChange}
                style={{ height: 200 }}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  }, [visible, tempDate, handleChange, handleConfirm, handleCancel, props.label]);

  return { open, TimePickerModal };
}
