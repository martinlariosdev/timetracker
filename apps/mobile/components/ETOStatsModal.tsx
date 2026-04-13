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

interface ETOStatsModalProps {
  visible: boolean;
  onClose: () => void;
  balance: number;
}

// --- Mock Stats Data ---
const MOCK_STATS = {
  thisYear: {
    label: 'This Year (2026)',
    accrued: 19.76,
    used: 0.0,
    netGain: 19.76,
  },
  lastYear: {
    label: 'Last Year (2025)',
    accrued: 48.64,
    used: 16.0,
    netGain: 32.64,
  },
  allTime: {
    totalAccrued: 128.48,
    totalUsed: 94.56,
    netBalance: 33.92,
  },
};

function StatRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View
      className="flex-row items-center justify-between"
      style={{ paddingVertical: 12 }}
    >
      <Text className="text-body text-gray-600">{label}</Text>
      <Text
        className="text-body font-semibold"
        style={{ color: valueColor || '#1F2937' }}
      >
        {value}
      </Text>
    </View>
  );
}

function StatsSection({
  title,
  stats,
}: {
  title: string;
  stats: { label: string; value: string; valueColor?: string }[];
}) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text className="text-body-small font-bold text-gray-500 uppercase mb-2">
        {title}
      </Text>
      <View className="bg-gray-50 rounded-lg" style={{ padding: 16 }}>
        {stats.map((stat, index) => (
          <React.Fragment key={stat.label}>
            {index > 0 && (
              <View
                style={{ borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}
              />
            )}
            <StatRow
              label={stat.label}
              value={stat.value}
              valueColor={stat.valueColor}
            />
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

export default function ETOStatsModal({
  visible,
  onClose,
  balance,
}: ETOStatsModalProps) {
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
          accessibilityLabel="Close stats"
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
              ETO Statistics
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
            {/* This Year */}
            <StatsSection
              title={MOCK_STATS.thisYear.label}
              stats={[
                {
                  label: 'Accrued',
                  value: `${MOCK_STATS.thisYear.accrued.toFixed(2)} hrs`,
                  valueColor: '#10B981',
                },
                {
                  label: 'Used',
                  value: `${MOCK_STATS.thisYear.used.toFixed(2)} hrs`,
                  valueColor: MOCK_STATS.thisYear.used > 0 ? '#EF4444' : '#6B7280',
                },
                {
                  label: 'Net Gain',
                  value: `${MOCK_STATS.thisYear.netGain.toFixed(2)} hrs`,
                  valueColor: '#2563EB',
                },
              ]}
            />

            {/* Last Year */}
            <StatsSection
              title={MOCK_STATS.lastYear.label}
              stats={[
                {
                  label: 'Accrued',
                  value: `${MOCK_STATS.lastYear.accrued.toFixed(2)} hrs`,
                  valueColor: '#10B981',
                },
                {
                  label: 'Used',
                  value: `${MOCK_STATS.lastYear.used.toFixed(2)} hrs`,
                  valueColor: '#EF4444',
                },
                {
                  label: 'Net Gain',
                  value: `${MOCK_STATS.lastYear.netGain.toFixed(2)} hrs`,
                  valueColor: '#2563EB',
                },
              ]}
            />

            {/* All Time */}
            <StatsSection
              title="All Time"
              stats={[
                {
                  label: 'Total Accrued',
                  value: `${MOCK_STATS.allTime.totalAccrued.toFixed(2)} hrs`,
                  valueColor: '#10B981',
                },
                {
                  label: 'Total Used',
                  value: `${MOCK_STATS.allTime.totalUsed.toFixed(2)} hrs`,
                  valueColor: '#EF4444',
                },
                {
                  label: 'Net Balance',
                  value: `${balance.toFixed(2)} hrs`,
                  valueColor: '#2563EB',
                },
              ]}
            />

            {/* Export Report Button */}
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
              accessibilityLabel="Export ETO report"
              accessibilityRole="button"
            >
              <Text className="text-body font-semibold text-gray-700">
                Export Report
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
