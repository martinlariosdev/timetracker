import { Test, TestingModule } from '@nestjs/testing';
import { SyncResolver } from './sync.resolver';
import { SyncService } from './sync.service';
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
import type { Consultant } from '../generated';

describe('SyncResolver', () => {
  let resolver: SyncResolver;
  let syncService: SyncService;

  const mockSyncService = {
    createSyncLog: jest.fn(),
    getSyncLogs: jest.fn(),
    getFailedSyncLogs: jest.fn(),
    detectConflict: jest.fn(),
    resolveConflict: jest.fn(),
    syncTimeEntries: jest.fn(),
    syncETOTransactions: jest.fn(),
    syncTimesheetSubmissions: jest.fn(),
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

  describe('checkConflict', () => {
    const entityType = SyncEntityType.TIME_ENTRY;
    const entityId = 'time-entry-123';
    const lastSyncedAt = new Date('2024-04-12T10:00:00Z');

    it('should detect conflict and return ConflictInfo', async () => {
      const mockConflictInfo = {
        hasConflict: true,
        serverVersion: {
          id: entityId,
          consultantId: mockUser.id,
          date: new Date('2024-04-12'),
          totalHours: 8,
          updatedAt: new Date('2024-04-12T11:00:00Z'),
        },
        clientVersion: null,
        serverUpdatedAt: new Date('2024-04-12T11:00:00Z'),
        clientLastSyncedAt: lastSyncedAt,
        conflictDetails: 'Server data was modified after client\'s last sync',
      };

      mockSyncService.detectConflict.mockResolvedValue(mockConflictInfo);

      const result = await resolver.checkConflict(entityType, entityId, lastSyncedAt, mockUser);

      expect(result).toEqual(mockConflictInfo);
      expect(mockSyncService.detectConflict).toHaveBeenCalledWith(
        mockUser.id,
        entityType,
        entityId,
        lastSyncedAt,
      );
    });

    it('should return no conflict when entity not modified', async () => {
      const mockConflictInfo = {
        hasConflict: false,
        serverVersion: null,
        clientVersion: null,
        serverUpdatedAt: null,
        clientLastSyncedAt: null,
        conflictDetails: null,
      };

      mockSyncService.detectConflict.mockResolvedValue(mockConflictInfo);

      const result = await resolver.checkConflict(entityType, entityId, lastSyncedAt, mockUser);

      expect(result.hasConflict).toBe(false);
      expect(result.serverVersion).toBeNull();
      expect(mockSyncService.detectConflict).toHaveBeenCalledWith(
        mockUser.id,
        entityType,
        entityId,
        lastSyncedAt,
      );
    });

    it('should check conflict for ETO transaction', async () => {
      const etoType = SyncEntityType.ETO_TRANSACTION;
      const etoId = 'eto-123';

      const mockConflictInfo = {
        hasConflict: true,
        serverVersion: {
          id: etoId,
          consultantId: mockUser.id,
          hours: 8,
          createdAt: new Date('2024-04-12T11:00:00Z'),
        },
        clientVersion: null,
        serverUpdatedAt: new Date('2024-04-12T11:00:00Z'),
        clientLastSyncedAt: lastSyncedAt,
        conflictDetails: 'Server data was modified after client\'s last sync',
      };

      mockSyncService.detectConflict.mockResolvedValue(mockConflictInfo);

      const result = await resolver.checkConflict(etoType, etoId, lastSyncedAt, mockUser);

      expect(result.hasConflict).toBe(true);
      expect(mockSyncService.detectConflict).toHaveBeenCalledWith(
        mockUser.id,
        etoType,
        etoId,
        lastSyncedAt,
      );
    });
  });

  describe('resolveConflict', () => {
    const entityId = 'time-entry-123';

    it('should resolve conflict with SERVER_WINS strategy', async () => {
      const input: ResolveConflictInput = {
        entityType: SyncEntityType.TIME_ENTRY,
        entityId,
        strategy: ConflictResolutionStrategy.SERVER_WINS,
      };

      const mockResolvedConflict = {
        success: true,
        finalData: {
          id: entityId,
          consultantId: mockUser.id,
          date: new Date('2024-04-12'),
          totalHours: 8,
          description: 'Server version',
        },
        strategy: ConflictResolutionStrategy.SERVER_WINS,
        message: 'Server data preserved, client changes discarded',
      };

      mockSyncService.resolveConflict.mockResolvedValue(mockResolvedConflict);

      const result = await resolver.resolveConflict(input, mockUser);

      expect(result).toEqual(mockResolvedConflict);
      expect(result.success).toBe(true);
      expect(result.strategy).toBe(ConflictResolutionStrategy.SERVER_WINS);
      expect(mockSyncService.resolveConflict).toHaveBeenCalledWith(mockUser.id, input);
    });

    it('should resolve conflict with CLIENT_WINS strategy', async () => {
      const clientData = {
        id: entityId,
        consultantId: mockUser.id,
        date: new Date('2024-04-12'),
        totalHours: 9,
        description: 'Client version',
      };

      const input: ResolveConflictInput = {
        entityType: SyncEntityType.TIME_ENTRY,
        entityId,
        strategy: ConflictResolutionStrategy.CLIENT_WINS,
        clientData,
      };

      const mockResolvedConflict = {
        success: true,
        finalData: clientData,
        strategy: ConflictResolutionStrategy.CLIENT_WINS,
        message: 'Client data applied, server changes overwritten',
      };

      mockSyncService.resolveConflict.mockResolvedValue(mockResolvedConflict);

      const result = await resolver.resolveConflict(input, mockUser);

      expect(result).toEqual(mockResolvedConflict);
      expect(result.success).toBe(true);
      expect(result.strategy).toBe(ConflictResolutionStrategy.CLIENT_WINS);
      expect(mockSyncService.resolveConflict).toHaveBeenCalledWith(mockUser.id, input);
    });

    it('should resolve conflict with MANUAL_MERGE strategy', async () => {
      const serverData = {
        id: entityId,
        consultantId: mockUser.id,
        date: new Date('2024-04-12'),
        totalHours: 8,
        description: 'Server version',
      };

      const clientData = {
        id: entityId,
        consultantId: mockUser.id,
        date: new Date('2024-04-12'),
        totalHours: 9,
        description: 'Client version',
      };

      const input: ResolveConflictInput = {
        entityType: SyncEntityType.TIME_ENTRY,
        entityId,
        strategy: ConflictResolutionStrategy.MANUAL_MERGE,
        clientData,
      };

      const mockResolvedConflict = {
        success: true,
        finalData: {
          serverVersion: serverData,
          clientVersion: clientData,
        },
        strategy: ConflictResolutionStrategy.MANUAL_MERGE,
        message: 'Manual merge required - both versions returned for client handling',
      };

      mockSyncService.resolveConflict.mockResolvedValue(mockResolvedConflict);

      const result = await resolver.resolveConflict(input, mockUser);

      expect(result).toEqual(mockResolvedConflict);
      expect(result.success).toBe(true);
      expect(result.strategy).toBe(ConflictResolutionStrategy.MANUAL_MERGE);
      expect(result.finalData).toHaveProperty('serverVersion');
      expect(result.finalData).toHaveProperty('clientVersion');
      expect(mockSyncService.resolveConflict).toHaveBeenCalledWith(mockUser.id, input);
    });

    it('should resolve conflict for ETO transaction', async () => {
      const etoId = 'eto-123';

      const input: ResolveConflictInput = {
        entityType: SyncEntityType.ETO_TRANSACTION,
        entityId: etoId,
        strategy: ConflictResolutionStrategy.SERVER_WINS,
      };

      const mockResolvedConflict = {
        success: true,
        finalData: {
          id: etoId,
          consultantId: mockUser.id,
          hours: 8,
          transactionType: 'Accrual',
          createdAt: new Date('2024-04-12T11:00:00Z'),
        },
        strategy: ConflictResolutionStrategy.SERVER_WINS,
        message: 'Server data preserved, client changes discarded',
      };

      mockSyncService.resolveConflict.mockResolvedValue(mockResolvedConflict);

      const result = await resolver.resolveConflict(input, mockUser);

      expect(result.success).toBe(true);
      expect(result.finalData).toHaveProperty('id', etoId);
      expect(mockSyncService.resolveConflict).toHaveBeenCalledWith(mockUser.id, input);
    });

    it('should resolve conflict for Timesheet Submission', async () => {
      const submissionId = 'submission-123';

      const input: ResolveConflictInput = {
        entityType: SyncEntityType.TIMESHEET_SUBMISSION,
        entityId: submissionId,
        strategy: ConflictResolutionStrategy.SERVER_WINS,
      };

      const mockResolvedConflict = {
        success: true,
        finalData: {
          id: submissionId,
          consultantId: mockUser.id,
          status: 'submitted',
          updatedAt: new Date('2024-04-12T11:00:00Z'),
        },
        strategy: ConflictResolutionStrategy.SERVER_WINS,
        message: 'Server data preserved, client changes discarded',
      };

      mockSyncService.resolveConflict.mockResolvedValue(mockResolvedConflict);

      const result = await resolver.resolveConflict(input, mockUser);

      expect(result.success).toBe(true);
      expect(result.finalData).toHaveProperty('status', 'submitted');
      expect(mockSyncService.resolveConflict).toHaveBeenCalledWith(mockUser.id, input);
    });
  });

  describe('syncTimeEntries', () => {
    it('should sync multiple time entries successfully', async () => {
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

      const mockResult = {
        successful: 2,
        failed: 0,
        conflicts: [],
        errors: [],
      };

      mockSyncService.syncTimeEntries.mockResolvedValue(mockResult);

      const result = await resolver.syncTimeEntries(entries, mockDeviceId, mockUser);

      expect(result).toEqual(mockResult);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
      expect(mockSyncService.syncTimeEntries).toHaveBeenCalledWith(mockUser.id, entries, mockDeviceId);
    });

    it('should handle partial failures in batch sync', async () => {
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

      const mockResult = {
        successful: 1,
        failed: 1,
        conflicts: [],
        errors: [
          {
            entityId: 'temp-123',
            entityType: 'TimeEntry',
            operation: 'CREATE',
            error: 'Validation failed',
          },
        ],
      };

      mockSyncService.syncTimeEntries.mockResolvedValue(mockResult);

      const result = await resolver.syncTimeEntries(entries, mockDeviceId, mockUser);

      expect(result.successful).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(mockSyncService.syncTimeEntries).toHaveBeenCalledWith(mockUser.id, entries, mockDeviceId);
    });

    it('should handle conflicts in batch sync', async () => {
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

      const mockResult = {
        successful: 0,
        failed: 1,
        conflicts: [
          {
            hasConflict: true,
            serverVersion: { id: 'entry-1', totalHours: 9 },
            clientVersion: null,
            serverUpdatedAt: new Date('2024-04-12T11:00:00Z'),
            clientLastSyncedAt: new Date('2024-04-12T10:00:00Z'),
            conflictDetails: 'Server data was modified after client\'s last sync',
          },
        ],
        errors: [],
      };

      mockSyncService.syncTimeEntries.mockResolvedValue(mockResult);

      const result = await resolver.syncTimeEntries(entries, mockDeviceId, mockUser);

      expect(result.successful).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].hasConflict).toBe(true);
      expect(mockSyncService.syncTimeEntries).toHaveBeenCalledWith(mockUser.id, entries, mockDeviceId);
    });
  });

  describe('syncETOTransactions', () => {
    it('should sync ETO transactions successfully', async () => {
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

      const mockResult = {
        successful: 1,
        failed: 0,
        conflicts: [],
        errors: [],
      };

      mockSyncService.syncETOTransactions.mockResolvedValue(mockResult);

      const result = await resolver.syncETOTransactions(transactions, mockDeviceId, mockUser);

      expect(result).toEqual(mockResult);
      expect(result.successful).toBe(1);
      expect(mockSyncService.syncETOTransactions).toHaveBeenCalledWith(
        mockUser.id,
        transactions,
        mockDeviceId,
      );
    });

    it('should handle ETO transaction sync errors', async () => {
      const transactions: SyncETOTransactionInput[] = [
        {
          date: '2024-04-12',
          hours: 100,
          transactionType: 'Usage',
          operation: SyncOperation.CREATE,
        },
      ];

      const mockResult = {
        successful: 0,
        failed: 1,
        conflicts: [],
        errors: [
          {
            entityId: 'temp-123',
            entityType: 'ETOTransaction',
            operation: 'CREATE',
            error: 'Insufficient ETO balance',
          },
        ],
      };

      mockSyncService.syncETOTransactions.mockResolvedValue(mockResult);

      const result = await resolver.syncETOTransactions(transactions, mockDeviceId, mockUser);

      expect(result.successful).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(mockSyncService.syncETOTransactions).toHaveBeenCalledWith(
        mockUser.id,
        transactions,
        mockDeviceId,
      );
    });
  });

  describe('syncTimesheetSubmissions', () => {
    it('should sync timesheet submissions successfully', async () => {
      const submissions: SyncTimesheetSubmissionInput[] = [
        {
          payPeriodId: 'period-1',
          status: 'draft',
          comments: 'Initial draft',
          operation: SyncOperation.CREATE,
        },
      ];

      const mockResult = {
        successful: 1,
        failed: 0,
        conflicts: [],
        errors: [],
      };

      mockSyncService.syncTimesheetSubmissions.mockResolvedValue(mockResult);

      const result = await resolver.syncTimesheetSubmissions(submissions, mockDeviceId, mockUser);

      expect(result).toEqual(mockResult);
      expect(result.successful).toBe(1);
      expect(mockSyncService.syncTimesheetSubmissions).toHaveBeenCalledWith(
        mockUser.id,
        submissions,
        mockDeviceId,
      );
    });

    it('should handle submission sync errors', async () => {
      const submissions: SyncTimesheetSubmissionInput[] = [
        {
          payPeriodId: 'period-1',
          status: 'submitted',
          operation: SyncOperation.CREATE,
        },
      ];

      const mockResult = {
        successful: 0,
        failed: 1,
        conflicts: [],
        errors: [
          {
            entityId: 'temp-123',
            entityType: 'TimesheetSubmission',
            operation: 'CREATE',
            error: 'Submission already exists for pay period period-1',
          },
        ],
      };

      mockSyncService.syncTimesheetSubmissions.mockResolvedValue(mockResult);

      const result = await resolver.syncTimesheetSubmissions(submissions, mockDeviceId, mockUser);

      expect(result.successful).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(mockSyncService.syncTimesheetSubmissions).toHaveBeenCalledWith(
        mockUser.id,
        submissions,
        mockDeviceId,
      );
    });
  });
});
