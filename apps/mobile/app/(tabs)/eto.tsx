import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  TextInput,
  Platform,
  StatusBar,
  Animated,
  RefreshControl,
  KeyboardAvoidingView,
} from 'react-native';

// Types
interface Transaction {
  id: string;
  date: string;
  type: 'accrued' | 'used' | 'converted';
  description: string;
  period?: string;
  reason?: string;
  hours: number;
  runningBalance: number;
  createdBy: string;
  createdDate: string;
}

interface BalanceDetails {
  current: number;
  totalAccrued: number;
  totalUsed: number;
  totalConverted: number;
  averageMonthly: number;
  lastAccrualDate: string;
  nextAccrualEstimate: string;
}

interface YearStats {
  year: string;
  accrued: number;
  used: number;
  converted: number;
  netGain: number;
}

export default function ETOScreen() {
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showUseETOModal, setShowUseETOModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Use ETO form state
  const [useEtoDate, setUseEtoDate] = useState(new Date().toISOString().split('T')[0]);
  const [useEtoHours, setUseEtoHours] = useState('8.00');
  const [useEtoReason, setUseEtoReason] = useState('');

  // Modal animations
  const modalSlideAnim = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Mock data - Replace with API calls
  const balanceDetails: BalanceDetails = {
    current: 33.92,
    totalAccrued: 128.48,
    totalUsed: 94.56,
    totalConverted: 0,
    averageMonthly: 3.45,
    lastAccrualDate: 'Mar 31, 2026',
    nextAccrualEstimate: 'Apr 15, 2026',
  };

  const recentChange = {
    amount: 3.84,
    label: 'accrued this period',
    isPositive: true,
  };

  const recentTransactions: Transaction[] = [
    {
      id: '1',
      date: 'Mar 31, 2026',
      type: 'accrued',
      description: 'Post ETO Accrual',
      period: '03/16/2026 - 03/31/2026',
      hours: 3.84,
      runningBalance: 33.92,
      createdBy: 'TimeTrack System',
      createdDate: 'Mar 31, 2026 at 11:59 PM',
    },
    {
      id: '2',
      date: 'Mar 16, 2026',
      type: 'accrued',
      description: 'Post ETO Accrual',
      period: '03/01/2026 - 03/15/2026',
      hours: 3.20,
      runningBalance: 30.08,
      createdBy: 'TimeTrack System',
      createdDate: 'Mar 16, 2026 at 11:59 PM',
    },
    {
      id: '3',
      date: 'Feb 27, 2026',
      type: 'accrued',
      description: 'Post ETO Accrual',
      period: '02/16/2026 - 02/28/2026',
      hours: 3.20,
      runningBalance: 26.88,
      createdBy: 'TimeTrack System',
      createdDate: 'Feb 27, 2026 at 11:59 PM',
    },
    {
      id: '4',
      date: 'Dec 5, 2025',
      type: 'used',
      description: 'ETO - Vacation',
      reason: 'Used for vacation day',
      hours: -8.00,
      runningBalance: 8.64,
      createdBy: 'Martin Larios',
      createdDate: 'Dec 5, 2025 at 9:00 AM',
    },
  ];

  const yearStats: YearStats[] = [
    {
      year: '2026',
      accrued: 19.76,
      used: 0.0,
      converted: 0.0,
      netGain: 19.76,
    },
    {
      year: '2025',
      accrued: 48.64,
      used: 16.0,
      converted: 0.0,
      netGain: 32.64,
    },
    {
      year: 'All Time',
      accrued: 128.48,
      used: 94.56,
      converted: 0.0,
      netGain: 33.92,
    },
  ];

  // Handlers
  const handleRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch ETO data from API
    setTimeout(() => setRefreshing(false), 1000);
  };

  const openBalanceModal = () => {
    setShowBalanceModal(true);
    animateModalIn();
  };

  const openUseETOModal = () => {
    setShowUseETOModal(true);
    animateModalIn();
  };

  const openStatsModal = () => {
    setShowStatsModal(true);
    animateModalIn();
  };

  const openTransactionModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
    animateModalIn();
  };

  const closeAllModals = () => {
    animateModalOut(() => {
      setShowBalanceModal(false);
      setShowUseETOModal(false);
      setShowStatsModal(false);
      setShowTransactionModal(false);
      setShowMoreMenu(false);
    });
  };

  const animateModalIn = () => {
    Animated.parallel([
      Animated.timing(modalSlideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateModalOut = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(modalSlideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(callback);
  };

  const handleUseETO = () => {
    // TODO: Submit ETO usage to API
    console.log('Use ETO:', { date: useEtoDate, hours: useEtoHours, reason: useEtoReason });
    closeAllModals();
    // Reset form
    setUseEtoHours('8.00');
    setUseEtoReason('');
  };

  const handleQuickSelectHours = (hours: number) => {
    setUseEtoHours(hours.toFixed(2));
  };

  const getRemainingBalance = (): number => {
    const hours = parseFloat(useEtoHours) || 0;
    return balanceDetails.current - hours;
  };

  const getTransactionTypeIcon = (type: string): string => {
    switch (type) {
      case 'accrued':
        return '🎁';
      case 'used':
        return '💸';
      case 'converted':
        return '🔄';
      default:
        return '📄';
    }
  };

  const getAmountColor = (hours: number): string => {
    if (hours > 0) return '#10B981'; // Success green
    if (hours < 0) return '#EF4444'; // Error red
    return '#1F2937'; // Gray 800
  };

  const modalTranslateY = modalSlideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1000, 0],
  });

  return (
    <SafeAreaView
      className="flex-1 bg-gray-50"
      style={{
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Top Bar */}
      <View className="flex-row items-center justify-between h-14 px-4 bg-white border-b border-gray-200">
        <TouchableOpacity className="w-10 h-10 items-center justify-center">
          <Text className="text-gray-600 text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-800">ETO</Text>
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={() => setShowMoreMenu(true)}
        >
          <Text className="text-gray-600 text-2xl">⋮</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Balance Card */}
        <TouchableOpacity
          className="mx-4 mt-4 bg-white rounded-3xl p-7 border-2 border-blue-600"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4,
          }}
          onPress={openBalanceModal}
          activeOpacity={0.9}
        >
          <View className="flex-row items-center gap-2 mb-4">
            <Text className="text-3xl">💰</Text>
            <Text className="text-base text-gray-600">ETO Balance</Text>
          </View>

          <Text className="text-6xl font-bold text-blue-600 text-center my-4">
            {balanceDetails.current.toFixed(2)}
          </Text>
          <Text className="text-base font-semibold text-gray-800 text-center">
            hrs
          </Text>

          <View className="flex-row items-center justify-center gap-1 mt-4">
            <Text className="text-xl">{recentChange.isPositive ? '↗' : '↘'}</Text>
            <Text className="text-sm text-gray-600">
              {recentChange.isPositive ? '+' : ''}
              {recentChange.amount.toFixed(2)} {recentChange.label}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View className="flex-row px-4 mt-4 gap-3">
          <TouchableOpacity
            className="flex-1 bg-blue-600 rounded-2xl h-16 flex-row items-center justify-center px-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 4,
            }}
            onPress={openUseETOModal}
            activeOpacity={0.85}
          >
            <Text className="text-2xl mr-2">💸</Text>
            <Text className="text-base font-bold text-white">Use ETO</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-2xl h-16 w-20 items-center justify-center border-2 border-gray-200"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }}
            onPress={openStatsModal}
            activeOpacity={0.85}
          >
            <Text className="text-2xl">📊</Text>
          </TouchableOpacity>
        </View>

        {/* Section Header */}
        <View className="flex-row items-center justify-between px-4 pt-6 pb-3">
          <Text className="text-lg font-bold text-gray-800">Recent Activity</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text className="text-sm font-semibold text-blue-600">View All →</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction Cards */}
        <View className="px-4 pb-6">
          {recentTransactions.map((transaction) => (
            <TouchableOpacity
              key={transaction.id}
              className="bg-white rounded-2xl p-5 mb-4 border border-gray-200"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2,
              }}
              onPress={() => openTransactionModal(transaction)}
              activeOpacity={0.8}
            >
              {/* Card Header */}
              <View className="flex-row items-center gap-2 mb-3">
                <Text className="text-lg">📅</Text>
                <Text className="text-base font-semibold text-gray-800">
                  {transaction.date}
                </Text>
              </View>

              {/* Transaction Type */}
              <Text className="text-base font-semibold text-gray-800 mb-1" numberOfLines={1}>
                {transaction.description}
              </Text>

              {/* Period/Reason */}
              <Text className="text-xs text-gray-600 mb-4" numberOfLines={1}>
                {transaction.period || transaction.reason}
              </Text>

              {/* Amount & Balance Row */}
              <View className="flex-row items-center justify-between pt-4 border-t border-gray-200">
                <Text
                  className="text-lg font-bold"
                  style={{ color: getAmountColor(transaction.hours) }}
                >
                  {transaction.hours > 0 ? '+' : ''}
                  {transaction.hours.toFixed(2)} hrs
                </Text>
                <Text className="text-base text-gray-600">
                  → {transaction.runningBalance.toFixed(2)} hrs
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Balance Detail Modal */}
      <Modal
        visible={showBalanceModal}
        transparent
        animationType="none"
        onRequestClose={closeAllModals}
      >
        <View className="flex-1 justify-end">
          <Animated.View
            className="absolute inset-0 bg-black"
            style={{ opacity: backdropOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] }) }}
          >
            <TouchableOpacity className="flex-1" onPress={closeAllModals} activeOpacity={1} />
          </Animated.View>

          <Animated.View
            className="bg-white rounded-t-3xl px-6 py-6"
            style={{
              transform: [{ translateY: modalTranslateY }],
              maxHeight: '85%',
            }}
          >
            <View className="flex-row justify-end mb-4">
              <TouchableOpacity onPress={closeAllModals} className="w-10 h-10 items-center justify-center">
                <Text className="text-2xl text-gray-600">×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-2xl font-bold text-gray-800 mb-6">ETO Balance Details</Text>

              {/* Current Balance Card */}
              <View className="bg-blue-50 border-2 border-blue-600 rounded-2xl p-6 mb-6">
                <Text className="text-5xl font-bold text-blue-600 text-center">
                  {balanceDetails.current.toFixed(2)}
                </Text>
                <Text className="text-base text-gray-600 text-center mt-2">Current Balance</Text>
              </View>

              {/* Lifetime Summary */}
              <Text className="text-base font-bold text-gray-500 uppercase mb-3">Lifetime Summary</Text>
              <View className="bg-gray-50 rounded-2xl p-5 mb-6">
                <View className="flex-row justify-between mb-3">
                  <Text className="text-base text-gray-700">Total Accrued</Text>
                  <Text className="text-base font-semibold text-gray-800">
                    {balanceDetails.totalAccrued.toFixed(2)} hrs
                  </Text>
                </View>
                <View className="flex-row justify-between mb-3">
                  <Text className="text-base text-gray-700">Total Used</Text>
                  <Text className="text-base font-semibold text-gray-800">
                    {balanceDetails.totalUsed.toFixed(2)} hrs
                  </Text>
                </View>
                <View className="flex-row justify-between pt-3 border-t border-gray-200">
                  <Text className="text-base font-bold text-gray-800">Current Balance</Text>
                  <Text className="text-base font-bold text-blue-600">
                    {balanceDetails.current.toFixed(2)} hrs
                  </Text>
                </View>
              </View>

              {/* Accrual Rate */}
              <Text className="text-base font-bold text-gray-500 uppercase mb-3">Accrual Rate</Text>
              <View className="bg-gray-50 rounded-2xl p-5 mb-6">
                <View className="flex-row justify-between mb-3">
                  <Text className="text-base text-gray-700">Average per Month</Text>
                  <Text className="text-base font-semibold text-gray-800">
                    {balanceDetails.averageMonthly.toFixed(2)} hrs
                  </Text>
                </View>
                <View className="flex-row justify-between mb-3">
                  <Text className="text-base text-gray-700">Last Accrual Date</Text>
                  <Text className="text-base font-semibold text-gray-800">
                    {balanceDetails.lastAccrualDate}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-base text-gray-700">Next Accrual Est.</Text>
                  <Text className="text-base font-semibold text-gray-800">
                    {balanceDetails.nextAccrualEstimate}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                className="bg-gray-100 rounded-xl py-4 items-center"
                onPress={closeAllModals}
              >
                <Text className="text-base font-semibold text-gray-800">Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* Use ETO Modal */}
      <Modal
        visible={showUseETOModal}
        transparent
        animationType="none"
        onRequestClose={closeAllModals}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 justify-end">
            <Animated.View
              className="absolute inset-0 bg-black"
              style={{ opacity: backdropOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] }) }}
            >
              <TouchableOpacity className="flex-1" onPress={closeAllModals} activeOpacity={1} />
            </Animated.View>

            <Animated.View
              className="bg-white rounded-t-3xl px-6 py-6"
              style={{
                transform: [{ translateY: modalTranslateY }],
                maxHeight: '85%',
              }}
            >
              <View className="flex-row justify-end mb-4">
                <TouchableOpacity onPress={closeAllModals} className="w-10 h-10 items-center justify-center">
                  <Text className="text-2xl text-gray-600">×</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text className="text-2xl font-bold text-gray-800 mb-6">Use ETO Hours</Text>

                {/* Available Balance */}
                <Text className="text-sm text-gray-500 mb-2">Available: {balanceDetails.current.toFixed(2)} hrs</Text>
                <View className="h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
                  <View
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${Math.min((balanceDetails.current / 40) * 100, 100)}%` }}
                  />
                </View>

                {/* Select Date */}
                <Text className="text-xs font-bold text-gray-700 uppercase mb-2">Select Date *</Text>
                <View className="bg-white border border-gray-300 rounded-xl p-4 mb-4 flex-row justify-between items-center">
                  <Text className="text-base text-gray-800">📅 {useEtoDate}</Text>
                  <TouchableOpacity>
                    <Text className="text-sm text-blue-600 font-semibold">Change</Text>
                  </TouchableOpacity>
                </View>

                {/* Hours to Use */}
                <Text className="text-xs font-bold text-gray-700 uppercase mb-2">Hours to Use *</Text>
                <TextInput
                  className="bg-white border border-gray-300 rounded-xl p-4 mb-2 text-center text-3xl font-bold text-gray-800"
                  value={useEtoHours}
                  onChangeText={setUseEtoHours}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                />
                <Text className="text-xs text-gray-500 mb-4 text-center">
                  Max: {balanceDetails.current.toFixed(2)} hrs
                </Text>

                {/* Quick Select */}
                <Text className="text-xs font-bold text-gray-700 uppercase mb-2">Quick Select:</Text>
                <View className="flex-row gap-2 mb-6">
                  {[4, 8, 16].map((hours) => (
                    <TouchableOpacity
                      key={hours}
                      className="flex-1 bg-gray-100 border border-gray-300 rounded-xl py-3 items-center"
                      onPress={() => handleQuickSelectHours(hours)}
                    >
                      <Text className="text-base font-bold text-gray-800">{hours}</Text>
                      <Text className="text-xs text-gray-600">hours</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    className="flex-1 bg-gray-100 border border-gray-300 rounded-xl py-3 items-center"
                    onPress={() => handleQuickSelectHours(balanceDetails.current)}
                  >
                    <Text className="text-base font-bold text-gray-800">All</Text>
                    <Text className="text-xs text-gray-600">hours</Text>
                  </TouchableOpacity>
                </View>

                {/* Reason */}
                <Text className="text-xs font-bold text-gray-700 uppercase mb-2">Reason (Optional)</Text>
                <TextInput
                  className="bg-white border border-gray-300 rounded-xl p-4 mb-4 text-base text-gray-800"
                  value={useEtoReason}
                  onChangeText={setUseEtoReason}
                  placeholder="Vacation, sick day, etc."
                  multiline
                  numberOfLines={2}
                />

                {/* After This */}
                <Text className="text-base text-gray-600 text-center mb-6">
                  After this: <Text className="font-bold">{getRemainingBalance().toFixed(2)} hrs</Text> remaining
                </Text>

                {/* Apply Button */}
                <TouchableOpacity
                  className="bg-green-500 rounded-xl py-4 items-center mb-3"
                  onPress={handleUseETO}
                  activeOpacity={0.8}
                >
                  <Text className="text-base font-bold text-white">Apply ETO</Text>
                </TouchableOpacity>
              </ScrollView>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Stats Modal */}
      <Modal
        visible={showStatsModal}
        transparent
        animationType="none"
        onRequestClose={closeAllModals}
      >
        <View className="flex-1 justify-end">
          <Animated.View
            className="absolute inset-0 bg-black"
            style={{ opacity: backdropOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] }) }}
          >
            <TouchableOpacity className="flex-1" onPress={closeAllModals} activeOpacity={1} />
          </Animated.View>

          <Animated.View
            className="bg-white rounded-t-3xl px-6 py-6"
            style={{
              transform: [{ translateY: modalTranslateY }],
              maxHeight: '85%',
            }}
          >
            <View className="flex-row justify-end mb-4">
              <TouchableOpacity onPress={closeAllModals} className="w-10 h-10 items-center justify-center">
                <Text className="text-2xl text-gray-600">×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-2xl font-bold text-gray-800 mb-6">ETO Statistics</Text>

              {yearStats.map((stat, index) => (
                <View key={stat.year} className={index < yearStats.length - 1 ? 'mb-6' : 'mb-4'}>
                  <Text className="text-base font-bold text-gray-500 uppercase mb-3">{stat.year}</Text>
                  <View className="bg-gray-50 rounded-2xl p-5">
                    <View className="flex-row justify-between mb-3">
                      <Text className="text-base text-gray-700">Accrued</Text>
                      <Text className="text-base font-semibold text-green-600">
                        {stat.accrued.toFixed(2)} hrs
                      </Text>
                    </View>
                    <View className="flex-row justify-between mb-3">
                      <Text className="text-base text-gray-700">Used</Text>
                      <Text className="text-base font-semibold text-red-600">
                        {stat.used.toFixed(2)} hrs
                      </Text>
                    </View>
                    <View className="flex-row justify-between pt-3 border-t border-gray-200">
                      <Text className="text-base font-bold text-gray-800">Net Gain</Text>
                      <Text className="text-base font-bold text-blue-600">
                        {stat.netGain.toFixed(2)} hrs
                      </Text>
                    </View>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                className="bg-gray-100 rounded-xl py-4 items-center mb-3"
                onPress={closeAllModals}
              >
                <Text className="text-base font-semibold text-gray-800">Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* Transaction Detail Modal */}
      <Modal
        visible={showTransactionModal}
        transparent
        animationType="none"
        onRequestClose={closeAllModals}
      >
        <View className="flex-1 justify-end">
          <Animated.View
            className="absolute inset-0 bg-black"
            style={{ opacity: backdropOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] }) }}
          >
            <TouchableOpacity className="flex-1" onPress={closeAllModals} activeOpacity={1} />
          </Animated.View>

          <Animated.View
            className="bg-white rounded-t-3xl px-6 py-6"
            style={{
              transform: [{ translateY: modalTranslateY }],
              maxHeight: '70%',
            }}
          >
            <View className="flex-row justify-end mb-4">
              <TouchableOpacity onPress={closeAllModals} className="w-10 h-10 items-center justify-center">
                <Text className="text-2xl text-gray-600">×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedTransaction && (
                <>
                  {/* Amount Header */}
                  <View
                    className="rounded-2xl p-6 mb-6 items-center"
                    style={{
                      backgroundColor: selectedTransaction.hours > 0 ? '#D1FAE5' : '#FEE2E2',
                      borderWidth: 2,
                      borderColor: getAmountColor(selectedTransaction.hours),
                    }}
                  >
                    <Text
                      className="text-5xl font-bold"
                      style={{ color: getAmountColor(selectedTransaction.hours) }}
                    >
                      {selectedTransaction.hours > 0 ? '+' : ''}
                      {selectedTransaction.hours.toFixed(2)} hrs
                    </Text>
                  </View>

                  {/* Details */}
                  <View className="gap-5">
                    <View>
                      <Text className="text-xs font-bold text-gray-500 uppercase mb-1">Date</Text>
                      <Text className="text-base text-gray-800">{selectedTransaction.date}</Text>
                    </View>

                    {selectedTransaction.period && (
                      <View>
                        <Text className="text-xs font-bold text-gray-500 uppercase mb-1">Period</Text>
                        <Text className="text-base text-gray-800">{selectedTransaction.period}</Text>
                      </View>
                    )}

                    <View>
                      <Text className="text-xs font-bold text-gray-500 uppercase mb-1">Type</Text>
                      <View className="flex-row items-center gap-2">
                        <Text className="text-lg">{getTransactionTypeIcon(selectedTransaction.type)}</Text>
                        <Text className="text-base text-gray-800 capitalize">{selectedTransaction.type}</Text>
                      </View>
                    </View>

                    <View>
                      <Text className="text-xs font-bold text-gray-500 uppercase mb-1">Description</Text>
                      <Text className="text-base text-gray-800">
                        {selectedTransaction.reason || `${selectedTransaction.description} - ${selectedTransaction.period}`}
                      </Text>
                    </View>

                    <View>
                      <Text className="text-xs font-bold text-gray-500 uppercase mb-1">Running Balance</Text>
                      <Text className="text-base text-gray-800">
                        {selectedTransaction.runningBalance.toFixed(2)} hrs
                      </Text>
                    </View>

                    <View>
                      <Text className="text-xs font-bold text-gray-500 uppercase mb-1">Created By</Text>
                      <Text className="text-base text-gray-800">{selectedTransaction.createdBy}</Text>
                      <Text className="text-sm text-gray-600">{selectedTransaction.createdDate}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    className="bg-gray-100 rounded-xl py-4 items-center mt-6"
                    onPress={closeAllModals}
                  >
                    <Text className="text-base font-semibold text-gray-800">Close</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* More Menu Modal */}
      <Modal
        visible={showMoreMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMoreMenu(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40"
          activeOpacity={1}
          onPress={() => setShowMoreMenu(false)}
        >
          <View className="flex-1 justify-start items-end pt-16 pr-4">
            <View className="bg-white rounded-2xl p-2 w-56" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 }}>
              <TouchableOpacity className="px-4 py-3 flex-row items-center gap-3">
                <Text className="text-lg">🔍</Text>
                <Text className="text-base text-gray-800">Search Transactions</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 py-3 flex-row items-center gap-3"
                onPress={() => {
                  setShowMoreMenu(false);
                  setTimeout(() => openStatsModal(), 300);
                }}
              >
                <Text className="text-lg">📊</Text>
                <Text className="text-base text-gray-800">View Statistics</Text>
              </TouchableOpacity>
              <TouchableOpacity className="px-4 py-3 flex-row items-center gap-3">
                <Text className="text-lg">📤</Text>
                <Text className="text-base text-gray-800">Export Report</Text>
              </TouchableOpacity>
              <TouchableOpacity className="px-4 py-3 flex-row items-center gap-3">
                <Text className="text-lg">⚙️</Text>
                <Text className="text-base text-gray-800">ETO Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity className="px-4 py-3 flex-row items-center gap-3">
                <Text className="text-lg">❓</Text>
                <Text className="text-base text-gray-800">ETO Policy Info</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
