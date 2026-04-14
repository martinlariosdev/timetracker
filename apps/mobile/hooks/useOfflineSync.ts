import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthenticatedMutation } from './useAuthenticatedMutation';
import { useOfflineStatus } from './useOfflineStatus';
import { useOfflineQueue } from './useOfflineQueue';
import { OfflineQueue, QueueItem, QueueItemType } from '../lib/offline-queue';
import { getDeviceId } from '../lib/device';
import {
  SYNC_TIME_ENTRIES_MUTATION,
  SYNC_ETO_TRANSACTIONS_MUTATION,
  SYNC_TIMESHEET_SUBMISSIONS_MUTATION,
} from '../lib/graphql/mutations';

/** Error from a sync operation */
export interface SyncError {
  entityId: string;
  entityType: string;
  operation: string;
  error: string;
}

/** Raw conflict info returned from a batch sync mutation */
export interface RawSyncConflict {
  hasConflict: boolean;
  serverVersion?: Record<string, any> | null;
  clientVersion?: Record<string, any> | null;
  serverUpdatedAt?: string | null;
  clientLastSyncedAt?: string | null;
  conflictDetails?: string | null;
}

/** Enriched conflict with entity context for UI display */
export interface SyncConflict {
  id: string;
  entityType: 'TimeEntry' | 'ETOTransaction' | 'TimesheetSubmission';
  entityId: string;
  serverData: Record<string, any>;
  localData: Record<string, any>;
  conflictingFields: string[];
  timestamp: Date;
  details?: string | null;
}

/** Result from a batch sync mutation */
interface SyncResult {
  successful: number;
  failed: number;
  conflicts: RawSyncConflict[];
  errors: SyncError[];
}

/** State returned by useOfflineSync */
export interface OfflineSyncState {
  isSyncing: boolean;
  queueSize: number;
  lastSyncedAt: Date | null;
  syncErrors: SyncError[];
  syncConflicts: SyncConflict[];
  clearConflict: (conflictId: string) => void;
  triggerSync: () => Promise<void>;
}

const DEBOUNCE_MS = 2000;

/** Derive which fields differ between two data objects */
function getConflictingFields(
  serverData: Record<string, any>,
  clientData: Record<string, any>,
): string[] {
  const allKeys = new Set([...Object.keys(serverData), ...Object.keys(clientData)]);
  const diffFields: string[] = [];
  for (const key of allKeys) {
    if (JSON.stringify(serverData[key]) !== JSON.stringify(clientData[key])) {
      diffFields.push(key);
    }
  }
  return diffFields;
}

/** Build enriched SyncConflict entries from raw conflicts and the queue items that triggered them */
function enrichConflicts(
  rawConflicts: RawSyncConflict[],
  queueItems: QueueItem[],
  entityType: 'TimeEntry' | 'ETOTransaction' | 'TimesheetSubmission',
): SyncConflict[] {
  const enriched: SyncConflict[] = [];
  // Match conflicts to queue items by index (backend returns one conflict per input entry)
  for (let i = 0; i < rawConflicts.length; i++) {
    const raw = rawConflicts[i];
    if (!raw.hasConflict) continue;

    const queueItem = queueItems[i];
    if (!queueItem) {
      console.warn(`[enrichConflicts] No queue item at index ${i} for conflict, skipping`);
      continue;
    }
    const serverData = raw.serverVersion ?? {};
    const localData = raw.clientVersion ?? queueItem.data ?? {};
    enriched.push({
      id: queueItem.id,
      entityType,
      entityId: queueItem.entityId ?? '',
      serverData,
      localData,
      conflictingFields: getConflictingFields(serverData, localData),
      timestamp: new Date(),
      details: raw.conflictDetails,
    });
  }
  return enriched;
}

function groupByType(items: QueueItem[]): Map<QueueItemType, QueueItem[]> {
  const groups = new Map<QueueItemType, QueueItem[]>();
  for (const item of items) {
    const list = groups.get(item.type) || [];
    list.push(item);
    groups.set(item.type, list);
  }
  return groups;
}

function transformTimeEntry(item: QueueItem) {
  return {
    id: item.entityId,
    date: item.data.date,
    projectTaskNumber: item.data.projectTaskNumber,
    clientName: item.data.clientName,
    description: item.data.description,
    inTime1: item.data.inTime1,
    outTime1: item.data.outTime1,
    inTime2: item.data.inTime2,
    outTime2: item.data.outTime2,
    totalHours: item.data.totalHours,
    operation: item.operation,
    lastSyncedAt: item.data.lastSyncedAt,
    resolution: 'SERVER_WINS',
    payPeriodId: item.data.payPeriodId,
  };
}

