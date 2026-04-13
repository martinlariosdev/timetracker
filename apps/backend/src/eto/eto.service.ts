import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UseETOInput, AdjustETOInput } from './dto';

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
  async getTransactions(consultantId: string, limit?: number, offset?: number) {
    const where = { consultantId };

    const transactions = await this.prisma.eTOTransaction.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit || 50,
      skip: offset || 0,
    });

    return transactions;
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
   * @param input - ConsultantId, hours, transactionType, date, and description
   * @returns Created ETO transaction
   * @throws NotFoundException if consultant not found
   * @throws BadRequestException if adjustment would result in negative balance
   */
  async adjustETO(input: AdjustETOInput) {
    const { consultantId, hours, transactionType, date, description } = input;

    // Validate that hours is positive
    if (hours <= 0) {
      throw new BadRequestException('Hours must be positive');
    }

    // Validate consultant exists and get current balance
    const currentBalance = await this.getBalance(consultantId);

    // Determine if this is adding or subtracting based on transactionType
    const isAccrual = transactionType === 'Accrual';
    const actualHours = isAccrual ? hours : -hours;

    // Check that adjustment won't result in negative balance
    const newBalance = currentBalance + actualHours;
    if (newBalance < 0) {
      throw new BadRequestException(
        `Adjustment would result in negative balance. Current: ${currentBalance} hours, Adjustment: ${actualHours} hours`,
      );
    }

    // Use a transaction to ensure atomic update
    const result = await this.prisma.$transaction(async (tx) => {
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

      // Update consultant's ETO balance
      if (isAccrual) {
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
              decrement: hours,
            },
          },
        });
      }

      this.logger.log(`Consultant ${consultantId} ETO adjusted by ${actualHours} hours (${transactionType})`);
      return transaction;
    });

    return result;
  }
}
