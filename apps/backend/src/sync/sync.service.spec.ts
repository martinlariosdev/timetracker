import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SyncService } from './sync.service';
import { PrismaService } from '../prisma/prisma.service';
import { TimesheetService } from '../timesheet/timesheet.service';
import { SubmissionService } from '../timesheet/submission.service';
import { ETOService } from '../eto/eto.service';
import {
  CreateSyncLogInput,
  SyncFilterInput,
  SyncEntityType,
  SyncOperationType,
  ConflictResolutionStrategy,
  ResolveConflictInput,
  SyncOperation,
  SyncTimeEntryInput,
  SyncETOTransactionInput,
  SyncTimesheetSubmissionInput,
} from './dto';

describe('SyncService', () => {
  let service: SyncService;
  let prismaService: PrismaService;
  let timesheetService: TimesheetService;
  let submissionService: SubmissionService;
  let etoService: ETOService;

  const mockPrismaService = {
    syncLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    timeEntry: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    eTOTransaction: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    consultant: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    timesheetSubmission: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockTimesheetService = {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockSubmissionService = {
    submitTimesheet: jest.fn(),
  };

  const mockETOService = {
    useETO: jest.fn(),
  };

  const mockUserId = '507f1f77bcf86cd799439011';
  const mockDeviceId = 'device-abc-123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: TimesheetService,
          useValue: mockTimesheetService,
        },
        {
          provide: SubmissionService,
          useValue: mockSubmissionService,
        },
        {
          provide: ETOService,
          useValue: mockETOService,
        },
      ],
    }).compile();

    service = module.get<SyncService>(SyncService);
    prismaService = module.get<PrismaService>(PrismaService);
    timesheetService = module.get<TimesheetService>(TimesheetService);
    submissionService = module.get<SubmissionService>(SubmissionService);
    etoService = module.get<ETOService>(ETOService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSyncLog', () => {
    it('should create a successful sync log', async () => {
      const input: CreateSyncLogInput = {
        deviceId: mockDeviceId,
        entityType: SyncEntityType.TIME_ENTRY,
        operation: SyncOperationType.CREATE,
        entityId: 'time-entry-123',
        success: true,
      };

      const mockSyncLog = {
        id: 'sync-log-1',
        userId: mockUserId,
        deviceId: mockDeviceId,
        entityType: 'TimeEntry',
        operation: 'create',
        entityId: 'time-entry-123',
        syncedAt: new Date('2024-04-12'),
        success: true,
        error: null,
      };

      mockPrismaService.syncLog.create.mockResolvedValue(mockSyncLog);

      const result = await service.createSyncLog(mockUserId, input);

      expect(result).toEqual(mockSyncLog);
      expect(mockPrismaService.syncLog.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          deviceId: mockDeviceId,
          entityType: 'TimeEntry',
          operation: 'create',
          entityId: 'time-entry-123',
          success: true,
          error: undefined,
        },
      });
    });

    it('should create a failed sync log with error message', async () => {
      const input: CreateSyncLogInput = {
        deviceId: mockDeviceId,
        entityType: SyncEntityType.ETO_TRANSACTION,
        operation: SyncOperationType.UPDATE,
        entityId: 'eto-123',
        success: false,
        error: 'Network timeout',
      };

      const mockSyncLog = {
        id: 'sync-log-2',
        userId: mockUserId,
        deviceId: mockDeviceId,
        entityType: 'ETOTransaction',
        operation: 'update',
        entityId: 'eto-123',
        syncedAt: new Date('2024-04-12'),
        success: false,
        error: 'Network timeout',
      };

      mockPrismaService.syncLog.create.mockResolvedValue(mockSyncLog);

      const result = await service.createSyncLog(mockUserId, input);

      expect(result).toEqual(mockSyncLog);
      expect(mockPrismaService.syncLog.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          deviceId: mockDeviceId,
          entityType: 'ETOTransaction',
          operation: 'update',
          entityId: 'eto-123',
          success: false,
          error: 'Network timeout',
        },
      });
    });

    it('should default success to true when omitted', async () => {
      const input: CreateSyncLogInput = {
        deviceId: mockDeviceId,
        entityType: SyncEntityType.TIME_ENTRY,
        operation: SyncOperationType.CREATE,
        entityId: 'time-entry-123',
        // success omitted - should default to true
      };

      const mockSyncLog = {
        id: 'sync-log-3',
        userId: mockUserId,
        deviceId: mockDeviceId,
        entityType: 'TimeEntry',
        operation: 'create',
        entityId: 'time-entry-123',
        syncedAt: new Date('2024-04-12'),
        success: true, // defaulted
        error: null,
      };

      mockPrismaService.syncLog.create.mockResolvedValue(mockSyncLog);

      const result = await service.createSyncLog(mockUserId, input);

      expect(result).toEqual(mockSyncLog);
      expect(mockPrismaService.syncLog.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          deviceId: mockDeviceId,
          entityType: 'TimeEntry',
          operation: 'create',
          entityId: 'time-entry-123',
          success: true, // should be defaulted to true
          error: undefined,
        },
      });
    });

    it('should throw BadRequestException when userId is missing', async () => {
      const input: CreateSyncLogInput = {
        deviceId: mockDeviceId,
        entityType: SyncEntityType.TIME_ENTRY,
        operation: SyncOperationType.CREATE,
        entityId: 'time-entry-123',
      };

      await expect(service.createSyncLog('', input)).rejects.toThrow(BadRequestException);
      await expect(service.createSyncLog('', input)).rejects.toThrow('Missing required fields for sync log');
    });

    it('should throw BadRequestException when required fields are missing', async () => {
      const inputMissingDeviceId = {
        entityType: SyncEntityType.TIME_ENTRY,
        operation: SyncOperationType.CREATE,
        entityId: 'time-entry-123',
      } as CreateSyncLogInput;

      await expect(service.createSyncLog(mockUserId, inputMissingDeviceId)).rejects.toThrow(BadRequestException);
      await expect(service.createSyncLog(mockUserId, inputMissingDeviceId)).rejects.toThrow('Missing required fields for sync log');
    });

    it('should throw InternalServerErrorException when Prisma create fails', async () => {
      const input: CreateSyncLogInput = {
        deviceId: mockDeviceId,
        entityType: SyncEntityType.TIME_ENTRY,
        operation: SyncOperationType.CREATE,
        entityId: 'time-entry-123',
      };

      mockPrismaService.syncLog.create.mockRejectedValue(new Error('Database connection error'));

      await expect(service.createSyncLog(mockUserId, input)).rejects.toThrow(InternalServerErrorException);
      await expect(service.createSyncLog(mockUserId, input)).rejects.toThrow('Failed to create sync log');
    });
  });

  describe('getSyncLogs', () => {
    it('should return sync logs for a user with default pagination', async () => {
      const mockSyncLogs = [
        {
          id: 'sync-log-1',
          userId: mockUserId,
          deviceId: mockDeviceId,
          entityType: 'TimeEntry',
          operation: 'create',
          entityId: 'time-entry-123',
          syncedAt: new Date('2024-04-12'),
          success: true,
          error: null,
        },
        {
          id: 'sync-log-2',
          userId: mockUserId,
          deviceId: mockDeviceId,
          entityType: 'ETOTransaction',
          operation: 'update',
          entityId: 'eto-123',
          syncedAt: new Date('2024-04-11'),
          success: false,
          error: 'Network error',
        },
      ];

      mockPrismaService.syncLog.findMany.mockResolvedValue(mockSyncLogs);

      const result = await service.getSyncLogs(mockUserId);

      expect(result).toEqual(mockSyncLogs);
      expect(mockPrismaService.syncLog.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        orderBy: { syncedAt: 'desc' },
        take: 100,
      });
    });

    it('should filter sync logs by deviceId', async () => {
      const mockSyncLogs = [
        {
          id: 'sync-log-1',
          userId: mockUserId,
          deviceId: mockDeviceId,
          entityType: 'TimeEntry',
          operation: 'create',
          entityId: 'time-entry-123',
          syncedAt: new Date('2024-04-12'),
          success: true,
          error: null,
        },
      ];

      mockPrismaService.syncLog.findMany.mockResolvedValue(mockSyncLogs);

      const result = await service.getSyncLogs(mockUserId, { deviceId: mockDeviceId });

      expect(result).toEqual(mockSyncLogs);
      expect(mockPrismaService.syncLog.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          deviceId: mockDeviceId,
        },
        orderBy: { syncedAt: 'desc' },
        take: 100,
      });
    });

    it('should filter sync logs using SyncFilterInput', async () => {
      const filters: SyncFilterInput = {
        entityType: SyncEntityType.TIME_ENTRY,
        operation: SyncOperationType.CREATE,
        onlyFailed: false,
      };

      const mockSyncLogs = [
        {
          id: 'sync-log-1',
          userId: mockUserId,
          deviceId: mockDeviceId,
          entityType: 'TimeEntry',
          operation: 'create',
          entityId: 'time-entry-123',
          syncedAt: new Date('2024-04-12'),
          success: true,
          error: null,
        },
      ];

      mockPrismaService.syncLog.findMany.mockResolvedValue(mockSyncLogs);

      const result = await service.getSyncLogs(mockUserId, filters);

      expect(result).toEqual(mockSyncLogs);
      expect(mockPrismaService.syncLog.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          entityType: 'TimeEntry',
          operation: 'create',
        },
        orderBy: { syncedAt: 'desc' },
        take: 100,
      });
    });

    it('should filter for only failed syncs', async () => {
      const filters: SyncFilterInput = {
        onlyFailed: true,
      };

      const mockSyncLogs = [
        {
          id: 'sync-log-2',
          userId: mockUserId,
          deviceId: mockDeviceId,
          entityType: 'ETOTransaction',
          operation: 'update',
          entityId: 'eto-123',
          syncedAt: new Date('2024-04-11'),
          success: false,
          error: 'Network error',
        },
      ];

      mockPrismaService.syncLog.findMany.mockResolvedValue(mockSyncLogs);

      const result = await service.getSyncLogs(mockUserId, filters);

      expect(result).toEqual(mockSyncLogs);
      expect(mockPrismaService.syncLog.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          success: false,
        },
        orderBy: { syncedAt: 'desc' },
        take: 100,
      });
    });

    it('should throw BadRequestException when userId is missing', async () => {
      await expect(service.getSyncLogs('')).rejects.toThrow(BadRequestException);
      await expect(service.getSyncLogs('')).rejects.toThrow('User ID is required');
    });

    it('should throw InternalServerErrorException when Prisma findMany fails', async () => {
      mockPrismaService.syncLog.findMany.mockRejectedValue(new Error('Database connection error'));

      await expect(service.getSyncLogs(mockUserId)).rejects.toThrow(InternalServerErrorException);
      await expect(service.getSyncLogs(mockUserId)).rejects.toThrow('Failed to retrieve sync logs');
    });
  });

  describe('getFailedSyncLogs', () => {
    it('should return only failed sync logs for a user', async () => {
      const mockFailedSyncLogs = [
        {
          id: 'sync-log-2',
          userId: mockUserId,
          deviceId: mockDeviceId,
          entityType: 'ETOTransaction',
          operation: 'update',
          entityId: 'eto-123',
          syncedAt: new Date('2024-04-11'),
          success: false,
          error: 'Network error',
        },
      ];

      mockPrismaService.syncLog.findMany.mockResolvedValue(mockFailedSyncLogs);

      const result = await service.getFailedSyncLogs(mockUserId);

      expect(result).toEqual(mockFailedSyncLogs);
      expect(mockPrismaService.syncLog.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          success: false,
        },
        orderBy: { syncedAt: 'desc' },
        take: 100,
      });
    });

    it('should filter failed sync logs by deviceId', async () => {
      const mockFailedSyncLogs = [
        {
          id: 'sync-log-2',
          userId: mockUserId,
          deviceId: mockDeviceId,
          entityType: 'ETOTransaction',
          operation: 'update',
          entityId: 'eto-123',
          syncedAt: new Date('2024-04-11'),
          success: false,
          error: 'Network error',
        },
      ];

      mockPrismaService.syncLog.findMany.mockResolvedValue(mockFailedSyncLogs);

      const result = await service.getFailedSyncLogs(mockUserId, mockDeviceId);

      expect(result).toEqual(mockFailedSyncLogs);
      expect(mockPrismaService.syncLog.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          deviceId: mockDeviceId,
          success: false,
        },
        orderBy: { syncedAt: 'desc' },
        take: 100,
      });
    });

    it('should throw BadRequestException when userId is missing', async () => {
      await expect(service.getFailedSyncLogs('')).rejects.toThrow(BadRequestException);
      await expect(service.getFailedSyncLogs('')).rejects.toThrow('User ID is required');
    });

    it('should throw InternalServerErrorException when Prisma findMany fails', async () => {
      mockPrismaService.syncLog.findMany.mockRejectedValue(new Error('Database connection error'));

      await expect(service.getFailedSyncLogs(mockUserId)).rejects.toThrow(InternalServerErrorException);
      await expect(service.getFailedSyncLogs(mockUserId)).rejects.toThrow('Failed to retrieve failed sync logs');
    });
  });

  describe('getSyncLogsByEntity', () => {
    it('should return sync logs for a specific entity', async () => {
      const entityType = 'TimeEntry';
      const entityId = 'time-entry-123';

      const mockEntitySyncLogs = [
        {
          id: 'sync-log-1',
          userId: mockUserId,
          deviceId: mockDeviceId,
          entityType: 'TimeEntry',
          operation: 'create',
          entityId: 'time-entry-123',
          syncedAt: new Date('2024-04-12T10:00:00Z'),
          success: true,
          error: null,
        },
        {
          id: 'sync-log-3',
          userId: mockUserId,
          deviceId: 'device-xyz-456',
          entityType: 'TimeEntry',
          operation: 'update',
          entityId: 'time-entry-123',
          syncedAt: new Date('2024-04-12T11:00:00Z'),
          success: true,
          error: null,
        },
      ];

      mockPrismaService.syncLog.findMany.mockResolvedValue(mockEntitySyncLogs);

      const result = await service.getSyncLogsByEntity(mockUserId, entityType, entityId);

      expect(result).toEqual(mockEntitySyncLogs);
      expect(mockPrismaService.syncLog.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          entityType,
          entityId,
        },
        orderBy: { syncedAt: 'desc' },
        take: 100,
      });
    });

    it('should return empty array if no sync logs exist for entity', async () => {
      const entityType = 'TimeEntry';
      const entityId = 'nonexistent-123';

      mockPrismaService.syncLog.findMany.mockResolvedValue([]);

      const result = await service.getSyncLogsByEntity(mockUserId, entityType, entityId);

      expect(result).toEqual([]);
      expect(mockPrismaService.syncLog.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          entityType,
          entityId,
        },
        orderBy: { syncedAt: 'desc' },
        take: 100,
      });
    });

    it('should throw BadRequestException when required fields are missing', async () => {
      await expect(service.getSyncLogsByEntity('', 'TimeEntry', 'entity-123')).rejects.toThrow(BadRequestException);
      await expect(service.getSyncLogsByEntity('', 'TimeEntry', 'entity-123')).rejects.toThrow('User ID, entity type, and entity ID are required');

      await expect(service.getSyncLogsByEntity(mockUserId, '', 'entity-123')).rejects.toThrow(BadRequestException);
      await expect(service.getSyncLogsByEntity(mockUserId, 'TimeEntry', '')).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException when Prisma findMany fails', async () => {
      mockPrismaService.syncLog.findMany.mockRejectedValue(new Error('Database connection error'));

      await expect(service.getSyncLogsByEntity(mockUserId, 'TimeEntry', 'entity-123')).rejects.toThrow(InternalServerErrorException);
      await expect(service.getSyncLogsByEntity(mockUserId, 'TimeEntry', 'entity-123')).rejects.toThrow('Failed to retrieve sync logs for entity');
    });
  });

  describe('detectConflict', () => {
    const entityId = 'time-entry-123';
    const lastSyncedAt = new Date('2024-04-12T10:00:00Z');

    it('should detect no conflict when entity not modified after lastSyncedAt', async () => {
      const mockTimeEntry = {
        id: entityId,
        consultantId: mockUserId,
        date: new Date('2024-04-12'),
        totalHours: 8,
        updatedAt: new Date('2024-04-12T09:00:00Z'), // Before lastSyncedAt
        createdAt: new Date('2024-04-12T08:00:00Z'),
      };

      mockPrismaService.timeEntry.findFirst.mockResolvedValue(mockTimeEntry);

      const result = await service.detectConflict(
        mockUserId,
        SyncEntityType.TIME_ENTRY,
        entityId,
        lastSyncedAt,
      );

      expect(result.hasConflict).toBe(false);
      expect(result.serverVersion).toBeNull();
      expect(result.conflictDetails).toBeNull();
      expect(mockPrismaService.timeEntry.findFirst).toHaveBeenCalledWith({
        where: { id: entityId, consultantId: mockUserId },
      });
    });

    it('should detect conflict when TimeEntry modified after lastSyncedAt', async () => {
      const mockTimeEntry = {
        id: entityId,
        consultantId: mockUserId,
        date: new Date('2024-04-12'),
        totalHours: 8,
        updatedAt: new Date('2024-04-12T11:00:00Z'), // After lastSyncedAt
        createdAt: new Date('2024-04-12T08:00:00Z'),
      };

      mockPrismaService.timeEntry.findFirst.mockResolvedValue(mockTimeEntry);

      const result = await service.detectConflict(
        mockUserId,
        SyncEntityType.TIME_ENTRY,
        entityId,
        lastSyncedAt,
      );

      expect(result.hasConflict).toBe(true);
      expect(result.serverVersion).toEqual(mockTimeEntry);
      expect(result.serverUpdatedAt).toEqual(mockTimeEntry.updatedAt);
      expect(result.clientLastSyncedAt).toEqual(lastSyncedAt);
      expect(result.conflictDetails).toContain('Server data was modified after client\'s last sync');
    });

    it('should detect conflict for ETOTransaction using createdAt', async () => {
      const etoId = 'eto-123';
      const mockETOTransaction = {
        id: etoId,
        consultantId: mockUserId,
        date: new Date('2024-04-12'),
        hours: 8,
        transactionType: 'Accrual',
        createdAt: new Date('2024-04-12T11:00:00Z'), // After lastSyncedAt
      };

      mockPrismaService.eTOTransaction.findFirst.mockResolvedValue(mockETOTransaction);

      const result = await service.detectConflict(
        mockUserId,
        SyncEntityType.ETO_TRANSACTION,
        etoId,
        lastSyncedAt,
      );

      expect(result.hasConflict).toBe(true);
      expect(result.serverVersion).toEqual(mockETOTransaction);
      expect(result.serverUpdatedAt).toEqual(mockETOTransaction.createdAt);
    });

    it('should detect conflict for Consultant', async () => {
      const mockConsultant = {
        id: mockUserId,
        name: 'John Doe',
        email: 'john@example.com',
        updatedAt: new Date('2024-04-12T11:00:00Z'), // After lastSyncedAt
        createdAt: new Date('2024-01-01T00:00:00Z'),
      };

      mockPrismaService.consultant.findUnique.mockResolvedValue(mockConsultant);

      const result = await service.detectConflict(
        mockUserId,
        SyncEntityType.CONSULTANT,
        mockUserId,
        lastSyncedAt,
      );

      expect(result.hasConflict).toBe(true);
      expect(result.serverVersion).toEqual(mockConsultant);
      expect(mockPrismaService.consultant.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
      });
    });

    it('should detect conflict for TimesheetSubmission', async () => {
      const submissionId = 'submission-123';
      const mockSubmission = {
        id: submissionId,
        consultantId: mockUserId,
        payPeriodId: 'period-123',
        status: 'submitted',
        updatedAt: new Date('2024-04-12T11:00:00Z'), // After lastSyncedAt
        createdAt: new Date('2024-04-12T08:00:00Z'),
      };

      mockPrismaService.timesheetSubmission.findFirst.mockResolvedValue(mockSubmission);

      const result = await service.detectConflict(
        mockUserId,
        SyncEntityType.TIMESHEET_SUBMISSION,
        submissionId,
        lastSyncedAt,
      );

      expect(result.hasConflict).toBe(true);
      expect(result.serverVersion).toEqual(mockSubmission);
    });

    it('should throw NotFoundException when entity does not exist', async () => {
      mockPrismaService.timeEntry.findFirst.mockResolvedValue(null);

      await expect(
        service.detectConflict(mockUserId, SyncEntityType.TIME_ENTRY, 'nonexistent-123', lastSyncedAt),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.detectConflict(mockUserId, SyncEntityType.TIME_ENTRY, 'nonexistent-123', lastSyncedAt),
      ).rejects.toThrow('TimeEntry with ID nonexistent-123 not found');
    });

    it('should throw BadRequestException when required fields are missing', async () => {
      await expect(
        service.detectConflict('', SyncEntityType.TIME_ENTRY, entityId, lastSyncedAt),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.detectConflict('', SyncEntityType.TIME_ENTRY, entityId, lastSyncedAt),
      ).rejects.toThrow('All fields are required for conflict detection');

      await expect(
        service.detectConflict(mockUserId, SyncEntityType.TIME_ENTRY, '', lastSyncedAt),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException when Prisma query fails', async () => {
      mockPrismaService.timeEntry.findFirst.mockRejectedValue(new Error('Database error'));

      await expect(
        service.detectConflict(mockUserId, SyncEntityType.TIME_ENTRY, entityId, lastSyncedAt),
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        service.detectConflict(mockUserId, SyncEntityType.TIME_ENTRY, entityId, lastSyncedAt),
      ).rejects.toThrow('Failed to detect conflict');
    });
  });

  describe('resolveConflict', () => {
    const entityId = 'time-entry-123';

    it('should resolve conflict with SERVER_WINS strategy', async () => {
      const mockTimeEntry = {
        id: entityId,
        consultantId: mockUserId,
        date: new Date('2024-04-12'),
        totalHours: 8,
        description: 'Server version',
        updatedAt: new Date('2024-04-12T11:00:00Z'),
        createdAt: new Date('2024-04-12T08:00:00Z'),
      };

      mockPrismaService.timeEntry.findFirst.mockResolvedValue(mockTimeEntry);

      const input: ResolveConflictInput = {
        entityType: SyncEntityType.TIME_ENTRY,
        entityId,
        strategy: ConflictResolutionStrategy.SERVER_WINS,
      };

      const result = await service.resolveConflict(mockUserId, input);

      expect(result.success).toBe(true);
      expect(result.strategy).toBe(ConflictResolutionStrategy.SERVER_WINS);
      expect(result.finalData).toEqual(mockTimeEntry);
      expect(result.message).toContain('Server data preserved');
      expect(mockPrismaService.timeEntry.update).not.toHaveBeenCalled();
    });

    it('should resolve conflict with CLIENT_WINS strategy', async () => {
      const mockServerTimeEntry = {
        id: entityId,
        consultantId: mockUserId,
        date: new Date('2024-04-12'),
        totalHours: 8,
        description: 'Server version',
        updatedAt: new Date('2024-04-12T11:00:00Z'),
        createdAt: new Date('2024-04-12T08:00:00Z'),
      };

      const clientData = {
        id: entityId,
        consultantId: mockUserId,
        date: new Date('2024-04-12'),
        totalHours: 9,
        description: 'Client version',
      };

      const mockUpdatedTimeEntry = {
        ...mockServerTimeEntry,
        totalHours: 9,
        description: 'Client version',
      };

      mockPrismaService.timeEntry.findFirst.mockResolvedValue(mockServerTimeEntry);
      mockPrismaService.timeEntry.update.mockResolvedValue(mockUpdatedTimeEntry);

      const input: ResolveConflictInput = {
        entityType: SyncEntityType.TIME_ENTRY,
        entityId,
        strategy: ConflictResolutionStrategy.CLIENT_WINS,
        clientData,
      };

      const result = await service.resolveConflict(mockUserId, input);

      expect(result.success).toBe(true);
      expect(result.strategy).toBe(ConflictResolutionStrategy.CLIENT_WINS);
      expect(result.finalData).toEqual(mockUpdatedTimeEntry);
      expect(result.message).toContain('Client data applied');
      expect(mockPrismaService.timeEntry.update).toHaveBeenCalledWith({
        where: {
          id: entityId,
          consultantId: mockUserId, // Ownership verification
        },
        data: {
          date: clientData.date,
          totalHours: clientData.totalHours,
          description: clientData.description,
        },
      });
    });

    it('should throw BadRequestException when CLIENT_WINS strategy lacks client data', async () => {
      const mockTimeEntry = {
        id: entityId,
        consultantId: mockUserId,
        date: new Date('2024-04-12'),
        totalHours: 8,
      };

      mockPrismaService.timeEntry.findFirst.mockResolvedValue(mockTimeEntry);

      const input: ResolveConflictInput = {
        entityType: SyncEntityType.TIME_ENTRY,
        entityId,
        strategy: ConflictResolutionStrategy.CLIENT_WINS,
        // clientData missing
      };

      await expect(service.resolveConflict(mockUserId, input)).rejects.toThrow(BadRequestException);
      await expect(service.resolveConflict(mockUserId, input)).rejects.toThrow(
        'Client data is required for CLIENT_WINS strategy',
      );
    });

    it('should resolve conflict with MANUAL_MERGE strategy', async () => {
      const mockServerTimeEntry = {
        id: entityId,
        consultantId: mockUserId,
        date: new Date('2024-04-12'),
        totalHours: 8,
        description: 'Server version',
        updatedAt: new Date('2024-04-12T11:00:00Z'),
        createdAt: new Date('2024-04-12T08:00:00Z'),
      };

      const clientData = {
        id: entityId,
        consultantId: mockUserId,
        date: new Date('2024-04-12'),
        totalHours: 9,
        description: 'Client version',
      };

      mockPrismaService.timeEntry.findFirst.mockResolvedValue(mockServerTimeEntry);

      const input: ResolveConflictInput = {
        entityType: SyncEntityType.TIME_ENTRY,
        entityId,
        strategy: ConflictResolutionStrategy.MANUAL_MERGE,
        clientData,
      };

      const result = await service.resolveConflict(mockUserId, input);

      expect(result.success).toBe(true);
      expect(result.strategy).toBe(ConflictResolutionStrategy.MANUAL_MERGE);
      expect(result.finalData).toEqual({
        serverVersion: mockServerTimeEntry,
        clientVersion: clientData,
      });
      expect(result.message).toContain('Manual merge required');
      expect(mockPrismaService.timeEntry.update).not.toHaveBeenCalled();
    });

    it('should resolve conflict for ETOTransaction', async () => {
      const etoId = 'eto-123';
      const mockETOTransaction = {
        id: etoId,
        consultantId: mockUserId,
        date: new Date('2024-04-12'),
        hours: 8,
        transactionType: 'Accrual',
        createdAt: new Date('2024-04-12T11:00:00Z'),
      };

      mockPrismaService.eTOTransaction.findFirst.mockResolvedValue(mockETOTransaction);

      const input: ResolveConflictInput = {
        entityType: SyncEntityType.ETO_TRANSACTION,
        entityId: etoId,
        strategy: ConflictResolutionStrategy.SERVER_WINS,
      };

      const result = await service.resolveConflict(mockUserId, input);

      expect(result.success).toBe(true);
      expect(result.finalData).toEqual(mockETOTransaction);
      expect(mockPrismaService.eTOTransaction.findFirst).toHaveBeenCalledWith({
        where: { id: etoId, consultantId: mockUserId },
      });
    });

    it('should resolve conflict for Consultant', async () => {
      const mockConsultant = {
        id: mockUserId,
        name: 'John Doe',
        email: 'john@example.com',
        updatedAt: new Date('2024-04-12T11:00:00Z'),
        createdAt: new Date('2024-01-01T00:00:00Z'),
      };

      mockPrismaService.consultant.findUnique.mockResolvedValue(mockConsultant);

      const input: ResolveConflictInput = {
        entityType: SyncEntityType.CONSULTANT,
        entityId: mockUserId,
        strategy: ConflictResolutionStrategy.SERVER_WINS,
      };

      const result = await service.resolveConflict(mockUserId, input);

      expect(result.success).toBe(true);
      expect(result.finalData).toEqual(mockConsultant);
    });

    it('should resolve conflict for TimesheetSubmission', async () => {
      const submissionId = 'submission-123';
      const mockSubmission = {
        id: submissionId,
        consultantId: mockUserId,
        payPeriodId: 'period-123',
        status: 'submitted',
        updatedAt: new Date('2024-04-12T11:00:00Z'),
        createdAt: new Date('2024-04-12T08:00:00Z'),
      };

      mockPrismaService.timesheetSubmission.findFirst.mockResolvedValue(mockSubmission);

      const input: ResolveConflictInput = {
        entityType: SyncEntityType.TIMESHEET_SUBMISSION,
        entityId: submissionId,
        strategy: ConflictResolutionStrategy.SERVER_WINS,
      };

      const result = await service.resolveConflict(mockUserId, input);

      expect(result.success).toBe(true);
      expect(result.finalData).toEqual(mockSubmission);
    });

    it('should throw NotFoundException when entity does not exist', async () => {
      mockPrismaService.timeEntry.findFirst.mockResolvedValue(null);

      const input: ResolveConflictInput = {
        entityType: SyncEntityType.TIME_ENTRY,
        entityId: 'nonexistent-123',
        strategy: ConflictResolutionStrategy.SERVER_WINS,
      };

      await expect(service.resolveConflict(mockUserId, input)).rejects.toThrow(NotFoundException);
      await expect(service.resolveConflict(mockUserId, input)).rejects.toThrow(
        'TimeEntry with ID nonexistent-123 not found',
      );
    });

    it('should throw BadRequestException when required fields are missing', async () => {
      const input: ResolveConflictInput = {
        entityType: SyncEntityType.TIME_ENTRY,
        entityId: entityId,
        strategy: ConflictResolutionStrategy.SERVER_WINS,
      };

      await expect(service.resolveConflict('', input)).rejects.toThrow(BadRequestException);
      await expect(service.resolveConflict('', input)).rejects.toThrow(
        'User ID, entity type, entity ID, and strategy are required',
      );
    });

    it('should throw InternalServerErrorException when Prisma query fails', async () => {
      mockPrismaService.timeEntry.findFirst.mockRejectedValue(new Error('Database error'));

      const input: ResolveConflictInput = {
        entityType: SyncEntityType.TIME_ENTRY,
        entityId: entityId,
        strategy: ConflictResolutionStrategy.SERVER_WINS,
      };

      await expect(service.resolveConflict(mockUserId, input)).rejects.toThrow(InternalServerErrorException);
      await expect(service.resolveConflict(mockUserId, input)).rejects.toThrow('Failed to resolve conflict');
    });

    it('should use provided serverData instead of fetching from database', async () => {
      const serverData = {
        id: entityId,
        consultantId: mockUserId,
        date: new Date('2024-04-12'),
        totalHours: 8,
        description: 'Provided server data',
      };

      const input: ResolveConflictInput = {
        entityType: SyncEntityType.TIME_ENTRY,
        entityId,
        strategy: ConflictResolutionStrategy.SERVER_WINS,
        serverData,
      };

      const result = await service.resolveConflict(mockUserId, input);

      expect(result.success).toBe(true);
      expect(result.finalData).toEqual(serverData);
      expect(mockPrismaService.timeEntry.findFirst).not.toHaveBeenCalled();
    });

    it('should enforce ownership verification when updating TimeEntry', async () => {
      const mockServerTimeEntry = {
        id: entityId,
        consultantId: mockUserId,
        date: new Date('2024-04-12'),
        totalHours: 8,
        description: 'Server version',
      };

      const clientData = {
        id: entityId,
        date: new Date('2024-04-12'),
        totalHours: 9,
        description: 'Client version',
      };

      mockPrismaService.timeEntry.findFirst.mockResolvedValue(mockServerTimeEntry);
      // Simulate ownership verification failure - Prisma will return null
      mockPrismaService.timeEntry.update.mockRejectedValue(
        new Error('Record to update not found'),
      );

      const input: ResolveConflictInput = {
        entityType: SyncEntityType.TIME_ENTRY,
        entityId,
        strategy: ConflictResolutionStrategy.CLIENT_WINS,
        clientData,
      };

      await expect(service.resolveConflict(mockUserId, input)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockPrismaService.timeEntry.update).toHaveBeenCalledWith({
        where: {
          id: entityId,
          consultantId: mockUserId, // Ownership check enforced
        },
        data: expect.any(Object),
      });
    });

    it('should filter out unauthorized fields from client data for TimeEntry', async () => {
      const mockServerTimeEntry = {
        id: entityId,
        consultantId: mockUserId,
        date: new Date('2024-04-12'),
        totalHours: 8,
      };

      const clientDataWithUnauthorizedFields = {
        id: entityId,
        consultantId: 'attacker-id', // Should be filtered
        date: new Date('2024-04-12'),
        totalHours: 9,
        description: 'Valid description',
        synced: true, // Should be filtered
        createdAt: new Date(), // Should be filtered
        updatedAt: new Date(), // Should be filtered
      };

      const mockUpdatedTimeEntry = {
        ...mockServerTimeEntry,
        totalHours: 9,
        description: 'Valid description',
      };

      mockPrismaService.timeEntry.findFirst.mockResolvedValue(mockServerTimeEntry);
      mockPrismaService.timeEntry.update.mockResolvedValue(mockUpdatedTimeEntry);

      const input: ResolveConflictInput = {
        entityType: SyncEntityType.TIME_ENTRY,
        entityId,
        strategy: ConflictResolutionStrategy.CLIENT_WINS,
        clientData: clientDataWithUnauthorizedFields,
      };

      const result = await service.resolveConflict(mockUserId, input);

      expect(result.success).toBe(true);
      // Verify that only allowed fields were passed to update
      expect(mockPrismaService.timeEntry.update).toHaveBeenCalledWith({
        where: {
          id: entityId,
          consultantId: mockUserId,
        },
        data: {
          date: clientDataWithUnauthorizedFields.date,
          totalHours: clientDataWithUnauthorizedFields.totalHours,
          description: clientDataWithUnauthorizedFields.description,
          // synced, createdAt, updatedAt, consultantId should NOT be in data
        },
      });
      // Explicitly verify unauthorized fields are NOT present
      const updateCall = mockPrismaService.timeEntry.update.mock.calls[0][0];
      expect(updateCall.data).not.toHaveProperty('synced');
      expect(updateCall.data).not.toHaveProperty('createdAt');
      expect(updateCall.data).not.toHaveProperty('updatedAt');
      expect(updateCall.data).not.toHaveProperty('consultantId');
    });

    it('should filter out unauthorized fields from Consultant data', async () => {
      const mockConsultant = {
        id: mockUserId,
        name: 'John Doe',
        email: 'john@example.com',
        etoBalance: 80, // Critical field
      };

      const clientDataWithUnauthorizedFields = {
        id: mockUserId,
        name: 'John Updated',
        email: 'john.updated@example.com',
        etoBalance: 1000, // Should be filtered - critical security field
        paymentType: 'W2', // Should be filtered
        workingHoursPerPeriod: 40, // Should be filtered
      };

      const mockUpdatedConsultant = {
        ...mockConsultant,
        name: 'John Updated',
        email: 'john.updated@example.com',
      };

      mockPrismaService.consultant.findUnique.mockResolvedValue(mockConsultant);
      mockPrismaService.consultant.update.mockResolvedValue(mockUpdatedConsultant);

      const input: ResolveConflictInput = {
        entityType: SyncEntityType.CONSULTANT,
        entityId: mockUserId,
        strategy: ConflictResolutionStrategy.CLIENT_WINS,
        clientData: clientDataWithUnauthorizedFields,
      };

      const result = await service.resolveConflict(mockUserId, input);

      expect(result.success).toBe(true);
      // Verify that only allowed fields (name, email) were passed to update
      expect(mockPrismaService.consultant.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: {
          name: 'John Updated',
          email: 'john.updated@example.com',
          // etoBalance, paymentType, workingHoursPerPeriod should NOT be in data
        },
      });
      // Explicitly verify unauthorized fields are NOT present
      const updateCall = mockPrismaService.consultant.update.mock.calls[0][0];
      expect(updateCall.data).not.toHaveProperty('etoBalance');
      expect(updateCall.data).not.toHaveProperty('paymentType');
      expect(updateCall.data).not.toHaveProperty('workingHoursPerPeriod');
    });

    it('should filter out status field from TimesheetSubmission data', async () => {
      const submissionId = 'submission-123';
      const mockSubmission = {
        id: submissionId,
        consultantId: mockUserId,
        payPeriodId: 'period-123',
        status: 'pending',
        comments: 'Original comments',
      };

      const clientDataWithUnauthorizedFields = {
        id: submissionId,
        consultantId: mockUserId,
        comments: 'Updated comments',
        status: 'approved', // Should be filtered - server-controlled
        submittedAt: new Date(),
      };

      const mockUpdatedSubmission = {
        ...mockSubmission,
        comments: 'Updated comments',
      };

      mockPrismaService.timesheetSubmission.findFirst.mockResolvedValue(mockSubmission);
      mockPrismaService.timesheetSubmission.update.mockResolvedValue(mockUpdatedSubmission);

      const input: ResolveConflictInput = {
        entityType: SyncEntityType.TIMESHEET_SUBMISSION,
        entityId: submissionId,
        strategy: ConflictResolutionStrategy.CLIENT_WINS,
        clientData: clientDataWithUnauthorizedFields,
      };

      const result = await service.resolveConflict(mockUserId, input);

      expect(result.success).toBe(true);
      // Verify that only allowed fields were passed to update
      expect(mockPrismaService.timesheetSubmission.update).toHaveBeenCalledWith({
        where: {
          id: submissionId,
          consultantId: mockUserId,
        },
        data: {
          submittedAt: clientDataWithUnauthorizedFields.submittedAt,
          comments: 'Updated comments',
          // status should NOT be in data
        },
      });
      // Explicitly verify status is NOT present
      const updateCall = mockPrismaService.timesheetSubmission.update.mock.calls[0][0];
      expect(updateCall.data).not.toHaveProperty('status');
    });
  });

  describe('syncTimeEntries', () => {
    it('should successfully sync multiple time entries with CREATE operations', async () => {
      const entries: SyncTimeEntryInput[] = [
        {
          date: '2024-04-12',
          clientName: 'Client A',
          description: 'Work done',
          inTime1: '09:00',
          outTime1: '17:00',
          totalHours: 8,
          operation: SyncOperation.CREATE,
        },
        {
          date: '2024-04-13',
          clientName: 'Client B',
          description: 'More work',
          inTime1: '10:00',
          outTime1: '18:00',
          totalHours: 8,
          operation: SyncOperation.CREATE,
        },
      ];

      const mockCreatedEntry1 = { id: 'entry-1', consultantId: mockUserId };
      const mockCreatedEntry2 = { id: 'entry-2', consultantId: mockUserId };

      // Mock transaction to execute callback with mocked tx client
      const mockTx = {
        timeEntry: { create: jest.fn() },
        syncLog: { create: jest.fn() },
      };

      mockTx.timeEntry.create
        .mockResolvedValueOnce(mockCreatedEntry1)
        .mockResolvedValueOnce(mockCreatedEntry2);
      mockTx.syncLog.create.mockResolvedValue({} as any);

      mockPrismaService.$transaction.mockImplementation((callback: any) => callback(mockTx));

      const result = await service.syncTimeEntries(mockUserId, entries, mockDeviceId);

      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.conflicts).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(2);
      expect(mockTx.timeEntry.create).toHaveBeenCalledTimes(2);
      expect(mockTx.syncLog.create).toHaveBeenCalledTimes(2);
    });

    it('should successfully sync UPDATE operation without conflict', async () => {
      const entries: SyncTimeEntryInput[] = [
        {
          id: 'entry-1',
          date: '2024-04-12',
          clientName: 'Client A',
          description: 'Updated work',
          inTime1: '09:00',
          outTime1: '17:00',
          totalHours: 8,
          operation: SyncOperation.UPDATE,
        },
      ];

      const mockUpdatedEntry = { id: 'entry-1', consultantId: mockUserId };

      // Mock transaction to execute callback with mocked tx client
      const mockTx = {
        timeEntry: { update: jest.fn() },
        syncLog: { create: jest.fn() },
      };

      mockTx.timeEntry.update.mockResolvedValue(mockUpdatedEntry);
      mockTx.syncLog.create.mockResolvedValue({} as any);

      mockPrismaService.$transaction.mockImplementation((callback: any) => callback(mockTx));

      const result = await service.syncTimeEntries(mockUserId, entries, mockDeviceId);

      expect(result.successful).toBe(1);
      expect(result.failed).toBe(0);
      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1);
      expect(mockTx.timeEntry.update).toHaveBeenCalledTimes(1);
      expect(mockTx.syncLog.create).toHaveBeenCalledTimes(1);
    });

    it('should successfully sync DELETE operation', async () => {
      const entries: SyncTimeEntryInput[] = [
        {
          id: 'entry-1',
          date: '2024-04-12',
          clientName: 'Client A',
          description: 'To delete',
          inTime1: '09:00',
          outTime1: '17:00',
          totalHours: 8,
          operation: SyncOperation.DELETE,
        },
      ];

      // Mock transaction to execute callback with mocked tx client
      const mockTx = {
        timeEntry: { delete: jest.fn() },
        syncLog: { create: jest.fn() },
      };

      mockTx.timeEntry.delete.mockResolvedValue({} as any);
      mockTx.syncLog.create.mockResolvedValue({} as any);

      mockPrismaService.$transaction.mockImplementation((callback: any) => callback(mockTx));

      const result = await service.syncTimeEntries(mockUserId, entries, mockDeviceId);

      expect(result.successful).toBe(1);
      expect(result.failed).toBe(0);
      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1);
      expect(mockTx.timeEntry.delete).toHaveBeenCalledTimes(1);
      expect(mockTx.syncLog.create).toHaveBeenCalledTimes(1);
    });

    it('should handle conflict with SERVER_WINS resolution', async () => {
      const entries: SyncTimeEntryInput[] = [
        {
          id: 'entry-1',
          date: '2024-04-12',
          clientName: 'Client A',
          description: 'Updated work',
          inTime1: '09:00',
          outTime1: '17:00',
          totalHours: 8,
          operation: SyncOperation.UPDATE,
          lastSyncedAt: new Date('2024-04-12T10:00:00Z'),
          resolution: ConflictResolutionStrategy.SERVER_WINS,
        },
      ];

      const mockTimeEntry = {
        id: 'entry-1',
        consultantId: mockUserId,
        updatedAt: new Date('2024-04-12T11:00:00Z'), // After lastSyncedAt - conflict!
      };

      mockPrismaService.timeEntry.findFirst.mockResolvedValue(mockTimeEntry);
      mockPrismaService.syncLog.create.mockResolvedValue({} as any);

      const result = await service.syncTimeEntries(mockUserId, entries, mockDeviceId);

      expect(result.successful).toBe(1); // SERVER_WINS counts as successful
      expect(result.failed).toBe(0);
      expect(result.conflicts).toHaveLength(0);
      expect(mockTimesheetService.update).not.toHaveBeenCalled(); // No update performed
    });

    it('should handle conflict with MANUAL_MERGE resolution', async () => {
      const entries: SyncTimeEntryInput[] = [
        {
          id: 'entry-1',
          date: '2024-04-12',
          clientName: 'Client A',
          description: 'Updated work',
          inTime1: '09:00',
          outTime1: '17:00',
          totalHours: 8,
          operation: SyncOperation.UPDATE,
          lastSyncedAt: new Date('2024-04-12T10:00:00Z'),
          resolution: ConflictResolutionStrategy.MANUAL_MERGE,
        },
      ];

      const mockTimeEntry = {
        id: 'entry-1',
        consultantId: mockUserId,
        updatedAt: new Date('2024-04-12T11:00:00Z'), // After lastSyncedAt - conflict!
      };

      mockPrismaService.timeEntry.findFirst.mockResolvedValue(mockTimeEntry);
      mockPrismaService.syncLog.create.mockResolvedValue({} as any);

      const result = await service.syncTimeEntries(mockUserId, entries, mockDeviceId);

      expect(result.successful).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].hasConflict).toBe(true);
    });

    it('should handle errors gracefully and continue processing', async () => {
      const entries: SyncTimeEntryInput[] = [
        {
          date: '2024-04-12',
          clientName: 'Client A',
          description: 'Work done',
          inTime1: '09:00',
          outTime1: '17:00',
          totalHours: 8,
          operation: SyncOperation.CREATE,
        },
        {
          date: '2024-04-13',
          clientName: 'Client B',
          description: 'More work',
          inTime1: '10:00',
          outTime1: '18:00',
          totalHours: 8,
          operation: SyncOperation.CREATE,
        },
      ];

      const mockCreatedEntry = { id: 'entry-2', consultantId: mockUserId };

      // Mock transaction - first fails, second succeeds
      const mockTx1 = {
        timeEntry: { create: jest.fn() },
        syncLog: { create: jest.fn() },
      };
      const mockTx2 = {
        timeEntry: { create: jest.fn() },
        syncLog: { create: jest.fn() },
      };

      mockTx1.timeEntry.create.mockRejectedValue(new Error('Validation failed'));
      mockTx2.timeEntry.create.mockResolvedValue(mockCreatedEntry);
      mockTx2.syncLog.create.mockResolvedValue({} as any);

      mockPrismaService.$transaction
        .mockImplementationOnce((callback: any) => callback(mockTx1))
        .mockImplementationOnce((callback: any) => callback(mockTx2));

      const result = await service.syncTimeEntries(mockUserId, entries, mockDeviceId);

      expect(result.successful).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain('Validation failed');
    });
  });

  describe('syncETOTransactions', () => {
    it('should successfully sync CREATE operation', async () => {
      const transactions: SyncETOTransactionInput[] = [
        {
          date: '2024-04-12',
          hours: 8,
          transactionType: 'Usage',
          description: 'ETO usage',
          projectName: 'Project A',
          operation: SyncOperation.CREATE,
        },
      ];

      const mockCreatedTransaction = { id: 'eto-1', consultantId: mockUserId };
      mockETOService.useETO.mockResolvedValue(mockCreatedTransaction);
      mockPrismaService.syncLog.create.mockResolvedValue({} as any);

      const result = await service.syncETOTransactions(mockUserId, transactions, mockDeviceId);

      expect(result.successful).toBe(1);
      expect(result.failed).toBe(0);
      expect(mockETOService.useETO).toHaveBeenCalledWith(mockUserId, {
        hours: 8,
        date: '2024-04-12',
        description: 'ETO usage',
        projectName: 'Project A',
      });
    });

    it('should reject DELETE operation for ETO transactions', async () => {
      const transactions: SyncETOTransactionInput[] = [
        {
          id: 'eto-1',
          date: '2024-04-12',
          hours: 8,
          transactionType: 'Usage',
          operation: SyncOperation.DELETE,
        },
      ];

      mockPrismaService.syncLog.create.mockResolvedValue({} as any);

      const result = await service.syncETOTransactions(mockUserId, transactions, mockDeviceId);

      expect(result.successful).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors[0].error).toContain('cannot be deleted');
    });

    it('should reject UPDATE operation for ETO transactions', async () => {
      const transactions: SyncETOTransactionInput[] = [
        {
          id: 'eto-1',
          date: '2024-04-12',
          hours: 8,
          transactionType: 'Usage',
          operation: SyncOperation.UPDATE,
          lastSyncedAt: new Date('2024-04-12T10:00:00Z'),
        },
      ];

      const mockETOTransaction = {
        id: 'eto-1',
        consultantId: mockUserId,
        createdAt: new Date('2024-04-12T09:00:00Z'), // Before lastSyncedAt - no conflict
      };

      mockPrismaService.eTOTransaction.findFirst.mockResolvedValue(mockETOTransaction);
      mockPrismaService.syncLog.create.mockResolvedValue({} as any);

      const result = await service.syncETOTransactions(mockUserId, transactions, mockDeviceId);

      expect(result.successful).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors[0].error).toContain('cannot be updated');
    });
  });

  describe('syncTimesheetSubmissions', () => {
    it('should successfully sync CREATE operation', async () => {
      const submissions: SyncTimesheetSubmissionInput[] = [
        {
          payPeriodId: 'period-1',
          status: 'draft',
          operation: SyncOperation.CREATE,
        },
      ];

      const mockCreatedSubmission = { id: 'submission-1', consultantId: mockUserId };

      // Mock transaction to execute callback with mocked tx client
      const mockTx = {
        timesheetSubmission: {
          findUnique: jest.fn(),
          create: jest.fn(),
        },
        syncLog: { create: jest.fn() },
      };

      mockTx.timesheetSubmission.findUnique.mockResolvedValue(null); // Not exists
      mockTx.timesheetSubmission.create.mockResolvedValue(mockCreatedSubmission);
      mockTx.syncLog.create.mockResolvedValue({} as any);

      mockPrismaService.$transaction.mockImplementation((callback: any) => callback(mockTx));

      const result = await service.syncTimesheetSubmissions(mockUserId, submissions, mockDeviceId);

      expect(result.successful).toBe(1);
      expect(result.failed).toBe(0);
      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1);
      expect(mockTx.timesheetSubmission.create).toHaveBeenCalledWith({
        data: {
          consultantId: mockUserId,
          payPeriodId: 'period-1',
          status: 'draft',
          submittedAt: undefined,
          comments: undefined,
        },
      });
    });

    it('should reject CREATE if submission already exists', async () => {
      const submissions: SyncTimesheetSubmissionInput[] = [
        {
          payPeriodId: 'period-1',
          status: 'draft',
          operation: SyncOperation.CREATE,
        },
      ];

      const mockExistingSubmission = { id: 'submission-1', consultantId: mockUserId };

      // Mock transaction to execute callback with mocked tx client
      const mockTx = {
        timesheetSubmission: {
          findUnique: jest.fn(),
          create: jest.fn(),
        },
        syncLog: { create: jest.fn() },
      };

      mockTx.timesheetSubmission.findUnique.mockResolvedValue(mockExistingSubmission);

      mockPrismaService.$transaction.mockImplementation((callback: any) => callback(mockTx));

      const result = await service.syncTimesheetSubmissions(mockUserId, submissions, mockDeviceId);

      expect(result.successful).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors[0].error).toContain('already exists');
    });

    it('should successfully sync UPDATE operation', async () => {
      const submissions: SyncTimesheetSubmissionInput[] = [
        {
          id: 'submission-1',
          payPeriodId: 'period-1',
          status: 'submitted',
          comments: 'Updated comments',
          operation: SyncOperation.UPDATE,
        },
      ];

      const mockUpdatedSubmission = { id: 'submission-1', consultantId: mockUserId };

      // Mock transaction to execute callback with mocked tx client
      const mockTx = {
        timesheetSubmission: {
          update: jest.fn(),
        },
        syncLog: { create: jest.fn() },
      };

      mockTx.timesheetSubmission.update.mockResolvedValue(mockUpdatedSubmission);
      mockTx.syncLog.create.mockResolvedValue({} as any);

      mockPrismaService.$transaction.mockImplementation((callback: any) => callback(mockTx));

      const result = await service.syncTimesheetSubmissions(mockUserId, submissions, mockDeviceId);

      expect(result.successful).toBe(1);
      expect(result.failed).toBe(0);
      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1);
      expect(mockTx.timesheetSubmission.update).toHaveBeenCalledWith({
        where: {
          id: 'submission-1',
          consultantId: mockUserId,
        },
        data: {
          comments: 'Updated comments',
          submittedAt: undefined,
          status: 'submitted',
        },
      });
    });

    it('should reject DELETE operation for timesheet submissions', async () => {
      const submissions: SyncTimesheetSubmissionInput[] = [
        {
          id: 'submission-1',
          payPeriodId: 'period-1',
          status: 'draft',
          operation: SyncOperation.DELETE,
        },
      ];

      mockPrismaService.syncLog.create.mockResolvedValue({} as any);

      const result = await service.syncTimesheetSubmissions(mockUserId, submissions, mockDeviceId);

      expect(result.successful).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors[0].error).toContain('cannot be deleted');
    });
  });
});
