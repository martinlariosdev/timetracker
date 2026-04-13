import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

/**
 * Enum for entity types that can be synced
 */
export enum SyncEntityType {
  TIME_ENTRY = 'TimeEntry',
  ETO_TRANSACTION = 'ETOTransaction',
  CONSULTANT = 'Consultant',
  TIMESHEET_SUBMISSION = 'TimesheetSubmission',
}

registerEnumType(SyncEntityType, {
  name: 'SyncEntityType',
  description: 'Type of entity being synced',
});

/**
 * Enum for sync operation types
 */
export enum SyncOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

registerEnumType(SyncOperationType, {
  name: 'SyncOperationType',
  description: 'Type of sync operation',
});

/**
 * GraphQL Object Type for SyncLog
 * Represents a sync operation log record
 * Corresponds to the SyncLog Prisma model
 */
@ObjectType({ description: 'Sync operation log record for tracking offline sync operations' })
export class SyncLogObjectType {
  @Field(() => ID, { description: 'Unique identifier for the sync log' })
  id: string;

  @Field(() => ID, { description: 'ID of the user who performed the sync' })
  userId: string;

  @Field(() => String, { description: 'Device identifier that performed the sync' })
  deviceId: string;

  @Field(() => SyncEntityType, { description: 'Type of entity being synced' })
  entityType: SyncEntityType;

  @Field(() => SyncOperationType, { description: 'Type of operation performed' })
  operation: SyncOperationType;

  @Field(() => ID, { description: 'ID of the entity that was synced' })
  entityId: string;

  @Field(() => Date, { description: 'Timestamp when the sync occurred' })
  syncedAt: Date;

  @Field(() => Boolean, { description: 'Whether the sync operation was successful' })
  success: boolean;

  @Field(() => String, { nullable: true, description: 'Error message if sync failed' })
  error?: string | null;
}
