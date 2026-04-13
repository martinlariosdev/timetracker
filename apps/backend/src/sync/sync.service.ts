import { Injectable, Logger, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSyncLogInput,
  SyncFilterInput,
  SyncLogObjectType,
  ConflictInfo,
  ResolveConflictInput,
  ResolvedConflict,
  ConflictResolutionStrategy,
  SyncEntityType,
} from './dto';
import { Prisma } from '../generated';

const DEFAULT_SYNC_LOG_LIMIT = 100;

/**
 * SyncService
 * Handles business logic for offline sync queue management
 * Manages sync log creation, retrieval, and filtering
 */
@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a sync log entry
   * Records a sync operation performed by a mobile device
   * @param userId - ID of the user performing the sync
   * @param data - Sync operation details (device, entity, operation, etc.)
   * @returns Created sync log entry
   */
  async createSyncLog(userId: string, data: CreateSyncLogInput): Promise<SyncLogObjectType> {
    // Validate required fields
    if (!userId || !data.deviceId || !data.entityType || !data.operation || !data.entityId) {
      throw new BadRequestException('Missing required fields for sync log');
    }

    const { deviceId, entityType, operation, entityId, success, error } = data;
    const successValue = success ?? true; // Default to true if not provided

    try {
      const syncLog = await this.prisma.syncLog.create({
        data: {
          userId,
          deviceId,
          entityType,
          operation,
          entityId,
          success: successValue,
          error,
        },
      });

      this.logger.log(
        `Sync log created: ${operation} ${entityType} ${entityId} for user ${userId} on device ${deviceId} - ${successValue ? 'SUCCESS' : 'FAILED'}`,
      );

      return syncLog as SyncLogObjectType;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to create sync log: ${message}`);
      throw new InternalServerErrorException('Failed to create sync log');
    }
  }

  /**
   * Get sync logs for a user
   * Supports optional filtering by device and various filters
   * @param userId - ID of the user
   * @param filters - Optional filters (deviceId, entityType, operation, onlyFailed)
   * @returns Array of sync logs ordered by syncedAt desc
   */
  async getSyncLogs(
    userId: string,
    filters?: SyncFilterInput,
  ): Promise<SyncLogObjectType[]> {
    // Validate required fields
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const where: Prisma.SyncLogWhereInput = { userId };

    // Apply additional filters if provided
    if (filters) {
      if (filters.deviceId) {
        where.deviceId = filters.deviceId;
      }
      if (filters.entityType) {
        where.entityType = filters.entityType;
      }
      if (filters.operation) {
        where.operation = filters.operation;
      }
      if (filters.onlyFailed) {
        where.success = false;
      }
    }

    try {
      const syncLogs = await this.prisma.syncLog.findMany({
        where,
        orderBy: { syncedAt: 'desc' },
        take: DEFAULT_SYNC_LOG_LIMIT,
      });

      return syncLogs as SyncLogObjectType[];
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to get sync logs: ${message}`);
      throw new InternalServerErrorException('Failed to retrieve sync logs');
    }
  }

  /**
   * Get failed sync logs for a user
   * Used for identifying operations that need to be retried
   * @param userId - ID of the user
   * @param deviceId - Optional device ID filter
   * @returns Array of failed sync logs ordered by syncedAt desc
   */
  async getFailedSyncLogs(userId: string, deviceId?: string): Promise<SyncLogObjectType[]> {
    // Validate required fields
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const where: Prisma.SyncLogWhereInput = {
      userId,
      success: false,
    };

    if (deviceId) {
      where.deviceId = deviceId;
    }

    try {
      const syncLogs = await this.prisma.syncLog.findMany({
        where,
        orderBy: { syncedAt: 'desc' },
        take: DEFAULT_SYNC_LOG_LIMIT,
      });

      this.logger.log(`Found ${syncLogs.length} failed sync logs for user ${userId}`);

      return syncLogs as SyncLogObjectType[];
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to get failed sync logs: ${message}`);
      throw new InternalServerErrorException('Failed to retrieve failed sync logs');
    }
  }

  /**
   * Get sync logs for a specific entity
   * Used for conflict detection - check if entity was modified on server while offline
   * @param userId - ID of the user
   * @param entityType - Type of entity (TimeEntry, ETOTransaction, etc.)
   * @param entityId - ID of the specific entity
   * @returns Array of sync logs for the entity ordered by syncedAt desc
   */
  async getSyncLogsByEntity(
    userId: string,
    entityType: string,
    entityId: string,
  ): Promise<SyncLogObjectType[]> {
    // Validate required fields
    if (!userId || !entityType || !entityId) {
      throw new BadRequestException('User ID, entity type, and entity ID are required');
    }

    try {
      const syncLogs = await this.prisma.syncLog.findMany({
        where: {
          userId,
          entityType,
          entityId,
        },
        orderBy: { syncedAt: 'desc' },
      });

      return syncLogs as SyncLogObjectType[];
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to get sync logs by entity: ${message}`);
      throw new InternalServerErrorException('Failed to retrieve sync logs for entity');
    }
  }

  /**
   * Detect if a conflict exists for an entity
   * Compares server's updatedAt/createdAt with client's lastSyncedAt
   * @param userId - ID of the user
   * @param entityType - Type of entity to check
   * @param entityId - ID of the entity to check
   * @param lastSyncedAt - Client's last sync timestamp
   * @returns ConflictInfo with details if conflict detected, null otherwise
   */
  async detectConflict(
    userId: string,
    entityType: SyncEntityType,
    entityId: string,
    lastSyncedAt: Date,
  ): Promise<ConflictInfo> {
    // Validate required fields
    if (!userId || !entityType || !entityId || !lastSyncedAt) {
      throw new BadRequestException('All fields are required for conflict detection');
    }

    try {
      // Fetch the entity from the database based on type
      const serverEntity = await this.getEntityByType(userId, entityType, entityId);

      if (!serverEntity) {
        throw new NotFoundException(`${entityType} with ID ${entityId} not found`);
      }

      // Check if entity was modified after client's last sync
      const hasConflict = this.checkConflictByEntityType(
        entityType,
        serverEntity,
        lastSyncedAt,
      );

      if (!hasConflict) {
        return {
          hasConflict: false,
          serverVersion: null,
          clientVersion: null,
          serverUpdatedAt: null,
          clientLastSyncedAt: null,
          conflictDetails: null,
        };
      }

      // Get the relevant timestamp for the entity
      const serverTimestamp = this.getEntityTimestamp(entityType, serverEntity);

      this.logger.warn(
        `Conflict detected for ${entityType} ${entityId}: server updated at ${serverTimestamp?.toISOString()}, client last synced at ${lastSyncedAt.toISOString()}`,
      );

      return {
        hasConflict: true,
        serverVersion: serverEntity,
        clientVersion: null, // Client version not available in this check
        serverUpdatedAt: serverTimestamp,
        clientLastSyncedAt: lastSyncedAt,
        conflictDetails: `Server data was modified after client's last sync (server: ${serverTimestamp?.toISOString()}, client: ${lastSyncedAt.toISOString()})`,
      };
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof BadRequestException) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to detect conflict: ${message}`);
      throw new InternalServerErrorException('Failed to detect conflict');
    }
  }

  /**
   * Resolve a conflict using the specified strategy
   * @param userId - ID of the user
   * @param resolution - Conflict resolution input
   * @returns ResolvedConflict with the final data
   */
  async resolveConflict(
    userId: string,
    resolution: ResolveConflictInput,
  ): Promise<ResolvedConflict> {
    const { entityType, entityId, strategy, clientData, serverData } = resolution;

    // Validate required fields
    if (!userId || !entityType || !entityId || !strategy) {
      throw new BadRequestException('User ID, entity type, entity ID, and strategy are required');
    }

    try {
      // Fetch server data if not provided
      const serverEntity = serverData || await this.getEntityByType(userId, entityType, entityId);

      if (!serverEntity) {
        throw new NotFoundException(`${entityType} with ID ${entityId} not found`);
      }

      let finalData: Record<string, any>;
      let message: string;

      switch (strategy) {
        case ConflictResolutionStrategy.SERVER_WINS:
          finalData = serverEntity;
          message = 'Server data preserved, client changes discarded';
          this.logger.log(
            `Conflict resolved with SERVER_WINS for ${entityType} ${entityId} by user ${userId}`,
          );
          break;

        case ConflictResolutionStrategy.CLIENT_WINS:
          if (!clientData) {
            throw new BadRequestException('Client data is required for CLIENT_WINS strategy');
          }
          // Update the entity with client data
          finalData = await this.updateEntityByType(userId, entityType, entityId, clientData);
          message = 'Client data applied, server changes overwritten';
          this.logger.log(
            `Conflict resolved with CLIENT_WINS for ${entityType} ${entityId} by user ${userId}`,
          );
          break;

        case ConflictResolutionStrategy.MANUAL_MERGE:
          // Return both versions for UI to handle
          finalData = {
            serverVersion: serverEntity,
            clientVersion: clientData || null,
          };
          message = 'Manual merge required - both versions returned for client handling';
          this.logger.log(
            `Conflict flagged for MANUAL_MERGE for ${entityType} ${entityId} by user ${userId}`,
          );
          break;

        default:
          throw new BadRequestException(`Unknown conflict resolution strategy: ${strategy}`);
      }

      // Log the conflict resolution
      this.logger.log(
        `Conflict resolution logged: ${strategy} for ${entityType} ${entityId} by user ${userId}`,
      );

      return {
        success: true,
        finalData,
        strategy,
        message,
      };
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to resolve conflict: ${message}`);
      throw new InternalServerErrorException('Failed to resolve conflict');
    }
  }

  /**
   * Get entity by type and ID
   * Helper method to fetch entities from different tables
   * @private
   */
  private async getEntityByType(
    userId: string,
    entityType: SyncEntityType,
    entityId: string,
  ): Promise<Record<string, any> | null> {
    switch (entityType) {
      case SyncEntityType.TIME_ENTRY:
        return await this.prisma.timeEntry.findFirst({
          where: { id: entityId, consultantId: userId },
        });

      case SyncEntityType.ETO_TRANSACTION:
        return await this.prisma.eTOTransaction.findFirst({
          where: { id: entityId, consultantId: userId },
        });

      case SyncEntityType.CONSULTANT:
        return await this.prisma.consultant.findUnique({
          where: { id: entityId },
        });

      case SyncEntityType.TIMESHEET_SUBMISSION:
        return await this.prisma.timesheetSubmission.findFirst({
          where: { id: entityId, consultantId: userId },
        });

      default:
        throw new BadRequestException(`Unknown entity type: ${entityType}`);
    }
  }

  /**
   * Check if conflict exists based on entity type
   * @private
   */
  private checkConflictByEntityType(
    entityType: SyncEntityType,
    serverEntity: any,
    lastSyncedAt: Date,
  ): boolean {
    switch (entityType) {
      case SyncEntityType.TIME_ENTRY:
        return serverEntity.updatedAt > lastSyncedAt;

      case SyncEntityType.ETO_TRANSACTION:
        // ETOTransaction doesn't have updatedAt, use createdAt
        return serverEntity.createdAt > lastSyncedAt;

      case SyncEntityType.CONSULTANT:
        return serverEntity.updatedAt > lastSyncedAt;

      case SyncEntityType.TIMESHEET_SUBMISSION:
        return serverEntity.updatedAt > lastSyncedAt;

      default:
        return false;
    }
  }

  /**
   * Get the relevant timestamp for an entity
   * @private
   */
  private getEntityTimestamp(
    entityType: SyncEntityType,
    serverEntity: any,
  ): Date | null {
    switch (entityType) {
      case SyncEntityType.TIME_ENTRY:
      case SyncEntityType.CONSULTANT:
      case SyncEntityType.TIMESHEET_SUBMISSION:
        return serverEntity.updatedAt;

      case SyncEntityType.ETO_TRANSACTION:
        return serverEntity.createdAt;

      default:
        return null;
    }
  }

  /**
   * Update entity by type with client data
   * @private
   */
  private async updateEntityByType(
    userId: string,
    entityType: SyncEntityType,
    entityId: string,
    clientData: Record<string, any>,
  ): Promise<Record<string, any>> {
    // Remove fields that shouldn't be updated
    const { id, createdAt, updatedAt, consultantId, ...updateData } = clientData;

    switch (entityType) {
      case SyncEntityType.TIME_ENTRY:
        return await this.prisma.timeEntry.update({
          where: { id: entityId },
          data: updateData as Prisma.TimeEntryUpdateInput,
        });

      case SyncEntityType.ETO_TRANSACTION:
        return await this.prisma.eTOTransaction.update({
          where: { id: entityId },
          data: updateData as Prisma.ETOTransactionUpdateInput,
        });

      case SyncEntityType.CONSULTANT:
        return await this.prisma.consultant.update({
          where: { id: entityId },
          data: updateData as Prisma.ConsultantUpdateInput,
        });

      case SyncEntityType.TIMESHEET_SUBMISSION:
        return await this.prisma.timesheetSubmission.update({
          where: { id: entityId },
          data: updateData as Prisma.TimesheetSubmissionUpdateInput,
        });

      default:
        throw new BadRequestException(`Unknown entity type: ${entityType}`);
    }
  }
}
