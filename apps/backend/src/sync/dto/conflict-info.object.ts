import { ObjectType, Field } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

/**
 * GraphQL Object Type for ConflictInfo
 * Represents information about a detected conflict between client and server data
 */
@ObjectType({ description: 'Information about a detected data conflict' })
export class ConflictInfo {
  @Field(() => Boolean, { description: 'Whether a conflict was detected' })
  hasConflict: boolean;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Current server version of the data' })
  serverVersion?: Record<string, any> | null;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Client version of the data that conflicts' })
  clientVersion?: Record<string, any> | null;

  @Field(() => Date, { nullable: true, description: 'Timestamp when server data was last updated' })
  serverUpdatedAt?: Date | null;

  @Field(() => Date, { nullable: true, description: 'Timestamp when client last synced' })
  clientLastSyncedAt?: Date | null;

  @Field(() => String, { nullable: true, description: 'Details about what changed' })
  conflictDetails?: string | null;
}
