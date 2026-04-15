import { ObjectType, Field, ID } from '@nestjs/graphql';

/**
 * GraphQL Object Type for PayPeriod
 * Represents a pay period during which consultants track time entries
 * Corresponds to the PayPeriod Prisma model
 */
@ObjectType({ description: 'Pay period for timesheet submissions' })
export class PayPeriodType {
  @Field(() => ID, { description: 'Unique identifier for the pay period' })
  id: string;

  @Field(() => Date, { description: 'Start date of the pay period' })
  startDate: Date;

  @Field(() => Date, { description: 'End date of the pay period' })
  endDate: Date;

  @Field({ description: 'Human-readable display text (e.g., "April 1-15, 2026")' })
  displayText: string;

  @Field({ description: 'Whether this is the current active pay period' })
  isCurrent: boolean;

  @Field(() => Date, { nullable: true, description: 'Submission deadline for this pay period' })
  deadlineDate?: Date;
}
