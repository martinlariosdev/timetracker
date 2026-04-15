import { InputType, Field, ID } from '@nestjs/graphql';
import { SyncOperation } from './sync-operation.enum';
import { ConflictResolutionStrategy } from './conflict-resolution-strategy.enum';

/**
 * Input type for syncing a timesheet submission
 * Used in batch sync operations
 */
@InputType({ description: 'Input for syncing a single timesheet submission' })
export class SyncTimesheetSubmissionInput {
  @Field(() => ID, {
    nullable: true,
    description: 'ID of existing submission (null for CREATE)',
  })
  id?: string;

  @Field(() => ID, { description: 'Pay period ID for this submission' })
  payPeriodId: string;

  @Field({
    description: 'Submission status (draft, submitted, approved, rejected)',
  })
  status: string;

  @Field({ nullable: true, description: 'When the timesheet was submitted' })
  submittedAt?: Date;

  @Field({ nullable: true, description: 'Comments for the submission' })
  comments?: string;

  @Field(() => SyncOperation, {
    description: 'Operation to perform (CREATE, UPDATE, DELETE)',
  })
  operation: SyncOperation;

  @Field({
    nullable: true,
    description: 'Client last synced timestamp for conflict detection',
  })
  lastSyncedAt?: Date;

  @Field(() => ConflictResolutionStrategy, {
    nullable: true,
    defaultValue: ConflictResolutionStrategy.SERVER_WINS,
    description: 'Conflict resolution strategy if conflict detected',
  })
  resolution?: ConflictResolutionStrategy;
}
