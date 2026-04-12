import { z } from 'zod';

// Date format: YYYY-MM-DD
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// Time format: HH:mm (24-hour)
const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

/**
 * Helper function to compare times in HH:mm format
 * Returns true if time1 is before time2
 */
function isTimeBefore(time1: string, time2: string): boolean {
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  return h1 * 60 + m1 < h2 * 60 + m2;
}

/**
 * Helper function to check if time ranges overlap
 * Returns true if ranges overlap
 */
function timeRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const [h1s, m1s] = start1.split(':').map(Number);
  const [h1e, m1e] = end1.split(':').map(Number);
  const [h2s, m2s] = start2.split(':').map(Number);
  const [h2e, m2e] = end2.split(':').map(Number);

  const range1Start = h1s * 60 + m1s;
  const range1End = h1e * 60 + m1e;
  const range2Start = h2s * 60 + m2s;
  const range2End = h2e * 60 + m2e;

  return range1Start < range2End && range2Start < range1End;
}

/**
 * Base schema for time entry fields without cross-field validation
 */
const baseTimeEntryFields = {
  consultantId: z.number().int().positive('Consultant ID must be a positive integer'),
  date: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format'),
  payPeriodId: z.number().int().positive('Pay period ID must be a positive integer'),
  projectTaskNumber: z.string().max(50, 'Project/task number cannot exceed 50 characters').nullable().optional(),
  clientName: z.string().min(1, 'Client name is required').max(200, 'Client name cannot exceed 200 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description cannot exceed 1000 characters'),
  inTime1: z.string().regex(timeRegex, 'Time must be in HH:mm format'),
  outTime1: z.string().regex(timeRegex, 'Time must be in HH:mm format'),
  inTime2: z.string().regex(timeRegex, 'Time must be in HH:mm format').nullable().optional(),
  outTime2: z.string().regex(timeRegex, 'Time must be in HH:mm format').nullable().optional(),
};

/**
 * Function to add time validation refinements to a schema
 */
function addTimeValidation<T extends z.ZodTypeAny>(schema: T) {
  return schema.refine(
    (data: any) => {
      // Validate outTime1 is after inTime1
      return isTimeBefore(data.inTime1, data.outTime1);
    },
    {
      message: 'outTime1 must be after inTime1',
      path: ['outTime1'],
    }
  ).refine(
    (data: any) => {
      // If inTime2 is provided, outTime2 must also be provided
      if (data.inTime2 && !data.outTime2) {
        return false;
      }
      // If outTime2 is provided, inTime2 must also be provided
      if (data.outTime2 && !data.inTime2) {
        return false;
      }
      return true;
    },
    {
      message: 'Both inTime2 and outTime2 must be provided together',
      path: ['inTime2'],
    }
  ).refine(
    (data: any) => {
      // If second time block is provided, validate outTime2 is after inTime2
      if (data.inTime2 && data.outTime2) {
        return isTimeBefore(data.inTime2, data.outTime2);
      }
      return true;
    },
    {
      message: 'outTime2 must be after inTime2',
      path: ['outTime2'],
    }
  ).refine(
    (data: any) => {
      // Validate time blocks don't overlap
      if (data.inTime2 && data.outTime2) {
        return !timeRangesOverlap(data.inTime1, data.outTime1, data.inTime2, data.outTime2);
      }
      return true;
    },
    {
      message: 'Time blocks cannot overlap',
      path: ['inTime2'],
    }
  );
}

/**
 * Schema for creating a new time entry with full validation
 */
export const createTimeEntrySchema = addTimeValidation(z.object(baseTimeEntryFields));

/**
 * Schema for updating an existing time entry
 * Includes all create fields plus id
 */
export const updateTimeEntrySchema = addTimeValidation(z.object({
  ...baseTimeEntryFields,
  id: z.union([z.number().int().positive(), z.string().min(1)]),
}));

/**
 * Schema for a complete time entry (as returned from server)
 */
export const timeEntrySchema = addTimeValidation(z.object({
  ...baseTimeEntryFields,
  id: z.union([z.number().int().positive(), z.string().min(1)]),
  totalHours: z.number().nonnegative('Total hours must be non-negative'),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
  synced: z.boolean(),
  localId: z.string().optional(),
}));

/**
 * Schema for partial updates (PATCH)
 * All fields are optional but still validated when provided
 */
export const patchTimeEntrySchema = z.object(baseTimeEntryFields).partial().refine(
  (data) => {
    // Only validate if both times are present
    if (data.inTime1 && data.outTime1) {
      return isTimeBefore(data.inTime1, data.outTime1);
    }
    return true;
  },
  {
    message: 'outTime1 must be after inTime1',
    path: ['outTime1'],
  }
).refine(
  (data) => {
    // Only validate if both times are present
    if (data.inTime2 && data.outTime2) {
      return isTimeBefore(data.inTime2, data.outTime2);
    }
    return true;
  },
  {
    message: 'outTime2 must be after inTime2',
    path: ['outTime2'],
  }
).refine(
  (data) => {
    // Only validate overlap if all four times are present
    if (data.inTime1 && data.outTime1 && data.inTime2 && data.outTime2) {
      return !timeRangesOverlap(data.inTime1, data.outTime1, data.inTime2, data.outTime2);
    }
    return true;
  },
  {
    message: 'Time blocks cannot overlap',
    path: ['inTime2'],
  }
);

// Export types inferred from schemas
export type CreateTimeEntryInput = z.infer<typeof createTimeEntrySchema>;
export type UpdateTimeEntryInput = z.infer<typeof updateTimeEntrySchema>;
export type TimeEntry = z.infer<typeof timeEntrySchema>;
export type PatchTimeEntryInput = z.infer<typeof patchTimeEntrySchema>;
