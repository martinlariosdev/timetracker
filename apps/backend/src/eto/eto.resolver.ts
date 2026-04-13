import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ETOService } from './eto.service';
import {
  ETOTransactionType,
  ETOBalanceType,
  UseETOInput,
  AdjustETOInput,
  ETOFilterInput,
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
   * Query ETO balance for the current user
   * Returns balance along with recent transactions and period statistics
   * @param filters - Optional filters for transactions
   * @param user - Current authenticated user
   * @returns ETO balance information
   */
  @Query(() => ETOBalanceType, { description: 'Get current ETO balance and recent transactions' })
  async etoBalance(
    @Args('filters', { nullable: true }) filters: ETOFilterInput,
    @CurrentUser() user: Consultant,
  ): Promise<ETOBalanceType> {
    return this.etoService.getBalanceWithTransactions(user.id, filters);
  }

  /**
   * Query ETO transactions for the current user
   * Optional filters can be applied for date range and transaction type
   * @param filters - Optional filters for date range and type
   * @param user - Current authenticated user
   * @returns Array of ETO transactions with running balances
   */
  @Query(() => [ETOTransactionType], { description: 'Get ETO transactions for the current user' })
  async etoTransactions(
    @Args('filters', { nullable: true }) filters: ETOFilterInput,
    @CurrentUser() user: Consultant,
  ): Promise<ETOTransactionType[]> {
    return this.etoService.getTransactions(user.id, filters);
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
   * Note: In production, this should be restricted to admins/managers
   * @param input - Hours, type, date, and description
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
    // For now, users can adjust their own balance for testing
    return this.etoService.adjustETO(user.id, input);
  }
}
