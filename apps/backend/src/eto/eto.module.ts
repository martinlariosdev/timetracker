import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ETOService } from './eto.service';
import { ETOResolver } from './eto.resolver';

/**
 * ETOModule
 * Provides ETO (Earned Time Off) management functionality
 * Includes service and GraphQL resolver for ETO operations
 */
@Module({
  imports: [PrismaModule],
  providers: [ETOService, ETOResolver],
  exports: [ETOService],
})
export class ETOModule {}
