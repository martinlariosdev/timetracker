import { registerEnumType } from '@nestjs/graphql';

/**
 * Enum for conflict resolution strategies
 */
export enum ConflictResolutionStrategy {
  SERVER_WINS = 'SERVER_WINS',
  CLIENT_WINS = 'CLIENT_WINS',
  MANUAL_MERGE = 'MANUAL_MERGE',
}

registerEnumType(ConflictResolutionStrategy, {
  name: 'ConflictResolutionStrategy',
  description: 'Strategy for resolving data conflicts during sync',
});
