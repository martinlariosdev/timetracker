import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SyncService } from './sync.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSyncLogInput, SyncFilterInput, SyncEntityType, SyncOperationType } from './dto';

describe('SyncService', () => {
  let service: SyncService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    syncLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
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
      ],
    }).compile();

    service = module.get<SyncService>(SyncService);
    prismaService = module.get<PrismaService>(PrismaService);

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

    it('should throw BadRequestException when Prisma create fails', async () => {
      const input: CreateSyncLogInput = {
        deviceId: mockDeviceId,
        entityType: SyncEntityType.TIME_ENTRY,
        operation: SyncOperationType.CREATE,
        entityId: 'time-entry-123',
      };

      mockPrismaService.syncLog.create.mockRejectedValue(new Error('Database connection error'));

      await expect(service.createSyncLog(mockUserId, input)).rejects.toThrow(BadRequestException);
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

      const result = await service.getSyncLogs(mockUserId, mockDeviceId);

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

      const result = await service.getSyncLogs(mockUserId, undefined, filters);

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

      const result = await service.getSyncLogs(mockUserId, undefined, filters);

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

    it('should throw BadRequestException when Prisma findMany fails', async () => {
      mockPrismaService.syncLog.findMany.mockRejectedValue(new Error('Database connection error'));

      await expect(service.getSyncLogs(mockUserId)).rejects.toThrow(BadRequestException);
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

    it('should throw BadRequestException when Prisma findMany fails', async () => {
      mockPrismaService.syncLog.findMany.mockRejectedValue(new Error('Database connection error'));

      await expect(service.getFailedSyncLogs(mockUserId)).rejects.toThrow(BadRequestException);
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
      });
    });

    it('should throw BadRequestException when required fields are missing', async () => {
      await expect(service.getSyncLogsByEntity('', 'TimeEntry', 'entity-123')).rejects.toThrow(BadRequestException);
      await expect(service.getSyncLogsByEntity('', 'TimeEntry', 'entity-123')).rejects.toThrow('User ID, entity type, and entity ID are required');

      await expect(service.getSyncLogsByEntity(mockUserId, '', 'entity-123')).rejects.toThrow(BadRequestException);
      await expect(service.getSyncLogsByEntity(mockUserId, 'TimeEntry', '')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when Prisma findMany fails', async () => {
      mockPrismaService.syncLog.findMany.mockRejectedValue(new Error('Database connection error'));

      await expect(service.getSyncLogsByEntity(mockUserId, 'TimeEntry', 'entity-123')).rejects.toThrow(BadRequestException);
      await expect(service.getSyncLogsByEntity(mockUserId, 'TimeEntry', 'entity-123')).rejects.toThrow('Failed to retrieve sync logs for entity');
    });
  });
});
