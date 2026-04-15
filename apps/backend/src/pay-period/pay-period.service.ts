import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PayPeriod } from '@prisma/client';

/**
 * PayPeriodService
 * Handles pay period queries and business logic
 */
@Injectable()
export class PayPeriodService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get the current pay period (marked isCurrent: true)
   * @returns Current pay period
   * @throws NotFoundException if no current period found
   */
  async getCurrentPayPeriod(): Promise<PayPeriod> {
    const period = await this.prisma.payPeriod.findFirst({
      where: { isCurrent: true },
    });

    if (!period) {
      throw new NotFoundException('No current pay period found');
    }

    return period;
  }

  /**
   * Get pay period that contains a specific date
   * @param date Date to find pay period for
   * @returns Pay period containing the date
   * @throws NotFoundException if no period found
   */
  async getPayPeriodForDate(date: Date): Promise<PayPeriod> {
    const period = await this.prisma.payPeriod.findFirst({
      where: {
        startDate: { lte: date },
        endDate: { gte: date },
      },
    });

    if (!period) {
      throw new NotFoundException(
        `No pay period found for date ${date.toISOString()}`,
      );
    }

    return period;
  }

  /**
   * Get recent pay periods
   * @param limit Maximum number of periods to return (optional)
   * @returns List of pay periods sorted by startDate descending
   */
  async getPayPeriods(limit?: number): Promise<PayPeriod[]> {
    return this.prisma.payPeriod.findMany({
      orderBy: { startDate: 'desc' },
      ...(limit && { take: limit }),
    });
  }
}
