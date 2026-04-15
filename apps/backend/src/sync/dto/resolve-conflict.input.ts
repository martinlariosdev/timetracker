import { InputType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { SyncEntityType } from './sync-log.object';
import { ConflictResolutionStrategy } from './conflict-resolution-strategy.enum';

/**
 * GraphQL Input Type for resolving a conflict
 * Used when applying a conflict resolution strategy
 */
@InputType({ description: 'Input for resolving a data conflict' })
export class ResolveConflictInput {
  @Field(() => SyncEntityType, { description: 'Type of entity with conflict' })
  entityType: SyncEntityType;

  @Field(() => ID, { description: 'ID of the entity with conflict' })
  entityId: string;

  @Field(() => ConflictResolutionStrategy, {
    description: 'Strategy to use for conflict resolution',
  })
  strategy: ConflictResolutionStrategy;

  @Field(() => GraphQLJSONObject, {
    nullable: true,
    description: 'Client data to use for CLIENT_WINS strategy',
  })
  clientData?: Record<string, any>;

  @Field(() => GraphQLJSONObject, {
    nullable: true,
    description:
      'Server data to use for SERVER_WINS strategy (optional, will be fetched if not provided)',
  })
  serverData?: Record<string, any>;
}
