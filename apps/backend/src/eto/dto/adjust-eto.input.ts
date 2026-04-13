import { InputType, Field, Float, ID } from '@nestjs/graphql';

/**
 * GraphQL Input Type for manually adjusting ETO balance
 * Used for accruals or administrative adjustments
 * This is an admin operation - admins can adjust any consultant's balance
 */
@InputType({ description: 'Input for manually adjusting ETO balance (accrual or admin adjustment)' })
export class AdjustETOInput {
  @Field(() => ID, { description: 'ID of the consultant whose balance to adjust' })
  consultantId: string;

  @Field(() => Float, { description: 'Number of hours (always positive, direction determined by transactionType)' })
  hours: number;

  @Field({ description: 'Type of adjustment: Accrual (adds to balance) or Usage (deducts from balance)' })
  transactionType: string;

  @Field({ description: 'Date of the adjustment' })
  date: string;

  @Field({ description: 'Description or reason for the adjustment' })
  description: string;
}
