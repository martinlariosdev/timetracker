import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDatePicker } from '@/components/DatePicker';
import { useAuthenticatedMutation } from '@/hooks/useAuthenticatedMutation';
import { USE_ETO_MUTATION } from '@/lib/graphql/mutations';

interface UseETOModalProps {
  visible: boolean;
  onClose: () => void;
  balance: number;
  onSuccess: () => void;
}

const QUICK_HOURS = [4, 8, 16];

function formatDateDisplay(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const y = date.getFullYear();
  return `${m}/${d}/${y}`;
}

function formatDateParam(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function UseETOModal({
  visible,
  onClose,
  balance,
  onSuccess,
}: UseETOModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [hoursText, setHoursText] = useState('8.00');
  const [reason, setReason] = useState('');

  const hours = useMemo(() => {
    const parsed = parseFloat(hoursText);
    return isNaN(parsed) ? 0 : parsed;
  }, [hoursText]);

  const remaining = useMemo(() => balance - hours, [balance, hours]);
  const isValid = hours > 0 && hours <= balance;

  const datePicker = useDatePicker({
    value: selectedDate,
    onChange: setSelectedDate,
    minimumDate: new Date(),
  });

  const [useETO, { loading: isSubmitting }] = useAuthenticatedMutation(
    USE_ETO_MUTATION,
    {
      refetchQueries: ['Me', 'ETOTransactions'],
    },
  );

  const handleQuickSelect = useCallback((quickHours: number) => {
    setHoursText(quickHours.toFixed(2));
  }, []);

  const handleSelectAll = useCallback(() => {
    setHoursText(balance.toFixed(2));
  }, [balance]);

  const handleSubmit = useCallback(async () => {
    if (!isValid) return;

    try {
      const dateStr = formatDateParam(selectedDate);
      await useETO({
        variables: {
          input: {
            date: dateStr,
            hours,
            description: reason.trim() || undefined,
            projectName: undefined,
          },
        },
      });
      Alert.alert('ETO Applied', `${hours.toFixed(2)} hours of ETO have been used.`);
      setHoursText('8.00');
      setReason('');
      setSelectedDate(new Date());
      onSuccess();
    } catch (err) {
      Alert.alert('Request Failed', 'Could not apply ETO. Please try again.');
    }
  }, [isValid, selectedDate, hours, reason, useETO, onSuccess]);

  const handleClose = useCallback(() => {
    setHoursText('8.00');
    setReason('');
    setSelectedDate(new Date());
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType={Platform.OS === 'ios' ? 'slide' : 'fade'}
      onRequestClose={handleClose}
    >
      <View
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      >
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={handleClose}
          accessibilityLabel="Close use ETO modal"
        />
        <View
          className="bg-white"
          style={{
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: Platform.OS === 'ios' ? 40 : 24,
            maxHeight: '80%',
          }}
        >
          {/* Handle */}
          <View
            className="self-center rounded-full mb-4"
            style={{ width: 40, height: 4, backgroundColor: '#D1D5DB' }}
          />

          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text
              className="text-h3 font-bold text-gray-900"
              accessibilityRole="header"
            >
              Use ETO Hours
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              className="items-center justify-center"
              style={{ width: 32, height: 32 }}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Available Balance */}
            <View className="mb-4">
              <Text className="text-body text-gray-600">
                Available: <Text className="font-bold text-primary">{balance.toFixed(2)} hrs</Text>
              </Text>
              <View
                className="rounded-full mt-2"
                style={{
                  height: 8,
                  backgroundColor: '#E5E7EB',
                }}
              >
                <View
                  className="rounded-full"
                  style={{
                    height: 8,
                    width: `${Math.min(((balance - hours) / balance) * 100, 100)}%`,
                    backgroundColor: remaining >= 0 ? '#2563EB' : '#EF4444',
                  }}
                />
              </View>
            </View>

            {/* Date Selector */}
            <Text className="text-body-small text-gray-700 mb-2">
              Select Date *
            </Text>
            <TouchableOpacity
              onPress={datePicker.open}
              className="bg-white flex-row items-center mb-4"
              style={{
                height: 52,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#D1D5DB',
                paddingHorizontal: 16,
              }}
              accessibilityLabel={`Date: ${formatDateDisplay(selectedDate)}`}
              accessibilityRole="button"
            >
              <Text style={{ fontSize: 20 }}>📅</Text>
              <Text className="text-body text-gray-800 ml-3">
                {formatDateDisplay(selectedDate)}
              </Text>
            </TouchableOpacity>

            {/* Hours Input */}
            <Text className="text-body-small text-gray-700 mb-2">
              Hours to Use *
            </Text>
            <View
              className="items-center justify-center mb-2"
              style={{
                height: 72,
                borderRadius: 12,
                borderWidth: hours > balance ? 2 : 1,
                borderColor: hours > balance ? '#EF4444' : '#D1D5DB',
                backgroundColor: '#F9FAFB',
              }}
            >
              <TextInput
                className="text-center font-bold"
                style={{
                  fontSize: 32,
                  color: hours > balance ? '#EF4444' : '#2563EB',
                  width: '100%',
                }}
                value={hoursText}
                onChangeText={setHoursText}
                keyboardType="decimal-pad"
                accessibilityLabel="Hours to use"
              />
            </View>
            {hours > balance && (
              <Text className="text-caption text-error mb-2">
                Exceeds available balance
              </Text>
            )}

            {/* Quick Select Chips */}
            <Text className="text-caption text-gray-500 mb-2">Quick Select:</Text>
            <View className="flex-row mb-4" style={{ gap: 8 }}>
              {QUICK_HOURS.map((h) => (
                <TouchableOpacity
                  key={h}
                  onPress={() => handleQuickSelect(h)}
                  className="items-center justify-center"
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: hours === h ? '#2563EB' : '#E5E7EB',
                    backgroundColor: hours === h ? '#EFF6FF' : '#FFFFFF',
                  }}
                  accessibilityLabel={`${h} hours`}
                  accessibilityRole="button"
                >
                  <Text
                    className="font-semibold"
                    style={{
                      fontSize: 16,
                      color: hours === h ? '#2563EB' : '#4B5563',
                    }}
                  >
                    {h}
                  </Text>
                  <Text
                    className="text-caption"
                    style={{ color: hours === h ? '#2563EB' : '#9CA3AF' }}
                  >
                    hours
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={handleSelectAll}
                className="items-center justify-center"
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: hours === balance ? '#2563EB' : '#E5E7EB',
                  backgroundColor: hours === balance ? '#EFF6FF' : '#FFFFFF',
                }}
                accessibilityLabel="Use all available hours"
                accessibilityRole="button"
              >
                <Text
                  className="font-semibold"
                  style={{
                    fontSize: 16,
                    color: hours === balance ? '#2563EB' : '#4B5563',
                  }}
                >
                  All
                </Text>
              </TouchableOpacity>
            </View>

            {/* Reason */}
            <Text className="text-body-small text-gray-700 mb-2">
              Reason (Optional)
            </Text>
            <TextInput
              className="bg-white text-body text-gray-800 mb-4"
              style={{
                height: 48,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#D1D5DB',
                paddingHorizontal: 16,
              }}
              placeholder="Vacation"
              placeholderTextColor="#9CA3AF"
              value={reason}
              onChangeText={setReason}
              accessibilityLabel="Reason for ETO use"
            />

            {/* Remaining Balance Preview */}
            {isValid && (
              <Text className="text-body text-gray-600 text-center mb-4">
                After this: <Text className="font-bold text-primary">{remaining.toFixed(2)} hrs</Text> remaining
              </Text>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!isValid || isSubmitting}
              activeOpacity={0.8}
              className="flex-row items-center justify-center rounded-xl"
              style={{
                height: 56,
                backgroundColor: !isValid || isSubmitting ? '#D1D5DB' : '#2563EB',
                marginBottom: 8,
              }}
              accessibilityLabel="Apply ETO hours"
              accessibilityRole="button"
              accessibilityState={{ disabled: !isValid || isSubmitting }}
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text className="text-body font-bold text-white ml-2">
                    Submitting...
                  </Text>
                </>
              ) : (
                <Text className="text-body font-bold text-white">Apply ETO</Text>
              )}
            </TouchableOpacity>
          </ScrollView>

          {datePicker.modal}
        </View>
      </View>
    </Modal>
  );
}
