import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators';
import { SubmissionService } from './submission.service';
import {
  TimesheetSubmissionType,
  SubmitTimesheetInput,
  ApproveTimesheetInput,
  RejectTimesheetInput,
} from './dto';
import type { Consultant } from '@prisma/client';

/**
 * SubmissionResolver
 * Provides GraphQL API for timesheet submission and approval workflow
 * All operations are protected by JWT authentication
 * Team lead operations require additional authorization checks
 */
@Resolver(() => TimesheetSubmissionType)
@UseGuards(JwtAuthGuard)
export class SubmissionResolver {
  constructor(private submissionService: SubmissionService) {}

  /**
   * Submit a timesheet for approval
   * Consultants can only submit their own timesheets
   * @param input - Contains payPeriodId to submit
   * @param user - Current authenticated user
   * @returns Created submission record
   */
  @Mutation(() => TimesheetSubmissionType, { description: 'Submit a timesheet for approval' })
  async submitTimesheet(
    @Args('input') input: SubmitTimesheetInput,
    @CurrentUser() user: Consultant,
  ) {
    return this.submissionService.submitTimesheet(user.id, input.payPeriodId);
  }

  /**
   * Approve a timesheet submission
   * Only team leads can approve timesheets for their consultants
   * @param input - Contains submissionId and optional comments
   * @param user - Current authenticated user (must be a team lead)
   * @returns Updated submission record
   */
  @Mutation(() => TimesheetSubmissionType, { description: 'Approve a timesheet submission (team leads only)' })
  async approveTimesheet(
    @Args('input') input: ApproveTimesheetInput,
    @CurrentUser() user: Consultant,
  ) {
    // Use user.externalId as the team lead identifier
    // The service will verify authorization against consultant.teamLeadId
    return this.submissionService.approveTimesheet(
      input.submissionId,
      user.externalId,
      input.comments,
    );
  }

  /**
   * Reject a timesheet submission
   * Only team leads can reject timesheets for their consultants
   * @param input - Contains submissionId and required comments
   * @param user - Current authenticated user (must be a team lead)
   * @returns Updated submission record
   */
  @Mutation(() => TimesheetSubmissionType, { description: 'Reject a timesheet submission (team leads only)' })
  async rejectTimesheet(
    @Args('input') input: RejectTimesheetInput,
    @CurrentUser() user: Consultant,
  ) {
    // Use user.externalId as the team lead identifier
    return this.submissionService.rejectTimesheet(
      input.submissionId,
      user.externalId,
      input.comments,
    );
  }

  /**
   * Get a single timesheet submission
   * Users can view their own submissions or submissions they need to approve
   * @param id - Submission ID
   * @param user - Current authenticated user
   * @returns Submission record
   */
  @Query(() => TimesheetSubmissionType, { description: 'Get a timesheet submission by ID' })
  async timesheetSubmission(
    @Args('id') id: string,
    @CurrentUser() user: Consultant,
  ) {
    const submission = await this.submissionService.getSubmission(id);

    // Check authorization: user must be the consultant or their team lead
    const isOwner = submission.consultantId === user.id;
    const isTeamLead = submission.consultant.teamLeadId === user.externalId;

    if (!isOwner && !isTeamLead) {
      throw new ForbiddenException(
        'You can only view your own submissions or submissions for your team',
      );
    }

    return submission;
  }

  /**
   * Get all timesheet submissions for the current user
   * @param user - Current authenticated user
   * @returns Array of submissions
   */
  @Query(() => [TimesheetSubmissionType], { description: 'Get all timesheet submissions for the current user' })
  async myTimesheetSubmissions(@CurrentUser() user: Consultant) {
    return this.submissionService.getSubmissionsByConsultant(user.id);
  }

  /**
   * Get all timesheet submissions pending review by the current team lead
   * Only returns submissions for consultants under this team lead
   * @param user - Current authenticated user (team lead)
   * @returns Array of submissions pending review
   */
  @Query(() => [TimesheetSubmissionType], { description: 'Get timesheet submissions pending review (team leads only)' })
  async pendingTimesheetSubmissions(@CurrentUser() user: Consultant) {
    // Use externalId as the team lead identifier
    return this.submissionService.getSubmissionsForTeamLead(user.externalId);
  }
}
