import { Test, TestingModule } from '@nestjs/testing';
import { ETOResolver } from './eto.resolver';
import { ETOService } from './eto.service';
import { UseETOInput, AdjustETOInput } from './dto';
import type { Consultant } from '@prisma/client';

describe('ETOResolver', () => {
  let resolver: ETOResolver;

  const mockETOService = {
    getBalance: jest.fn(),
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

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('etoBalance', () => {
    it('should return ETO balance as a number', async () => {
      mockETOService.getBalance.mockResolvedValue(40.0);

      const result = await resolver.etoBalance(
        mockConsultant.id,
        mockConsultant,
      );

      expect(result).toBe(40.0);
      expect(mockETOService.getBalance).toHaveBeenCalledWith(mockConsultant.id);
    });
  });

  describe('etoTransactions', () => {
    it('should return ETO transactions for consultant', async () => {
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
        },
      ];

      mockETOService.getTransactions.mockResolvedValue(mockTransactions);

      const result = await resolver.etoTransactions(
        mockConsultant.id,
        undefined,
        undefined,
        mockConsultant,
      );

      expect(result.length).toBe(2);
      expect(result[0].id).toBe('1');
      expect(mockETOService.getTransactions).toHaveBeenCalledWith(
        mockConsultant.id,
        undefined,
        undefined,
      );
    });

    it('should pass limit and offset to service', async () => {
      mockETOService.getTransactions.mockResolvedValue([]);

      await resolver.etoTransactions(mockConsultant.id, 10, 5, mockConsultant);

      expect(mockETOService.getTransactions).toHaveBeenCalledWith(
        mockConsultant.id,
        10,
        5,
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
      expect(mockETOService.useETO).toHaveBeenCalledWith(
        mockConsultant.id,
        input,
      );
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
      expect(mockETOService.useETO).toHaveBeenCalledWith(
        mockConsultant.id,
        input,
      );
    });
  });

  describe('adjustETO', () => {
    it('should adjust ETO balance for specified consultant', async () => {
      const input: AdjustETOInput = {
        consultantId: mockConsultant.id,
        hours: 4,
        transactionType: 'Accrual',
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
      expect(mockETOService.adjustETO).toHaveBeenCalledWith(input);
    });

    it('should handle Usage transaction type', async () => {
      const input: AdjustETOInput = {
        consultantId: mockConsultant.id,
        hours: 2,
        transactionType: 'Usage',
        date: '2024-04-01',
        description: 'Admin correction',
      };

      const mockTransaction = {
        id: '1',
        consultantId: mockConsultant.id,
        date: new Date('2024-04-01'),
        hours: -2,
        transactionType: 'Usage',
        description: 'Admin correction',
        synced: true,
        createdAt: new Date('2024-04-01'),
      };

      mockETOService.adjustETO.mockResolvedValue(mockTransaction);

      const result = await resolver.adjustETO(input, mockConsultant);

      expect(result.hours).toBe(-2);
      expect(mockETOService.adjustETO).toHaveBeenCalledWith(input);
    });
  });
});
