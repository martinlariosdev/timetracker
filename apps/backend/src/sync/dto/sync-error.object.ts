import { ObjectType, Field } from '@nestjs/graphql';

/**
 * GraphQL Object Type for Sync Error
 * Represents an error that occurred during a sync operation
 */
@ObjectType({ description: 'Error information for a failed sync operation' })
export class SyncError {
  @Field(() => String, { description: 'ID of the entity that failed to sync' })
  entityId: string;

  @Field(() => String, {
    description: 'Type of entity (TimeEntry, ETOTransaction, etc.)',
  })
  entityType: string;

  @Field(() => String, {
    description: 'Operation that was attempted (CREATE, UPDATE, DELETE)',
  })
  operation: string;

  @Field(() => String, {
    description: 'Error message describing what went wrong',
  })
  error: string;
}
