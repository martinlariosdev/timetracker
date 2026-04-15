import { InputType, Field, ID } from '@nestjs/graphql';

/**
 * GraphQL Input Type for filtering TimeEntry queries
 * All fields are optional to allow flexible filtering
 */
@InputType({ description: 'Filters for querying time entries' })
export class TimeEntryFiltersInput {
  @Field(() => ID, { nullable: true, description: 'Filter by consultant ID' })
  consultantId?: string;

  @Field(() => ID, { nullable: true, description: 'Filter by pay period ID' })
  payPeriodId?: string;

  @Field({
    nullable: true,
    description: 'Filter entries from this date onwards',
  })
  startDate?: Date;

  @Field({ nullable: true, description: 'Filter entries up to this date' })
  endDate?: Date;
}
