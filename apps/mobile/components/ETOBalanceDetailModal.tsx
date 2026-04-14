import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- Mock Lifetime Data ---
const MOCK_LIFETIME = {
  totalAccrued: 128.48,
  totalUsed: 94.56,
  averagePerMonth: 3.45,
  lastAccrualDate: 'Mar 31',
  nextAccrualEst: 'Apr 15',
  maxCap: 200,
};

interface ETOBalanceDetailModalProps {
  visible: boolean;
  onClose: () => void;
  balance: number;
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      className="flex-row items-center justify-between"
      style={{ paddingVertical: 12 }}
    >
      <Text className="text-body text-gray-600">{label}</Text>
      <Text className="text-body font-semibold text-gray-800">{value}</Text>
    </View>
  );
}

function CircularProgress({
  current,
  max,
}: {
  current: number;
  max: number;
}) {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <View
      className="items-center justify-center"
      style={{ width: 160, height: 160 }}
      accessibilityLabel={`${current.toFixed(2)} hours of ${max} maximum, ${percentage.toFixed(0)} percent`}
    >
      {/* Outer ring background */}
      <View
        className="absolute items-center justify-center"
        style={{
          width: 160,
          height: 160,
          borderRadius: 80,
          borderWidth: 12,
          borderColor: '#E5E7EB',
        }}
      />
      {/* Filled portion shown as a colored border overlay */}
      <View
        className="absolute items-center justify-center"
        style={{
          width: 160,
          height: 160,
          borderRadius: 80,
          borderWidth: 12,
          borderColor: '#2563EB',
          borderTopColor: percentage < 25 ? '#E5E7EB' : '#2563EB',
          borderRightColor: percentage < 50 ? '#E5E7EB' : '#2563EB',
          borderBottomColor: percentage < 75 ? '#E5E7EB' : '#2563EB',
          borderLeftColor: percentage < 100 ? '#E5E7EB' : '#2563EB',
          transform: [{ rotate: '-90deg' }],
        }}
      />
      {/* Center text */}
      <Text
        className="font-bold"
        style={{ fontSize: 28, color: '#2563EB' }}
      >
        {current.toFixed(2)}
      </Text>
      <Text className="text-caption text-gray-500">hours</Text>
    </View>
  );
}

export default function ETOBalanceDetailModal({
  visible,
  onClose,
  balance,
}: ETOBalanceDetailModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType={Platform.OS === 'ios' ? 'slide' : 'fade'}
      onRequestClose={onClose}
    >
      <View
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      >
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="Close balance details"
        />
        <View
          className="bg-white"
          style={{
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: Platform.OS === 'ios' ? 40 : 24,
            maxHeight: '75%',
          }}
        >
          {/* Handle */}
          <View
            className="self-center rounded-full mb-4"
            style={{ width: 40, height: 4, backgroundColor: '#D1D5DB' }}
          />

          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text
              className="text-h3 font-bold text-gray-900"
              accessibilityRole="header"
            >
              ETO Balance Details
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="items-center justify-center"
              style={{ width: 32, height: 32 }}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Circular Progress */}
            <View className="items-center mb-6">
              <CircularProgress
                current={balance}
                max={MOCK_LIFETIME.maxCap}
              />
              <Text className="text-caption text-gray-500 mt-2">
                of {MOCK_LIFETIME.maxCap} hr cap
              </Text>
            </View>

            {/* Lifetime Summary */}
            <Text className="text-body-small font-bold text-gray-500 uppercase mb-2">
              Lifetime Summary
            </Text>
            <View
              className="bg-gray-50 rounded-lg"
              style={{ padding: 16, marginBottom: 20 }}
            >
              <StatRow
                label="Total Accrued"
                value={`${MOCK_LIFETIME.totalAccrued.toFixed(2)} hrs`}
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }} />
              <StatRow
                label="Total Used"
                value={`${MOCK_LIFETIME.totalUsed.toFixed(2)} hrs`}
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }} />
              <StatRow
                label="Current Balance"
                value={`${balance.toFixed(2)} hrs`}
              />
            </View>

            {/* Accrual Rate */}
            <Text className="text-body-small font-bold text-gray-500 uppercase mb-2">
              Accrual Rate
            </Text>
            <View
              className="bg-gray-50 rounded-lg"
              style={{ padding: 16, marginBottom: 20 }}
            >
              <StatRow
                label="Average per Month"
                value={`${MOCK_LIFETIME.averagePerMonth.toFixed(2)} hrs`}
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }} />
              <StatRow
                label="Last Accrual Date"
                value={MOCK_LIFETIME.lastAccrualDate}
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }} />
              <StatRow
                label="Next Accrual Est."
                value={MOCK_LIFETIME.nextAccrualEst}
              />
            </View>

            {/* View Full History Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              className="items-center justify-center rounded-xl"
              style={{
                height: 52,
                borderWidth: 1.5,
                borderColor: '#D1D5DB',
                backgroundColor: '#FFFFFF',
                marginBottom: 8,
              }}
              accessibilityLabel="View full ETO history"
              accessibilityRole="button"
            >
              <Text className="text-body font-semibold text-gray-700">
                View Full History
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
