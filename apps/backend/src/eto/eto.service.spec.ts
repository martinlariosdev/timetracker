import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ETOService } from './eto.service';
import { PrismaService } from '../prisma/prisma.service';
import { UseETOInput, AdjustETOInput, ETOFilterInput } from './dto';

describe('ETOService', () => {
  let service: ETOService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    consultant: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    eTOTransaction: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockConsultant = {
    id: '507f1f77bcf86cd799439011',
    externalId: 'EXT-001',
    name: 'John Doe',
    email: 'john@example.com',
    etoBalance: 40.0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ETOService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ETOService>(ETOService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBalance', () => {
    it('should return consultant ETO balance', async () => {
      mockPrismaService.consultant.findUnique.mockResolvedValue({
        etoBalance: 40.0,
      });

      const balance = await service.getBalance(mockConsultant.id);

      expect(balance).toBe(40.0);
      expect(mockPrismaService.consultant.findUnique).toHaveBeenCalledWith({
        where: { id: mockConsultant.id },
        select: { etoBalance: true },
      });
    });

    it('should throw BadRequestException if consultant not found', async () => {
      mockPrismaService.consultant.findUnique.mockResolvedValue(null);

      await expect(service.getBalance('invalid-id')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getBalanceWithTransactions', () => {
    it('should return balance with recent transactions and period statistics', async () => {
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

      mockPrismaService.consultant.findUnique.mockResolvedValue({
        etoBalance: 40.0,
      });

      mockPrismaService.eTOTransaction.findMany
        .mockResolvedValueOnce(mockTransactions) // For recent transactions
        .mockResolvedValueOnce(mockTransactions); // For period statistics

      const result = await service.getBalanceWithTransactions(mockConsultant.id);

      expect(result.balance).toBe(40.0);
      expect(result.recentTransactions.length).toBe(2);
      expect(result.accruedThisPeriod).toBe(4);
      expect(result.usedThisPeriod).toBe(8);
    });

    it('should apply filters to transactions', async () => {
      mockPrismaService.consultant.findUnique.mockResolvedValue({
        etoBalance: 40.0,
      });

      mockPrismaService.eTOTransaction.findMany.mockResolvedValue([]);

      const filters: ETOFilterInput = {
        startDate: '2024-04-01',
        endDate: '2024-04-30',
        transactionType: 'Usage',
        limit: 5,
      };

      await service.getBalanceWithTransactions(mockConsultant.id, filters);

      expect(mockPrismaService.eTOTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            consultantId: mockConsultant.id,
            transactionType: 'Usage',
            date: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
          take: 5,
        }),
      );
    });
  });

  describe('getTransactions', () => {
    it('should return filtered ETO transactions', async () => {
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
      ];

      mockPrismaService.consultant.findUnique.mockResolvedValue({
        etoBalance: 40.0,
      });

      mockPrismaService.eTOTransaction.findMany.mockResolvedValue(mockTransactions);

      const result = await service.getTransactions(mockConsultant.id);

      expect(result.length).toBe(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('useETO', () => {
    it('should successfully use ETO and update balance', async () => {
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

      mockPrismaService.consultant.findUnique.mockResolvedValue({
        etoBalance: 40.0,
      });

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          eTOTransaction: {
            create: jest.fn().mockResolvedValue(mockTransaction),
          },
          consultant: {
            update: jest.fn().mockResolvedValue({ etoBalance: 32.0 }),
          },
        });
      });

      const result = await service.useETO(mockConsultant.id, input);

      expect(result.hours).toBe(-8);
      expect(result.transactionType).toBe('Usage');
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if hours is negative', async () => {
      const input: UseETOInput = {
        hours: -8,
        date: '2024-04-15',
        description: 'Invalid',
      };

      await expect(service.useETO(mockConsultant.id, input)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if insufficient balance', async () => {
      const input: UseETOInput = {
        hours: 50,
        date: '2024-04-15',
        description: 'Too much',
      };

      mockPrismaService.consultant.findUnique.mockResolvedValue({
        etoBalance: 40.0,
      });

      await expect(service.useETO(mockConsultant.id, input)).rejects.toThrow(
        'Insufficient ETO balance',
      );
    });
  });

  describe('adjustETO', () => {
    it('should successfully adjust ETO balance (positive)', async () => {
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

      mockPrismaService.consultant.findUnique.mockResolvedValue({
        etoBalance: 40.0,
      });

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          eTOTransaction: {
            create: jest.fn().mockResolvedValue(mockTransaction),
          },
          consultant: {
            update: jest.fn().mockResolvedValue({ etoBalance: 44.0 }),
          },
        });
      });

      const result = await service.adjustETO(mockConsultant.id, input);

      expect(result.hours).toBe(4);
      expect(result.transactionType).toBe('Accrual');
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should successfully adjust ETO balance (negative)', async () => {
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

      mockPrismaService.consultant.findUnique.mockResolvedValue({
        etoBalance: 40.0,
      });

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          eTOTransaction: {
            create: jest.fn().mockResolvedValue(mockTransaction),
          },
          consultant: {
            update: jest.fn().mockResolvedValue({ etoBalance: 38.0 }),
          },
        });
      });

      const result = await service.adjustETO(mockConsultant.id, input);

      expect(result.hours).toBe(-2);
      expect(result.transactionType).toBe('Adjustment');
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });
});