function transformETOTransaction(item: QueueItem) {
  return {
    id: item.entityId,
    date: item.data.date,
    hours: item.data.hours,
    transactionType: item.data.transactionType,
    description: item.data.description,
    projectName: item.data.projectName,
    operation: item.operation,
    lastSyncedAt: item.data.lastSyncedAt,
    resolution: 'SERVER_WINS',
  };
}

function transformTimesheetSubmission(item: QueueItem) {
  return {
    id: item.entityId,
    payPeriodId: item.data.payPeriodId,
    status: item.data.status,
    submittedAt: item.data.submittedAt,
    comments: item.data.comments,
    operation: item.operation,
    lastSyncedAt: item.data.lastSyncedAt,
    resolution: 'SERVER_WINS',
  };
}

/**
 * Hook for automatic background sync of offline-queued operations.
 *
 * Monitors network status and triggers sync when connectivity is restored.
 * Groups queued operations by entity type and calls the corresponding
 * batch sync mutation for each group.
 */
export function useOfflineSync(): OfflineSyncState {
  const { isOnline } = useOfflineStatus();
  const { size: queueSize, refresh: refreshQueue } = useOfflineQueue();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncErrors, setSyncErrors] = useState<SyncError[]>([]);
  const [syncConflicts, setSyncConflicts] = useState<SyncConflict[]>([]);

  const clearConflict = useCallback((conflictId: string) => {
    setSyncConflicts((prev) => prev.filter((c) => c.id !== conflictId));
  }, []);

  const wasOnlineRef = useRef(isOnline);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [syncTimeEntries] = useAuthenticatedMutation<{ syncTimeEntries: SyncResult }>(SYNC_TIME_ENTRIES_MUTATION);
  const [syncETOTransactions] = useAuthenticatedMutation<{ syncETOTransactions: SyncResult }>(SYNC_ETO_TRANSACTIONS_MUTATION);
  const [syncTimesheetSubmissions] = useAuthenticatedMutation<{ syncTimesheetSubmissions: SyncResult }>(SYNC_TIMESHEET_SUBMISSIONS_MUTATION);

  const triggerSync = useCallback(async () => {
    if (isSyncing) return;

    const items = await OfflineQueue.getAll();
    if (items.length === 0) {
      console.log('[useOfflineSync] Queue empty, nothing to sync');
      return;
    }

    setIsSyncing(true);
    const errors: SyncError[] = [];
    const conflicts: SyncConflict[] = [];

    try {
      const deviceId = await getDeviceId();
      const grouped = groupByType(items);

      // Sync time entries
      const timeEntries = grouped.get('TimeEntry');
      if (timeEntries && timeEntries.length > 0) {
        console.log(`[useOfflineSync] Syncing ${timeEntries.length} time entries`);
        try {
          const { data } = await syncTimeEntries({
            variables: {
              entries: timeEntries.map(transformTimeEntry),
              deviceId,
            },
          });
          const result = data?.syncTimeEntries;
          if (!result) {
            console.error('[useOfflineSync] No data returned for time entries sync');
          } else {
            console.log(`[useOfflineSync] Time entries: ${result.successful} synced, ${result.failed} failed`);

            if (result.errors.length > 0) {
              errors.push(...result.errors);
            }

            if (result.conflicts.length > 0) {
              conflicts.push(...enrichConflicts(result.conflicts, timeEntries, 'TimeEntry'));
            }

            // Remove successfully synced items
            const errorEntityIds = new Set(result.errors.map((e: SyncError) => e.entityId));
            const successIds = timeEntries
              .filter((item) => !errorEntityIds.has(item.entityId ?? item.id))
              .map((item) => item.id);
            if (successIds.length > 0) {
              await OfflineQueue.removeByIds(successIds);
            }

            // Update retry count for failed items
            for (const item of timeEntries) {
              if (errorEntityIds.has(item.entityId ?? item.id)) {
                await OfflineQueue.updateById(item.id, {
                  retryCount: item.retryCount + 1,
                  lastError: result.errors.find(
                    (e: SyncError) => e.entityId === (item.entityId ?? item.id)
                  )?.error,
                });
              }
            }
          }
        } catch (err) {
          console.error('[useOfflineSync] Failed to sync time entries:', err);
          // Network error - leave in queue for next sync attempt
        }
      }

      // Sync ETO transactions
      const etoTransactions = grouped.get('ETOTransaction');
      if (etoTransactions && etoTransactions.length > 0) {
        console.log(`[useOfflineSync] Syncing ${etoTransactions.length} ETO transactions`);
        try {
          const { data } = await syncETOTransactions({
            variables: {
              transactions: etoTransactions.map(transformETOTransaction),
              deviceId,
            },
          });
          const result = data?.syncETOTransactions;
          if (!result) {
            console.error('[useOfflineSync] No data returned for ETO transactions sync');
          } else {
            console.log(`[useOfflineSync] ETO transactions: ${result.successful} synced, ${result.failed} failed`);

            if (result.errors.length > 0) {
              errors.push(...result.errors);
            }

            if (result.conflicts.length > 0) {
              conflicts.push(...enrichConflicts(result.conflicts, etoTransactions, 'ETOTransaction'));
            }

            const errorEntityIds = new Set(result.errors.map((e: SyncError) => e.entityId));
            const successIds = etoTransactions
              .filter((item) => !errorEntityIds.has(item.entityId ?? item.id))
              .map((item) => item.id);
            if (successIds.length > 0) {
              await OfflineQueue.removeByIds(successIds);
            }

            for (const item of etoTransactions) {
              if (errorEntityIds.has(item.entityId ?? item.id)) {
                await OfflineQueue.updateById(item.id, {
                  retryCount: item.retryCount + 1,
                  lastError: result.errors.find(
                    (e: SyncError) => e.entityId === (item.entityId ?? item.id)
                  )?.error,
                });
              }
            }
          }
        } catch (err) {
          console.error('[useOfflineSync] Failed to sync ETO transactions:', err);
        }
      }

      // Sync timesheet submissions
      const timesheetSubmissions = grouped.get('TimesheetSubmission');
      if (timesheetSubmissions && timesheetSubmissions.length > 0) {
        console.log(`[useOfflineSync] Syncing ${timesheetSubmissions.length} timesheet submissions`);
        try {
          const { data } = await syncTimesheetSubmissions({
            variables: {
              submissions: timesheetSubmissions.map(transformTimesheetSubmission),
              deviceId,
            },
          });
          const result = data?.syncTimesheetSubmissions;
          if (!result) {
            console.error('[useOfflineSync] No data returned for timesheet submissions sync');
          } else {
            console.log(`[useOfflineSync] Timesheet submissions: ${result.successful} synced, ${result.failed} failed`);

            if (result.errors.length > 0) {
              errors.push(...result.errors);
            }

            if (result.conflicts.length > 0) {
              conflicts.push(...enrichConflicts(result.conflicts, timesheetSubmissions, 'TimesheetSubmission'));
            }

            const errorEntityIds = new Set(result.errors.map((e: SyncError) => e.entityId));
            const successIds = timesheetSubmissions
              .filter((item) => !errorEntityIds.has(item.entityId ?? item.id))
              .map((item) => item.id);
            if (successIds.length > 0) {
              await OfflineQueue.removeByIds(successIds);
            }

            for (const item of timesheetSubmissions) {
              if (errorEntityIds.has(item.entityId ?? item.id)) {
                await OfflineQueue.updateById(item.id, {
                  retryCount: item.retryCount + 1,
                  lastError: result.errors.find(
                    (e: SyncError) => e.entityId === (item.entityId ?? item.id)
                  )?.error,
                });
              }
            }
          }
        } catch (err) {
          console.error('[useOfflineSync] Failed to sync timesheet submissions:', err);
        }
      }

      setSyncErrors(errors);
      setSyncConflicts((prev) => [...prev, ...conflicts]);
      setLastSyncedAt(new Date());
      await refreshQueue();
      console.log(`[useOfflineSync] Sync complete, ${conflicts.length} conflicts detected`);
    } catch (err) {
      console.error('[useOfflineSync] Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, syncTimeEntries, syncETOTransactions, syncTimesheetSubmissions, refreshQueue]);

  // Auto-sync when transitioning from offline to online
  useEffect(() => {
    const wasOnline = wasOnlineRef.current;
    wasOnlineRef.current = isOnline;

    // Only trigger on offline -> online transition
    if (!wasOnline && isOnline) {
      console.log('[useOfflineSync] Network restored, scheduling sync');

      // Debounce to avoid rapid-fire syncs if network flaps
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        triggerSync();
        debounceTimerRef.current = null;
      }, DEBOUNCE_MS);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [isOnline, triggerSync]);

  return {
    isSyncing,
    queueSize,
    lastSyncedAt,
    syncErrors,
    syncConflicts,
    clearConflict,
    triggerSync,
  };
}
