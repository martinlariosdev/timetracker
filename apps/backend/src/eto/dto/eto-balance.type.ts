import { ObjectType, Field, Float } from '@nestjs/graphql';
import { ETOTransactionType } from './eto-transaction.type';

/**
 * GraphQL Object Type for ETO Balance information
 * Represents the current ETO balance and recent transaction history
 */
@ObjectType({ description: 'ETO balance and recent transaction history for a consultant' })
export class ETOBalanceType {
  @Field(() => Float, { description: 'Current ETO balance in hours' })
  balance: number;

  @Field(() => [ETOTransactionType], { description: 'Recent ETO transactions' })
  recentTransactions: ETOTransactionType[];

  @Field(() => Float, { description: 'Total hours accrued in current period' })
  accruedThisPeriod: number;

  @Field(() => Float, { description: 'Total hours used in current period' })
  usedThisPeriod: number;
}
