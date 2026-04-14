import { InputType, Field, ID } from '@nestjs/graphql';
import { SyncOperation } from './sync-operation.enum';
import { ConflictResolutionStrategy } from './conflict-resolution-strategy.enum';

/**
 * Input type for syncing a time entry
 * Used in batch sync operations
 */
@InputType({ description: 'Input for syncing a single time entry' })
export class SyncTimeEntryInput {
  @Field(() => ID, { nullable: true, description: 'ID of existing entry (null for CREATE)' })
  id?: string;

  @Field({ description: 'Date in YYYY-MM-DD format' })
  date: string;

  @Field({ nullable: true, description: 'Project/task number' })
  projectTaskNumber?: string;

  @Field({ description: 'Client name' })
  clientName: string;

  @Field({ description: 'Description of work performed' })
  description: string;

  @Field({ description: 'First check-in time (HH:mm)' })
  inTime1: string;

  @Field({ description: 'First check-out time (HH:mm)' })
  outTime1: string;

  @Field({ nullable: true, description: 'Second check-in time (HH:mm)' })
  inTime2?: string;

  @Field({ nullable: true, description: 'Second check-out time (HH:mm)' })
  outTime2?: string;

  @Field({ description: 'Total hours (calculated client-side)' })
  totalHours: number;

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

  @Field(() => ID, { nullable: true, description: 'Pay period ID (will use current if not provided)' })
  payPeriodId?: string;
}
