import { ObjectType, Field } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { ConflictResolutionStrategy } from './conflict-resolution-strategy.enum';

/**
 * GraphQL Object Type for ResolvedConflict
 * Represents the result of applying a conflict resolution strategy
 */
@ObjectType({
  description: 'Result of applying a conflict resolution strategy',
})
export class ResolvedConflict {
  @Field(() => Boolean, {
    description: 'Whether the conflict was successfully resolved',
  })
  success: boolean;

  @Field(() => GraphQLJSONObject, {
    description: 'Final data after conflict resolution',
  })
  finalData: Record<string, any>;

  @Field(() => ConflictResolutionStrategy, {
    description: 'Strategy that was applied',
  })
  strategy: ConflictResolutionStrategy;

  @Field(() => String, {
    nullable: true,
    description: 'Additional details about the resolution',
  })
  message?: string | null;
}
