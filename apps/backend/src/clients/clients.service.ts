import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClientType } from './dto/client.type';

/**
 * ClientsService
 * Provides data access for Client entities
 */
@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all active clients, ordered by name ascending
   * @returns Array of active clients
   */
  async getActiveClients(): Promise<ClientType[]> {
    return this.prisma.client.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        active: true,
      },
    });
  }
}
