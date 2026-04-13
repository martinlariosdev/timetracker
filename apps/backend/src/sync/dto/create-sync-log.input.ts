import { InputType, Field, ID } from '@nestjs/graphql';
import { SyncEntityType, SyncOperationType } from './sync-log.object';

/**
 * GraphQL Input Type for creating a sync log
 * Used when recording sync operations from mobile devices
 */
@InputType({ description: 'Input for creating a sync log entry' })
export class CreateSyncLogInput {
  @Field({ description: 'Device identifier that performed the sync' })
  deviceId: string;

  @Field(() => SyncEntityType, { description: 'Type of entity being synced' })
  entityType: SyncEntityType;

  @Field(() => SyncOperationType, { description: 'Type of operation performed' })
  operation: SyncOperationType;

  @Field(() => ID, { description: 'ID of the entity that was synced' })
  entityId: string;

  @Field({ nullable: true, defaultValue: true, description: 'Whether the sync operation was successful' })
  success?: boolean;

  @Field({ nullable: true, description: 'Error message if sync failed' })
  error?: string;
}
