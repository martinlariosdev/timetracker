import { describe, it, expect } from '@jest/globals';
import {
  createTimeEntrySchema,
  updateTimeEntrySchema,
  timeEntrySchema,
  patchTimeEntrySchema,
  consultantSchema,
  createConsultantSchema,
  updateConsultantSchema,
} from '../index';

describe('Time Entry Validation Schemas', () => {
  describe('createTimeEntrySchema', () => {
    it('should validate a valid time entry', () => {
      const validEntry = {
        consultantId: 1,
        date: '2026-04-12',
        payPeriodId: 1,
        clientName: 'Aderant',
        description: 'Working on TimeTrack mobile app',
        inTime1: '09:00',
        outTime1: '17:00',
      };

      const result = createTimeEntrySchema.safeParse(validEntry);
      expect(result.success).toBe(true);
    });

    it('should fail validation when required fields are missing', () => {
      const invalidEntry = {
        consultantId: 1,
        date: '2026-04-12',
        // Missing required fields: payPeriodId, clientName, description, inTime1, outTime1
      };

      const result = createTimeEntrySchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should fail validation with invalid date format', () => {
      const invalidEntry = {
        consultantId: 1,
        date: '12-04-2026', // Wrong format
        payPeriodId: 1,
        clientName: 'Aderant',
        description: 'Working on project',
        inTime1: '09:00',
        outTime1: '17:00',
      };

      const result = createTimeEntrySchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
    });

    it('should fail validation with invalid time format', () => {
      const invalidEntry = {
        consultantId: 1,
        date: '2026-04-12',
        payPeriodId: 1,
        clientName: 'Aderant',
        description: 'Working on project',
        inTime1: '9:00', // Missing leading zero
        outTime1: '17:00',
      };

      const result = createTimeEntrySchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
    });

    it('should fail validation when end time is before start time', () => {
      const invalidEntry = {
        consultantId: 1,
        date: '2026-04-12',
        payPeriodId: 1,
        clientName: 'Aderant',
        description: 'Working on project',
        inTime1: '17:00',
        outTime1: '09:00', // End before start
      };

      const result = createTimeEntrySchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue =>
          issue.message.includes('must be after')
        )).toBe(true);
      }
    });

    it('should fail validation when time blocks overlap', () => {
      const invalidEntry = {
        consultantId: 1,
        date: '2026-04-12',
        payPeriodId: 1,
        clientName: 'Aderant',
        description: 'Working on project',
        inTime1: '09:00',
        outTime1: '13:00',
        inTime2: '12:00', // Overlaps with first block
        outTime2: '17:00',
      };

      const result = createTimeEntrySchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue =>
          issue.message.includes('overlap')
        )).toBe(true);
      }
    });

    it('should validate when second time block is properly separated', () => {
      const validEntry = {
        consultantId: 1,
        date: '2026-04-12',
        payPeriodId: 1,
        clientName: 'Aderant',
        description: 'Working on project',
        inTime1: '09:00',
        outTime1: '12:00',
        inTime2: '13:00',
        outTime2: '17:00',
      };

      const result = createTimeEntrySchema.safeParse(validEntry);
      expect(result.success).toBe(true);
    });

    it('should fail validation when inTime2 is provided without outTime2', () => {
      const invalidEntry = {
        consultantId: 1,
        date: '2026-04-12',
        payPeriodId: 1,
        clientName: 'Aderant',
        description: 'Working on project',
        inTime1: '09:00',
        outTime1: '12:00',
        inTime2: '13:00',
        // Missing outTime2
      };

      const result = createTimeEntrySchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
    });

    it('should fail validation when description exceeds maximum length', () => {
      const invalidEntry = {
        consultantId: 1,
        date: '2026-04-12',
        payPeriodId: 1,
        clientName: 'Aderant',
        description: 'a'.repeat(1001), // Exceeds 1000 char limit
        inTime1: '09:00',
        outTime1: '17:00',
      };

      const result = createTimeEntrySchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
    });

    it('should validate optional projectTaskNumber', () => {
      const validEntry = {
        consultantId: 1,
        date: '2026-04-12',
        payPeriodId: 1,
        projectTaskNumber: 'PROJ-123',
        clientName: 'Aderant',
        description: 'Working on project',
        inTime1: '09:00',
        outTime1: '17:00',
      };

      const result = createTimeEntrySchema.safeParse(validEntry);
      expect(result.success).toBe(true);
    });

    it('should allow null for optional fields', () => {
      const validEntry = {
        consultantId: 1,
        date: '2026-04-12',
        payPeriodId: 1,
        projectTaskNumber: null,
        clientName: 'Aderant',
        description: 'Working on project',
        inTime1: '09:00',
        outTime1: '17:00',
        inTime2: null,
        outTime2: null,
      };

      const result = createTimeEntrySchema.safeParse(validEntry);
      expect(result.success).toBe(true);
    });
  });

  describe('updateTimeEntrySchema', () => {
    it('should validate a valid update with id', () => {
      const validUpdate = {
        id: 1,
        consultantId: 1,
        date: '2026-04-12',
        payPeriodId: 1,
        clientName: 'Aderant',
        description: 'Working on project',
        inTime1: '09:00',
        outTime1: '17:00',
      };

      const result = updateTimeEntrySchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it('should accept string id for offline entries', () => {
      const validUpdate = {
        id: 'temp-123',
        consultantId: 1,
        date: '2026-04-12',
        payPeriodId: 1,
        clientName: 'Aderant',
        description: 'Working on project',
        inTime1: '09:00',
        outTime1: '17:00',
      };

      const result = updateTimeEntrySchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it('should fail validation when id is missing', () => {
      const invalidUpdate = {
        consultantId: 1,
        date: '2026-04-12',
        payPeriodId: 1,
        clientName: 'Aderant',
        description: 'Working on project',
        inTime1: '09:00',
        outTime1: '17:00',
      };

      const result = updateTimeEntrySchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });
  });

  describe('timeEntrySchema', () => {
    it('should validate a complete time entry from server', () => {
      const validEntry = {
        id: 1,
        consultantId: 1,
        date: '2026-04-12',
        payPeriodId: 1,
        clientName: 'Aderant',
        description: 'Working on project',
        inTime1: '09:00',
        outTime1: '17:00',
        totalHours: 8,
        createdAt: new Date('2026-04-12T09:00:00Z'),
        updatedAt: new Date('2026-04-12T10:00:00Z'),
        synced: true,
      };

      const result = timeEntrySchema.safeParse(validEntry);
      expect(result.success).toBe(true);
    });

    it('should allow null for updatedAt', () => {
      const validEntry = {
        id: 1,
        consultantId: 1,
        date: '2026-04-12',
        payPeriodId: 1,
        clientName: 'Aderant',
        description: 'Working on project',
        inTime1: '09:00',
        outTime1: '17:00',
        totalHours: 8,
        createdAt: new Date('2026-04-12T09:00:00Z'),
        updatedAt: null,
        synced: false,
      };

      const result = timeEntrySchema.safeParse(validEntry);
      expect(result.success).toBe(true);
    });
  });

  describe('patchTimeEntrySchema', () => {
    it('should allow partial updates', () => {
      const validPatch = {
        description: 'Updated description',
      };

      const result = patchTimeEntrySchema.safeParse(validPatch);
      expect(result.success).toBe(true);
    });

    it('should validate time constraints on partial updates', () => {
      const invalidPatch = {
        inTime1: '17:00',
        outTime1: '09:00', // End before start
      };

      const result = patchTimeEntrySchema.safeParse(invalidPatch);
      expect(result.success).toBe(false);
    });

    it('should allow updating just one time field', () => {
      const validPatch = {
        inTime1: '08:00',
      };

      const result = patchTimeEntrySchema.safeParse(validPatch);
      expect(result.success).toBe(true);
    });
  });
});

describe('Consultant Validation Schemas', () => {
  describe('consultantSchema', () => {
    it('should validate a valid consultant', () => {
      const validConsultant = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        teamLeadId: 2,
        teamLeadName: 'Jane Smith',
        teamLeadEmail: 'jane.smith@example.com',
        etoBalance: 40,
        workingHoursPerPeriod: 80,
        paymentType: 'Hourly',
      };

      const result = consultantSchema.safeParse(validConsultant);
      expect(result.success).toBe(true);
    });

    it('should fail validation with invalid email', () => {
      const invalidConsultant = {
        id: 1,
        name: 'John Doe',
        email: 'invalid-email',
        teamLeadId: 2,
        teamLeadName: 'Jane Smith',
        teamLeadEmail: 'jane.smith@example.com',
        etoBalance: 40,
        workingHoursPerPeriod: 80,
        paymentType: 'Hourly',
      };

      const result = consultantSchema.safeParse(invalidConsultant);
      expect(result.success).toBe(false);
    });

    it('should fail validation with invalid paymentType', () => {
      const invalidConsultant = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        teamLeadId: 2,
        teamLeadName: 'Jane Smith',
        teamLeadEmail: 'jane.smith@example.com',
        etoBalance: 40,
        workingHoursPerPeriod: 80,
        paymentType: 'Weekly', // Invalid type
      };

      const result = consultantSchema.safeParse(invalidConsultant);
      expect(result.success).toBe(false);
    });

    it('should fail validation with negative etoBalance', () => {
      const invalidConsultant = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        teamLeadId: 2,
        teamLeadName: 'Jane Smith',
        teamLeadEmail: 'jane.smith@example.com',
        etoBalance: -10,
        workingHoursPerPeriod: 80,
        paymentType: 'Hourly',
      };

      const result = consultantSchema.safeParse(invalidConsultant);
      expect(result.success).toBe(false);
    });

    it('should validate Monthly payment type', () => {
      const validConsultant = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        teamLeadId: 2,
        teamLeadName: 'Jane Smith',
        teamLeadEmail: 'jane.smith@example.com',
        etoBalance: 40,
        workingHoursPerPeriod: 160,
        paymentType: 'Monthly',
      };

      const result = consultantSchema.safeParse(validConsultant);
      expect(result.success).toBe(true);
    });
  });

  describe('createConsultantSchema', () => {
    it('should validate consultant creation input', () => {
      const validInput = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        teamLeadId: 2,
        paymentType: 'Hourly',
      };

      const result = createConsultantSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should fail validation without required fields', () => {
      const invalidInput = {
        name: 'John Doe',
        // Missing email, teamLeadId, paymentType
      };

      const result = createConsultantSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('updateConsultantSchema', () => {
    it('should allow partial updates', () => {
      const validUpdate = {
        name: 'John Smith',
      };

      const result = updateConsultantSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it('should validate email when provided', () => {
      const invalidUpdate = {
        email: 'not-an-email',
      };

      const result = updateConsultantSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });

    it('should allow updating multiple fields', () => {
      const validUpdate = {
        name: 'John Smith',
        email: 'john.smith@example.com',
        etoBalance: 50,
      };

      const result = updateConsultantSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });
  });
});
