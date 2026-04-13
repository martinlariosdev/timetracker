import { Test, TestingModule } from '@nestjs/testing';
import { ETOResolver } from './eto.resolver';
import { ETOService } from './eto.service';
import { UseETOInput, AdjustETOInput, ETOFilterInput } from './dto';
import type { Consultant } from '../generated';

describe('ETOResolver', () => {
  let resolver: ETOResolver;
  let etoService: ETOService;

  const mockETOService = {
    getBalance: jest.fn(),
    getBalanceWithTransactions: jest.fn(),
    getTransactions: jest.fn(),
    useETO: jest.fn(),
    adjustETO: jest.fn(),
  };

  const mockConsultant: Consultant = {
    id: '507f1f77bcf86cd799439011',
    externalId: 'EXT-001',
    name: 'John Doe',
    email: 'john@example.com',
    teamLeadId: null,
    teamLeadName: null,
    teamLeadEmail: null,
    etoBalance: 40.0,
    workingHoursPerPeriod: 88,
    paymentType: 'Hourly',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ETOResolver,
        {
          provide: ETOService,
          useValue: mockETOService,
        },
      ],
    }).compile();

    resolver = module.get<ETOResolver>(ETOResolver);
    etoService = module.get<ETOService>(ETOService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('etoBalance', () => {
    it('should return ETO balance with transactions', async () => {
      const mockBalanceData = {
        balance: 40.0,
        recentTransactions: [
          {
            id: '1',
            consultantId: mockConsultant.id,
            date: new Date('2024-04-10'),
            hours: -8,
            transactionType: 'Usage',
            description: 'Vacation day',
            synced: true,
            createdAt: new Date('2024-04-10'),
            runningBalance: 40.0,
          },
        ],
        accruedThisPeriod: 4,
        usedThisPeriod: 8,
      };

      mockETOService.getBalanceWithTransactions.mockResolvedValue(mockBalanceData);

      const result = await resolver.etoBalance(null, mockConsultant);

      expect(result.balance).toBe(40.0);
      expect(result.recentTransactions.length).toBe(1);
      expect(result.accruedThisPeriod).toBe(4);
      expect(result.usedThisPeriod).toBe(8);
      expect(mockETOService.getBalanceWithTransactions).toHaveBeenCalledWith(
        mockConsultant.id,
        null,
      );
    });

    it('should pass filters to service', async () => {
      const filters: ETOFilterInput = {
        startDate: '2024-04-01',
        endDate: '2024-04-30',
        limit: 5,
      };

      const mockBalanceData = {
        balance: 40.0,
        recentTransactions: [],
        accruedThisPeriod: 0,
        usedThisPeriod: 0,
      };

      mockETOService.getBalanceWithTransactions.mockResolvedValue(mockBalanceData);

      await resolver.etoBalance(filters, mockConsultant);

      expect(mockETOService.getBalanceWithTransactions).toHaveBeenCalledWith(
        mockConsultant.id,
        filters,
      );
    });
  });

  describe('etoTransactions', () => {
    it('should return ETO transactions for current user', async () => {
      const mockTransactions = [
        {
          id: '1',
          consultantId: mockConsultant.id,
          date: new Date('2024-04-10'),
          hours: -8,
          transactionType: 'Usage',
          description: 'Vacation day',
          synced: true,
          createdAt: new Date('2024-04-10'),
          runningBalance: 40.0,
        },
        {
          id: '2',
          consultantId: mockConsultant.id,
          date: new Date('2024-04-05'),
          hours: 4,
          transactionType: 'Accrual',
          description: 'Monthly accrual',
          synced: true,
          createdAt: new Date('2024-04-05'),
          runningBalance: 48.0,
        },
      ];

      mockETOService.getTransactions.mockResolvedValue(mockTransactions);

      const result = await resolver.etoTransactions(null, mockConsultant);

      expect(result.length).toBe(2);
      expect(result[0].id).toBe('1');
      expect(mockETOService.getTransactions).toHaveBeenCalledWith(
        mockConsultant.id,
        null,
      );
    });

    it('should pass filters to service', async () => {
      const filters: ETOFilterInput = {
        startDate: '2024-04-01',
        transactionType: 'Usage',
      };

      mockETOService.getTransactions.mockResolvedValue([]);

      await resolver.etoTransactions(filters, mockConsultant);

      expect(mockETOService.getTransactions).toHaveBeenCalledWith(
        mockConsultant.id,
        filters,
      );
    });
  });

  describe('useETO', () => {
    it('should use ETO hours for current user', async () => {
      const input: UseETOInput = {
        hours: 8,
        date: '2024-04-15',
        description: 'Sick day',
      };

      const mockTransaction = {
        id: '1',
        consultantId: mockConsultant.id,
        date: new Date('2024-04-15'),
        hours: -8,
        transactionType: 'Usage',
        description: 'Sick day',
        projectName: null,
        synced: true,
        createdAt: new Date('2024-04-15'),
      };

      mockETOService.useETO.mockResolvedValue(mockTransaction);

      const result = await resolver.useETO(input, mockConsultant);

      expect(result.hours).toBe(-8);
      expect(result.transactionType).toBe('Usage');
      expect(mockETOService.useETO).toHaveBeenCalledWith(mockConsultant.id, input);
    });

    it('should include project name when provided', async () => {
      const input: UseETOInput = {
        hours: 4,
        date: '2024-04-15',
        description: 'Half day off',
        projectName: 'PROJ-123',
      };

      const mockTransaction = {
        id: '1',
        consultantId: mockConsultant.id,
        date: new Date('2024-04-15'),
        hours: -4,
        transactionType: 'Usage',
        description: 'Half day off',
        projectName: 'PROJ-123',
        synced: true,
        createdAt: new Date('2024-04-15'),
      };

      mockETOService.useETO.mockResolvedValue(mockTransaction);

      const result = await resolver.useETO(input, mockConsultant);

      expect(result.projectName).toBe('PROJ-123');
      expect(mockETOService.useETO).toHaveBeenCalledWith(mockConsultant.id, input);
    });
  });

  describe('adjustETO', () => {
    it('should adjust ETO balance for current user', async () => {
      const input: AdjustETOInput = {
        hours: 4,
        type: 'Accrual',
        date: '2024-04-01',
        description: 'Monthly accrual',
      };

      const mockTransaction = {
        id: '1',
        consultantId: mockConsultant.id,
        date: new Date('2024-04-01'),
        hours: 4,
        transactionType: 'Accrual',
        description: 'Monthly accrual',
        synced: true,
        createdAt: new Date('2024-04-01'),
      };

      mockETOService.adjustETO.mockResolvedValue(mockTransaction);

      const result = await resolver.adjustETO(input, mockConsultant);

      expect(result.hours).toBe(4);
      expect(result.transactionType).toBe('Accrual');
      expect(mockETOService.adjustETO).toHaveBeenCalledWith(mockConsultant.id, input);
    });

    it('should handle negative adjustments', async () => {
      const input: AdjustETOInput = {
        hours: -2,
        type: 'Adjustment',
        date: '2024-04-01',
        description: 'Admin correction',
      };

      const mockTransaction = {
        id: '1',
        consultantId: mockConsultant.id,
        date: new Date('2024-04-01'),
        hours: -2,
        transactionType: 'Adjustment',
        description: 'Admin correction',
        synced: true,
        createdAt: new Date('2024-04-01'),
      };

      mockETOService.adjustETO.mockResolvedValue(mockTransaction);

      const result = await resolver.adjustETO(input, mockConsultant);

      expect(result.hours).toBe(-2);
      expect(mockETOService.adjustETO).toHaveBeenCalledWith(mockConsultant.id, input);
    });
  });
});
