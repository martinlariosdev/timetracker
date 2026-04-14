import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TimeEntry } from '@prisma/client';

/**
 * SubmissionService
 * Handles timesheet submission workflow with validation and approval logic
 * Implements business rules for timesheet submission and team lead approval
 */
@Injectable()
export class SubmissionService {
  private readonly logger = new Logger(SubmissionService.name);
  private readonly MINIMUM_HOURS_PER_WEEK = 40;

  constructor(private prisma: PrismaService) {}

  /**
   * Submit a timesheet for approval
   * Validates that all required time entries exist and meet minimum hours
   * @param consultantId - ID of the consultant submitting
   * @param payPeriodId - ID of the pay period to submit
   * @returns Created submission record
   * @throws BadRequestException if validation fails
   */
  async submitTimesheet(consultantId: string, payPeriodId: string) {
    // Check that pay period exists
    const payPeriod = await this.prisma.payPeriod.findUnique({
      where: { id: payPeriodId },
    });

    if (!payPeriod) {
      throw new NotFoundException(`Pay period with ID ${payPeriodId} not found`);
    }

    // Check if already submitted
    const existingSubmission = await this.prisma.timesheetSubmission.findUnique({
      where: {
        consultantId_payPeriodId: {
          consultantId,
          payPeriodId,
        },
      },
    });

    if (existingSubmission && existingSubmission.status !== 'draft') {
      throw new BadRequestException(
        `Timesheet for this period has already been ${existingSubmission.status}`,
      );
    }

    // Get all time entries for this period
    const timeEntries = await this.prisma.timeEntry.findMany({
      where: {
        consultantId,
        payPeriodId,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Validate time entries
    await this.validateTimeEntries(timeEntries, payPeriod.startDate, payPeriod.endDate);

    // Create or update submission
    const submission = await this.prisma.timesheetSubmission.upsert({
      where: {
        consultantId_payPeriodId: {
          consultantId,
          payPeriodId,
        },
      },
      update: {
        status: 'submitted',
        submittedAt: new Date(),
      },
      create: {
        consultantId,
        payPeriodId,
        status: 'submitted',
        submittedAt: new Date(),
      },
    });

    this.logger.log(`Timesheet submitted: ${submission.id} by consultant ${consultantId}`);
    return submission;
  }

  /**
   * Approve a timesheet submission
   * Only team leads can approve timesheets for their consultants
   * @param submissionId - ID of the submission to approve
   * @param teamLeadId - ID of the team lead approving
   * @returns Updated submission record
   * @throws BadRequestException if validation fails
   */
  async approveTimesheet(submissionId: string, teamLeadId: string, comments?: string) {
    const submission = await this.prisma.timesheetSubmission.findUnique({
      where: { id: submissionId },
      include: {
        consultant: true,
      },
    });

    if (!submission) {
      throw new NotFoundException(`Submission with ID ${submissionId} not found`);
    }

    // Verify the submission is in submitted status
    if (submission.status !== 'submitted') {
      throw new BadRequestException(
        `Cannot approve timesheet with status: ${submission.status}`,
      );
    }

    // Verify team lead authorization
    if (submission.consultant.teamLeadId !== teamLeadId) {
      throw new BadRequestException(
        'You are not authorized to approve this timesheet',
      );
    }

    const updated = await this.prisma.timesheetSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: teamLeadId,
        comments: comments || submission.comments,
      },
    });

    this.logger.log(`Timesheet approved: ${submissionId} by team lead ${teamLeadId}`);
    return updated;
  }

