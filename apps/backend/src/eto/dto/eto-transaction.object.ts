import { ObjectType, Field, ID, Float, registerEnumType } from '@nestjs/graphql';

/**
 * Enum for ETO transaction types
 */
export enum ETOTransactionType {
  ACCRUAL = 'Accrual',
  USAGE = 'Usage',
  ADJUSTMENT = 'Adjustment',
}

registerEnumType(ETOTransactionType, {
  name: 'ETOTransactionType',
  description: 'Type of ETO transaction',
});

/**
 * GraphQL Object Type for ETOTransaction
 * Represents an ETO (Earned Time Off) transaction record
 * Corresponds to the ETOTransaction Prisma model
 */
@ObjectType({ description: 'ETO transaction record for tracking earned time off' })
export class ETOTransactionObjectType {
  @Field(() => ID, { description: 'Unique identifier for the ETO transaction' })
  id: string;

  @Field(() => ID, { description: 'ID of the consultant who owns this transaction' })
  consultantId: string;

  @Field(() => Date, { description: 'Transaction date in ISO 8601 format' })
  date: Date;

  @Field(() => Float, { description: 'Number of hours for this transaction (positive for accrual, negative for usage)' })
  hours: number;

  @Field(() => ETOTransactionType, { description: 'Type of transaction: Accrual, Usage, or Adjustment' })
  transactionType: ETOTransactionType;

  @Field(() => String, { nullable: true, description: 'Description or reason for the transaction' })
  description?: string | null;

  @Field(() => String, { nullable: true, description: 'Project name associated with ETO usage' })
  projectName?: string | null;

  @Field(() => Boolean, { description: 'Whether this transaction has been synced with the backend' })
  synced: boolean;

  @Field(() => Date, { description: 'Timestamp when this transaction was created' })
  createdAt: Date;
}
