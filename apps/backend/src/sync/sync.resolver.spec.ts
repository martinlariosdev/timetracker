import { Test, TestingModule } from '@nestjs/testing';
import { SyncResolver } from './sync.resolver';
import { SyncService } from './sync.service';
import { CreateSyncLogInput, SyncFilterInput, SyncEntityType, SyncOperationType } from './dto';
import type { Consultant } from '../generated';

describe('SyncResolver', () => {
  let resolver: SyncResolver;
  let syncService: SyncService;

  const mockSyncService = {
    createSyncLog: jest.fn(),
    getSyncLogs: jest.fn(),
    getFailedSyncLogs: jest.fn(),
  };

  const mockUser = {
    id: '507f1f77bcf86cd799439011',
    externalId: 'EXT-001',
    name: 'John Doe',
    email: 'john@example.com',
    etoBalance: 40.0,
    teamLeadId: null,
    teamLeadName: null,
    teamLeadEmail: null,
    workingHoursPerPeriod: 88,
    paymentType: 'Hourly',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  } as Consultant;

  const mockDeviceId = 'device-abc-123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncResolver,
        {
          provide: SyncService,
          useValue: mockSyncService,
        },
      ],
    }).compile();

    resolver = module.get<SyncResolver>(SyncResolver);
    syncService = module.get<SyncService>(SyncService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('logSync', () => {
    it('should create a sync log entry', async () => {
      const input: CreateSyncLogInput = {
        deviceId: mockDeviceId,
        entityType: SyncEntityType.TIME_ENTRY,
        operation: SyncOperationType.CREATE,
        entityId: 'time-entry-123',
        success: true,
      };

      const mockSyncLog = {
        id: 'sync-log-1',
        userId: mockUser.id,
        deviceId: mockDeviceId,
        entityType: 'TimeEntry',
        operation: 'create',
        entityId: 'time-entry-123',
        syncedAt: new Date('2024-04-12'),
        success: true,
        error: null,
      };

      mockSyncService.createSyncLog.mockResolvedValue(mockSyncLog);

      const result = await resolver.logSync(input, mockUser);

      expect(result).toEqual(mockSyncLog);
      expect(mockSyncService.createSyncLog).toHaveBeenCalledWith(mockUser.id, input);
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
        userId: mockUser.id,
        deviceId: mockDeviceId,
        entityType: 'ETOTransaction',
        operation: 'update',
        entityId: 'eto-123',
        syncedAt: new Date('2024-04-12'),
        success: false,
        error: 'Network timeout',
      };

      mockSyncService.createSyncLog.mockResolvedValue(mockSyncLog);

      const result = await resolver.logSync(input, mockUser);

      expect(result).toEqual(mockSyncLog);
      expect(mockSyncService.createSyncLog).toHaveBeenCalledWith(mockUser.id, input);
    });
  });

  describe('syncLogs', () => {
    it('should return sync logs for current user without filters', async () => {
      const mockSyncLogs = [
        {
          id: 'sync-log-1',
          userId: mockUser.id,
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
          userId: mockUser.id,
          deviceId: mockDeviceId,
          entityType: 'ETOTransaction',
          operation: 'update',
          entityId: 'eto-123',
          syncedAt: new Date('2024-04-11'),
          success: false,
          error: 'Network error',
        },
      ];

      mockSyncService.getSyncLogs.mockResolvedValue(mockSyncLogs);

      const result = await resolver.syncLogs(mockUser, undefined);

      expect(result).toEqual(mockSyncLogs);
      expect(mockSyncService.getSyncLogs).toHaveBeenCalledWith(mockUser.id, undefined);
    });

    it('should return sync logs with filters', async () => {
      const filters: SyncFilterInput = {
        entityType: SyncEntityType.TIME_ENTRY,
        operation: SyncOperationType.CREATE,
        onlyFailed: false,
      };

      const mockSyncLogs = [
        {
          id: 'sync-log-1',
          userId: mockUser.id,
          deviceId: mockDeviceId,
          entityType: 'TimeEntry',
          operation: 'create',
          entityId: 'time-entry-123',
          syncedAt: new Date('2024-04-12'),
          success: true,
          error: null,
        },
      ];

      mockSyncService.getSyncLogs.mockResolvedValue(mockSyncLogs);

      const result = await resolver.syncLogs(mockUser, filters);

      expect(result).toEqual(mockSyncLogs);
      expect(mockSyncService.getSyncLogs).toHaveBeenCalledWith(mockUser.id, filters);
    });

    it('should return only failed syncs when onlyFailed filter is true', async () => {
      const filters: SyncFilterInput = {
        onlyFailed: true,
      };

      const mockFailedSyncLogs = [
        {
          id: 'sync-log-2',
          userId: mockUser.id,
          deviceId: mockDeviceId,
          entityType: 'ETOTransaction',
          operation: 'update',
          entityId: 'eto-123',
          syncedAt: new Date('2024-04-11'),
          success: false,
          error: 'Network error',
        },
      ];

      mockSyncService.getSyncLogs.mockResolvedValue(mockFailedSyncLogs);

      const result = await resolver.syncLogs(mockUser, filters);

      expect(result).toEqual(mockFailedSyncLogs);
      expect(mockSyncService.getSyncLogs).toHaveBeenCalledWith(mockUser.id, filters);
    });
  });

  describe('failedSyncs', () => {
    it('should return only failed syncs for current user', async () => {
      const mockFailedSyncLogs = [
        {
          id: 'sync-log-2',
          userId: mockUser.id,
          deviceId: mockDeviceId,
          entityType: 'ETOTransaction',
          operation: 'update',
          entityId: 'eto-123',
          syncedAt: new Date('2024-04-11'),
          success: false,
          error: 'Network error',
        },
        {
          id: 'sync-log-3',
          userId: mockUser.id,
          deviceId: 'device-xyz-456',
          entityType: 'TimeEntry',
          operation: 'create',
          entityId: 'time-entry-456',
          syncedAt: new Date('2024-04-10'),
          success: false,
          error: 'Server error',
        },
      ];

      mockSyncService.getFailedSyncLogs.mockResolvedValue(mockFailedSyncLogs);

      const result = await resolver.failedSyncs(mockUser);

      expect(result).toEqual(mockFailedSyncLogs);
      expect(mockSyncService.getFailedSyncLogs).toHaveBeenCalledWith(mockUser.id);
    });

    it('should return empty array if no failed syncs exist', async () => {
      mockSyncService.getFailedSyncLogs.mockResolvedValue([]);

      const result = await resolver.failedSyncs(mockUser);

      expect(result).toEqual([]);
      expect(mockSyncService.getFailedSyncLogs).toHaveBeenCalledWith(mockUser.id);
    });
  });
});
