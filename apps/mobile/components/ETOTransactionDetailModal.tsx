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

interface ETOTransaction {
  id: string;
  date: string;
  hours: number;
  transactionType: string;
  description: string;
  periodStart?: string;
  periodEnd?: string;
  runningBalance?: number;
}

interface ETOTransactionDetailModalProps {
  visible: boolean;
  onClose: () => void;
  transaction: ETOTransaction | null;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatFullDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text className="text-caption font-bold text-gray-500 uppercase mb-1">
        {label}
      </Text>
      <Text className="text-body text-gray-800">{value}</Text>
    </View>
  );
}

export default function ETOTransactionDetailModal({
  visible,
  onClose,
  transaction,
}: ETOTransactionDetailModalProps) {
  if (!transaction) return null;

  const isPositive = transaction.hours >= 0;
  const amountColor = isPositive ? '#10B981' : '#EF4444';
  const amountBg = isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';

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
          accessibilityLabel="Close transaction details"
        />
        <View
          className="bg-white"
          style={{
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: Platform.OS === 'ios' ? 40 : 24,
            maxHeight: '70%',
          }}
        >
          {/* Handle */}
          <View
            className="self-center rounded-full mb-4"
            style={{ width: 40, height: 4, backgroundColor: '#D1D5DB' }}
          />

          {/* Close Button */}
          <View className="flex-row justify-end mb-2">
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
            {/* Amount Header Card */}
            <View
              className="items-center justify-center rounded-lg mb-6"
              style={{
                padding: 24,
                backgroundColor: amountBg,
              }}
              accessibilityLabel={`${isPositive ? 'Plus' : 'Minus'} ${Math.abs(transaction.hours).toFixed(2)} hours`}
            >
              <Text
                className="font-bold"
                style={{ fontSize: 40, color: amountColor }}
              >
                {isPositive ? '+' : ''}{transaction.hours.toFixed(2)} hrs
              </Text>
            </View>

            {/* Detail Fields */}
            <DetailField
              label="Date"
              value={formatFullDate(transaction.date)}
            />

            {transaction.periodStart && transaction.periodEnd && (
              <DetailField
                label="Period"
                value={`${transaction.periodStart} - ${transaction.periodEnd}`}
              />
            )}

            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: '#E5E7EB',
                marginBottom: 16,
              }}
            />

            <DetailField
              label="Type"
              value={transaction.transactionType}
            />

            <DetailField
              label="Description"
              value={transaction.description}
            />

            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: '#E5E7EB',
                marginBottom: 16,
              }}
            />

            {transaction.runningBalance !== undefined && (
              <DetailField
                label="Running Balance"
                value={`${transaction.runningBalance.toFixed(2)} hrs`}
              />
            )}

            <DetailField
              label="Created By"
              value="TimeTrack System"
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
