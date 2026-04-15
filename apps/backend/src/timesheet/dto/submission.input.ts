import { InputType, Field, ID } from '@nestjs/graphql';

/**
 * Input type for submitting a timesheet
 */
@InputType({ description: 'Input for submitting a timesheet for approval' })
export class SubmitTimesheetInput {
  @Field(() => ID, { description: 'ID of the pay period to submit' })
  payPeriodId: string;
}

/**
 * Input type for approving a timesheet
 */
@InputType({ description: 'Input for approving a timesheet submission' })
export class ApproveTimesheetInput {
  @Field(() => ID, { description: 'ID of the submission to approve' })
  submissionId: string;

  @Field({ nullable: true, description: 'Optional comments from the approver' })
  comments?: string;
}

/**
 * Input type for rejecting a timesheet
 */
@InputType({ description: 'Input for rejecting a timesheet submission' })
export class RejectTimesheetInput {
  @Field(() => ID, { description: 'ID of the submission to reject' })
  submissionId: string;

  @Field({
    description: 'Required comments explaining why the timesheet was rejected',
  })
  comments: string;
}
