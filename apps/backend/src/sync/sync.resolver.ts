import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SyncService } from './sync.service';
import {
  SyncLogObjectType,
  CreateSyncLogInput,
  SyncFilterInput,
  ConflictInfo,
  ResolveConflictInput,
  ResolvedConflict,
  SyncEntityType,
  SyncTimeEntryInput,
  SyncETOTransactionInput,
  SyncTimesheetSubmissionInput,
  SyncResult,
} from './dto';
import type { Consultant } from '../generated';

/**
 * SyncResolver
 * Provides GraphQL API for offline sync queue operations
 * All operations are protected by JWT authentication
 * Users can only access their own sync logs
 */
@Resolver(() => SyncLogObjectType)
@UseGuards(JwtAuthGuard)
export class SyncResolver {
  constructor(private syncService: SyncService) {}

  /**
   * Record a sync operation
   * Creates a log entry for a sync operation performed by a mobile device
   * @param input - Sync operation details (device, entity, operation, success, error)
   * @param user - Current authenticated user
   * @returns Created sync log entry
   */
  @Mutation(() => SyncLogObjectType, { description: 'Record a sync operation from a mobile device' })
  async logSync(
    @Args('input') input: CreateSyncLogInput,
    @CurrentUser() user: Consultant,
  ): Promise<SyncLogObjectType> {
    return this.syncService.createSyncLog(user.id, input);
  }

  /**
   * Query sync logs for current user
   * Supports filtering by device, entity type, operation, and success status
   * @param filters - Optional filters for querying sync logs
   * @param user - Current authenticated user
   * @returns Array of sync logs ordered by syncedAt desc
   */
  @Query(() => [SyncLogObjectType], { description: 'Get sync logs for current user with optional filters' })
  async syncLogs(
    @CurrentUser() user: Consultant,
    @Args('filters', { nullable: true }) filters?: SyncFilterInput,
  ): Promise<SyncLogObjectType[]> {
    return this.syncService.getSyncLogs(user.id, filters);
  }

  /**
   * Query failed syncs for current user
   * Returns only sync operations that failed, useful for retry logic
   * @param user - Current authenticated user
   * @returns Array of failed sync logs ordered by syncedAt desc
   */
  @Query(() => [SyncLogObjectType], { description: 'Get failed syncs for current user/device' })
  async failedSyncs(
    @CurrentUser() user: Consultant,
  ): Promise<SyncLogObjectType[]> {
    return this.syncService.getFailedSyncLogs(user.id);
  }

  /**
   * Check for conflicts before syncing
   * Detects if entity was modified on server since client's last sync
   * @param entityType - Type of entity to check
   * @param entityId - ID of the entity to check
   * @param lastSyncedAt - Client's last sync timestamp
   * @param user - Current authenticated user
   * @returns ConflictInfo with details if conflict detected
   */
  @Query(() => ConflictInfo, { description: 'Check if an entity has conflicts before syncing' })
  async checkConflict(
    @Args('entityType', { type: () => SyncEntityType }) entityType: SyncEntityType,
    @Args('entityId') entityId: string,
    @Args('lastSyncedAt') lastSyncedAt: Date,
    @CurrentUser() user: Consultant,
  ): Promise<ConflictInfo> {
    return this.syncService.detectConflict(user.id, entityType, entityId, lastSyncedAt);
  }

  /**
   * Resolve a detected conflict
   * Applies the specified conflict resolution strategy
   * @param input - Conflict resolution input
   * @param user - Current authenticated user
   * @returns ResolvedConflict with final data after resolution
   */
  @Mutation(() => ResolvedConflict, { description: 'Resolve a detected conflict using a strategy' })
  async resolveConflict(
    @Args('input') input: ResolveConflictInput,
    @CurrentUser() user: Consultant,
  ): Promise<ResolvedConflict> {
    return this.syncService.resolveConflict(user.id, input);
  }

  /**
   * Batch sync time entries
   * Processes multiple time entries with conflict detection and resolution
   * @param entries - Array of time entries to sync
   * @param deviceId - Device ID for sync logging
   * @param user - Current authenticated user
   * @returns SyncResult with counts and any errors
   */
  @Mutation(() => SyncResult, { description: 'Batch sync time entries from mobile device' })
  async syncTimeEntries(
    @Args('entries', { type: () => [SyncTimeEntryInput] }) entries: SyncTimeEntryInput[],
    @Args('deviceId') deviceId: string,
    @CurrentUser() user: Consultant,
  ): Promise<SyncResult> {
    return this.syncService.syncTimeEntries(user.id, entries, deviceId);
  }

  /**
   * Batch sync ETO transactions
   * Processes multiple ETO transactions with conflict detection and resolution
   * @param transactions - Array of ETO transactions to sync
   * @param deviceId - Device ID for sync logging
   * @param user - Current authenticated user
   * @returns SyncResult with counts and any errors
   */
  @Mutation(() => SyncResult, { description: 'Batch sync ETO transactions from mobile device' })
  async syncETOTransactions(
    @Args('transactions', { type: () => [SyncETOTransactionInput] }) transactions: SyncETOTransactionInput[],
    @Args('deviceId') deviceId: string,
    @CurrentUser() user: Consultant,
  ): Promise<SyncResult> {
    return this.syncService.syncETOTransactions(user.id, transactions, deviceId);
  }

  /**
   * Batch sync timesheet submissions
   * Processes multiple timesheet submissions with conflict detection and resolution
   * @param submissions - Array of timesheet submissions to sync
   * @param deviceId - Device ID for sync logging
   * @param user - Current authenticated user
   * @returns SyncResult with counts and any errors
   */
  @Mutation(() => SyncResult, { description: 'Batch sync timesheet submissions from mobile device' })
  async syncTimesheetSubmissions(
    @Args('submissions', { type: () => [SyncTimesheetSubmissionInput] }) submissions: SyncTimesheetSubmissionInput[],
    @Args('deviceId') deviceId: string,
    @CurrentUser() user: Consultant,
  ): Promise<SyncResult> {
    return this.syncService.syncTimesheetSubmissions(user.id, submissions, deviceId);
  }
}
