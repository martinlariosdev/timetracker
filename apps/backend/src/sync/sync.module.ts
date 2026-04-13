import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SyncService } from './sync.service';
import { SyncResolver } from './sync.resolver';

/**
 * SyncModule
 * Provides offline sync queue management functionality
 * Includes service and GraphQL resolver for sync operations
 */
@Module({
  imports: [PrismaModule],
  providers: [SyncService, SyncResolver],
  exports: [SyncService],
})
export class SyncModule {}
