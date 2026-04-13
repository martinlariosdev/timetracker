import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { createTimeEntrySchema, patchTimeEntrySchema } from '@timetrack/shared';
import { ZodError } from 'zod';
import { CreateTimeEntryInput } from './dto/create-time-entry.input';
import { UpdateTimeEntryInput } from './dto/update-time-entry.input';

/**
 * TimesheetService
 * Handles CRUD operations for time entries with Zod validation
 * Integrates with Prisma for database operations
 */
@Injectable()
export class TimesheetService {
  private readonly logger = new Logger(TimesheetService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new time entry
   * Validates input with Zod schema and calculates total hours
   */
  async create(data: CreateTimeEntryInput) {
    try {
      // Convert string IDs to match shared schema expectations (number)
      // Note: The shared schema expects numeric IDs, but Prisma uses ObjectId strings
      // We'll validate the string format and structure, then convert for DB
      const validationData = {
        consultantId: this.convertToNumericId(data.consultantId),
        payPeriodId: this.convertToNumericId(data.payPeriodId),
        date: data.date,
        projectTaskNumber: data.projectTaskNumber || null,
        clientName: data.clientName,
        description: data.description,
        inTime1: data.inTime1,
        outTime1: data.outTime1,
        inTime2: data.inTime2 || null,
        outTime2: data.outTime2 || null,
      };

      // Validate with Zod schema from shared package
      const validated = createTimeEntrySchema.parse(validationData);

      // Check that consultant exists
      await this.validateConsultantExists(data.consultantId);

      // Check that pay period exists
      await this.validatePayPeriodExists(data.payPeriodId);

      // Check for overlapping entries
      await this.checkForOverlappingEntries(
        data.consultantId,
        data.date,
        data.inTime1,
        data.outTime1,
        data.inTime2,
        data.outTime2,
      );

      // Calculate total hours
      const totalHours = this.calculateTotalHours(
        data.inTime1,
        data.outTime1,
        data.inTime2,
        data.outTime2,
      );

      // Convert time strings to DateTime objects for Prisma
      const dateStr = data.date;
      const prismaData = {
        consultantId: data.consultantId,
        payPeriodId: data.payPeriodId,
        date: new Date(dateStr),
        projectTaskNumber: data.projectTaskNumber || null,
        clientName: data.clientName,
        description: data.description,
        inTime1: this.parseTimeToDateTime(dateStr, data.inTime1),
        outTime1: this.parseTimeToDateTime(dateStr, data.outTime1),
        inTime2: data.inTime2 ? this.parseTimeToDateTime(dateStr, data.inTime2) : null,
        outTime2: data.outTime2 ? this.parseTimeToDateTime(dateStr, data.outTime2) : null,
        totalHours,
        synced: true,
      };

      const timeEntry = await this.prisma.timeEntry.create({
        data: prismaData,
      });

      this.logger.log(`Created time entry ${timeEntry.id} for consultant ${data.consultantId}`);
      return timeEntry;
    } catch (error) {
      if (error instanceof ZodError) {
        this.logger.error('Validation error creating time entry', error.errors);
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.errors,
        });
      }
      throw error;
    }
  }

  /**
   * Find all time entries with optional filters
   */
  async findAll(filters?: {
    consultantId?: string;
    payPeriodId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: Prisma.TimeEntryWhereInput = {};

    if (filters?.consultantId) {
      where.consultantId = filters.consultantId;
    }

    if (filters?.payPeriodId) {
      where.payPeriodId = filters.payPeriodId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.date.lte = filters.endDate;
      }
    }

    const entries = await this.prisma.timeEntry.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        consultant: true,
        payPeriod: true,
      },
    });

    this.logger.log(`Found ${entries.length} time entries with filters: ${JSON.stringify(filters)}`);
    return entries;
  }

  /**
   * Find a single time entry by ID
   */
  async findOne(id: string) {
    const entry = await this.prisma.timeEntry.findUnique({
      where: { id },
      include: {
        consultant: true,
        payPeriod: true,
      },
    });

    if (!entry) {
      throw new NotFoundException(`TimeEntry with ID ${id} not found`);
    }

    return entry;
  }

  /**
   * Update an existing time entry
   * Validates changes with Zod and recalculates total hours if time fields changed
   */
  async update(id: string, data: UpdateTimeEntryInput) {
    // Check that entry exists
    const existingEntry = await this.findOne(id);

    try {
      // Build validation data from update input
      const validationData: Record<string, unknown> = {};

      if (data.consultantId !== undefined) {
        validationData.consultantId = this.convertToNumericId(data.consultantId);
      }
      if (data.payPeriodId !== undefined) {
        validationData.payPeriodId = this.convertToNumericId(data.payPeriodId);
      }
      if (data.date !== undefined) {
        validationData.date = data.date;
      }
      if (data.projectTaskNumber !== undefined) {
        validationData.projectTaskNumber = data.projectTaskNumber || null;
      }
      if (data.clientName !== undefined) {
        validationData.clientName = data.clientName;
      }
      if (data.description !== undefined) {
        validationData.description = data.description;
      }
      if (data.inTime1 !== undefined) {
        validationData.inTime1 = data.inTime1;
      }
      if (data.outTime1 !== undefined) {
        validationData.outTime1 = data.outTime1;
      }
      if (data.inTime2 !== undefined) {
        validationData.inTime2 = data.inTime2 || null;
      }
      if (data.outTime2 !== undefined) {
        validationData.outTime2 = data.outTime2 || null;
      }

      // Validate with partial schema
      patchTimeEntrySchema.parse(validationData);

      // Build Prisma update data
      const prismaData: Partial<Prisma.TimeEntryUpdateInput> = {};
      const dateStr = data.date || existingEntry.date.toISOString().split('T')[0];

      if (data.consultantId !== undefined) {
        await this.validateConsultantExists(data.consultantId);
        prismaData.consultant = { connect: { id: data.consultantId } };
      }

      if (data.payPeriodId !== undefined) {
        await this.validatePayPeriodExists(data.payPeriodId);
        prismaData.payPeriod = { connect: { id: data.payPeriodId } };
      }

      if (data.date !== undefined) {
        prismaData.date = new Date(data.date);
      }

      if (data.projectTaskNumber !== undefined) {
        prismaData.projectTaskNumber = data.projectTaskNumber || null;
      }

      if (data.clientName !== undefined) {
        prismaData.clientName = data.clientName;
      }

      if (data.description !== undefined) {
        prismaData.description = data.description;
      }

      // Handle time field updates
      const timeFieldsChanged =
        data.inTime1 !== undefined ||
        data.outTime1 !== undefined ||
        data.inTime2 !== undefined ||
        data.outTime2 !== undefined;

      if (timeFieldsChanged) {
        // Get final time values (new or existing)
        const finalInTime1 = data.inTime1 || this.extractTimeString(existingEntry.inTime1) || '';
        const finalOutTime1 = data.outTime1 || this.extractTimeString(existingEntry.outTime1) || '';
        const finalInTime2 = data.inTime2 !== undefined
          ? data.inTime2
          : this.extractTimeString(existingEntry.inTime2);
        const finalOutTime2 = data.outTime2 !== undefined
          ? data.outTime2
          : this.extractTimeString(existingEntry.outTime2);

        // Validate that required time fields are present
        if (!finalInTime1 || !finalOutTime1) {
          throw new BadRequestException('inTime1 and outTime1 are required');
        }

        // Check for overlapping entries (excluding current entry)
        await this.checkForOverlappingEntries(
          data.consultantId || existingEntry.consultantId,
          dateStr,
          finalInTime1,
          finalOutTime1,
          finalInTime2,
          finalOutTime2,
          id, // Exclude current entry from overlap check
        );

        // Update time fields
        if (data.inTime1 !== undefined) {
          prismaData.inTime1 = this.parseTimeToDateTime(dateStr, data.inTime1);
        }
        if (data.outTime1 !== undefined) {
          prismaData.outTime1 = this.parseTimeToDateTime(dateStr, data.outTime1);
        }
        if (data.inTime2 !== undefined) {
          prismaData.inTime2 = data.inTime2 ? this.parseTimeToDateTime(dateStr, data.inTime2) : null;
        }
        if (data.outTime2 !== undefined) {
          prismaData.outTime2 = data.outTime2 ? this.parseTimeToDateTime(dateStr, data.outTime2) : null;
        }

        // Recalculate total hours
        prismaData.totalHours = this.calculateTotalHours(
          finalInTime1,
          finalOutTime1,
          finalInTime2,
          finalOutTime2,
        );
      }

      const updated = await this.prisma.timeEntry.update({
        where: { id },
        data: prismaData,
      });

      this.logger.log(`Updated time entry ${id}`);
      return updated;
    } catch (error) {
      if (error instanceof ZodError) {
        this.logger.error('Validation error updating time entry', error.errors);
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.errors,
        });
      }
      throw error;
    }
  }

  /**
   * Delete a time entry
   */
  async delete(id: string) {
    // Check that entry exists
    await this.findOne(id);

    const deleted = await this.prisma.timeEntry.delete({
      where: { id },
    });

    this.logger.log(`Deleted time entry ${id}`);
    return deleted;
  }

  /**
   * Calculate total hours from time strings in HH:mm format
   */
  private calculateTotalHours(
    inTime1: string,
    outTime1: string,
    inTime2?: string | null,
    outTime2?: string | null,
  ): number {
    const hours1 = this.calculateHoursBetween(inTime1, outTime1);
    let hours2 = 0;

    if (inTime2 && outTime2) {
      hours2 = this.calculateHoursBetween(inTime2, outTime2);
    }

    return hours1 + hours2;
  }

  /**
   * Calculate hours between two time strings
   */
  private calculateHoursBetween(startTime: string, endTime: string): number {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    const totalMinutes = endMinutes - startMinutes;
    return totalMinutes / 60;
  }

  /**
   * Parse time string (HH:mm) to DateTime object for a given date
   */
  private parseTimeToDateTime(dateStr: string, timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(dateStr);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  /**
   * Extract time string (HH:mm) from DateTime object
   */
  private extractTimeString(dateTime: Date | null): string | null {
    if (!dateTime) return null;
    const date = new Date(dateTime);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Convert ObjectId string to a numeric representation for validation
   * This is a workaround since shared schema expects numeric IDs
   * but we use MongoDB ObjectId strings
   */
  private convertToNumericId(objectId: string): number {
    // For validation purposes, we'll use a simple hash
    // This is just for Zod validation compatibility
    let hash = 0;
    for (let i = 0; i < objectId.length; i++) {
      const char = objectId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Validate that consultant exists
   */
  private async validateConsultantExists(consultantId: string): Promise<void> {
    const consultant = await this.prisma.consultant.findUnique({
      where: { id: consultantId },
    });

    if (!consultant) {
      throw new BadRequestException(`Consultant with ID ${consultantId} not found`);
    }
  }

  /**
   * Validate that pay period exists
   */
  private async validatePayPeriodExists(payPeriodId: string): Promise<void> {
    const payPeriod = await this.prisma.payPeriod.findUnique({
      where: { id: payPeriodId },
    });

    if (!payPeriod) {
      throw new BadRequestException(`Pay period with ID ${payPeriodId} not found`);
    }
  }

  /**
   * Check for overlapping time entries on the same date for the same consultant
   */
  private async checkForOverlappingEntries(
    consultantId: string,
    date: string,
    inTime1: string,
    outTime1: string,
    inTime2?: string | null,
    outTime2?: string | null,
    excludeEntryId?: string,
  ): Promise<void> {
    const dateObj = new Date(date);
    const startOfDay = new Date(dateObj);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateObj);
    endOfDay.setHours(23, 59, 59, 999);

    const existingEntries = await this.prisma.timeEntry.findMany({
      where: {
        consultantId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        ...(excludeEntryId && { id: { not: excludeEntryId } }),
      },
    });

    for (const entry of existingEntries) {
      const existingInTime1 = this.extractTimeString(entry.inTime1);
      const existingOutTime1 = this.extractTimeString(entry.outTime1);
      const existingInTime2 = this.extractTimeString(entry.inTime2);
      const existingOutTime2 = this.extractTimeString(entry.outTime2);

      // Check overlap with first time block
      if (existingInTime1 && existingOutTime1) {
        if (this.timesOverlap(inTime1, outTime1, existingInTime1, existingOutTime1)) {
          throw new BadRequestException(
            `Time entry overlaps with existing entry: ${existingInTime1}-${existingOutTime1}`,
          );
        }

        if (inTime2 && outTime2 && this.timesOverlap(inTime2, outTime2, existingInTime1, existingOutTime1)) {
          throw new BadRequestException(
            `Time entry overlaps with existing entry: ${existingInTime1}-${existingOutTime1}`,
          );
        }
      }

      // Check overlap with second time block
      if (existingInTime2 && existingOutTime2) {
        if (this.timesOverlap(inTime1, outTime1, existingInTime2, existingOutTime2)) {
          throw new BadRequestException(
            `Time entry overlaps with existing entry: ${existingInTime2}-${existingOutTime2}`,
          );
        }

        if (inTime2 && outTime2 && this.timesOverlap(inTime2, outTime2, existingInTime2, existingOutTime2)) {
          throw new BadRequestException(
            `Time entry overlaps with existing entry: ${existingInTime2}-${existingOutTime2}`,
          );
        }
      }
    }
  }

  /**
   * Check if two time ranges overlap
   */
  private timesOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string,
  ): boolean {
    const [h1s, m1s] = start1.split(':').map(Number);
    const [h1e, m1e] = end1.split(':').map(Number);
    const [h2s, m2s] = start2.split(':').map(Number);
    const [h2e, m2e] = end2.split(':').map(Number);

    const range1Start = h1s * 60 + m1s;
    const range1End = h1e * 60 + m1e;
    const range2Start = h2s * 60 + m2s;
    const range2End = h2e * 60 + m2e;

    return range1Start < range2End && range2Start < range1End;
  }
}
