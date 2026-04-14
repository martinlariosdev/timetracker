import { InputType, Field, ID } from '@nestjs/graphql';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * Zod schema for creating a new TimeEntry
 * Defines validation rules for all input fields
 *
 * NOTE: This schema differs from packages/shared/src/validation/time-entry.schema.ts because:
 * - Backend uses MongoDB ObjectId strings for consultantId/payPeriodId
 * - Shared package uses numeric IDs for mobile/GraphQL compatibility
 * - Backend requires server-side validations not needed in shared package
 *
 * Do NOT consolidate these schemas - they serve different purposes in different contexts.
 */
export const createTimeEntrySchema = z.object({
  consultantId: z.string().min(1, 'Consultant ID is required'),
  payPeriodId: z.string().min(1, 'Pay period ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  projectTaskNumber: z.string().optional(),
  clientName: z.string().min(1, 'Client name is required'),
  description: z.string().min(1, 'Description is required'),
  inTime1: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format'),
  outTime1: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format'),
  inTime2: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format').optional(),
  outTime2: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format').optional(),
});

/**
 * GraphQL Input Type for creating a new TimeEntry
 * Uses Zod schema for validation
 */
@InputType({ description: 'Input for creating a new time entry' })
export class CreateTimeEntryInput extends createZodDto(createTimeEntrySchema) {
  @Field(() => ID, { description: 'ID of the consultant creating the entry' })
  consultantId: string;

  @Field(() => ID, { description: 'ID of the pay period for this entry' })
  payPeriodId: string;

  @Field({ description: 'Date of the time entry in YYYY-MM-DD format' })
  date: string;

  @Field({ nullable: true, description: 'Project or task number (e.g., PROJ-123)' })
  projectTaskNumber?: string;

  @Field({ description: 'Name of the client' })
  clientName: string;

  @Field({ description: 'Description of work performed' })
  description: string;

  @Field({ description: 'First clock-in time in HH:mm format' })
  inTime1: string;

  @Field({ description: 'First clock-out time in HH:mm format' })
  outTime1: string;

  @Field({ nullable: true, description: 'Second clock-in time in HH:mm format for split shifts' })
  inTime2?: string;

  @Field({ nullable: true, description: 'Second clock-out time in HH:mm format for split shifts' })
  outTime2?: string;
}
