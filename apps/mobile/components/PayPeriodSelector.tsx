import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePayPeriodContext } from '@/contexts/PayPeriodContext';
import { PayPeriod } from '@/types/pay-period';

interface PayPeriodSelectorProps {
  selectedPeriodId: string | null;
  onSelectPeriod: (period: PayPeriod) => void;
}

export function PayPeriodSelector({
  selectedPeriodId,
  onSelectPeriod,
}: PayPeriodSelectorProps) {
  const { payPeriods, currentPayPeriod, loading } = usePayPeriodContext();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedPeriod = payPeriods.find(p => p.id === selectedPeriodId) || currentPayPeriod;

  const handleSelectPeriod = useCallback((period: PayPeriod) => {
    onSelectPeriod(period);
    setModalVisible(false);
  }, [onSelectPeriod]);

  if (loading || !selectedPeriod) {
    return (
      <View className="bg-gray-200 rounded-full px-4 py-2">
        <Text className="text-sm text-gray-400">Loading periods...</Text>
      </View>
    );
  }

  return (
    <>
      {/* Selector Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="flex-row items-center bg-blue-50 rounded-full px-4 py-2 border border-blue-200"
        accessibilityRole="button"
        accessibilityLabel="Select pay period"
      >
        <Text className="text-sm font-semibold text-blue-700 mr-2">
          {selectedPeriod.displayText}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#1D4ED8" />
      </TouchableOpacity>

      {/* Selector Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            className="bg-white rounded-t-3xl"
            style={{ maxHeight: '80%' }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
              <Text className="text-lg font-bold text-gray-900">
                Select Pay Period
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="p-2"
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Period List */}
            <ScrollView className="px-4 py-2">
              {payPeriods.map((period) => (
                <TouchableOpacity
                  key={period.id}
                  onPress={() => handleSelectPeriod(period)}
                  className={`p-4 rounded-lg mb-2 ${
                    period.id === selectedPeriodId
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50'
                  }`}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${period.displayText}`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900">
                        {period.displayText}
                      </Text>
                      {period.deadlineDate && (
                        <Text className="text-sm text-gray-500 mt-1">
                          Due {new Date(period.deadlineDate).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                    <View className="flex-row items-center gap-2">
                      {period.isCurrent && (
                        <View className="bg-blue-500 rounded-full px-3 py-1">
                          <Text className="text-xs font-bold text-white">
                            Current
                          </Text>
                        </View>
                      )}
                      {period.id === selectedPeriodId && (
                        <Ionicons name="checkmark-circle" size={24} color="#2563EB" />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
