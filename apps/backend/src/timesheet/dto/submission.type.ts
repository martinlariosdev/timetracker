import { ObjectType, Field, ID } from '@nestjs/graphql';

/**
 * GraphQL Object Type for TimesheetSubmission
 * Represents a timesheet submission record in the approval workflow
 * Corresponds to the TimesheetSubmission Prisma model
 */
@ObjectType({ description: 'Timesheet submission for approval workflow' })
export class TimesheetSubmissionType {
  @Field(() => ID, { description: 'Unique identifier for the submission' })
  id: string;

  @Field(() => ID, { description: 'ID of the consultant who submitted the timesheet' })
  consultantId: string;

  @Field(() => ID, { description: 'ID of the pay period for this submission' })
  payPeriodId: string;

  @Field({ description: 'Submission status: draft, submitted, approved, or rejected' })
  status: string;

  @Field({ nullable: true, description: 'Timestamp when the timesheet was submitted' })
  submittedAt?: Date;

  @Field({ nullable: true, description: 'Timestamp when the timesheet was approved' })
  approvedAt?: Date;

  @Field({ nullable: true, description: 'ID of the team lead who approved the timesheet' })
  approvedBy?: string;

  @Field({ nullable: true, description: 'Timestamp when the timesheet was rejected' })
  rejectedAt?: Date;

  @Field({ nullable: true, description: 'ID of the team lead who rejected the timesheet' })
  rejectedBy?: string;

  @Field({ nullable: true, description: 'Comments from team lead (especially for rejections)' })
  comments?: string;

  @Field({ description: 'Timestamp when this submission was created' })
  createdAt: Date;

  @Field({ description: 'Timestamp when this submission was last updated' })
  updatedAt: Date;
}
