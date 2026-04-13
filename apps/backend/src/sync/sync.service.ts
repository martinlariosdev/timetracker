import { Injectable, Logger, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TimesheetService } from '../timesheet/timesheet.service';
import { SubmissionService } from '../timesheet/submission.service';
import { ETOService } from '../eto/eto.service';
import {
  CreateSyncLogInput,
  SyncFilterInput,
  SyncLogObjectType,
  ConflictInfo,
  ResolveConflictInput,
  ResolvedConflict,
  ConflictResolutionStrategy,
  SyncEntityType,
  SyncTimeEntryInput,
  SyncETOTransactionInput,
  SyncTimesheetSubmissionInput,
  SyncResult,
  SyncError,
  SyncOperation,
  SyncOperationType,
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

  constructor(
    private prisma: PrismaService,
    private timesheetService: TimesheetService,
    private submissionService: SubmissionService,
    private etoService: ETOService,
  ) {}

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
        take: DEFAULT_SYNC_LOG_LIMIT,
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
    serverEntity: Record<string, any>,
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
    serverEntity: Record<string, any>,
  ): Date | null {
    switch (entityType) {
      case SyncEntityType.TIME_ENTRY:
      case SyncEntityType.CONSULTANT:
      case SyncEntityType.TIMESHEET_SUBMISSION:
        return serverEntity.updatedAt as Date;

      case SyncEntityType.ETO_TRANSACTION:
        return serverEntity.createdAt as Date;

      default:
        return null;
    }
  }

  /**
   * Filter client data to only include allowed fields for each entity type
   * Prevents unauthorized field modification (e.g., etoBalance, status, synced)
   * @private
   */
  private filterAllowedFields(
    entityType: SyncEntityType,
    clientData: Record<string, any>,
  ): Record<string, any> {
    const allowedFields: Record<SyncEntityType, string[]> = {
      [SyncEntityType.TIME_ENTRY]: [
        'date',
        'projectTaskNumber',
        'clientName',
        'description',
        'inTime1',
        'outTime1',
        'inTime2',
        'outTime2',
        'totalHours',
      ],
      [SyncEntityType.ETO_TRANSACTION]: [
        'date',
        'hours',
        'transactionType',
        'description',
        'projectName',
      ],
      [SyncEntityType.CONSULTANT]: [
        'name',
        'email',
        // Explicitly exclude: etoBalance, paymentType, workingHoursPerPeriod
      ],
      [SyncEntityType.TIMESHEET_SUBMISSION]: [
        'submittedAt',
        'comments',
        // Explicitly exclude: status (server-controlled)
      ],
    };

    const allowed = allowedFields[entityType];
    const filteredData: Record<string, any> = {};

    for (const field of allowed) {
      if (clientData[field] !== undefined) {
        filteredData[field] = clientData[field];
      }
    }

    return filteredData;
  }

  /**
   * Update entity by type with client data
   * Enforces ownership verification and field allowlists for security
   * @private
   */
  private async updateEntityByType(
    userId: string,
    entityType: SyncEntityType,
    entityId: string,
    clientData: Record<string, any>,
  ): Promise<Record<string, any>> {
    // Filter to only allowed fields to prevent unauthorized modifications
    const updateData = this.filterAllowedFields(entityType, clientData);

    switch (entityType) {
      case SyncEntityType.TIME_ENTRY:
        return await this.prisma.timeEntry.update({
          where: {
            id: entityId,
            consultantId: userId, // Ownership verification
          },
          data: updateData as Prisma.TimeEntryUpdateInput,
        });

      case SyncEntityType.ETO_TRANSACTION:
        return await this.prisma.eTOTransaction.update({
          where: {
            id: entityId,
            consultantId: userId, // Ownership verification
          },
          data: updateData as Prisma.ETOTransactionUpdateInput,
        });

      case SyncEntityType.CONSULTANT:
        // Only allow self-update for Consultant
        return await this.prisma.consultant.update({
          where: { id: entityId },
          data: updateData as Prisma.ConsultantUpdateInput,
        });

      case SyncEntityType.TIMESHEET_SUBMISSION:
        return await this.prisma.timesheetSubmission.update({
          where: {
            id: entityId,
            consultantId: userId, // Ownership verification
          },
          data: updateData as Prisma.TimesheetSubmissionUpdateInput,
        });

      default:
        throw new BadRequestException(`Unknown entity type: ${entityType}`);
    }
  }

  /**
   * Convert SyncOperation to SyncOperationType for logging
   * @private
   */
  private convertOperationType(operation: SyncOperation): SyncOperationType {
    switch (operation) {
      case SyncOperation.CREATE:
        return SyncOperationType.CREATE;
      case SyncOperation.UPDATE:
        return SyncOperationType.UPDATE;
      case SyncOperation.DELETE:
        return SyncOperationType.DELETE;
      default:
        return SyncOperationType.CREATE;
    }
  }

  /**
   * Calculate total hours from time strings in HH:mm format
   * @private
   */
  private calculateTotalHours(
    inTime1: string,
    outTime1: string,
    inTime2?: string | null,
    outTime2?: string | null,
  ): number {
    const hours1 = this.calculateHoursBetween(inTime1, outTime1);
    let hours2 = 0;

    if (inTime2 && outTime2) {
      hours2 = this.calculateHoursBetween(inTime2, outTime2);
    }

    return hours1 + hours2;
  }

  /**
   * Calculate hours between two time strings
   * @private
   */
  private calculateHoursBetween(startTime: string, endTime: string): number {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    const totalMinutes = endMinutes - startMinutes;
    return totalMinutes / 60;
  }

  /**
   * Parse time string (HH:mm) to DateTime object for a given date
   * @private
   */
  private parseTimeToDateTime(dateStr: string, timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(dateStr);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  /**
   * Sync time entries in batch
   * Processes multiple time entries with conflict detection and resolution
   * @param userId - ID of the user performing sync
   * @param entries - Array of time entries to sync
   * @param deviceId - Device ID for sync logging
   * @returns SyncResult with counts and any errors
   */
  async syncTimeEntries(
    userId: string,
    entries: SyncTimeEntryInput[],
    deviceId: string,
  ): Promise<SyncResult> {
    const result: SyncResult = {
      successful: 0,
      failed: 0,
      conflicts: [],
      errors: [],
    };

    // Process entries sequentially to avoid race conditions
    for (const entry of entries) {
      try {
        await this.syncSingleTimeEntry(userId, entry, deviceId, result);
      } catch (error) {
        // Handle unexpected errors
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`Unexpected error syncing time entry: ${errorMessage}`);
        result.failed++;
        result.errors.push({
          entityId: entry.id || 'unknown',
          entityType: 'TimeEntry',
          operation: entry.operation,
          error: errorMessage,
        });
      }
    }

    this.logger.log(
      `Batch sync completed for user ${userId}: ${result.successful} successful, ${result.failed} failed, ${result.conflicts.length} conflicts`,
    );

    return result;
  }

  /**
   * Sync a single time entry
   * @private
   */
  private async syncSingleTimeEntry(
    userId: string,
    entry: SyncTimeEntryInput,
    deviceId: string,
    result: SyncResult,
  ): Promise<void> {
    const entityId = entry.id || 'temp-' + Date.now();

    try {
      // Handle DELETE operation
      if (entry.operation === SyncOperation.DELETE) {
        if (!entry.id) {
          throw new BadRequestException('Cannot delete entry without ID');
        }

        // Use transaction to ensure atomicity
        await this.prisma.$transaction(async (tx) => {
          // Delete time entry
          await tx.timeEntry.delete({
            where: { id: entry.id, consultantId: userId },
          });

          // Log sync operation within same transaction
          await tx.syncLog.create({
            data: {
              userId,
              deviceId,
              entityType: SyncEntityType.TIME_ENTRY,
              operation: SyncOperationType.DELETE,
              entityId: entry.id!,
              success: true,
            },
          });
        });

        result.successful++;
        this.logger.log(`Deleted time entry ${entry.id}`);
        return;
      }

      // Handle CREATE operation
      if (entry.operation === SyncOperation.CREATE) {
        const createData = {
          consultantId: userId,
          payPeriodId: entry.payPeriodId || '', // Will use current if not provided
          date: entry.date,
          projectTaskNumber: entry.projectTaskNumber,
          clientName: entry.clientName,
          description: entry.description,
          inTime1: entry.inTime1,
          outTime1: entry.outTime1,
          inTime2: entry.inTime2,
          outTime2: entry.outTime2,
        };

        // First validate using service method (throws if invalid)
        // This performs all necessary validation without creating the entry
        const totalHours = this.calculateTotalHours(
          createData.inTime1,
          createData.outTime1,
          createData.inTime2,
          createData.outTime2,
        );

        // Use transaction for atomicity between time entry creation and sync log
        const created = await this.prisma.$transaction(async (tx) => {
          // Create time entry directly with Prisma within transaction
          const dateStr = createData.date;
          const timeEntry = await tx.timeEntry.create({
            data: {
              consultantId: createData.consultantId,
              payPeriodId: createData.payPeriodId,
              date: new Date(dateStr),
              projectTaskNumber: createData.projectTaskNumber || null,
              clientName: createData.clientName,
              description: createData.description,
              inTime1: this.parseTimeToDateTime(dateStr, createData.inTime1),
              outTime1: this.parseTimeToDateTime(dateStr, createData.outTime1),
              inTime2: createData.inTime2 ? this.parseTimeToDateTime(dateStr, createData.inTime2) : null,
              outTime2: createData.outTime2 ? this.parseTimeToDateTime(dateStr, createData.outTime2) : null,
              totalHours,
              synced: true,
            },
          });

          // Log sync operation within same transaction
          await tx.syncLog.create({
            data: {
              userId,
              deviceId,
              entityType: SyncEntityType.TIME_ENTRY,
              operation: SyncOperationType.CREATE,
              entityId: timeEntry.id,
              success: true,
            },
          });

          return timeEntry;
        });

        result.successful++;
        this.logger.log(`Created time entry ${created.id}`);
        return;
      }

      // Handle UPDATE operation
      if (entry.operation === SyncOperation.UPDATE) {
        if (!entry.id) {
          throw new BadRequestException('Cannot update entry without ID');
        }

        // Detect conflict if lastSyncedAt provided
        if (entry.lastSyncedAt) {
          const conflictInfo = await this.detectConflict(
            userId,
            SyncEntityType.TIME_ENTRY,
            entry.id,
            entry.lastSyncedAt,
          );

          if (conflictInfo.hasConflict) {
            // Apply resolution strategy
            const resolution = entry.resolution || ConflictResolutionStrategy.SERVER_WINS;

            if (resolution === ConflictResolutionStrategy.MANUAL_MERGE) {
              // Add to conflicts list for manual resolution
              result.conflicts.push(conflictInfo);
              result.failed++;
              await this.createSyncLog(userId, {
                deviceId,
                entityType: SyncEntityType.TIME_ENTRY,
                operation: SyncOperationType.UPDATE,
                entityId: entry.id,
                success: false,
                error: 'Conflict requires manual merge',
              });
              return;
            }

            if (resolution === ConflictResolutionStrategy.CLIENT_WINS) {
              // Proceed with update (client wins)
              this.logger.log(`Applying CLIENT_WINS for time entry ${entry.id}`);
            } else {
              // SERVER_WINS - skip update
              result.successful++;
              await this.createSyncLog(userId, {
                deviceId,
                entityType: SyncEntityType.TIME_ENTRY,
                operation: SyncOperationType.UPDATE,
                entityId: entry.id,
                success: true,
                error: 'Conflict resolved with SERVER_WINS',
              });
              return;
            }
          }
        }

        // Prepare update data and calculate total hours
        const dateStr = entry.date;
        const totalHours = this.calculateTotalHours(
          entry.inTime1,
          entry.outTime1,
          entry.inTime2,
          entry.outTime2,
        );

        const prismaUpdateData: any = {
          date: new Date(dateStr),
          clientName: entry.clientName,
          description: entry.description,
          inTime1: this.parseTimeToDateTime(dateStr, entry.inTime1),
          outTime1: this.parseTimeToDateTime(dateStr, entry.outTime1),
          totalHours,
        };

        if (entry.projectTaskNumber !== undefined) {
          prismaUpdateData.projectTaskNumber = entry.projectTaskNumber;
        }
        if (entry.inTime2 !== undefined) {
          prismaUpdateData.inTime2 = entry.inTime2 ? this.parseTimeToDateTime(dateStr, entry.inTime2) : null;
        }
        if (entry.outTime2 !== undefined) {
          prismaUpdateData.outTime2 = entry.outTime2 ? this.parseTimeToDateTime(dateStr, entry.outTime2) : null;
        }

        // Use transaction for atomicity between time entry update and sync log
        await this.prisma.$transaction(async (tx) => {
          // Update time entry directly with Prisma within transaction
          await tx.timeEntry.update({
            where: {
              id: entry.id,
              consultantId: userId, // Ownership verification
            },
            data: prismaUpdateData,
          });

          // Log sync operation within same transaction
          await tx.syncLog.create({
            data: {
              userId,
              deviceId,
              entityType: SyncEntityType.TIME_ENTRY,
              operation: SyncOperationType.UPDATE,
              entityId: entry.id!,
              success: true,
            },
          });
        });

        result.successful++;
        this.logger.log(`Updated time entry ${entry.id}`);
        return;
      }

      throw new BadRequestException(`Unknown operation: ${entry.operation}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.failed++;
      result.errors.push({
        entityId,
        entityType: 'TimeEntry',
        operation: entry.operation,
        error: errorMessage,
      });

      await this.createSyncLog(userId, {
        deviceId,
        entityType: SyncEntityType.TIME_ENTRY,
        operation: this.convertOperationType(entry.operation),
        entityId,
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Sync ETO transactions in batch
   * Processes multiple ETO transactions with conflict detection and resolution
   * @param userId - ID of the user performing sync
   * @param transactions - Array of ETO transactions to sync
   * @param deviceId - Device ID for sync logging
   * @returns SyncResult with counts and any errors
   */
  async syncETOTransactions(
    userId: string,
    transactions: SyncETOTransactionInput[],
    deviceId: string,
  ): Promise<SyncResult> {
    const result: SyncResult = {
      successful: 0,
      failed: 0,
      conflicts: [],
      errors: [],
    };

    // Process transactions sequentially to avoid race conditions
    for (const transaction of transactions) {
      try {
        await this.syncSingleETOTransaction(userId, transaction, deviceId, result);
      } catch (error) {
        // Handle unexpected errors
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`Unexpected error syncing ETO transaction: ${errorMessage}`);
        result.failed++;
        result.errors.push({
          entityId: transaction.id || 'unknown',
          entityType: 'ETOTransaction',
          operation: transaction.operation,
          error: errorMessage,
        });
      }
    }

    this.logger.log(
      `Batch ETO sync completed for user ${userId}: ${result.successful} successful, ${result.failed} failed, ${result.conflicts.length} conflicts`,
    );

    return result;
  }

  /**
   * Sync a single ETO transaction
   * @private
   */
  private async syncSingleETOTransaction(
    userId: string,
    transaction: SyncETOTransactionInput,
    deviceId: string,
    result: SyncResult,
  ): Promise<void> {
    const entityId = transaction.id || 'temp-' + Date.now();

    try {
      // Handle DELETE operation
      if (transaction.operation === SyncOperation.DELETE) {
        if (!transaction.id) {
          throw new BadRequestException('Cannot delete transaction without ID');
        }

        // ETO transactions should not be deleted directly - use adjustments
        throw new BadRequestException('ETO transactions cannot be deleted. Use adjustments instead.');
      }

      // Handle CREATE operation (use ETO)
      if (transaction.operation === SyncOperation.CREATE) {
        // Create ETO transaction (etoService.useETO handles its own transaction)
        const created = await this.etoService.useETO(userId, {
          hours: transaction.hours,
          date: transaction.date,
          description: transaction.description,
          projectName: transaction.projectName,
        });

        // Log sync operation after successful creation
        try {
          await this.createSyncLog(userId, {
            deviceId,
            entityType: SyncEntityType.ETO_TRANSACTION,
            operation: SyncOperationType.CREATE,
            entityId: created.id,
            success: true,
          });
        } catch (logError) {
          const logErrorMessage = logError instanceof Error ? logError.message : String(logError);
          this.logger.error(`Failed to create sync log for ETO transaction ${created.id}: ${logErrorMessage}`);
          // Don't fail the operation, but note the logging issue
        }

        result.successful++;
        this.logger.log(`Created ETO transaction ${created.id}`);
        return;
      }

      // Handle UPDATE operation
      if (transaction.operation === SyncOperation.UPDATE) {
        if (!transaction.id) {
          throw new BadRequestException('Cannot update transaction without ID');
        }

        // Detect conflict if lastSyncedAt provided
        if (transaction.lastSyncedAt) {
          const conflictInfo = await this.detectConflict(
            userId,
            SyncEntityType.ETO_TRANSACTION,
            transaction.id,
            transaction.lastSyncedAt,
          );

          if (conflictInfo.hasConflict) {
            // Apply resolution strategy
            const resolution = transaction.resolution || ConflictResolutionStrategy.SERVER_WINS;

            if (resolution === ConflictResolutionStrategy.MANUAL_MERGE) {
              // Add to conflicts list for manual resolution
              result.conflicts.push(conflictInfo);
              result.failed++;
              await this.createSyncLog(userId, {
                deviceId,
                entityType: SyncEntityType.ETO_TRANSACTION,
                operation: SyncOperationType.UPDATE,
                entityId: transaction.id,
                success: false,
                error: 'Conflict requires manual merge',
              });
              return;
            }

            if (resolution === ConflictResolutionStrategy.CLIENT_WINS) {
              // Proceed with update (client wins)
              this.logger.log(`Applying CLIENT_WINS for ETO transaction ${transaction.id}`);
            } else {
              // SERVER_WINS - skip update
              result.successful++;
              await this.createSyncLog(userId, {
                deviceId,
                entityType: SyncEntityType.ETO_TRANSACTION,
                operation: SyncOperationType.UPDATE,
                entityId: transaction.id,
                success: true,
                error: 'Conflict resolved with SERVER_WINS',
              });
              return;
            }
          }
        }

        // ETO transactions are immutable after creation - use adjustments
        throw new BadRequestException('ETO transactions cannot be updated. Use adjustments instead.');
      }

      throw new BadRequestException(`Unknown operation: ${transaction.operation}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.failed++;
      result.errors.push({
        entityId,
        entityType: 'ETOTransaction',
        operation: transaction.operation,
        error: errorMessage,
      });

      await this.createSyncLog(userId, {
        deviceId,
        entityType: SyncEntityType.ETO_TRANSACTION,
        operation: this.convertOperationType(transaction.operation),
        entityId,
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * Sync timesheet submissions in batch
   * Processes multiple timesheet submissions with conflict detection and resolution
   * @param userId - ID of the user performing sync
   * @param submissions - Array of timesheet submissions to sync
   * @param deviceId - Device ID for sync logging
   * @returns SyncResult with counts and any errors
   */
  async syncTimesheetSubmissions(
    userId: string,
    submissions: SyncTimesheetSubmissionInput[],
    deviceId: string,
  ): Promise<SyncResult> {
    const result: SyncResult = {
      successful: 0,
      failed: 0,
      conflicts: [],
      errors: [],
    };

    // Process submissions sequentially to avoid race conditions
    for (const submission of submissions) {
      try {
        await this.syncSingleTimesheetSubmission(userId, submission, deviceId, result);
      } catch (error) {
        // Handle unexpected errors
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`Unexpected error syncing timesheet submission: ${errorMessage}`);
        result.failed++;
        result.errors.push({
          entityId: submission.id || 'unknown',
          entityType: 'TimesheetSubmission',
          operation: submission.operation,
          error: errorMessage,
        });
      }
    }

    this.logger.log(
      `Batch submission sync completed for user ${userId}: ${result.successful} successful, ${result.failed} failed, ${result.conflicts.length} conflicts`,
    );

    return result;
  }

  /**
   * Sync a single timesheet submission
   * @private
   */
  private async syncSingleTimesheetSubmission(
    userId: string,
    submission: SyncTimesheetSubmissionInput,
    deviceId: string,
    result: SyncResult,
  ): Promise<void> {
    const entityId = submission.id || 'temp-' + Date.now();

    try {
      // Handle DELETE operation
      if (submission.operation === SyncOperation.DELETE) {
        if (!submission.id) {
          throw new BadRequestException('Cannot delete submission without ID');
        }

        // Timesheet submissions should not be deleted - use draft status instead
        throw new BadRequestException('Timesheet submissions cannot be deleted. Use draft status instead.');
      }

      // Handle CREATE operation
      if (submission.operation === SyncOperation.CREATE) {
        // Use transaction to ensure atomicity
        const created = await this.prisma.$transaction(async (tx) => {
          // Check if already exists first
          const existing = await tx.timesheetSubmission.findUnique({
            where: {
              consultantId_payPeriodId: {
                consultantId: userId,
                payPeriodId: submission.payPeriodId,
              },
            },
          });

          if (existing) {
            throw new BadRequestException(`Submission already exists for pay period ${submission.payPeriodId}`);
          }

          // Create draft submission
          const timesheetSubmission = await tx.timesheetSubmission.create({
            data: {
              consultantId: userId,
              payPeriodId: submission.payPeriodId,
              status: submission.status || 'draft',
              submittedAt: submission.submittedAt,
              comments: submission.comments,
            },
          });

          // Log sync operation within same transaction
          await tx.syncLog.create({
            data: {
              userId,
              deviceId,
              entityType: SyncEntityType.TIMESHEET_SUBMISSION,
              operation: SyncOperationType.CREATE,
              entityId: timesheetSubmission.id,
              success: true,
            },
          });

          return timesheetSubmission;
        });

        result.successful++;
        this.logger.log(`Created timesheet submission ${created.id}`);
        return;
      }

      // Handle UPDATE operation
      if (submission.operation === SyncOperation.UPDATE) {
        if (!submission.id) {
          throw new BadRequestException('Cannot update submission without ID');
        }

        // Detect conflict if lastSyncedAt provided
        if (submission.lastSyncedAt) {
          const conflictInfo = await this.detectConflict(
            userId,
            SyncEntityType.TIMESHEET_SUBMISSION,
            submission.id,
            submission.lastSyncedAt,
          );

          if (conflictInfo.hasConflict) {
            // Apply resolution strategy
            const resolution = submission.resolution || ConflictResolutionStrategy.SERVER_WINS;

            if (resolution === ConflictResolutionStrategy.MANUAL_MERGE) {
              // Add to conflicts list for manual resolution
              result.conflicts.push(conflictInfo);
              result.failed++;
              await this.createSyncLog(userId, {
                deviceId,
                entityType: SyncEntityType.TIMESHEET_SUBMISSION,
                operation: SyncOperationType.UPDATE,
                entityId: submission.id,
                success: false,
                error: 'Conflict requires manual merge',
              });
              return;
            }

            if (resolution === ConflictResolutionStrategy.CLIENT_WINS) {
              // Proceed with update (client wins)
              this.logger.log(`Applying CLIENT_WINS for timesheet submission ${submission.id}`);
            } else {
              // SERVER_WINS - skip update
              result.successful++;
              await this.createSyncLog(userId, {
                deviceId,
                entityType: SyncEntityType.TIMESHEET_SUBMISSION,
                operation: SyncOperationType.UPDATE,
                entityId: submission.id,
                success: true,
                error: 'Conflict resolved with SERVER_WINS',
              });
              return;
            }
          }
        }

        // Only allow certain fields to be updated
        const updateData: any = {};
        if (submission.comments !== undefined) {
          updateData.comments = submission.comments;
        }
        if (submission.submittedAt !== undefined) {
          updateData.submittedAt = submission.submittedAt;
        }
        // Status changes should go through SubmissionService methods, but allow for sync
        if (submission.status !== undefined) {
          updateData.status = submission.status;
        }

        // Use transaction to ensure atomicity
        await this.prisma.$transaction(async (tx) => {
          // Update timesheet submission
          await tx.timesheetSubmission.update({
            where: {
              id: submission.id,
              consultantId: userId, // Ownership verification
            },
            data: updateData,
          });

          // Log sync operation within same transaction
          await tx.syncLog.create({
            data: {
              userId,
              deviceId,
              entityType: SyncEntityType.TIMESHEET_SUBMISSION,
              operation: SyncOperationType.UPDATE,
              entityId: submission.id!,
              success: true,
            },
          });
        });

        result.successful++;
        this.logger.log(`Updated timesheet submission ${submission.id}`);
        return;
      }

      throw new BadRequestException(`Unknown operation: ${submission.operation}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.failed++;
      result.errors.push({
        entityId,
        entityType: 'TimesheetSubmission',
        operation: submission.operation,
        error: errorMessage,
      });

      await this.createSyncLog(userId, {
        deviceId,
        entityType: SyncEntityType.TIMESHEET_SUBMISSION,
        operation: this.convertOperationType(submission.operation),
        entityId,
        success: false,
        error: errorMessage,
      });
    }
  }
}
