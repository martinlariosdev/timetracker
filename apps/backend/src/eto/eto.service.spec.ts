import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ETOService } from './eto.service';
import { PrismaService } from '../prisma/prisma.service';
import { UseETOInput, AdjustETOInput } from './dto';

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

    it('should throw NotFoundException if consultant not found', async () => {
      mockPrismaService.consultant.findUnique.mockResolvedValue(null);

      await expect(service.getBalance('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getTransactions', () => {
    it('should return ETO transactions with limit and offset', async () => {
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

      mockPrismaService.consultant.findUnique.mockResolvedValue(mockConsultant);
      mockPrismaService.eTOTransaction.findMany.mockResolvedValue(
        mockTransactions,
      );

      const result = await service.getTransactions(mockConsultant.id, 10, 5);

      expect(result.length).toBe(1);
      expect(result[0].id).toBe('1');
      expect(mockPrismaService.consultant.findUnique).toHaveBeenCalledWith({
        where: { id: mockConsultant.id },
      });
      expect(mockPrismaService.eTOTransaction.findMany).toHaveBeenCalledWith({
        where: { consultantId: mockConsultant.id },
        orderBy: { date: 'desc' },
        take: 10,
        skip: 5,
      });
    });

    it('should use default limit when not provided', async () => {
      mockPrismaService.consultant.findUnique.mockResolvedValue(mockConsultant);
      mockPrismaService.eTOTransaction.findMany.mockResolvedValue([]);

      await service.getTransactions(mockConsultant.id);

      expect(mockPrismaService.eTOTransaction.findMany).toHaveBeenCalledWith({
        where: { consultantId: mockConsultant.id },
        orderBy: { date: 'desc' },
        take: 50,
        skip: 0,
      });
    });

    it('should throw NotFoundException if consultant not found', async () => {
      mockPrismaService.consultant.findUnique.mockResolvedValue(null);

      await expect(service.getTransactions('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
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

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          consultant: {
            findUnique: jest.fn().mockResolvedValue({
              etoBalance: 40.0,
            }),
            update: jest.fn().mockResolvedValue({ etoBalance: 32.0 }),
          },
          eTOTransaction: {
            create: jest.fn().mockResolvedValue(mockTransaction),
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

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          consultant: {
            findUnique: jest.fn().mockResolvedValue({
              etoBalance: 40.0,
            }),
          },
        });
      });

      await expect(service.useETO(mockConsultant.id, input)).rejects.toThrow(
        'Insufficient ETO balance',
      );
    });
  });

  describe('adjustETO', () => {
    it('should successfully adjust ETO balance (Accrual)', async () => {
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

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          consultant: {
            findUnique: jest.fn().mockResolvedValue({
              etoBalance: 40.0,
            }),
            update: jest.fn().mockResolvedValue({ etoBalance: 44.0 }),
          },
          eTOTransaction: {
            create: jest.fn().mockResolvedValue(mockTransaction),
          },
        });
      });

      const result = await service.adjustETO(input);

      expect(result.hours).toBe(4);
      expect(result.transactionType).toBe('Accrual');
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should successfully adjust ETO balance (Usage)', async () => {
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

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          consultant: {
            findUnique: jest.fn().mockResolvedValue({
              etoBalance: 40.0,
            }),
            update: jest.fn().mockResolvedValue({ etoBalance: 38.0 }),
          },
          eTOTransaction: {
            create: jest.fn().mockResolvedValue(mockTransaction),
          },
        });
      });

      const result = await service.adjustETO(input);

      expect(result.hours).toBe(-2);
      expect(result.transactionType).toBe('Usage');
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if hours is not positive', async () => {
      const input: AdjustETOInput = {
        consultantId: mockConsultant.id,
        hours: -2,
        transactionType: 'Accrual',
        date: '2024-04-01',
        description: 'Invalid',
      };

      await expect(service.adjustETO(input)).rejects.toThrow(
        'Hours must be positive',
      );
    });

    it('should throw BadRequestException if adjustment would result in negative balance', async () => {
      const input: AdjustETOInput = {
        consultantId: mockConsultant.id,
        hours: 50,
        transactionType: 'Usage',
        date: '2024-04-01',
        description: 'Too much',
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          consultant: {
            findUnique: jest.fn().mockResolvedValue({
              etoBalance: 40.0,
            }),
          },
        });
      });

      await expect(service.adjustETO(input)).rejects.toThrow(
        'Adjustment would result in negative balance',
      );
    });
  });
});
