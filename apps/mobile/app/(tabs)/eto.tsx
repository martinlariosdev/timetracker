import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useAuthenticatedQuery } from '@/hooks/useAuthenticatedQuery';
import { ME_QUERY, ETO_TRANSACTIONS_QUERY } from '@/lib/graphql/queries';
import { useTheme } from '@/contexts/ThemeContext';
import { ErrorView } from '@/components/ErrorView';
import { DayCardSkeletonList } from '@/components/skeletons/DayCardSkeleton';
import ETOBalanceDetailModal from '@/components/ETOBalanceDetailModal';
import UseETOModal from '@/components/UseETOModal';
import ETOStatsModal from '@/components/ETOStatsModal';
import ETOTransactionDetailModal from '@/components/ETOTransactionDetailModal';

// --- Types ---

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

// --- Mock Data ---
// Used when backend queries are not yet returning data

const MOCK_BALANCE = 33.92;
const MOCK_RECENT_CHANGE = 3.84;

const MOCK_TRANSACTIONS: ETOTransaction[] = [
  {
    id: '1',
    date: '2026-03-31',
    hours: 3.84,
    transactionType: 'Post ETO Accrual',
    description: 'Post ETO Accrual for period 03/16 - 03/31',
    periodStart: '03/16',
    periodEnd: '03/31',
    runningBalance: 33.92,
  },
  {
    id: '2',
    date: '2026-03-16',
    hours: 3.2,
    transactionType: 'Post ETO Accrual',
    description: 'Post ETO Accrual for period 03/01 - 03/15',
    periodStart: '03/01',
    periodEnd: '03/15',
    runningBalance: 30.08,
  },
  {
    id: '3',
    date: '2026-02-27',
    hours: 3.2,
    transactionType: 'Post ETO Accrual',
    description: 'Post ETO Accrual for period 02/16 - 02/28',
    periodStart: '02/16',
    periodEnd: '02/28',
    runningBalance: 26.88,
  },
  {
    id: '4',
    date: '2025-12-05',
    hours: -8.0,
    transactionType: 'ETO - Vacation',
    description: 'Used for vacation day',
    runningBalance: 8.64,
  },
  {
    id: '5',
    date: '2025-11-28',
    hours: 3.2,
    transactionType: 'Post ETO Accrual',
    description: 'Post ETO Accrual for period 11/16 - 11/28',
    periodStart: '11/16',
    periodEnd: '11/28',
    runningBalance: 16.64,
  },
];

// --- Date Formatting ---

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatTransactionDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const month = MONTH_NAMES[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const currentYear = new Date().getFullYear();
  if (year === currentYear) {
    return `${month.slice(0, 3)} ${day}`;
  }
  return `${month.slice(0, 3)} ${day}, ${year}`;
}

// --- Sub-Components ---

