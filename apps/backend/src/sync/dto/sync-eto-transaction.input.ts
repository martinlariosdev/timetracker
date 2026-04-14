import { InputType, Field, ID } from '@nestjs/graphql';
import { SyncOperation } from './sync-operation.enum';
import { ConflictResolutionStrategy } from './conflict-resolution-strategy.enum';

/**
 * Input type for syncing an ETO transaction
 * Used in batch sync operations
 */
@InputType({ description: 'Input for syncing a single ETO transaction' })
export class SyncETOTransactionInput {
  @Field(() => ID, { nullable: true, description: 'ID of existing transaction (null for CREATE)' })
  id?: string;

  @Field({ description: 'Date of the transaction' })
  date: string;

  @Field({ description: 'Number of hours (positive value)' })
  hours: number;

  @Field({ description: 'Transaction type (Usage, Accrual, Adjustment)' })
  transactionType: string;

  @Field({ nullable: true, description: 'Description of the transaction' })
  description?: string;

  @Field({ nullable: true, description: 'Project name (for Usage type)' })
  projectName?: string;

  @Field(() => SyncOperation, { description: 'Operation to perform (CREATE, UPDATE, DELETE)' })
  operation: SyncOperation;

  @Field({ nullable: true, description: 'Client last synced timestamp for conflict detection' })
  lastSyncedAt?: Date;

  @Field(() => ConflictResolutionStrategy, {
    nullable: true,
    defaultValue: ConflictResolutionStrategy.SERVER_WINS,
    description: 'Conflict resolution strategy if conflict detected'
  })
  resolution?: ConflictResolutionStrategy;
}
