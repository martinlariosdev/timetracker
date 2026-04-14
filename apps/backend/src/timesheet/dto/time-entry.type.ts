import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

/**
 * GraphQL Object Type for TimeEntry
 * Represents a time entry record in the timesheet system
 * Corresponds to the TimeEntry Prisma model
 */
@ObjectType({ description: 'Time entry for tracking work hours' })
export class TimeEntryType {
  @Field(() => ID, { description: 'Unique identifier for the time entry' })
  id: string;

  @Field(() => ID, { description: 'ID of the consultant who created this entry' })
  consultantId: string;

  @Field(() => ID, { description: 'ID of the pay period this entry belongs to' })
  payPeriodId: string;

  @Field(() => Date, { description: 'Entry date in YYYY-MM-DD format' })
  date: Date;

  @Field(() => String, { nullable: true, description: 'Project or task number (e.g., PROJ-123)' })
  projectTaskNumber?: string;

  @Field(() => String, { nullable: true, description: 'Name of the client' })
  clientName?: string;

  @Field(() => String, { nullable: true, description: 'Description of work performed' })
  description?: string;

  @Field(() => Date, { nullable: true, description: 'First clock-in time (ISO 8601 format)' })
  inTime1?: Date;

  @Field(() => Date, { nullable: true, description: 'First clock-out time (ISO 8601 format)' })
  outTime1?: Date;

  @Field(() => Date, { nullable: true, description: 'Second clock-in time (ISO 8601 format), for split shifts' })
  inTime2?: Date;

  @Field(() => Date, { nullable: true, description: 'Second clock-out time (ISO 8601 format), for split shifts' })
  outTime2?: Date;

  @Field(() => Float, { description: 'Total hours worked in this entry' })
  totalHours: number;

  @Field(() => Boolean, { description: 'Whether this entry has been synced with the backend' })
  synced: boolean;

  @Field(() => Date, { description: 'Timestamp when this entry was created' })
  createdAt: Date;

  @Field(() => Date, { description: 'Timestamp when this entry was last updated' })
  updatedAt: Date;
}
