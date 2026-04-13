import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSyncLogInput, SyncFilterInput, SyncLogObjectType } from './dto';

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

      return syncLog;
    } catch (error) {
      this.logger.error(`Failed to create sync log: ${error.message}`);
      throw new BadRequestException('Failed to create sync log');
    }
  }

  /**
   * Get sync logs for a user
   * Supports optional filtering by device and various filters
   * @param userId - ID of the user
   * @param deviceId - Optional device ID filter
   * @param filters - Optional filters (entityType, operation, onlyFailed)
   * @returns Array of sync logs ordered by syncedAt desc
   */
  async getSyncLogs(
    userId: string,
    deviceId?: string,
    filters?: SyncFilterInput,
  ): Promise<SyncLogObjectType[]> {
    // Validate required fields
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const where: any = { userId };

    // Add deviceId filter if provided
    if (deviceId) {
      where.deviceId = deviceId;
    }

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

      return syncLogs;
    } catch (error) {
      this.logger.error(`Failed to get sync logs: ${error.message}`);
      throw new BadRequestException('Failed to retrieve sync logs');
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

    const where: any = {
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

      return syncLogs;
    } catch (error) {
      this.logger.error(`Failed to get failed sync logs: ${error.message}`);
      throw new BadRequestException('Failed to retrieve failed sync logs');
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

      return syncLogs;
    } catch (error) {
      this.logger.error(`Failed to get sync logs by entity: ${error.message}`);
      throw new BadRequestException('Failed to retrieve sync logs for entity');
    }
  }
}
