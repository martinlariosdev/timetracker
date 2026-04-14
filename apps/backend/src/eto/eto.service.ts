import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UseETOInput, AdjustETOInput, ETOTransactionObjectType } from './dto';
import { ETOTransactionType } from './dto/eto-transaction.object';

const DEFAULT_TRANSACTION_LIMIT = 50;

/**
 * ETOService
 * Handles business logic for ETO (Earned Time Off) management
 * Manages balance updates, transaction creation, and validation
 */
@Injectable()
export class ETOService {
  private readonly logger = new Logger(ETOService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get current ETO balance for a consultant
   * @param consultantId - ID of the consultant
   * @returns Current ETO balance in hours
   */
  async getBalance(consultantId: string): Promise<number> {
    const consultant = await this.prisma.consultant.findUnique({
      where: { id: consultantId },
      select: { etoBalance: true },
    });

    if (!consultant) {
      throw new NotFoundException(`Consultant with ID ${consultantId} not found`);
    }

    return consultant.etoBalance;
  }


  /**
   * Get ETO transactions for a consultant
   * @param consultantId - ID of the consultant
   * @param limit - Maximum number of transactions to return
   * @param offset - Number of transactions to skip
   * @returns Array of ETO transactions
   */
  async getTransactions(consultantId: string, limit?: number, offset?: number): Promise<ETOTransactionObjectType[]> {
    // Verify consultant exists and get current balance for running balance calculation
    const consultant = await this.prisma.consultant.findUnique({
      where: { id: consultantId },
      select: { id: true, etoBalance: true },
    });

    if (!consultant) {
      throw new NotFoundException(`Consultant with ID ${consultantId} not found`);
    }

    const where = { consultantId };

    // Fetch all transactions (up to limit) sorted newest-first
    const transactions = await this.prisma.eTOTransaction.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit || DEFAULT_TRANSACTION_LIMIT,
      skip: offset || 0,
    });

    // Compute running balance: start from current balance and work backwards.
    // The most recent transaction's running balance equals the current balance.
    // Each older transaction's running balance = the newer one's balance minus the newer one's hours.
    // Note: When offset > 0 (pagination), we need to account for skipped transactions.
    // We subtract the sum of skipped transactions' hours from the current balance.
    let runningBalance = consultant.etoBalance;
    if (offset && offset > 0) {
      const skippedTransactions = await this.prisma.eTOTransaction.findMany({
        where,
        orderBy: { date: 'desc' },
        take: offset,
        select: { hours: true },
      });
      const skippedHours = skippedTransactions.reduce((sum, tx) => sum + tx.hours, 0);
      runningBalance = Math.round((runningBalance - skippedHours) * 100) / 100;
    }
    const withRunningBalance = transactions.map((tx) => {
      const result = {
        ...tx,
        runningBalance,
      };
      // Subtract this transaction's hours to get the balance before it
      runningBalance = Math.round((runningBalance - tx.hours) * 100) / 100;
      return result;
    });

    return withRunningBalance as ETOTransactionObjectType[];
  }

  /**
   * Use ETO hours (deduct from balance)
   * Creates a transaction and updates the consultant's balance atomically
   * @param consultantId - ID of the consultant
   * @param input - Hours, date, and optional description
   * @returns Created ETO transaction
   * @throws BadRequestException if insufficient balance
   */
  async useETO(consultantId: string, input: UseETOInput): Promise<ETOTransactionObjectType> {
    const { hours, date, description, projectName } = input;

    // Validate that hours is positive
    if (hours <= 0) {
      throw new BadRequestException('Hours must be positive when using ETO');
    }

    // Use a transaction to ensure atomic update
    const result = await this.prisma.$transaction(async (tx) => {
      // Read consultant inside transaction to prevent race condition
      const consultant = await tx.consultant.findUnique({
        where: { id: consultantId },
        select: { etoBalance: true },
      });

      if (!consultant) {
        throw new NotFoundException(`Consultant with ID ${consultantId} not found`);
      }

      // Check sufficient balance inside transaction
      if (consultant.etoBalance < hours) {
        throw new BadRequestException(
          `Insufficient ETO balance. Available: ${consultant.etoBalance} hours, Requested: ${hours} hours`,
        );
      }

      // Create ETO transaction record (negative hours for usage)
      const transaction = await tx.eTOTransaction.create({
        data: {
          consultantId,
          date: new Date(date),
          hours: -hours, // Negative for usage
          transactionType: ETOTransactionType.USAGE,
          description: description || 'ETO usage',
          projectName: projectName || null,
          synced: true,
        },
      });

      // Update consultant's ETO balance
      await tx.consultant.update({
        where: { id: consultantId },
        data: {
          etoBalance: {
            decrement: hours,
          },
        },
      });

      this.logger.log(`Consultant ${consultantId} used ${hours} hours of ETO. New balance: ${consultant.etoBalance - hours}`);
      return transaction as ETOTransactionObjectType;
    });

    return result;
  }

  /**
   * Adjust ETO balance (accrual or administrative adjustment)
   * Creates a transaction and updates the consultant's balance atomically
   * @param input - ConsultantId, hours, transactionType, date, and description
   * @returns Created ETO transaction
   * @throws NotFoundException if consultant not found
   * @throws BadRequestException if adjustment would result in negative balance
   */
  async adjustETO(input: AdjustETOInput): Promise<ETOTransactionObjectType> {
    const { consultantId, hours, transactionType, date, description } = input;

    // Validate that hours is positive
    if (hours <= 0) {
      throw new BadRequestException('Hours must be positive');
    }

    // Determine if this is adding or subtracting based on transactionType
    const isAccrual = transactionType === ETOTransactionType.ACCRUAL;
    const actualHours = isAccrual ? hours : -hours;

    // Use a transaction to ensure atomic update
    const result = await this.prisma.$transaction(async (tx) => {
      // Read consultant inside transaction to prevent race condition
      const consultant = await tx.consultant.findUnique({
        where: { id: consultantId },
        select: { etoBalance: true },
      });

      if (!consultant) {
        throw new NotFoundException(`Consultant with ID ${consultantId} not found`);
      }

      // Check that adjustment won't result in negative balance inside transaction
      const newBalance = consultant.etoBalance + actualHours;
      if (newBalance < 0) {
        throw new BadRequestException(
          `Adjustment would result in negative balance. Current: ${consultant.etoBalance} hours, Adjustment: ${actualHours} hours`,
        );
      }

      // Create ETO transaction record
      const transaction = await tx.eTOTransaction.create({
        data: {
          consultantId,
          date: new Date(date),
          hours: actualHours,
          transactionType,
          description,
          synced: true,
        },
      });

      // Update consultant's ETO balance with single update using increment
      await tx.consultant.update({
        where: { id: consultantId },
        data: {
          etoBalance: {
            increment: actualHours, // actualHours is already positive or negative
          },
        },
      });

      this.logger.log(`Consultant ${consultantId} ETO adjusted by ${actualHours} hours (${transactionType})`);
      return transaction as ETOTransactionObjectType;
    });

    return result;
  }
}
