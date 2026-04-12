import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TimesheetService } from './timesheet.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTimeEntryInput } from './dto/create-time-entry.input';
import { UpdateTimeEntryInput } from './dto/update-time-entry.input';

describe('TimesheetService', () => {
  let service: TimesheetService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    timeEntry: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    consultant: {
      findUnique: jest.fn(),
    },
    payPeriod: {
      findUnique: jest.fn(),
    },
  };

  const mockConsultant = {
    id: '507f1f77bcf86cd799439011',
    externalId: 'EXT-001',
    name: 'John Doe',
    email: 'john@example.com',
    teamLeadId: null,
    teamLeadName: null,
    teamLeadEmail: null,
    etoBalance: 0,
    workingHoursPerPeriod: 88,
    paymentType: 'Hourly',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockPayPeriod = {
    id: '507f1f77bcf86cd799439012',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-15'),
    displayText: 'January 2024 - Period 1',
    isCurrent: true,
    deadlineDate: new Date('2024-01-20'),
    createdAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimesheetService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TimesheetService>(TimesheetService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const validCreateInput: CreateTimeEntryInput = {
      consultantId: '507f1f77bcf86cd799439011',
      payPeriodId: '507f1f77bcf86cd799439012',
      date: '2024-01-15',
      projectTaskNumber: 'PROJ-123',
      clientName: 'Acme Corp',
      description: 'Development work',
      inTime1: '09:00',
      outTime1: '12:00',
      inTime2: '13:00',
      outTime2: '17:00',
    };

    const mockCreatedEntry = {
      id: '507f1f77bcf86cd799439013',
      consultantId: '507f1f77bcf86cd799439011',
      payPeriodId: '507f1f77bcf86cd799439012',
      date: new Date('2024-01-15'),
      projectTaskNumber: 'PROJ-123',
      clientName: 'Acme Corp',
      description: 'Development work',
      inTime1: new Date('2024-01-15T09:00:00.000Z'),
      outTime1: new Date('2024-01-15T12:00:00.000Z'),
      inTime2: new Date('2024-01-15T13:00:00.000Z'),
      outTime2: new Date('2024-01-15T17:00:00.000Z'),
      totalHours: 7,
      synced: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    };

    it('should create a time entry with valid data', async () => {
      mockPrismaService.consultant.findUnique.mockResolvedValue(mockConsultant);
      mockPrismaService.payPeriod.findUnique.mockResolvedValue(mockPayPeriod);
      mockPrismaService.timeEntry.findMany.mockResolvedValue([]);
      mockPrismaService.timeEntry.create.mockResolvedValue(mockCreatedEntry);

      const result = await service.create(validCreateInput);

      expect(result).toEqual(mockCreatedEntry);
      expect(mockPrismaService.consultant.findUnique).toHaveBeenCalledWith({
        where: { id: validCreateInput.consultantId },
      });
      expect(mockPrismaService.payPeriod.findUnique).toHaveBeenCalledWith({
        where: { id: validCreateInput.payPeriodId },
      });
      expect(mockPrismaService.timeEntry.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          consultantId: validCreateInput.consultantId,
          payPeriodId: validCreateInput.payPeriodId,
          clientName: validCreateInput.clientName,
          description: validCreateInput.description,
          totalHours: 7, // 3 hours (9-12) + 4 hours (13-17)
          synced: true,
        }),
      });
    });

    it('should calculate total hours correctly for single time block', async () => {
      const singleBlockInput: CreateTimeEntryInput = {
        ...validCreateInput,
        inTime2: undefined,
        outTime2: undefined,
      };

      mockPrismaService.consultant.findUnique.mockResolvedValue(mockConsultant);
      mockPrismaService.payPeriod.findUnique.mockResolvedValue(mockPayPeriod);
      mockPrismaService.timeEntry.findMany.mockResolvedValue([]);
      mockPrismaService.timeEntry.create.mockResolvedValue({
        ...mockCreatedEntry,
        totalHours: 3,
        inTime2: null,
        outTime2: null,
      });

      const result = await service.create(singleBlockInput);

      expect(mockPrismaService.timeEntry.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          totalHours: 3, // 3 hours (9-12)
        }),
      });
    });

    it('should throw BadRequestException when consultant not found', async () => {
      mockPrismaService.consultant.findUnique.mockResolvedValue(null);

      await expect(service.create(validCreateInput)).rejects.toThrow(BadRequestException);
      await expect(service.create(validCreateInput)).rejects.toThrow(
        `Consultant with ID ${validCreateInput.consultantId} not found`,
      );
    });

    it('should throw BadRequestException when pay period not found', async () => {
      mockPrismaService.consultant.findUnique.mockResolvedValue(mockConsultant);
      mockPrismaService.payPeriod.findUnique.mockResolvedValue(null);

      await expect(service.create(validCreateInput)).rejects.toThrow(BadRequestException);
      await expect(service.create(validCreateInput)).rejects.toThrow(
        `Pay period with ID ${validCreateInput.payPeriodId} not found`,
      );
    });

    it('should throw BadRequestException with invalid date format', async () => {
      const invalidInput: CreateTimeEntryInput = {
        ...validCreateInput,
        date: '15-01-2024', // Wrong format
      };

      await expect(service.create(invalidInput)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException with invalid time format', async () => {
      const invalidInput: CreateTimeEntryInput = {
        ...validCreateInput,
        inTime1: '9:00', // Missing leading zero
      };

      await expect(service.create(invalidInput)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when outTime1 is before inTime1', async () => {
      const invalidInput: CreateTimeEntryInput = {
        ...validCreateInput,
        inTime1: '12:00',
        outTime1: '09:00', // Before inTime1
      };

      await expect(service.create(invalidInput)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when time blocks overlap', async () => {
      const overlappingInput: CreateTimeEntryInput = {
        ...validCreateInput,
        inTime1: '09:00',
        outTime1: '13:30',
        inTime2: '13:00', // Overlaps with first block
        outTime2: '17:00',
      };

      await expect(service.create(overlappingInput)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when overlapping with existing entry', async () => {
      const existingEntry = {
        ...mockCreatedEntry,
        id: 'existing-id',
        inTime1: new Date('2024-01-15T10:00:00.000Z'),
        outTime1: new Date('2024-01-15T11:00:00.000Z'),
      };

      mockPrismaService.consultant.findUnique.mockResolvedValue(mockConsultant);
      mockPrismaService.payPeriod.findUnique.mockResolvedValue(mockPayPeriod);
      mockPrismaService.timeEntry.findMany.mockResolvedValue([existingEntry]);

      await expect(service.create(validCreateInput)).rejects.toThrow(BadRequestException);
      await expect(service.create(validCreateInput)).rejects.toThrow(/overlaps with existing entry/);
    });

    it('should throw BadRequestException when clientName is missing', async () => {
      const invalidInput: CreateTimeEntryInput = {
        ...validCreateInput,
        clientName: '',
      };

      await expect(service.create(invalidInput)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when description is missing', async () => {
      const invalidInput: CreateTimeEntryInput = {
        ...validCreateInput,
        description: '',
      };

      await expect(service.create(invalidInput)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    const mockEntries = [
      {
        id: '507f1f77bcf86cd799439013',
        consultantId: '507f1f77bcf86cd799439011',
        payPeriodId: '507f1f77bcf86cd799439012',
        date: new Date('2024-01-15'),
        projectTaskNumber: 'PROJ-123',
        clientName: 'Acme Corp',
        description: 'Development work',
        inTime1: new Date('2024-01-15T09:00:00.000Z'),
        outTime1: new Date('2024-01-15T12:00:00.000Z'),
        inTime2: null,
        outTime2: null,
        totalHours: 3,
        synced: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        consultant: mockConsultant,
        payPeriod: mockPayPeriod,
      },
    ];

    it('should return all time entries without filters', async () => {
      mockPrismaService.timeEntry.findMany.mockResolvedValue(mockEntries);

      const result = await service.findAll();

      expect(result).toEqual(mockEntries);
      expect(mockPrismaService.timeEntry.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { date: 'desc' },
        include: {
          consultant: true,
          payPeriod: true,
        },
      });
    });

    it('should filter by consultantId', async () => {
      mockPrismaService.timeEntry.findMany.mockResolvedValue(mockEntries);

      const result = await service.findAll({ consultantId: '507f1f77bcf86cd799439011' });

      expect(result).toEqual(mockEntries);
      expect(mockPrismaService.timeEntry.findMany).toHaveBeenCalledWith({
        where: { consultantId: '507f1f77bcf86cd799439011' },
        orderBy: { date: 'desc' },
        include: {
          consultant: true,
          payPeriod: true,
        },
      });
    });

    it('should filter by payPeriodId', async () => {
      mockPrismaService.timeEntry.findMany.mockResolvedValue(mockEntries);

      const result = await service.findAll({ payPeriodId: '507f1f77bcf86cd799439012' });

      expect(result).toEqual(mockEntries);
      expect(mockPrismaService.timeEntry.findMany).toHaveBeenCalledWith({
        where: { payPeriodId: '507f1f77bcf86cd799439012' },
        orderBy: { date: 'desc' },
        include: {
          consultant: true,
          payPeriod: true,
        },
      });
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      mockPrismaService.timeEntry.findMany.mockResolvedValue(mockEntries);

      const result = await service.findAll({ startDate, endDate });

      expect(result).toEqual(mockEntries);
      expect(mockPrismaService.timeEntry.findMany).toHaveBeenCalledWith({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: 'desc' },
        include: {
          consultant: true,
          payPeriod: true,
        },
      });
    });

    it('should apply multiple filters', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      mockPrismaService.timeEntry.findMany.mockResolvedValue(mockEntries);

      const result = await service.findAll({
        consultantId: '507f1f77bcf86cd799439011',
        payPeriodId: '507f1f77bcf86cd799439012',
        startDate,
        endDate,
      });

      expect(result).toEqual(mockEntries);
      expect(mockPrismaService.timeEntry.findMany).toHaveBeenCalledWith({
        where: {
          consultantId: '507f1f77bcf86cd799439011',
          payPeriodId: '507f1f77bcf86cd799439012',
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: 'desc' },
        include: {
          consultant: true,
          payPeriod: true,
        },
      });
    });

    it('should return empty array when no entries found', async () => {
      mockPrismaService.timeEntry.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    const mockEntry = {
      id: '507f1f77bcf86cd799439013',
      consultantId: '507f1f77bcf86cd799439011',
      payPeriodId: '507f1f77bcf86cd799439012',
      date: new Date('2024-01-15'),
      projectTaskNumber: 'PROJ-123',
      clientName: 'Acme Corp',
      description: 'Development work',
      inTime1: new Date('2024-01-15T09:00:00.000Z'),
      outTime1: new Date('2024-01-15T12:00:00.000Z'),
      inTime2: null,
      outTime2: null,
      totalHours: 3,
      synced: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      consultant: mockConsultant,
      payPeriod: mockPayPeriod,
    };

    it('should return a time entry by id', async () => {
      mockPrismaService.timeEntry.findUnique.mockResolvedValue(mockEntry);

      const result = await service.findOne('507f1f77bcf86cd799439013');

      expect(result).toEqual(mockEntry);
      expect(mockPrismaService.timeEntry.findUnique).toHaveBeenCalledWith({
        where: { id: '507f1f77bcf86cd799439013' },
        include: {
          consultant: true,
          payPeriod: true,
        },
      });
    });

    it('should throw NotFoundException when entry not found', async () => {
      mockPrismaService.timeEntry.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        'TimeEntry with ID nonexistent-id not found',
      );
    });
  });

  describe('update', () => {
    const existingEntry = {
      id: '507f1f77bcf86cd799439013',
      consultantId: '507f1f77bcf86cd799439011',
      payPeriodId: '507f1f77bcf86cd799439012',
      date: new Date('2024-01-15'),
      projectTaskNumber: 'PROJ-123',
      clientName: 'Acme Corp',
      description: 'Development work',
      inTime1: new Date('2024-01-15T09:00:00.000Z'),
      outTime1: new Date('2024-01-15T12:00:00.000Z'),
      inTime2: null,
      outTime2: null,
      totalHours: 3,
      synced: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      consultant: mockConsultant,
      payPeriod: mockPayPeriod,
    };

    const updateInput: UpdateTimeEntryInput = {
      id: '507f1f77bcf86cd799439013',
      clientName: 'New Client Corp',
      description: 'Updated description',
    };

    it('should update a time entry', async () => {
      mockPrismaService.timeEntry.findUnique.mockResolvedValue(existingEntry);
      mockPrismaService.timeEntry.update.mockResolvedValue({
        ...existingEntry,
        clientName: 'New Client Corp',
        description: 'Updated description',
      });

      const result = await service.update('507f1f77bcf86cd799439013', updateInput);

      expect(result.clientName).toBe('New Client Corp');
      expect(result.description).toBe('Updated description');
      expect(mockPrismaService.timeEntry.update).toHaveBeenCalledWith({
        where: { id: '507f1f77bcf86cd799439013' },
        data: expect.objectContaining({
          clientName: 'New Client Corp',
          description: 'Updated description',
        }),
      });
    });

    it('should update time fields and recalculate total hours', async () => {
      const timeUpdateInput: UpdateTimeEntryInput = {
        id: '507f1f77bcf86cd799439013',
        inTime1: '08:00',
        outTime1: '17:00',
      };

      mockPrismaService.timeEntry.findUnique.mockResolvedValue(existingEntry);
      mockPrismaService.consultant.findUnique.mockResolvedValue(mockConsultant);
      mockPrismaService.payPeriod.findUnique.mockResolvedValue(mockPayPeriod);
      mockPrismaService.timeEntry.findMany.mockResolvedValue([]);
      mockPrismaService.timeEntry.update.mockResolvedValue({
        ...existingEntry,
        inTime1: new Date('2024-01-15T08:00:00.000Z'),
        outTime1: new Date('2024-01-15T17:00:00.000Z'),
        totalHours: 9,
      });

      const result = await service.update('507f1f77bcf86cd799439013', timeUpdateInput);

      expect(mockPrismaService.timeEntry.update).toHaveBeenCalledWith({
        where: { id: '507f1f77bcf86cd799439013' },
        data: expect.objectContaining({
          totalHours: 9, // 9 hours (8-17)
        }),
      });
    });

    it('should throw NotFoundException when entry not found', async () => {
      mockPrismaService.timeEntry.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent-id', updateInput)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException with invalid update data', async () => {
      const invalidUpdate: UpdateTimeEntryInput = {
        id: '507f1f77bcf86cd799439013',
        clientName: '', // Empty client name
      };

      mockPrismaService.timeEntry.findUnique.mockResolvedValue(existingEntry);

      await expect(service.update('507f1f77bcf86cd799439013', invalidUpdate)).rejects.toThrow(
        BadRequestException,
      );
    });

    // Note: Overlap detection for updates is covered by the create tests
    // The update method uses the same checkForOverlappingEntries logic
  });

  describe('delete', () => {
    const mockEntry = {
      id: '507f1f77bcf86cd799439013',
      consultantId: '507f1f77bcf86cd799439011',
      payPeriodId: '507f1f77bcf86cd799439012',
      date: new Date('2024-01-15'),
      projectTaskNumber: 'PROJ-123',
      clientName: 'Acme Corp',
      description: 'Development work',
      inTime1: new Date('2024-01-15T09:00:00.000Z'),
      outTime1: new Date('2024-01-15T12:00:00.000Z'),
      inTime2: null,
      outTime2: null,
      totalHours: 3,
      synced: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      consultant: mockConsultant,
      payPeriod: mockPayPeriod,
    };

    it('should delete a time entry', async () => {
      mockPrismaService.timeEntry.findUnique.mockResolvedValue(mockEntry);
      mockPrismaService.timeEntry.delete.mockResolvedValue(mockEntry);

      const result = await service.delete('507f1f77bcf86cd799439013');

      expect(result).toEqual(mockEntry);
      expect(mockPrismaService.timeEntry.delete).toHaveBeenCalledWith({
        where: { id: '507f1f77bcf86cd799439013' },
      });
    });

    it('should throw NotFoundException when entry not found', async () => {
      mockPrismaService.timeEntry.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('calculateTotalHours', () => {
    it('should calculate hours correctly for single time block', () => {
      // We need to access private method through any for testing
      const totalHours = (service as any).calculateTotalHours('09:00', '12:00', null, null);
      expect(totalHours).toBe(3);
    });

    it('should calculate hours correctly for two time blocks', () => {
      const totalHours = (service as any).calculateTotalHours('09:00', '12:00', '13:00', '17:00');
      expect(totalHours).toBe(7); // 3 + 4
    });

    it('should handle fractional hours', () => {
      const totalHours = (service as any).calculateTotalHours('09:00', '09:30', null, null);
      expect(totalHours).toBe(0.5);
    });

    it('should calculate full day correctly', () => {
      const totalHours = (service as any).calculateTotalHours('08:00', '17:00', null, null);
      expect(totalHours).toBe(9);
    });
  });
});
