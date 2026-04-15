import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PayPeriodService } from './pay-period.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PayPeriodService', () => {
  let service: PayPeriodService;
  let prisma: PrismaService;
  let mockFindFirst: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayPeriodService,
        {
          provide: PrismaService,
          useValue: {
            payPeriod: {
              findFirst: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PayPeriodService>(PayPeriodService);
    prisma = module.get<PrismaService>(PrismaService);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    mockFindFirst = prisma.payPeriod.findFirst as jest.Mock;
  });

  describe('getCurrentPayPeriod', () => {
    it('should return pay period with isCurrent: true', async () => {
      const mockPeriod = {
        id: '507f1f77bcf86cd799439011',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-04-15'),
        displayText: 'April 1-15, 2026',
        isCurrent: true,
        deadlineDate: new Date('2026-04-20'),
        createdAt: new Date(),
      };

      mockFindFirst.mockResolvedValue(mockPeriod);

      const result = await service.getCurrentPayPeriod();

      expect(result).toEqual(mockPeriod);
      expect(mockFindFirst).toHaveBeenCalledTimes(1);
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: { isCurrent: true },
      });
    });

    it('should throw NotFoundException if no current period found', async () => {
      mockFindFirst.mockResolvedValue(null);

      await expect(service.getCurrentPayPeriod()).rejects.toThrow(
        new NotFoundException('No current pay period found'),
      );
    });
  });

  describe('getPayPeriodForDate', () => {
    it('should return pay period containing the given date', async () => {
      const date = new Date('2026-04-10');
      const mockPeriod = {
        id: '507f1f77bcf86cd799439011',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-04-15'),
        displayText: 'April 1-15, 2026',
        isCurrent: true,
        deadlineDate: new Date('2026-04-20'),
        createdAt: new Date(),
      };

      mockFindFirst.mockResolvedValue(mockPeriod);

      const result = await service.getPayPeriodForDate(date);

      expect(result).toEqual(mockPeriod);
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: {
          startDate: { lte: date },
          endDate: { gte: date },
        },
      });
    });

    it('should handle boundary dates (first day of period)', async () => {
      const date = new Date('2026-04-01');
      const mockPeriod = {
        id: '507f1f77bcf86cd799439011',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-04-15'),
        displayText: 'April 1-15, 2026',
        isCurrent: true,
        deadlineDate: null,
        createdAt: new Date(),
      };

      mockFindFirst.mockResolvedValue(mockPeriod);

      const result = await service.getPayPeriodForDate(date);

      expect(result).toEqual(mockPeriod);
    });

    it('should handle boundary dates (last day of period)', async () => {
      const date = new Date('2026-04-15');
      const mockPeriod = {
        id: '507f1f77bcf86cd799439011',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-04-15'),
        displayText: 'April 1-15, 2026',
        isCurrent: true,
        deadlineDate: null,
        createdAt: new Date(),
      };

      mockFindFirst.mockResolvedValue(mockPeriod);

      const result = await service.getPayPeriodForDate(date);

      expect(result).toEqual(mockPeriod);
    });

    it('should throw NotFoundException if no period found for date', async () => {
      const date = new Date('2025-01-01');
      mockFindFirst.mockResolvedValue(null);

      await expect(service.getPayPeriodForDate(date)).rejects.toThrow(
        new NotFoundException('No pay period found for date 2025-01-01T00:00:00.000Z'),
      );
    });
  });

  describe('getPayPeriods', () => {
    it('should return pay periods sorted by startDate descending', async () => {
      const mockPeriods = [
        {
          id: '507f1f77bcf86cd799439013',
          startDate: new Date('2026-04-16'),
          endDate: new Date('2026-04-30'),
          displayText: 'April 16-30, 2026',
          isCurrent: false,
          deadlineDate: null,
          createdAt: new Date(),
        },
        {
          id: '507f1f77bcf86cd799439012',
          startDate: new Date('2026-04-01'),
          endDate: new Date('2026-04-15'),
          displayText: 'April 1-15, 2026',
          isCurrent: true,
          deadlineDate: null,
          createdAt: new Date(),
        },
      ];

      jest.spyOn(prisma.payPeriod, 'findMany').mockResolvedValue(mockPeriods);

      const result = await service.getPayPeriods();

      expect(result).toEqual(mockPeriods);
      expect(prisma.payPeriod.findMany).toHaveBeenCalledWith({
        orderBy: { startDate: 'desc' },
      });
    });

    it('should respect limit parameter', async () => {
      const mockPeriods = [
        {
          id: '507f1f77bcf86cd799439012',
          startDate: new Date('2026-04-01'),
          endDate: new Date('2026-04-15'),
          displayText: 'April 1-15, 2026',
          isCurrent: true,
          deadlineDate: null,
          createdAt: new Date(),
        },
      ];

      jest.spyOn(prisma.payPeriod, 'findMany').mockResolvedValue(mockPeriods);

      const result = await service.getPayPeriods(10);

      expect(result).toEqual(mockPeriods);
      expect(prisma.payPeriod.findMany).toHaveBeenCalledWith({
        orderBy: { startDate: 'desc' },
        take: 10,
      });
    });

    it('should handle empty database', async () => {
      jest.spyOn(prisma.payPeriod, 'findMany').mockResolvedValue([]);

      const result = await service.getPayPeriods();

      expect(result).toEqual([]);
    });
  });
});
