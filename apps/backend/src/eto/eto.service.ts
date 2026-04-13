import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UseETOInput, AdjustETOInput, ETOFilterInput } from './dto';

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
      throw new BadRequestException(`Consultant with ID ${consultantId} not found`);
    }

    return consultant.etoBalance;
  }

  /**
   * Get ETO balance with recent transactions and period statistics
   * @param consultantId - ID of the consultant
   * @param filters - Optional filters for transactions
   * @returns Balance information with recent transactions
   */
  async getBalanceWithTransactions(consultantId: string, filters?: ETOFilterInput) {
    const balance = await this.getBalance(consultantId);

    // Get recent transactions
    const limit = filters?.limit || 10;
    const where: any = { consultantId };

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    if (filters?.transactionType) {
      where.transactionType = filters.transactionType;
    }

    const transactions = await this.prisma.eTOTransaction.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit,
    });

    // Calculate running balances for each transaction
    const transactionsWithBalance = await this.calculateRunningBalances(consultantId, transactions);

    // Calculate period statistics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const periodTransactions = await this.prisma.eTOTransaction.findMany({
      where: {
        consultantId,
        date: { gte: thirtyDaysAgo },
      },
    });

    const accruedThisPeriod = periodTransactions
      .filter((t) => t.transactionType === 'Accrual' && t.hours > 0)
      .reduce((sum, t) => sum + t.hours, 0);

    const usedThisPeriod = periodTransactions
      .filter((t) => t.transactionType === 'Usage')
      .reduce((sum, t) => sum + Math.abs(t.hours), 0);

    return {
      balance,
      recentTransactions: transactionsWithBalance,
      accruedThisPeriod,
      usedThisPeriod,
    };
  }

  /**
   * Get ETO transactions for a consultant
   * @param consultantId - ID of the consultant
   * @param filters - Optional filters for date range and type
   * @returns Array of ETO transactions
   */
  async getTransactions(consultantId: string, filters?: ETOFilterInput) {
    const where: any = { consultantId };

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    if (filters?.transactionType) {
      where.transactionType = filters.transactionType;
    }

    const limit = filters?.limit || 50;

    const transactions = await this.prisma.eTOTransaction.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit,
    });

    // Calculate running balances
    return this.calculateRunningBalances(consultantId, transactions);
  }

  /**
   * Use ETO hours (deduct from balance)
   * Creates a transaction and updates the consultant's balance atomically
   * @param consultantId - ID of the consultant
   * @param input - Hours, date, and optional description
   * @returns Created ETO transaction
   * @throws BadRequestException if insufficient balance
   */
  async useETO(consultantId: string, input: UseETOInput) {
    const { hours, date, description, projectName } = input;

    // Validate that hours is positive
    if (hours <= 0) {
      throw new BadRequestException('Hours must be positive when using ETO');
    }

    // Get current balance
    const currentBalance = await this.getBalance(consultantId);

    // Check sufficient balance
    if (currentBalance < hours) {
      throw new BadRequestException(
        `Insufficient ETO balance. Available: ${currentBalance} hours, Requested: ${hours} hours`,
      );
    }

    // Use a transaction to ensure atomic update
    const result = await this.prisma.$transaction(async (tx) => {
      // Create ETO transaction record (negative hours for usage)
      const transaction = await tx.eTOTransaction.create({
        data: {
          consultantId,
          date: new Date(date),
          hours: -hours, // Negative for usage
          transactionType: 'Usage',
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

      this.logger.log(`Consultant ${consultantId} used ${hours} hours of ETO. New balance: ${currentBalance - hours}`);
      return transaction;
    });

    return result;
  }

  /**
   * Adjust ETO balance (accrual or administrative adjustment)
   * Creates a transaction and updates the consultant's balance atomically
   * @param consultantId - ID of the consultant
   * @param input - Hours, type, date, and description
   * @returns Created ETO transaction
   */
  async adjustETO(consultantId: string, input: AdjustETOInput) {
    const { hours, type, date, description } = input;

    // Validate consultant exists
    await this.getBalance(consultantId);

    // Use a transaction to ensure atomic update
    const result = await this.prisma.$transaction(async (tx) => {
      // Create ETO transaction record
      const transaction = await tx.eTOTransaction.create({
        data: {
          consultantId,
          date: new Date(date),
          hours, // Can be positive or negative
          transactionType: type,
          description,
          synced: true,
        },
      });

      // Update consultant's ETO balance
      if (hours > 0) {
        await tx.consultant.update({
          where: { id: consultantId },
          data: {
            etoBalance: {
              increment: hours,
            },
          },
        });
      } else {
        await tx.consultant.update({
          where: { id: consultantId },
          data: {
            etoBalance: {
              decrement: Math.abs(hours),
            },
          },
        });
      }

      this.logger.log(`Consultant ${consultantId} ETO adjusted by ${hours} hours (${type})`);
      return transaction;
    });

    return result;
  }

  /**
   * Calculate running balances for a list of transactions
   * Adds runningBalance field to each transaction
   * @param consultantId - ID of the consultant
   * @param transactions - Array of transactions (should be ordered by date desc)
   * @returns Transactions with running balance calculated
   */
  private async calculateRunningBalances(consultantId: string, transactions: any[]) {
    if (transactions.length === 0) {
      return [];
    }

    // Get current balance
    const currentBalance = await this.getBalance(consultantId);

    // Sort transactions by date descending to calculate backwards
    const sorted = [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime());

    let runningBalance = currentBalance;
    const withBalances = sorted.map((transaction) => {
      const transactionWithBalance = {
        ...transaction,
        runningBalance,
      };
      // Subtract this transaction to get previous balance
      runningBalance -= transaction.hours;
      return transactionWithBalance;
    });

    return withBalances;
  }
}
