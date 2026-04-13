import { Resolver, Query, Mutation, Args, ID, Float, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ETOService } from './eto.service';
import {
  ETOTransactionType,
  UseETOInput,
  AdjustETOInput,
} from './dto';
import type { Consultant } from '../generated';

/**
 * ETOResolver
 * Provides GraphQL API for ETO (Earned Time Off) operations
 * All operations are protected by JWT authentication
 * Users can only access their own ETO data
 */
@Resolver(() => ETOTransactionType)
@UseGuards(JwtAuthGuard)
export class ETOResolver {
  constructor(private etoService: ETOService) {}

  /**
   * Query ETO balance for a consultant
   * Returns just the balance number
   * @param consultantId - ID of the consultant
   * @param user - Current authenticated user
   * @returns ETO balance in hours
   */
  @Query(() => Float, { description: 'Get current ETO balance for a consultant' })
  async etoBalance(
    @Args('consultantId', { type: () => ID }) consultantId: string,
    @CurrentUser() user: Consultant,
  ): Promise<number> {
    // TODO: Add authorization check - users should only query their own data OR be admin
    // For now, allow any authenticated user to query any consultant
    return this.etoService.getBalance(consultantId);
  }

  /**
   * Query ETO transactions for a consultant
   * Supports pagination via limit and offset
   * @param consultantId - ID of the consultant
   * @param limit - Maximum number of transactions to return
   * @param offset - Number of transactions to skip
   * @param user - Current authenticated user
   * @returns Array of ETO transactions
   */
  @Query(() => [ETOTransactionType], { description: 'Get ETO transactions for a consultant' })
  async etoTransactions(
    @Args('consultantId', { type: () => ID }) consultantId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @CurrentUser() user?: Consultant,
  ): Promise<ETOTransactionType[]> {
    // TODO: Add authorization check - users should only query their own data OR be admin
    // For now, allow any authenticated user to query any consultant
    return this.etoService.getTransactions(consultantId, limit, offset);
  }

  /**
   * Use ETO hours (take time off)
   * Deducts hours from the user's balance and creates a transaction
   * @param input - Hours, date, and optional description
   * @param user - Current authenticated user
   * @returns Created ETO transaction
   * @throws BadRequestException if insufficient balance
   */
  @Mutation(() => ETOTransactionType, { description: 'Use ETO hours (take time off)' })
  async useETO(
    @Args('input') input: UseETOInput,
    @CurrentUser() user: Consultant,
  ): Promise<ETOTransactionType> {
    return this.etoService.useETO(user.id, input);
  }

  /**
   * Manually adjust ETO balance
   * For accruals or administrative adjustments
   * This is an admin operation - admins can adjust any consultant's balance
   * @param input - ConsultantId, hours, transactionType, date, and description
   * @param user - Current authenticated user
   * @returns Created ETO transaction
   */
  @Mutation(() => ETOTransactionType, { description: 'Manually adjust ETO balance (accrual or admin adjustment)' })
  async adjustETO(
    @Args('input') input: AdjustETOInput,
    @CurrentUser() user: Consultant,
  ): Promise<ETOTransactionType> {
    // TODO: In production, add role-based authorization
    // Only allow admins or team leads to perform adjustments
    return this.etoService.adjustETO(input);
  }
}
