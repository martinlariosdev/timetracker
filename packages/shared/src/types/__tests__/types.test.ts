import {
  TimeEntry,
  CreateTimeEntryInput,
  UpdateTimeEntryInput,
  TimesheetSummary,
  Consultant,
  TeamLead,
  PayPeriod,
  PayPeriodWithStats,
  PaginationInput,
  PaginatedResponse,
  AuthTokens,
  UserSession,
  SyncQueueItem,
  SyncConflict,
} from '../index';

describe('Type Definitions', () => {
  describe('TimeEntry', () => {
    test('should compile TimeEntry type with all fields', () => {
      const entry: TimeEntry = {
        id: 1,
        consultantId: 24563,
        date: '2026-04-10',
        payPeriodId: 741,
        projectTaskNumber: null,
        clientName: 'Aderant',
        description: 'Worked on PR #123',
        inTime1: '08:00',
        outTime1: '12:00',
        inTime2: '13:00',
        outTime2: '17:00',
        totalHours: 8.0,
        createdAt: new Date('2026-04-10T10:00:00Z'),
        updatedAt: null,
        synced: true,
      };

      expect(entry.id).toBe(1);
      expect(entry.consultantId).toBe(24563);
      expect(entry.date).toBe('2026-04-10');
      expect(entry.totalHours).toBe(8.0);
      expect(entry.synced).toBe(true);
    });

    test('should compile TimeEntry with optional localId for offline entries', () => {
      const entry: TimeEntry = {
        id: 'local-123',
        consultantId: 24563,
        date: '2026-04-10',
        payPeriodId: 741,
        projectTaskNumber: null,
        clientName: 'Aderant',
        description: 'Offline entry',
        inTime1: '08:00',
        outTime1: '12:00',
        inTime2: null,
        outTime2: null,
        totalHours: 4.0,
        createdAt: new Date(),
        updatedAt: null,
        synced: false,
        localId: 'local-123',
      };

      expect(entry.localId).toBe('local-123');
      expect(entry.synced).toBe(false);
    });

    test('should compile CreateTimeEntryInput type', () => {
      const input: CreateTimeEntryInput = {
        consultantId: 24563,
        date: '2026-04-10',
        payPeriodId: 741,
        clientName: 'Aderant',
        description: 'Worked on PR #123',
        inTime1: '08:00',
        outTime1: '12:00',
        inTime2: '13:00',
        outTime2: '17:00',
      };

      expect(input.consultantId).toBe(24563);
    });

    test('should compile UpdateTimeEntryInput type', () => {
      const input: UpdateTimeEntryInput = {
        id: 1,
        consultantId: 24563,
        date: '2026-04-10',
        payPeriodId: 741,
        clientName: 'Aderant',
        description: 'Updated description',
        inTime1: '08:00',
        outTime1: '12:00',
      };

      expect(input.id).toBe(1);
      expect(input.description).toBe('Updated description');
    });

    test('should compile TimesheetSummary type', () => {
      const summary: TimesheetSummary = {
        periodId: 741,
        totalRegularHours: 56.0,
        convertedETOHours: 0.0,
        usedETOHours: 0.0,
        totalHours: 56.0,
        etoHoursRemaining: 33.92,
        pendingDays: 4,
        status: 'DRAFT',
      };

      expect(summary.periodId).toBe(741);
      expect(summary.totalRegularHours).toBe(56.0);
      expect(summary.status).toBe('DRAFT');
    });
  });

  describe('Consultant', () => {
    test('should compile Consultant type', () => {
      const consultant: Consultant = {
        id: 24563,
        name: 'Martin Larios',
        email: 'martin.larios@softwaremind.com',
        teamLeadId: 12345,
        teamLeadName: 'Alessandro Silveira',
        teamLeadEmail: 'alessandro.silveira@softwaremind.com',
        etoBalance: 33.92,
        workingHoursPerPeriod: 80,
        paymentType: 'Hourly',
      };

      expect(consultant.id).toBe(24563);
      expect(consultant.name).toBe('Martin Larios');
      expect(consultant.paymentType).toBe('Hourly');
    });

    test('should compile TeamLead type', () => {
      const teamLead: TeamLead = {
        id: 12345,
        name: 'Alessandro Silveira',
        email: 'alessandro.silveira@softwaremind.com',
      };

      expect(teamLead.id).toBe(12345);
      expect(teamLead.name).toBe('Alessandro Silveira');
    });
  });

  describe('PayPeriod', () => {
    test('should compile PayPeriod type', () => {
      const period: PayPeriod = {
        id: 741,
        startDate: '2026-04-01',
        endDate: '2026-04-15',
        displayText: '04/01/2026 - 04/15/2026',
        isCurrent: true,
      };

      expect(period.id).toBe(741);
      expect(period.isCurrent).toBe(true);
    });

    test('should compile PayPeriodWithStats type', () => {
      const periodWithStats: PayPeriodWithStats = {
        id: 741,
        startDate: '2026-04-01',
        endDate: '2026-04-15',
        displayText: '04/01/2026 - 04/15/2026',
        isCurrent: true,
        totalHours: 56.0,
        totalEntries: 7,
        status: 'DRAFT',
      };

      expect(periodWithStats.totalHours).toBe(56.0);
      expect(periodWithStats.totalEntries).toBe(7);
    });
  });

  describe('Common Types', () => {
    test('should compile PaginationInput type', () => {
      const pagination: PaginationInput = {
        page: 1,
        limit: 20,
        sortBy: 'date',
        sortOrder: 'desc',
      };

      expect(pagination.page).toBe(1);
      expect(pagination.limit).toBe(20);
    });

    test('should compile PaginatedResponse type', () => {
      const response: PaginatedResponse<TimeEntry> = {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      expect(response.data).toEqual([]);
      expect(response.total).toBe(0);
    });

    test('should compile AuthTokens type', () => {
      const tokens: AuthTokens = {
        accessToken: 'eyJhbGc...',
        idToken: 'eyJhbGc...',
        refreshToken: 'refresh-token',
        expiresAt: Date.now() + 3600000,
      };

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.expiresAt).toBeGreaterThan(Date.now());
    });

    test('should compile UserSession type', () => {
      const session: UserSession = {
        consultantId: 24563,
        name: 'Martin Larios',
        email: 'martin.larios@softwaremind.com',
        tokens: {
          accessToken: 'eyJhbGc...',
          idToken: 'eyJhbGc...',
          refreshToken: 'refresh-token',
          expiresAt: Date.now() + 3600000,
        },
      };

      expect(session.consultantId).toBe(24563);
      expect(session.tokens.accessToken).toBeDefined();
    });

    test('should compile SyncQueueItem type', () => {
      const queueItem: SyncQueueItem = {
        id: 'queue-1',
        entityType: 'TimeEntry',
        operation: 'CREATE',
        data: {},
        retryCount: 0,
        createdAt: new Date(),
        error: null,
      };

      expect(queueItem.entityType).toBe('TimeEntry');
      expect(queueItem.operation).toBe('CREATE');
      expect(queueItem.retryCount).toBe(0);
    });

    test('should compile SyncConflict type', () => {
      const conflict: SyncConflict = {
        id: 'conflict-1',
        entityType: 'TimeEntry',
        entityId: 1,
        localVersion: {},
        serverVersion: {},
        resolvedAt: null,
        resolution: null,
      };

      expect(conflict.entityType).toBe('TimeEntry');
      expect(conflict.entityId).toBe(1);
    });
  });
});
