import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

/**
 * GraphQL Object Type for ETOTransaction
 * Represents an ETO (Earned Time Off) transaction record
 * Corresponds to the ETOTransaction Prisma model
 */
@ObjectType({ description: 'ETO transaction record for tracking earned time off' })
export class ETOTransactionType {
  @Field(() => ID, { description: 'Unique identifier for the ETO transaction' })
  id: string;

  @Field(() => ID, { description: 'ID of the consultant who owns this transaction' })
  consultantId: string;

  @Field({ description: 'Transaction date in ISO 8601 format' })
  date: Date;

  @Field(() => Float, { description: 'Number of hours for this transaction (positive for accrual, negative for usage)' })
  hours: number;

  @Field({ description: 'Type of transaction: Accrual, Usage, or Adjustment' })
  transactionType: string;

  @Field({ nullable: true, description: 'Description or reason for the transaction' })
  description?: string | null;

  @Field({ nullable: true, description: 'Project name associated with ETO usage' })
  projectName?: string | null;

  @Field({ description: 'Whether this transaction has been synced with the backend' })
  synced: boolean;

  @Field({ description: 'Timestamp when this transaction was created' })
  createdAt: Date;

  @Field(() => Float, { nullable: true, description: 'Running balance after this transaction' })
  runningBalance?: number;
}
