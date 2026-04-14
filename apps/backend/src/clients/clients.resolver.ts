import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClientsService } from './clients.service';
import { ClientType } from './dto/client.type';

/**
 * ClientsResolver
 * Provides GraphQL API for querying available clients
 * Protected by JWT authentication
 */
@Resolver(() => ClientType)
@UseGuards(JwtAuthGuard)
export class ClientsResolver {
  constructor(private readonly clientsService: ClientsService) {}

  /**
   * Query all active clients
   * @returns Array of active clients sorted by name
   */
  @Query(() => [ClientType], { description: 'Get all active clients' })
  async clients(): Promise<ClientType[]> {
    return this.clientsService.getActiveClients();
  }
}