  /**
   * Reject a timesheet submission
   * Only team leads can reject timesheets for their consultants
   * @param submissionId - ID of the submission to reject
   * @param teamLeadId - ID of the team lead rejecting
   * @param comments - Required comments explaining the rejection
   * @returns Updated submission record
   * @throws BadRequestException if validation fails
   */
  async rejectTimesheet(submissionId: string, teamLeadId: string, comments: string) {
    if (!comments || comments.trim().length === 0) {
      throw new BadRequestException('Comments are required when rejecting a timesheet');
    }

    const submission = await this.prisma.timesheetSubmission.findUnique({
      where: { id: submissionId },
      include: {
        consultant: true,
      },
    });

    if (!submission) {
      throw new NotFoundException(`Submission with ID ${submissionId} not found`);
    }

    // Verify the submission is in submitted status
    if (submission.status !== 'submitted') {
      throw new BadRequestException(
        `Cannot reject timesheet with status: ${submission.status}`,
      );
    }

    // Verify team lead authorization
    if (submission.consultant.teamLeadId !== teamLeadId) {
      throw new BadRequestException(
        'You are not authorized to reject this timesheet',
      );
    }

    const updated = await this.prisma.timesheetSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'rejected',
        rejectedAt: new Date(),
        rejectedBy: teamLeadId,
        comments,
      },
    });

    this.logger.log(`Timesheet rejected: ${submissionId} by team lead ${teamLeadId}`);
    return updated;
  }

  /**
   * Get a single submission by ID
   * @param id - Submission ID
   * @returns Submission record
   * @throws NotFoundException if not found
   */
  async getSubmission(id: string) {
    const submission = await this.prisma.timesheetSubmission.findUnique({
      where: { id },
      include: {
        consultant: true,
        payPeriod: true,
      },
    });

    if (!submission) {
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }

    return submission;
  }

  /**
   * Get a submission by consultant ID and pay period ID
   * @param consultantId - Consultant ID
   * @param payPeriodId - Pay period ID
   * @returns Submission record or null if not found
   */
  async getSubmissionByPayPeriod(consultantId: string, payPeriodId: string) {
    return this.prisma.timesheetSubmission.findFirst({
      where: {
        consultantId,
        payPeriodId,
      },
      include: {
        consultant: true,
        payPeriod: true,
      },
    });
  }

  /**
   * Get all submissions for a consultant
   * @param consultantId - Consultant ID
   * @returns Array of submissions
   */
  async getSubmissionsByConsultant(consultantId: string) {
    return this.prisma.timesheetSubmission.findMany({
      where: { consultantId },
      include: {
        payPeriod: true,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });
  }

  /**
   * Get all submissions for a team lead to review
   * @param teamLeadId - Team lead ID
   * @returns Array of submissions pending review
   */
  async getSubmissionsForTeamLead(teamLeadId: string) {
    return this.prisma.timesheetSubmission.findMany({
      where: {
        consultant: {
          teamLeadId,
        },
        status: 'submitted',
      },
      include: {
        consultant: true,
        payPeriod: true,
      },
      orderBy: {
        submittedAt: 'asc',
      },
    });
  }

  /**
   * Validate time entries for a pay period
   * Checks for:
   * - Minimum hours per week
   * - Date gaps in the period
   * - At least one entry exists
   * @throws BadRequestException if validation fails
   */
  private async validateTimeEntries(
    timeEntries: TimeEntry[],
    periodStart: Date,
    periodEnd: Date,
  ): Promise<void> {
    // Check that at least one time entry exists
    if (timeEntries.length === 0) {
      throw new BadRequestException(
        'Cannot submit timesheet: No time entries found for this period',
      );
    }

    // Calculate total hours
    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.totalHours, 0);

    // Calculate number of weeks in the period
    const periodDays = Math.ceil(
      (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24),
    );
    const weeks = Math.ceil(periodDays / 7);
    const minimumHours = weeks * this.MINIMUM_HOURS_PER_WEEK;

    // Check minimum hours
    if (totalHours < minimumHours) {
      throw new BadRequestException(
        `Cannot submit timesheet: Total hours (${totalHours}) is less than minimum required (${minimumHours} hours for ${weeks} week(s))`,
      );
    }

    // Check for date gaps (find dates with no entries)
    const entryDates = new Set(
      timeEntries.map(entry => entry.date.toISOString().split('T')[0]),
    );

    const missingDates: string[] = [];
    const currentDate = new Date(periodStart);

    while (currentDate <= periodEnd) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay();

      // Only check weekdays (Monday = 1, Friday = 5)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        if (!entryDates.has(dateStr)) {
          missingDates.push(dateStr);
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (missingDates.length > 0) {
      this.logger.warn(
        `Timesheet has missing weekday entries: ${missingDates.join(', ')}`,
      );
      // Note: This is a warning, not a hard error
      // Some organizations may allow gaps (vacation, sick days, etc.)
    }

    this.logger.log(
      `Validation passed: ${timeEntries.length} entries, ${totalHours} total hours`,
    );
  }
}
