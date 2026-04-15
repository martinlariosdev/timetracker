import { Test, TestingModule } from '@nestjs/testing';
import { PayPeriodResolver } from './pay-period.resolver';
import { PayPeriodService } from './pay-period.service';

describe('PayPeriodResolver', () => {
  let resolver: PayPeriodResolver;
  let service: PayPeriodService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayPeriodResolver,
        {
          provide: PayPeriodService,
          useValue: {
            getCurrentPayPeriod: jest.fn(),
            getPayPeriodForDate: jest.fn(),
            getPayPeriods: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<PayPeriodResolver>(PayPeriodResolver);
    service = module.get<PayPeriodService>(PayPeriodService);
  });

  describe('currentPayPeriod', () => {
    it('should return current pay period from service', async () => {
      const mockPeriod = {
        id: '507f1f77bcf86cd799439011',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-04-15'),
        displayText: 'April 1-15, 2026',
        isCurrent: true,
        deadlineDate: new Date('2026-04-20'),
        createdAt: new Date(),
      };

      jest.spyOn(service, 'getCurrentPayPeriod').mockResolvedValue(mockPeriod);

      const result = await resolver.currentPayPeriod();

      expect(result).toEqual(mockPeriod);
      expect(service.getCurrentPayPeriod).toHaveBeenCalled();
    });
  });

  describe('payPeriodForDate', () => {
    it('should return pay period for given date', async () => {
      const date = new Date('2026-04-10');
      const mockPeriod = {
        id: '507f1f77bcf86cd799439011',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-04-15'),
        displayText: 'April 1-15, 2026',
        isCurrent: true,
        deadlineDate: null,
        createdAt: new Date(),
      };

      jest.spyOn(service, 'getPayPeriodForDate').mockResolvedValue(mockPeriod);

      const result = await resolver.payPeriodForDate(date);

      expect(result).toEqual(mockPeriod);
      expect(service.getPayPeriodForDate).toHaveBeenCalledWith(date);
    });
  });

  describe('payPeriods', () => {
    it('should return list of pay periods', async () => {
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

      jest.spyOn(service, 'getPayPeriods').mockResolvedValue(mockPeriods);

      const result = await resolver.payPeriods();

      expect(result).toEqual(mockPeriods);
      expect(service.getPayPeriods).toHaveBeenCalledWith(undefined);
    });

    it('should pass limit to service', async () => {
      const mockPeriods = [];
      jest.spyOn(service, 'getPayPeriods').mockResolvedValue(mockPeriods);

      await resolver.payPeriods(20);

      expect(service.getPayPeriods).toHaveBeenCalledWith(20);
    });
  });
});
