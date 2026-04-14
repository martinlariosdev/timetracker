import { InputType, Field, ID } from '@nestjs/graphql';
import { createZodDto } from 'nestjs-zod';
import { createTimeEntrySchema } from './create-time-entry.input';
import { z } from 'zod';

/**
 * Zod schema for updating an existing TimeEntry
 * Extends create schema with required id field and makes other fields optional
 */
export const updateTimeEntrySchema = createTimeEntrySchema.extend({
  id: z.string().min(1, 'Time entry ID is required'),
}).partial();

/**
 * GraphQL Input Type for updating an existing TimeEntry
 * Uses Zod schema with partial fields for updates
 * Requires id field for identification
 */
@InputType({ description: 'Input for updating an existing time entry' })
export class UpdateTimeEntryInput extends createZodDto(updateTimeEntrySchema) {
  @Field(() => ID, { description: 'ID of the time entry to update' })
  id: string;

  @Field({ nullable: true, description: 'ID of the consultant creating the entry' })
  consultantId?: string;

  @Field({ nullable: true, description: 'ID of the pay period for this entry' })
  payPeriodId?: string;

  @Field({ nullable: true, description: 'Date of the time entry in YYYY-MM-DD format' })
  date?: string;

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
