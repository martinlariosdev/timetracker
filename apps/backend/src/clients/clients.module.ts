import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ClientsService } from './clients.service';
import { ClientsResolver } from './clients.resolver';

/**
 * ClientsModule
 * Provides client listing functionality for the client selector
 * Includes service and GraphQL resolver for client queries
 */
@Module({
  imports: [PrismaModule],
  providers: [ClientsService, ClientsResolver],
  exports: [ClientsService],
})
export class ClientsModule {}
