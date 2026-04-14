import { InputType, Field, Float } from '@nestjs/graphql';
import { createZodDto } from 'nestjs-zod';
import { createTimeEntrySchema } from './create-time-entry.input';

/**
 * Zod schema for updating an existing TimeEntry
 * Makes all create schema fields optional for partial updates
 */
export const updateTimeEntrySchema = createTimeEntrySchema.partial();

/**
 * GraphQL Input Type for updating an existing TimeEntry
 * Uses Zod schema with partial fields for updates
 * ID is passed as mutation argument, not in input object
 */
@InputType({ description: 'Input for updating an existing time entry' })
export class UpdateTimeEntryInput extends createZodDto(updateTimeEntrySchema) {
  @Field({ nullable: true, description: 'Date of the time entry in YYYY-MM-DD format' })
  date?: string;

  @Field(() => Float, { nullable: true, description: 'Total hours worked' })
  totalHours?: number;

  @Field({ nullable: true, description: 'Project or task number (e.g., PROJ-123)' })
  projectTaskNumber?: string;

  @Field({ nullable: true, description: 'Name of the client' })
  clientName?: string;

  @Field({ nullable: true, description: 'Description of work performed' })
  description?: string;

  @Field({ nullable: true, description: 'First clock-in time in HH:mm format' })
  inTime1?: string;

  @Field({ nullable: true, description: 'First clock-out time in HH:mm format' })
  outTime1?: string;

  @Field({ nullable: true, description: 'Second clock-in time in HH:mm format for split shifts' })
  inTime2?: string;

  @Field({ nullable: true, description: 'Second clock-out time in HH:mm format for split shifts' })
  outTime2?: string;
}
