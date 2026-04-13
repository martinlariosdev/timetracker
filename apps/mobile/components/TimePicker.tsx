import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

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

// --- Modal component defined outside hook for stable identity ---

interface TimePickerModalProps {
  visible: boolean;
  tempDate: Date;
  label: string;
  onCancel: () => void;
  onConfirm: () => void;
  onChange: (event: DateTimePickerEvent, selectedDate?: Date) => void;
}

function TimePickerModalComponent({
  visible,
  tempDate,
  label,
  onCancel,
  onConfirm,
  onChange,
}: TimePickerModalProps) {
  if (!visible) return null;

  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        value={tempDate}
        mode="time"
        is24Hour={true}
        display="spinner"
        onChange={onChange}
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
                {label}
              </Text>
              <TouchableOpacity
                onPress={onConfirm}
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
              onChange={onChange}
              style={{ height: 200 }}
            />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

/**
 * Hook that provides a time picker modal element and an open function.
 * The parent renders {timePicker.modal} and calls timePicker.open() from any touchable.
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

  const modal = (
    <TimePickerModalComponent
      visible={visible}
      tempDate={tempDate}
      label={props.label ?? 'Select Time'}
      onCancel={handleCancel}
      onConfirm={handleConfirm}
      onChange={handleChange}
    />
  );

  return { open, modal };
}

export default useTimePicker;
