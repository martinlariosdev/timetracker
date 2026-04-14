import { useState, useCallback } from 'react';
import { useAuthenticatedMutation } from './useAuthenticatedMutation';
import { RESOLVE_CONFLICT_MUTATION } from '../lib/graphql/mutations';
import { OfflineQueue } from '../lib/offline-queue';
import type { SyncConflict } from './useOfflineSync';

interface ResolvedConflictResult {
  resolveConflict: {
    success: boolean;
    finalData: Record<string, any>;
    strategy: string;
    message?: string | null;
  };
}

const ENTITY_TYPE_TO_SYNC_ENTITY: Record<SyncConflict['entityType'], string> = {
  TimeEntry: 'TIME_ENTRY',
  ETOTransaction: 'ETO_TRANSACTION',
  TimesheetSubmission: 'TIMESHEET_SUBMISSION',
};

export interface ConflictResolutionState {
  conflicts: SyncConflict[];
  currentConflict: SyncConflict | null;
  isResolving: boolean;
  showModal: boolean;
  resolveConflict: (conflictId: string, resolution: 'SERVER' | 'LOCAL') => Promise<void>;
  dismissConflict: () => void;
}

/**
 * Hook for managing conflict resolution flow.
 *
 * Accepts conflicts from useOfflineSync, presents them one at a time,
 * and calls the backend resolveConflict mutation to apply the chosen strategy.
 *
 * @param syncConflicts - Conflicts from useOfflineSync
 * @param clearConflict - Callback to remove a resolved conflict from useOfflineSync state
 */
export function useConflictResolution(
  syncConflicts: SyncConflict[],
  clearConflict: (conflictId: string) => void,
): ConflictResolutionState {
  const [isResolving, setIsResolving] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const [resolveConflictMutation] = useAuthenticatedMutation<ResolvedConflictResult>(
    RESOLVE_CONFLICT_MUTATION,
  );

  // Filter out dismissed conflicts to determine what to show
  const activeConflicts = syncConflicts.filter((c) => !dismissedIds.has(c.id));
  const currentConflict = activeConflicts.length > 0 ? activeConflicts[0] : null;
  const showModal = currentConflict !== null;

  const resolveConflict = useCallback(
    async (conflictId: string, resolution: 'SERVER' | 'LOCAL') => {
      const conflict = syncConflicts.find((c) => c.id === conflictId);
      if (!conflict) return;

      setIsResolving(true);
      try {
        const strategy = resolution === 'SERVER' ? 'SERVER_WINS' : 'CLIENT_WINS';

        const { data } = await resolveConflictMutation({
          variables: {
            input: {
              entityType: ENTITY_TYPE_TO_SYNC_ENTITY[conflict.entityType],
              entityId: conflict.entityId,
              strategy,
              clientData: resolution === 'LOCAL' ? conflict.localData : undefined,
              serverData: resolution === 'SERVER' ? conflict.serverData : undefined,
            },
          },
        });

        if (data?.resolveConflict.success) {
          // Remove the conflicting item from the offline queue
          await OfflineQueue.removeById(conflict.id);
          clearConflict(conflictId);
        }
      } catch (err) {
        console.error('[useConflictResolution] Failed to resolve conflict:', err);
        throw err;
      } finally {
        setIsResolving(false);
      }
    },
    [syncConflicts, resolveConflictMutation, clearConflict],
  );

  const dismissConflict = useCallback(() => {
    if (currentConflict) {
      setDismissedIds((prev) => new Set(prev).add(currentConflict.id));
    }
  }, [currentConflict]);

  return {
    conflicts: activeConflicts,
    currentConflict,
    isResolving,
    showModal,
    resolveConflict,
    dismissConflict,
  };
}
