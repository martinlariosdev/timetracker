import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SyncService } from './sync.service';
import {
  SyncLogObjectType,
  CreateSyncLogInput,
  SyncFilterInput,
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
    @Args('filters', { nullable: true }) filters?: SyncFilterInput,
    @CurrentUser() user: Consultant,
  ): Promise<SyncLogObjectType[]> {
    return this.syncService.getSyncLogs(user.id, undefined, filters);
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
}
