import { InputType, Field, Float } from '@nestjs/graphql';

/**
 * GraphQL Input Type for using ETO hours
 * Used when a consultant takes time off
 */
@InputType({ description: 'Input for using ETO hours (taking time off)' })
export class UseETOInput {
  @Field(() => Float, {
    description: 'Number of hours to use (must be positive)',
  })
  hours: number;

  @Field({ description: 'Date when ETO is used (YYYY-MM-DD format)' })
  date: string;

  @Field({ nullable: true, description: 'Description or reason for using ETO' })
  description?: string;

  @Field({
    nullable: true,
    description: 'Project name associated with this ETO usage',
  })
  projectName?: string;
}
