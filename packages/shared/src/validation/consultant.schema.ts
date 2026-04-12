import { z } from 'zod';

/**
 * Schema for payment type enum
 */
const paymentTypeSchema = z.enum(['Hourly', 'Monthly'], {
  errorMap: () => ({ message: 'Payment type must be either "Hourly" or "Monthly"' }),
});

/**
 * Schema for a complete consultant object
 */
export const consultantSchema = z.object({
  id: z.number().int().positive('Consultant ID must be a positive integer'),
  name: z.string().min(1, 'Name is required').max(200, 'Name cannot exceed 200 characters'),
  email: z.string().email('Invalid email address'),
  teamLeadId: z.number().int().positive('Team lead ID must be a positive integer'),
  teamLeadName: z.string().min(1, 'Team lead name is required').max(200, 'Team lead name cannot exceed 200 characters'),
  teamLeadEmail: z.string().email('Invalid team lead email address'),
  etoBalance: z.number().nonnegative('ETO balance must be non-negative'),
  workingHoursPerPeriod: z.number().positive('Working hours per period must be positive'),
  paymentType: paymentTypeSchema,
});

/**
 * Schema for creating a new consultant
 * Only includes fields that can be set during creation
 */
export const createConsultantSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name cannot exceed 200 characters'),
  email: z.string().email('Invalid email address'),
  teamLeadId: z.number().int().positive('Team lead ID must be a positive integer'),
  paymentType: paymentTypeSchema,
});

/**
 * Schema for updating consultant information
 * All fields are optional but validated when provided
 */
export const updateConsultantSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name cannot exceed 200 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  teamLeadId: z.number().int().positive('Team lead ID must be a positive integer').optional(),
  etoBalance: z.number().nonnegative('ETO balance must be non-negative').optional(),
  workingHoursPerPeriod: z.number().positive('Working hours per period must be positive').optional(),
  paymentType: paymentTypeSchema.optional(),
});

/**
 * Schema for team lead object
 */
export const teamLeadSchema = z.object({
  id: z.number().int().positive('Team lead ID must be a positive integer'),
  name: z.string().min(1, 'Name is required').max(200, 'Name cannot exceed 200 characters'),
  email: z.string().email('Invalid email address'),
});

// Export types inferred from schemas
export type Consultant = z.infer<typeof consultantSchema>;
export type CreateConsultantInput = z.infer<typeof createConsultantSchema>;
export type UpdateConsultantInput = z.infer<typeof updateConsultantSchema>;
export type TeamLead = z.infer<typeof teamLeadSchema>;
