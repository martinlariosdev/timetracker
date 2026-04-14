import { registerEnumType } from '@nestjs/graphql';

/**
 * Enum for sync operations
 */
export enum SyncOperation {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

registerEnumType(SyncOperation, {
  name: 'SyncOperation',
  description: 'Type of sync operation to perform',
});
