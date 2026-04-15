import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PayPeriodType } from './dto/pay-period.type';
import { PayPeriodService } from './pay-period.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * PayPeriodResolver
 * GraphQL resolver for pay period queries
 */
@Resolver(() => PayPeriodType)
@UseGuards(JwtAuthGuard)
export class PayPeriodResolver {
  constructor(private payPeriodService: PayPeriodService) {}

  @Query(() => PayPeriodType, {
    description: 'Get the current pay period (marked isCurrent: true)',
  })
  async currentPayPeriod(): Promise<PayPeriodType> {
    return this.payPeriodService.getCurrentPayPeriod();
  }

  @Query(() => PayPeriodType, {
    description: 'Get the pay period that contains a specific date',
  })
  async payPeriodForDate(
    @Args('date', { type: () => Date }) date: Date,
  ): Promise<PayPeriodType> {
    return this.payPeriodService.getPayPeriodForDate(date);
  }

  @Query(() => [PayPeriodType], {
    description: 'Get recent pay periods (for browsing history)',
  })
  async payPeriods(
    @Args('limit', { type: () => Number, nullable: true }) limit?: number,
  ): Promise<PayPeriodType[]> {
    return this.payPeriodService.getPayPeriods(limit);
  }
}
