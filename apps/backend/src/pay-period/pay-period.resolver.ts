import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PayPeriodType } from './dto/pay-period.type';
import { PayPeriodService } from './pay-period.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PayPeriod } from '@prisma/client';

/**
 * PayPeriodResolver
 * GraphQL resolver for pay period queries
 */
@Resolver(() => PayPeriodType)
@UseGuards(JwtAuthGuard)
export class PayPeriodResolver {
  constructor(private payPeriodService: PayPeriodService) {}

  /**
   * Transforms Prisma PayPeriod to PayPeriodType (handles null -> undefined)
   */
  private toPayPeriodType(period: PayPeriod): PayPeriodType {
    return {
      ...period,
      deadlineDate: period.deadlineDate ?? undefined,
    };
  }

  @Query(() => PayPeriodType, {
    description: 'Get the current pay period (marked isCurrent: true)',
  })
  async currentPayPeriod(): Promise<PayPeriodType> {
    const period = await this.payPeriodService.getCurrentPayPeriod();
    return this.toPayPeriodType(period);
  }

  @Query(() => PayPeriodType, {
    description: 'Get the pay period that contains a specific date',
  })
  async payPeriodForDate(
    @Args('date', { type: () => Date }) date: Date,
  ): Promise<PayPeriodType> {
    const period = await this.payPeriodService.getPayPeriodForDate(date);
    return this.toPayPeriodType(period);
  }

  @Query(() => [PayPeriodType], {
    description: 'Get recent pay periods (for browsing history)',
  })
  async payPeriods(
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<PayPeriodType[]> {
    const periods = await this.payPeriodService.getPayPeriods(limit);
    return periods.map((p) => this.toPayPeriodType(p));
  }
}
