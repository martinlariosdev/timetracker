import { InputType, Field, Float } from '@nestjs/graphql';

/**
 * Enum for ETO transaction types used in inputs
 */
export enum ETOAdjustmentType {
  ACCRUED = 'Accrual',
  ADJUSTMENT = 'Adjustment',
}

/**
 * GraphQL Input Type for using ETO hours
 * Used when a consultant takes time off
 */
@InputType({ description: 'Input for using ETO hours (taking time off)' })
export class UseETOInput {
  @Field(() => Float, { description: 'Number of hours to use (must be positive)' })
  hours: number;

  @Field({ description: 'Date when ETO is used (YYYY-MM-DD format)' })
  date: string;

  @Field({ nullable: true, description: 'Description or reason for using ETO' })
  description?: string;

  @Field({ nullable: true, description: 'Project name associated with this ETO usage' })
  projectName?: string;
}

/**
 * GraphQL Input Type for manually adjusting ETO balance
 * Used for accruals or administrative adjustments
 */
@InputType({ description: 'Input for manually adjusting ETO balance (accrual or admin adjustment)' })
export class AdjustETOInput {
  @Field(() => Float, { description: 'Number of hours to add/subtract (positive to add, negative to subtract)' })
  hours: number;

  @Field({ description: 'Type of adjustment: Accrual or Adjustment' })
  type: string;

  @Field({ description: 'Date of the adjustment' })
  date: string;

  @Field({ description: 'Description or reason for the adjustment' })
  description: string;
}

/**
 * GraphQL Input Type for filtering ETO transactions
 */
@InputType({ description: 'Filters for querying ETO transactions' })
export class ETOFilterInput {
  @Field({ nullable: true, description: 'Start date for filtering (YYYY-MM-DD format)' })
  startDate?: string;

  @Field({ nullable: true, description: 'End date for filtering (YYYY-MM-DD format)' })
  endDate?: string;

  @Field({ nullable: true, description: 'Filter by transaction type' })
  transactionType?: string;

  @Field(() => Float, { nullable: true, defaultValue: 10, description: 'Limit number of transactions returned' })
  limit?: number;
}
