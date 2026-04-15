import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ConflictInfo } from './conflict-info.object';
import { SyncError } from './sync-error.object';

/**
 * GraphQL Object Type for Sync Result
 * Summarizes the outcome of a batch sync operation
 */
@ObjectType({ description: 'Result of a batch sync operation' })
export class SyncResult {
  @Field(() => Int, { description: 'Number of successfully synced items' })
  successful: number;

  @Field(() => Int, { description: 'Number of items that failed to sync' })
  failed: number;

  @Field(() => [ConflictInfo], {
    description: 'List of conflicts detected during sync',
  })
  conflicts: ConflictInfo[];

  @Field(() => [SyncError], {
    description: 'List of errors that occurred during sync',
  })
  errors: SyncError[];
}
