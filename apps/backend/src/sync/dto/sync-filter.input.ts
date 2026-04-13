import { InputType, Field } from '@nestjs/graphql';
import { SyncEntityType, SyncOperationType } from './sync-log.object';

/**
 * GraphQL Input Type for filtering sync logs
 * Used to query sync history with various filters
 */
@InputType({ description: 'Filters for querying sync logs' })
export class SyncFilterInput {
  @Field({ nullable: true, description: 'Filter by device identifier' })
  deviceId?: string;

  @Field(() => SyncEntityType, { nullable: true, description: 'Filter by entity type' })
  entityType?: SyncEntityType;

  @Field(() => SyncOperationType, { nullable: true, description: 'Filter by operation type' })
  operation?: SyncOperationType;

  @Field({ nullable: true, defaultValue: false, description: 'Only return failed syncs' })
  onlyFailed?: boolean;
}
