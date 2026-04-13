import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from './BentoBox';
import type { SyncConflict } from '../hooks/useOfflineSync';

interface ConflictResolutionModalProps {
  visible: boolean;
  conflict: SyncConflict | null;
  onResolve: (resolution: 'SERVER' | 'LOCAL') => Promise<void>;
  onCancel: () => void;
}

const ENTITY_TYPE_LABELS: Record<SyncConflict['entityType'], string> = {
  TimeEntry: 'Time Entry',
  ETOTransaction: 'ETO Transaction',
  TimesheetSubmission: 'Timesheet Submission',
};

const FIELD_LABELS: Record<string, string> = {
  date: 'Date',
  hours: 'Hours',
  totalHours: 'Total Hours',
  description: 'Description',
  projectTaskNumber: 'Project Task',
  clientName: 'Client',
  inTime1: 'Clock In (AM)',
  outTime1: 'Clock Out (AM)',
  inTime2: 'Clock In (PM)',
  outTime2: 'Clock Out (PM)',
  transactionType: 'Transaction Type',
  projectName: 'Project',
  status: 'Status',
  submittedAt: 'Submitted At',
  comments: 'Comments',
  payPeriodId: 'Pay Period',
  reason: 'Reason',
};

function formatFieldValue(value: unknown): string {
  if (value === null || value === undefined) return '(empty)';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function getFieldLabel(field: string): string {
  return FIELD_LABELS[field] ?? field;
}

function FieldComparison({
  field,
  serverValue,
  localValue,
  isConflicting,
}: {
  field: string;
  serverValue: unknown;
  localValue: unknown;
  isConflicting: boolean;
}) {
  return (
    <View
      className={`mb-sm rounded-md p-sm ${isConflicting ? 'bg-warning/10 border border-warning/30' : 'bg-gray-50'}`}
      accessibilityLabel={`${getFieldLabel(field)}: Server has ${formatFieldValue(serverValue)}, your version has ${formatFieldValue(localValue)}${isConflicting ? ', values differ' : ''}`}
    >
      <Text className="text-body-small font-medium text-gray-700 mb-xs">
        {getFieldLabel(field)}
        {isConflicting && (
          <Text className="text-warning"> (differs)</Text>
        )}
      </Text>
      <View className="flex-row gap-sm">
        <View className="flex-1">
          <Text className="text-caption text-gray-500 mb-1">Server</Text>
          <Text className={`text-body-small ${isConflicting ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
            {formatFieldValue(serverValue)}
          </Text>
        </View>
        <View className="w-px bg-gray-200" />
        <View className="flex-1">
          <Text className="text-caption text-gray-500 mb-1">Yours</Text>
          <Text className={`text-body-small ${isConflicting ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
            {formatFieldValue(localValue)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function ConflictResolutionModal({
  visible,
  conflict,
  onResolve,
  onCancel,
}: ConflictResolutionModalProps) {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!conflict) return null;

  const allFields = new Set([
    ...Object.keys(conflict.serverData),
    ...Object.keys(conflict.localData),
  ]);
  const conflictingSet = new Set(conflict.conflictingFields);

  // Show conflicting fields first, then non-conflicting
  const sortedFields = [...allFields].sort((a, b) => {
    const aConflict = conflictingSet.has(a) ? 0 : 1;
    const bConflict = conflictingSet.has(b) ? 0 : 1;
    return aConflict - bConflict;
  });

  const handleResolve = async (resolution: 'SERVER' | 'LOCAL') => {
    setIsLoading(true);
    setError(null);
    try {
      await onResolve(resolution);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to resolve conflict. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isIOS = Platform.OS === 'ios';

  return (
    <Modal
      visible={visible}
      animationType={isIOS ? 'slide' : 'fade'}
      presentationStyle={isIOS ? 'pageSheet' : 'overFullScreen'}
      transparent={!isIOS}
      onRequestClose={onCancel}
      accessibilityViewIsModal
    >
      <View
        className={`flex-1 ${isIOS ? '' : 'bg-black/50 justify-end'}`}
        style={isIOS ? undefined : undefined}
      >
        <View
          className={`bg-white ${isIOS ? 'flex-1' : 'rounded-t-2xl max-h-[85%]'}`}
          style={{ paddingBottom: insets.bottom }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-lg pt-lg pb-md border-b border-gray-200">
            <View className="flex-1">
              <Text
                className="text-h3 font-semibold text-gray-800"
                accessibilityRole="header"
              >
                Sync Conflict
              </Text>
              <Text className="text-body-small text-gray-500 mt-xs">
                {ENTITY_TYPE_LABELS[conflict.entityType]}
                {conflict.conflictingFields.length > 0 && (
                  <Text>
                    {' '}
                    &middot; {conflict.conflictingFields.length} field
                    {conflict.conflictingFields.length !== 1 ? 's' : ''} differ
                  </Text>
                )}
              </Text>
            </View>
            <Button
              variant="secondary"
              onPress={onCancel}
              disabled={isLoading}
              className="w-10 h-10 p-0 rounded-full items-center justify-center"
              accessibilityLabel="Close conflict resolution"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={20} color="#374151" />
            </Button>
          </View>

          {/* Conflict details */}
          {conflict.details && (
            <View className="mx-lg mt-md">
              <Card className="bg-warning/5 border border-warning/20">
                <View className="flex-row items-start">
                  <Ionicons
                    name="alert-circle"
                    size={18}
                    color="#F59E0B"
                    style={{ marginRight: 8, marginTop: 2 }}
                  />
                  <Text className="text-body-small text-gray-700 flex-1">
                    {conflict.details}
                  </Text>
                </View>
              </Card>
            </View>
          )}

          {/* Field comparison */}
          <ScrollView
            className="flex-1 px-lg pt-md"
            contentContainerStyle={{ paddingBottom: 16 }}
            accessibilityLabel="Field comparison list"
          >
            {sortedFields.map((field) => (
              <FieldComparison
                key={field}
                field={field}
                serverValue={conflict.serverData[field]}
                localValue={conflict.localData[field]}
                isConflicting={conflictingSet.has(field)}
              />
            ))}
          </ScrollView>

          {/* Error message */}
          {error && (
            <View className="mx-lg mb-sm">
              <Card className="bg-error/5 border border-error/20">
                <View className="flex-row items-center">
                  <Ionicons
                    name="alert-circle"
                    size={16}
                    color="#EF4444"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-body-small text-error flex-1">{error}</Text>
                </View>
              </Card>
            </View>
          )}

          {/* Action buttons */}
          <View className="px-lg pt-sm pb-md border-t border-gray-200">
            <View className="flex-row gap-sm">
              <View className="flex-1">
                <Button
                  variant="outline"
                  onPress={() => handleResolve('SERVER')}
                  disabled={isLoading}
                  accessibilityLabel="Keep server version"
                  accessibilityRole="button"
                  accessibilityHint="Discards your local changes and keeps the server version"
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#2563EB" />
                  ) : (
                    <Text className="text-button text-primary text-center">Keep Server</Text>
                  )}
                </Button>
              </View>
              <View className="flex-1">
                <Button
                  variant="primary"
                  onPress={() => handleResolve('LOCAL')}
                  disabled={isLoading}
                  accessibilityLabel="Keep your version"
                  accessibilityRole="button"
                  accessibilityHint="Overwrites the server version with your local changes"
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-button text-white text-center">Keep Mine</Text>
                  )}
                </Button>
              </View>
            </View>
            <Button
              variant="secondary"
              onPress={onCancel}
              disabled={isLoading}
              className="mt-sm"
              accessibilityLabel="Cancel and decide later"
              accessibilityRole="button"
            >
              Decide Later
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
