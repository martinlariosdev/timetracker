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
}