function TopBar({
  onMorePress,
  topInset,
}: {
  onMorePress: () => void;
  topInset: number;
}) {
  const { colors } = useTheme();

  return (
    <View
      className="shadow-level-1"
      style={{ paddingTop: topInset, backgroundColor: colors.surface }}
    >
      <View
        className="flex-row items-center justify-between px-4"
        style={{ height: 56 }}
      >
        <View style={{ width: 44, height: 44 }} />
        <Text
          className="text-h3 font-semibold"
          style={{ color: colors.text }}
          accessibilityRole="header"
        >
          ETO
        </Text>
        <TouchableOpacity
          onPress={onMorePress}
          className="items-center justify-center"
          style={{ width: 44, height: 44 }}
          accessibilityLabel="More options"
          accessibilityRole="button"
        >
          <Ionicons name="ellipsis-vertical" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function BalanceCard({
  balance,
  recentChange,
  onPress,
}: {
  balance: number;
  recentChange: number | null;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const isPositiveChange = recentChange != null && recentChange >= 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="shadow-level-2 mx-md mt-md"
      style={{
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#2563EB',
        padding: 28,
        backgroundColor: colors.surface,
      }}
      accessibilityLabel={`ETO Balance: ${balance.toFixed(2)} hours.${recentChange != null ? ` ${isPositiveChange ? 'Plus' : 'Minus'} ${Math.abs(recentChange).toFixed(2)} accrued this period.` : ''} Tap for details.`}
      accessibilityRole="button"
    >
      <View className="flex-row items-center" style={{ gap: 8 }}>
        <Ionicons name="time-sharp" size={24} color={colors.text} />
        <Text className="text-body" style={{ color: colors.textSecondary }}>ETO Balance</Text>
      </View>

      <Text
        className="font-bold text-center"
        style={{
          fontSize: 56,
          lineHeight: 64,
          color: '#2563EB',
          marginTop: 16,
          marginBottom: 16,
        }}
      >
        {balance.toFixed(2)}
      </Text>

      {recentChange != null && (
        <View className="flex-row items-center justify-center" style={{ gap: 4 }}>
          <Ionicons
            name={isPositiveChange ? 'arrow-up' : 'arrow-down'}
            size={14}
            color={isPositiveChange ? '#10B981' : '#EF4444'}
          />
          <Text className="text-body-small" style={{ color: colors.textSecondary }}>
            {isPositiveChange ? '+' : ''}{recentChange.toFixed(2)} accrued this period
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function QuickActions({
  onUseETO,
  onStats,
}: {
  onUseETO: () => void;
  onStats: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View
      className="flex-row mx-md"
      style={{ gap: 12, marginTop: 16 }}
    >
      <TouchableOpacity
        onPress={onUseETO}
        activeOpacity={0.8}
        className="bg-primary shadow-level-2 flex-row items-center justify-center"
        style={{
          flex: 7,
          height: 64,
          borderRadius: 16,
        }}
        accessibilityLabel="Use ETO hours"
        accessibilityRole="button"
      >
        <Ionicons name="time-outline" size={24} color="#FFFFFF" />
        <Text className="text-body font-bold text-white ml-2">Use ETO</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onStats}
        activeOpacity={0.8}
        className="items-center justify-center"
        style={{
          flex: 3,
          height: 64,
          borderRadius: 16,
          backgroundColor: colors.surface,
          borderWidth: 2,
          borderColor: colors.border,
        }}
        accessibilityLabel="View ETO statistics"
        accessibilityRole="button"
      >
        <Ionicons name="stats-chart-outline" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

function SectionHeader({
  onViewAll,
}: {
  onViewAll: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View
      className="flex-row items-center justify-between"
      style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 12 }}
    >
      <Text className="text-h4 font-bold" style={{ color: colors.text }}>Recent Activity</Text>
      <TouchableOpacity
        onPress={onViewAll}
        accessibilityLabel="View all transactions"
        accessibilityRole="button"
      >
        <Text className="text-body-small font-semibold text-primary">
          View All →
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function TransactionCard({
  transaction,
  onPress,
}: {
  transaction: ETOTransaction;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const isPositive = transaction.hours >= 0;
  const amountColor = isPositive ? '#10B981' : '#EF4444';
  const formattedDate = formatTransactionDate(transaction.date);
  const periodText = transaction.periodStart && transaction.periodEnd
    ? `Period: ${transaction.periodStart} - ${transaction.periodEnd}`
    : transaction.description;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.95}
      className="shadow-level-1"
      style={{
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
      }}
      accessibilityLabel={`${transaction.transactionType}, ${formattedDate}, ${isPositive ? 'plus' : 'minus'} ${Math.abs(transaction.hours).toFixed(2)} hours`}
      accessibilityRole="button"
    >
      {/* Card Header */}
      <View className="flex-row items-center" style={{ gap: 8, marginBottom: 12 }}>
        <Ionicons name="calendar-outline" size={20} color={colors.text} />
        <Text className="text-body font-semibold" style={{ color: colors.text }}>
          {formattedDate}
        </Text>
      </View>

      {/* Transaction Type */}
      <Text
        className="text-body font-semibold"
        numberOfLines={1}
        style={{ marginBottom: 4, color: colors.text }}
      >
        {transaction.transactionType}
      </Text>

      {/* Period/Description */}
      <Text
        className="text-caption"
        numberOfLines={1}
        style={{ marginBottom: 16, color: colors.textSecondary }}
      >
        {periodText}
      </Text>

      {/* Amount & Balance Row */}
      <View
        className="flex-row items-center justify-between"
        style={{
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 16,
        }}
      >
        <Text
          className="text-body-large font-bold"
          style={{ color: amountColor }}
        >
          {isPositive ? '+' : ''}{transaction.hours.toFixed(2)} hrs
        </Text>
        {transaction.runningBalance !== undefined && (
          <Text className="text-body text-gray-600">
            → {transaction.runningBalance.toFixed(2)} hrs
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// --- Main Screen ---

export default function ETOScreen() {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const { colors } = useTheme();

  // --- Modal State ---
  const [balanceDetailVisible, setBalanceDetailVisible] = useState(false);
  const [useETOVisible, setUseETOVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [transactionDetailVisible, setTransactionDetailVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<ETOTransaction | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // --- GraphQL Queries ---
  const {
    data: meData,
    loading: meLoading,
    error: meError,
    refetch: refetchMe,
  } = useAuthenticatedQuery(ME_QUERY);

  // Get consultant ID from ME query for the transactions query
  const consultantId = meData?.me?.id;

  const {
    data: transactionsData,
    loading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useAuthenticatedQuery(ETO_TRANSACTIONS_QUERY, {
    variables: { consultantId: consultantId || '', limit: 20 },
    skip: !consultantId,
  });

  // --- Derived Data ---
  const balance = useMemo(() => {
    if (meData?.me?.etoBalance != null) {
      return meData.me.etoBalance;
    }
    return MOCK_BALANCE;
  }, [meData]);

  const transactions: ETOTransaction[] = useMemo(() => {
    if (transactionsData?.etoTransactions?.length > 0) {
      return transactionsData.etoTransactions.map((t: any) => ({
        id: t.id,
        date: t.date ? t.date.split('T')[0] : '',
        hours: t.hours,
        transactionType: t.transactionType || 'Transaction',
        description: t.description || t.projectName || '',
        runningBalance: t.runningBalance ?? undefined,
      }));
    }
    return MOCK_TRANSACTIONS; // Keep mock data as fallback during development
  }, [transactionsData]);

  const recentChange = useMemo(() => {
    if (meData?.me?.etoBalance != null && transactions.length > 0 && transactions !== MOCK_TRANSACTIONS) {
      const lastAccrual = transactions.find((t) => t.hours > 0);
      return lastAccrual?.hours ?? null;
    }
    if (meData?.me?.etoBalance != null) return null;
    return MOCK_RECENT_CHANGE;
  }, [meData, transactions]);

  const recentTransactions = useMemo(
    () => transactions.slice(0, 5),
    [transactions],
  );

  const loading = meLoading || transactionsLoading;
  const error = meError || transactionsError;

  // --- Handlers ---

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchMe(), refetchTransactions()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchMe, refetchTransactions]);

  const handleMorePress = useCallback(() => {
    // TODO: Show action sheet with more options
  }, []);

  const handleBalancePress = useCallback(() => {
    setBalanceDetailVisible(true);
  }, []);

  const handleUseETO = useCallback(() => {
    setUseETOVisible(true);
  }, []);

  const handleStats = useCallback(() => {
    setStatsVisible(true);
  }, []);

  const handleViewAll = useCallback(() => {
    // TODO: Navigate to full transaction list
  }, []);

  const handleTransactionPress = useCallback((transaction: ETOTransaction) => {
    setSelectedTransaction(transaction);
    setTransactionDetailVisible(true);
  }, []);

  const handleETORequestSuccess = useCallback(async () => {
    setUseETOVisible(false);
    await Promise.all([refetchMe(), refetchTransactions()]);
  }, [refetchMe, refetchTransactions]);

  // --- Render ---

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar style="dark" />

      {/* Top Bar */}
      <TopBar onMorePress={handleMorePress} topInset={insets.top} />

      {/* Content */}
      {loading && !transactions.length ? (
        <ScrollView className="flex-1 px-4 pt-3">
          <DayCardSkeletonList count={5} />
        </ScrollView>
      ) : error && !transactions.length ? (
        <ErrorView
          error={error}
          onRetry={async () => { await Promise.all([refetchMe(), refetchTransactions()]); }}
          onLogout={logout}
        />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#2563EB"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Balance Card */}
          <BalanceCard
            balance={balance}
            recentChange={recentChange}
            onPress={handleBalancePress}
          />

          {/* Quick Actions */}
          <QuickActions onUseETO={handleUseETO} onStats={handleStats} />

          {/* Section Header */}
          <SectionHeader onViewAll={handleViewAll} />

          {/* Transaction Cards */}
          {recentTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onPress={() => handleTransactionPress(transaction)}
            />
          ))}
        </ScrollView>
      )}

      {/* Modals */}
      <ETOBalanceDetailModal
        visible={balanceDetailVisible}
        onClose={() => setBalanceDetailVisible(false)}
        balance={balance}
      />

      <UseETOModal
        visible={useETOVisible}
        onClose={() => setUseETOVisible(false)}
        balance={balance}
        onSuccess={handleETORequestSuccess}
      />

      <ETOStatsModal
        visible={statsVisible}
        onClose={() => setStatsVisible(false)}
        balance={balance}
      />

      <ETOTransactionDetailModal
        visible={transactionDetailVisible}
        onClose={() => setTransactionDetailVisible(false)}
        transaction={selectedTransaction}
      />
    </View>
  );
}
